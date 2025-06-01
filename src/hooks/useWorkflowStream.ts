import { useState, useCallback, useRef, useEffect } from 'react';
import {
  WorkflowEvent,
  WorkflowStepState,
  StoredAnswer,
} from '../types/workflowEvents';

// API endpoint for the keyword agent stream
// const API_ENDPOINT = 'http://127.0.0.1:8000/agent/keyword/stream';
const API_ENDPOINT = 'http://127.0.0.1:8000/api/test/keyword/stream'; // testing endpoint

/**
 * Request interface matching the backend's expected structure
 */
interface KeywordAgentRequest {
  user_article: string;
}

/**
 * Return interface for the useWorkflowStream hook providing all necessary state and controls
 */
export interface UseWorkflowStreamReturn {
  /** Array of workflow step states representing each processing step */
  workflowSteps: WorkflowStepState[];
  /** Array of collected answers from the workflow, displayed after completion */
  answers: StoredAnswer[];
  /** True when stream is active and processing */
  isStreaming: boolean;
  /** True when initially connecting but no data received yet */
  isConnecting: boolean;
  /** True when workflow has completed successfully */
  isCompleted: boolean;
  /** Error message from stream connection or processing */
  error: string | null;
  /** Function to initiate the workflow stream */
  startWorkflowStream: (userArticle: string) => Promise<void>;
  /** Function to manually stop the current stream */
  stopStream: () => void;
  /** Function to toggle expansion of a specific workflow step card */
  toggleStepExpansion: (stepId: string) => void;
}

/**
 * Custom hook for managing workflow SSE streams with comprehensive state management.
 * Handles connection, reconnection, parsing, and state updates for workflow events.
 *
 * @returns {UseWorkflowStreamReturn} Hook state and control functions
 */
