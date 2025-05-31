import { useState, useCallback, useRef, useEffect } from 'react';
import {
  fetchEventSource,
  EventSourceMessage,
} from '@microsoft/fetch-event-source';
import {
  WorkflowEvent,
  WorkflowStepState,
  StoredAnswer,
  InternalEvent,
  InternalContentEvent,
  AnswerEvent,
  ErrorEvent as WorkflowErrorEvent,
} from '../types/workflowEvents';

/**
 * Configuration interface for the workflow stream API endpoint.
 */
interface StreamConfig {
  baseUrl: string;
  endpoint: string;
}

/**
 * Response interface for the useWorkflowStream hook.
 * Provides all necessary state and control methods for managing workflow streams.
 */
export interface UseWorkflowStreamResponse {
  steps: WorkflowStepState[];
  answers: StoredAnswer[];
  streamError: string | null;
  isStreaming: boolean;
  isWorkflowComplete: boolean;
  startWorkflow: (userArticle: string) => Promise<void>; // this is async function and returns a Promise to ensure consumers of the hook know they must await
  cancelWorkflow: () => void;
  resetWorkflow: () => void;
}

// Configuration for the API endpoint with environment variable support
const STREAM_CONFIG: StreamConfig = {
  baseUrl: 'http://127.0.0.1:8000',
  // endpoint: '/agent/keyword/stream',
  endpoint: '/agent/test/keyword/stream', // testing endpoint
};

// Counter for generating unique step IDs to ensure stable React keys
let stepIdCounter = 0;

/**
 * Generates a unique identifier for workflow steps.
 * Combines node name, counter, and timestamp for uniqueness.
 * @param {string} nodeName - The name of the workflow node
 * @returns {string} A unique identifier for the step
 */
const generateStepId = (nodeName: string): string => {
  stepIdCounter += 1;
  const sanitizedName = nodeName.replace(/\s+/g, '-').toLowerCase();
  return `${sanitizedName}-${stepIdCounter}-${Date.now()}`;
};

/**
 * Custom hook for managing Server-Sent Events (SSE) workflow streams.
 * Handles connection, data processing, error management, and state updates.
 * Features:
 * - Automatic reconnection via @microsoft/fetch-event-source
 * - Error handling for network and parsing errors
 * - Manages the workflow steps and tracks completion and loading states for them
 * - Collects answers from the workflow and stores them in a separate state
 * - Clean cancellation of connection and cleanup mechanisms
 * @returns {UseWorkflowStreamResponse} Hook response with state and control methods
 */
export const useWorkflowStream = (): UseWorkflowStreamResponse => {
  // State for workflow steps displayed as cards in the UI
  const [steps, setSteps] = useState<WorkflowStepState[]>([]);

  // State for collecting data of type "answer" from the workflow. These are shown after all the steps are completed but we may receive them at any time
  const [answers, setAnswers] = useState<StoredAnswer[]>([]);

  // State for tracking stream connection and parsing errors
  const [streamError, setStreamError] = useState<string | null>(null);

  // State indicating whether the stream connection is active
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // State indicating whether the workflow has completed successfully. Once this is true, answers are shown and step cards are collapsed
  const [isWorkflowComplete, setIsWorkflowComplete] = useState<boolean>(false);

  // Ref for managing stream cancellation via AbortController. We use Ref to persist this across renders
  const abortControllerRef = useRef<AbortController | null>(null);

  // Ref for tracking the currently active step that receives updates. This helps us update the correct card in the UI
  const currentActiveStepIdRef = useRef<string | null>(null);

  /**
   * Resets all hook state to initial values.
   * Called before starting a new workflow (indicated by empty dependency array) or on explicit reset.
   */
  const resetAllStates = useCallback((): void => {
    setSteps([]);
    setAnswers([]);
    setStreamError(null);
    setIsStreaming(false);
    setIsWorkflowComplete(false);
    currentActiveStepIdRef.current = null;
    stepIdCounter = 0;
  }, []);

  /**
   * Public method. Cancels the current workflow stream if one is active.
   * Aborts the fetch request and triggers cleanup callbacks.
   */
  const cancelWorkflow = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('Workflow streaming explicitly cancelled by user.');
    }
  }, []);

  /**
   * Public method. Resets workflow state.
   * Useful for clearing UI before starting a new workflow.
   */
  const resetWorkflow = useCallback((): void => {
    cancelWorkflow();
    resetAllStates();
  }, [cancelWorkflow, resetAllStates]);

  /**
   * Processes incoming workflow events and updates component state accordingly.
   * Handles different event types with appropriate state transformations.
   *
   * @param {WorkflowEvent} event - The parsed event from the SSE stream
   */
  const processWorkflowEvent = useCallback((event: WorkflowEvent): void => {
    try {
      switch (event.type) {
        case 'internal': {
          const internalEvent = event as InternalEvent;

          setSteps((prevSteps: WorkflowStepState[]) => {
            if (internalEvent.event_status === 'new') {
              // Mark previous step as completed when starting a new step
              const updatedSteps = prevSteps.map((step: WorkflowStepState) =>
                // find the current active step and mark it as completed
                step.id === currentActiveStepIdRef.current
                  ? {
                      ...step,
                      isCurrent: false,
                      isCompleted: true,
                      isLoading: false,
                    }
                  : step
              );

              // Create new workflow step
              const newStep: WorkflowStepState = {
                id: generateStepId(internalEvent.node),
                nodeName: internalEvent.node,
                content: internalEvent.content,
                internalContent: [],
                isCurrent: true,
                isCompleted: false,
                showDetails: true,
                isLoading: true,
              };

              // Update current step reference
              currentActiveStepIdRef.current = newStep.id;

              return [...updatedSteps, newStep];
            } else {
              // Update existing step content (event_status === 'old')
              return prevSteps.map((step: WorkflowStepState) =>
                step.id === currentActiveStepIdRef.current
                  ? {
                      ...step,
                      content: internalEvent.content,
                      isLoading: true,
                    }
                  : step
              );
            }
          });
          break;
        }

        case 'internal_content': {
          const contentEvent = event as InternalContentEvent;

          setSteps((prevSteps: WorkflowStepState[]) =>
            prevSteps.map((step: WorkflowStepState) =>
              step.id === currentActiveStepIdRef.current
                ? {
                    ...step,
                    internalContent: [
                      ...step.internalContent,
                      ...contentEvent.content,
                    ],
                    isLoading: false,
                  }
                : step
            )
          );
          break;
        }

        case 'answer': {
          const answerEvent = event as AnswerEvent;

          const newAnswer: StoredAnswer = {
            node: answerEvent.node,
            data: answerEvent.content,
            receivedAt: new Date(),
          };

          setAnswers((prevAnswers: StoredAnswer[]) => [
            ...prevAnswers,
            newAnswer,
          ]);
          break;
        }

        case 'complete': {
          // Mark all steps as completed and finalize workflow
          setSteps((prevSteps: WorkflowStepState[]) =>
            prevSteps.map((step: WorkflowStepState) => ({
              ...step,
              isCurrent: false,
              isCompleted: true,
              isLoading: false,
              showDetails: false, // Collapse all steps on completion
            }))
          );

          setIsWorkflowComplete(true);
          setIsStreaming(false);
          currentActiveStepIdRef.current = null;
          break;
        }

        case 'error': {
          const errorEvent = event as WorkflowErrorEvent;

          setStreamError(`Workflow error: ${errorEvent.content}`);

          // Stop loading current step but don't mark as completed
          setSteps((prevSteps: WorkflowStepState[]) =>
            prevSteps.map((step: WorkflowStepState) =>
              step.id === currentActiveStepIdRef.current
                ? { ...step, isLoading: false, isCurrent: false }
                : step
            )
          );
          break;
        }

        default:
          console.warn('Unknown workflow event type received:', event);
      }
    } catch (error) {
      console.error('Error processing workflow event:', error);
      setStreamError('Failed to process workflow event.');
    }
  }, []);

  /**
   * Initiates the SSE workflow stream with the provided user article.
   * Manages connection lifecycle, error handling, and event processing.
   *
   * @param {string} userArticle - The user's article content to process
   */
  const startWorkflow = useCallback(
    async (userArticle: string): Promise<void> => {
      // Prevent multiple concurrent streams
      if (isStreaming) {
        console.warn(
          'Workflow already in progress. Cancel current stream first.'
        );
        return;
      }

      // Reset state for fresh workflow
      resetAllStates();
      setIsStreaming(true);

      // Create abort controller for cancellation support
      abortControllerRef.current = new AbortController();

      const requestPayload = { user_article: userArticle };
      const streamUrl = `${STREAM_CONFIG.baseUrl}${STREAM_CONFIG.endpoint}`;

      try {
        await fetchEventSource(streamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify(requestPayload),
          signal: abortControllerRef.current.signal,

          /**
           * Handles incoming SSE messages from the server.
           * Parses JSON data and delegates to event processor.
           */
          onmessage: (eventMessage: EventSourceMessage): void => {
            if (!eventMessage.data) {
              console.warn('Received SSE message without data:', eventMessage);
              return;
            }

            try {
              const parsedEvent = JSON.parse(
                eventMessage.data
              ) as WorkflowEvent;
              processWorkflowEvent(parsedEvent);
            } catch (parseError) {
              console.error(
                'Failed to parse SSE event data:',
                eventMessage.data,
                parseError
              );
              setStreamError(
                'Error parsing server response. Check console for details.'
              );
            }
          },

          /**
           * Handles successful connection opening.
           * Validates response and sets appropriate state.
           */
          onopen: async (response: Response): Promise<void> => {
            const contentType = response.headers.get('content-type');
            const isEventStream = contentType?.startsWith('text/event-stream');

            if (response.ok && isEventStream) {
              setStreamError(null);
              console.log('SSE connection established successfully.');
            } else {
              setIsStreaming(false);

              const errorText = await response.text();
              const errorMessage = `Connection failed: ${response.status} ${response.statusText}. ${errorText}`;

              setStreamError(errorMessage);
              throw new Error(errorMessage);
            }
          },

          /**
           * Handles connection errors including network failures and retries.
           * Distinguishes between user-initiated cancellation and actual errors.
           */
          onerror: (error: any): void => {
            setIsStreaming(false);
            currentActiveStepIdRef.current = null;

            if (error instanceof Error && error.name === 'AbortError') {
              console.log('Stream connection intentionally cancelled.');
              setStreamError(null);
            } else {
              const errorMessage =
                error?.message ||
                'Connection to server lost. Please try again.';
              console.error('SSE connection error:', error);
              setStreamError(errorMessage);
            }
          },

          /**
           * Handles connection closure from server or client.
           * Detects unexpected closures and sets appropriate error state.
           */
          onclose: (): void => {
            console.log('SSE connection closed.');

            const wasAborted = abortControllerRef.current?.signal.aborted;
            const hasError = streamError !== null;

            // Set error for unexpected closures
            if (!isWorkflowComplete && !wasAborted && !hasError) {
              setStreamError('Connection closed unexpectedly by server.');
            }

            setIsStreaming(false);
            abortControllerRef.current = null;
          },
        });
      } catch (setupError) {
        console.error('Failed to initiate workflow stream:', setupError);

        const errorMessage =
          setupError instanceof Error
            ? setupError.message
            : 'Unknown error initiating workflow stream.';

        setStreamError(errorMessage);
        setIsStreaming(false);
        resetAllStates();
      }
    },
    [
      isStreaming,
      resetAllStates,
      processWorkflowEvent,
      isWorkflowComplete,
      streamError,
    ]
  );

  /**
   * Cleanup effect to abort active streams when component unmounts.
   * Prevents memory leaks and orphaned connections.
   */
  useEffect(() => {
    return (): void => {
      if (abortControllerRef.current) {
        console.log('useWorkflowStream cleanup: Aborting active stream.');
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    steps,
    answers,
    streamError,
    isStreaming,
    isWorkflowComplete,
    startWorkflow,
    cancelWorkflow,
    resetWorkflow,
  };
};