export const useWorkflowStream = (): UseWorkflowStreamReturn => {
  // Core stream state management
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStepState[]>([]);
  const [answers, setAnswers] = useState<StoredAnswer[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Stream control references
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  // Configuration constants
  const MAX_RECONNECT_ATTEMPTS = 3;
  const RECONNECT_DELAY = 5000; // 5 seconds

  /**
   * Generates a unique identifier for workflow steps using node name and timestamp.
   * Ensures uniqueness for each step.
   *
   * @param nodeName - The name of the workflow node
   * @returns Unique string identifier
   */
  const generateStepId = useCallback((nodeName: string): string => {
    // Use node name and current timestamp for uniqueness
    return `${nodeName}-${Date.now()}`;
  }, []);

  /**
   * Creates a new workflow step state object with default values.
   * Called when receiving an "internal" event with "new" status.
   *
   * @param nodeName - Name of the workflow node
   * @param content - Initial content for the step
   * @returns New WorkflowStepState object
   */
  const createNewStep = useCallback(
    (nodeName: string, content: string): WorkflowStepState => {
      return {
        id: generateStepId(nodeName),
        nodeName,
        content,
        internalContent: [],
        isCurrent: true, // set this to true as this is the latest step
        isCompleted: false,
        showDetails: true, // Start expanded, will collapse after completion
        isLoading: true,
      };
    },
    [generateStepId]
  );

  /**
   * Processes workflow events and updates state accordingly.
   * Handles all event types: internal, internal_content, answer, error, complete.
   *
   * @param event - The parsed workflow event from the stream
   */
  const processWorkflowEvent = useCallback(
    (event: WorkflowEvent): void => {
      switch (event.type) {
        case 'internal': {
          if (event.event_status === 'new') {
            // Go through all previous steps and update their state and add new step
            setWorkflowSteps((prevSteps: WorkflowStepState[]) => {
              // Mark all previous steps as completed and not current
              const updatedSteps = prevSteps.map((step) => {
                return {
                  ...step,
                  isCurrent: false,
                  isCompleted: true,
                  isLoading: false,
                };
              });
              // Add the new step as the current one
              const newStep = createNewStep(event.node, event.content);
              return [...updatedSteps, newStep];
            });
          } else if (event.event_status === 'old') {
            // Update the content of the current (active) step only
            setWorkflowSteps((prevSteps: WorkflowStepState[]) => {
              return prevSteps.map((step) =>
                step.isCurrent ? { ...step, content: event.content } : step
              );
            });
          }
          break;
        }

        case 'internal_content': {
          // Append new content to the internalContent array of the current step
          setWorkflowSteps((prevSteps: WorkflowStepState[]) => {
            return prevSteps.map((step) =>
              step.isCurrent
                ? {
                    ...step,
                    internalContent: step.internalContent.concat(event.content),
                  }
                : step
            );
          });
          break;
        }

        case 'answer': {
          // Add the answer to the answers array
          setAnswers((prevAnswers: StoredAnswer[]) => {
            const newAnswer: StoredAnswer = {
              node: event.node,
              data: event.content,
              receivedAt: new Date(),
            };
            return [...prevAnswers, newAnswer];
          });
          break;
        }

        case 'error': {
          // Set error state and stop streaming
          setError(event.content);
          setIsStreaming(false);
          setIsConnecting(false);
          break;
        }

        case 'complete': {
          // Mark all steps as completed and collapsed
          setWorkflowSteps((prevSteps: WorkflowStepState[]) => {
            return prevSteps.map((step) => ({
              ...step,
              isCurrent: false,
              isCompleted: true,
              isLoading: false,
              showDetails: false, // set this to false for all to collapse step cards after completion
            }));
          });
          setIsCompleted(true);
          setIsStreaming(false);
          setIsConnecting(false);
          break;
        }

        default: {
          console.warn('Unknown workflow event type received:', event);
          break;
        }
      }
    },
    [createNewStep]
  );

  /**
   * Handles the SSE stream reading with proper buffer management and event parsing.
   * Processes multiple events that may arrive in a single chunk and handles partial messages.
   *
   * @param response - The fetch response containing the SSE stream
   * @param signal - AbortSignal for cancelling the stream
   */
  const processStreamResponse = useCallback(
    async (response: Response, signal: AbortSignal): Promise<void> => {
      if (!response.body) {
        throw new Error('Response body is null, cannot read stream.');
      }

      const reader: ReadableStreamDefaultReader<Uint8Array> =
        response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          // Check for stream completion or cancellation
          if (done || signal.aborted) {
            break;
          }

          // Mark as connected after receiving first chunk
          if (isConnecting) {
            setIsConnecting(false);
            reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
          }

          // Decode chunk and add to buffer for processing
          buffer += decoder.decode(value, { stream: true });

          // Process all complete SSE messages in the current buffer
          let messageEndIndex: number;
          while ((messageEndIndex = buffer.indexOf('\n\n')) >= 0) {
            const messageLine: string = buffer
              .substring(0, messageEndIndex)
              .trim();
            buffer = buffer.substring(messageEndIndex + 2);

            // Parse SSE data events (format: "data: {json}")
            if (messageLine.startsWith('data:')) {
              const jsonString: string = messageLine.substring(5).trim();

              if (jsonString) {
                try {
                  const eventData: WorkflowEvent = JSON.parse(jsonString);
                  // call the event processing function
                  processWorkflowEvent(eventData);

                  // Stop processing if workflow completed
                  if (eventData.type === 'complete') {
                    await reader.cancel();
                    return;
                  }
                } catch (parseError) {
                  console.error(
                    'Failed to parse workflow event JSON:',
                    jsonString,
                    parseError
                  );
                  // Continue processing other events rather than failing completely
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
    [isConnecting, processWorkflowEvent]
  );

  /**
   * Attempts to reconnect to the stream after a connection failure.
   * Uses exponential backoff and limits the number of reconnection attempts.
   *
   * @param userArticle - The original user input to retry with
   * @param startWorkflowStreamFn - Reference to the startWorkflowStream function to avoid circular dependency
   */
  const attemptReconnection = useCallback(
    (
      userArticle: string,
      startWorkflowStreamFn: (userArticle: string) => Promise<void>
    ): void => {
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setError(
          `Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts. Please try again.`
        );
        setIsStreaming(false);
        setIsConnecting(false);
        return;
      }

      reconnectAttemptsRef.current += 1;
      const delay: number =
        RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1);

      console.log(
        `Attempting reconnection ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`
      );

      reconnectTimeoutRef.current = window.setTimeout(() => {
        startWorkflowStreamFn(userArticle);
      }, delay);
    },
    [MAX_RECONNECT_ATTEMPTS, RECONNECT_DELAY]
  );

  /**
   * Initiates the workflow stream with the provided user article.
   * Handles connection, error recovery, and proper state management.
   *
   * @param userArticle - The user's article content to process
   */
  const startWorkflowStream = useCallback(
    async (userArticle: string): Promise<void> => {
      // Prevent multiple concurrent streams
      if (isStreaming || abortControllerRef.current) {
        console.warn('Stream already in progress');
        return;
      }

      // Reset state for new stream
      setWorkflowSteps([]);
      setAnswers([]);
      setError(null);
      setIsCompleted(false);
      setIsStreaming(true);
      setIsConnecting(true);

      // Create new abort controller for this stream
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      try {
        const requestBody: KeywordAgentRequest = { user_article: userArticle };

        const response: Response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(requestBody),
          signal,
        });

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorText: string = await response.text();
            if (errorText) {
              errorMessage += `\nServer response: ${errorText}`;
            }
          } catch {
            // Ignore errors when reading error response body
          }
          throw new Error(errorMessage);
        }
        // Start processing the stream response
        await processStreamResponse(response, signal);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Stream was cancelled');
        } else {
          console.error('Stream error:', err);

          // Attempt reconnection for network errors if not manually cancelled
          if (
            !signal.aborted &&
            reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
          ) {
            attemptReconnection(userArticle, startWorkflowStream);
            return;
          }

          setError(
            err instanceof Error
              ? err.message
              : 'An unknown error occurred during streaming'
          );
        }
      } finally {
        // Only clean up if this wasn't a reconnection attempt
        if (!reconnectTimeoutRef.current) {
          setIsStreaming(false);
          setIsConnecting(false);
          abortControllerRef.current = null;
        }
      }
    },
    [
      isStreaming,
      processStreamResponse,
      attemptReconnection,
      MAX_RECONNECT_ATTEMPTS,
    ]
  );

  /**
   * Manually stops the current stream and cancels any pending reconnection attempts.
   */
  const stopStream = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    reconnectAttemptsRef.current = 0;
    setIsStreaming(false);
    setIsConnecting(false);
  }, []);

  /**
   * Toggles the expansion state of a specific workflow step card.
   * Used to show/hide detailed content after workflow completion.
   *
   * @param stepId - Unique identifier of the step to toggle
   */
  const toggleStepExpansion = useCallback((stepId: string): void => {
    setWorkflowSteps((prevSteps: WorkflowStepState[]) =>
      prevSteps.map((step: WorkflowStepState) =>
        step.id === stepId ? { ...step, showDetails: !step.showDetails } : step
      )
    );
  }, []);

  /**
   * Cleanup effect to abort streams and clear timeouts on component unmount.
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    workflowSteps,
    answers,
    isStreaming,
    isConnecting,
    isCompleted,
    error,
    startWorkflowStream,
    stopStream,
    toggleStepExpansion,
  };
};
