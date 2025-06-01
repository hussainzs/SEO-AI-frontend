import React, { useState } from 'react';
import { useWorkflowStream } from '../hooks/useWorkflowStream';
import { WorkflowStepState, StoredAnswer } from '../types/workflowEvents';

/**
 * WorkflowStreamTester component provides a comprehensive testing interface for the useWorkflowStream hook.
 * Displays all hook states, allows manual testing, and logs all events for debugging purposes.
 *
 * Features:
 * - Real-time state monitoring
 * - Event logging and error tracking
 * - Manual workflow triggering
 * - Step expansion/collapse testing
 * - Visual feedback for all hook states
 */
const WorkflowStreamTester: React.FC = () => {
  // Local state for test input and event logging
  const [testArticle, setTestArticle] = useState<string>(
    'This is a test article about React hooks and workflow management.'
  );
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [errorLog, setErrorLog] = useState<string[]>([]);

  // Use the workflow stream hook that we're testing
  const {
    workflowSteps,
    answers,
    isStreaming,
    isConnecting,
    isCompleted,
    error,
    startWorkflowStream,
    stopStream,
    toggleStepExpansion,
  } = useWorkflowStream();

  /**
   * Handles starting the workflow stream with the test article.
   * Logs the action for debugging purposes.
   */
  const handleStartWorkflow = async (): Promise<void> => {
    try {
      const timestamp = new Date().toLocaleTimeString();
      setEventLog((prevLog) => [
        ...prevLog,
        `[${timestamp}] Starting workflow with article: "${testArticle.substring(0, 50)}..."`,
      ]);

      await startWorkflowStream(testArticle);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      const timestamp = new Date().toLocaleTimeString();
      setErrorLog((prevErrors) => [
        ...prevErrors,
        `[${timestamp}] Workflow start error: ${errorMessage}`,
      ]);
    }
  };

  /**
   * Handles stopping the current workflow stream.
   * Logs the action for debugging purposes.
   */
  const handleStopWorkflow = (): void => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prevLog) => [
      ...prevLog,
      `[${timestamp}] Manually stopping workflow`,
    ]);
    stopStream();
  };

  /**
   * Handles toggling the expansion state of a workflow step.
   * Logs the action for debugging purposes.
   *
   * @param stepId - The unique identifier of the step to toggle
   */
  const handleToggleStep = (stepId: string): void => {
    const timestamp = new Date().toLocaleTimeString();
    const step = workflowSteps.find((s) => s.id === stepId);
    const stepName = step ? step.nodeName : 'Unknown';
    setEventLog((prevLog) => [
      ...prevLog,
      `[${timestamp}] Toggling step expansion: ${stepName} (${stepId})`,
    ]);
    toggleStepExpansion(stepId);
  };

  /**
   * Clears all logs for a fresh testing session.
   */
  const clearLogs = (): void => {
    setEventLog([]);
    setErrorLog([]);
  };

  /**
   * Renders a workflow step card with detailed information and controls.
   * Shows the card immediately when the step appears and animates content updates.
   *
   * @param step - The workflow step state to render
   * @returns JSX element representing the step card
   */
  const renderWorkflowStep = (step: WorkflowStepState): React.JSX.Element => {
    return (
      <div
        key={step.id}
        className="border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow-sm transition-all duration-300 ease-in-out"
      >
        {/* Step header with status indicators */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            {/* Status indicator circle with pulsing animation for current/loading steps */}
            <div
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                step.isCompleted
                  ? 'bg-green-500'
                  : step.isCurrent
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-gray-300'
              }`}
            />

            {/* Step name and status */}
            <div>
              <h3 className="font-semibold text-lg">{step.nodeName}</h3>
              <div className="text-sm text-gray-600">
                Status:{' '}
                {step.isCurrent
                  ? 'Current'
                  : step.isCompleted
                    ? 'Completed'
                    : 'Pending'}
                {step.isLoading && ' (Streaming...)'}
              </div>
            </div>
          </div>

          {/* Toggle expansion button */}
          <button
            onClick={() => handleToggleStep(step.id)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            type="button"
          >
            {step.showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {/* Main content - always shown with streaming animation */}
        <div className="mb-3">
          <div className="bg-gray-50 p-3 rounded border transition-all duration-300">
            <div className="flex items-center justify-between mb-1">
              <strong className="text-sm text-gray-700">Content:</strong>
              {step.isLoading && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <span>Streaming</span>
                </div>
              )}
            </div>
            <div className="transition-all duration-500 ease-in-out">
              {step.content ? (
                <p className="mt-1 animate-fadeIn">{step.content}</p>
              ) : (
                <p className="mt-1 text-gray-400 italic">
                  {step.isLoading ? 'Waiting for content...' : 'No content yet'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Internal content - shown as it streams in */}
        {step.internalContent.length > 0 && (
          <div className="mb-3 animate-fadeIn">
            <div className="bg-blue-50 p-3 rounded border transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <strong className="text-sm text-blue-700">
                  Live Updates ({step.internalContent.length} received):
                </strong>
                {step.isLoading && (
                  <span className="text-xs text-blue-600 animate-pulse">
                    More coming...
                  </span>
                )}
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {step.internalContent.map((content, index) => (
                  <div
                    key={index}
                    className="bg-white p-2 rounded text-sm border-l-2 border-blue-300 animate-slideInLeft"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {typeof content === 'string'
                          ? content
                          : JSON.stringify(content, null, 2)}
                      </div>
                      <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step details (conditionally shown) */}
        {step.showDetails && (
          <div className="space-y-3 animate-fadeIn">
            {/* Step metadata */}
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              <div className="grid grid-cols-2 gap-2">
                <div>ID: {step.id}</div>
                <div>Current: {step.isCurrent.toString()}</div>
                <div>Completed: {step.isCompleted.toString()}</div>
                <div>Loading: {step.isLoading.toString()}</div>
                <div>Show Details: {step.showDetails.toString()}</div>
                <div>Updates: {step.internalContent.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Renders the collected answers from the workflow.
   *
   * @param answer - The stored answer to render
   * @param index - The index of the answer in the array
   * @returns JSX element representing the answer
   */
  const renderAnswer = (
    answer: StoredAnswer,
    index: number
  ): React.JSX.Element => {
    return (
      <div
        key={index}
        className="border border-green-300 rounded-lg p-4 mb-3 bg-green-50"
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-green-800">
            Answer from: {answer.node}
          </h4>
          <span className="text-xs text-green-600">
            {answer.receivedAt.toLocaleTimeString()}
          </span>
        </div>
        <div className="bg-white p-3 rounded border">
          <pre className="whitespace-pre-wrap text-sm overflow-x-auto">
            {typeof answer.data === 'string'
              ? answer.data
              : JSON.stringify(answer.data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Workflow Stream Hook Tester
      </h1>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Control Panel</h2>

        {/* Test article input */}
        <div className="mb-4">
          <label
            htmlFor="test-article"
            className="block text-sm font-medium mb-2"
          >
            Test Article:
          </label>
          <textarea
            id="test-article"
            value={testArticle}
            onChange={(e) => setTestArticle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md resize-vertical"
            rows={3}
            placeholder="Enter test article content here..."
          />
        </div>

        {/* Control buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleStartWorkflow}
            disabled={isStreaming || isConnecting}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            {isConnecting
              ? 'Connecting...'
              : isStreaming
                ? 'Streaming...'
                : 'Start Workflow'}
          </button>

          <button
            onClick={handleStopWorkflow}
            disabled={!isStreaming && !isConnecting}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            Stop Workflow
          </button>

          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            type="button"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Hook State Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Current Hook States */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Hook States</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">Is Streaming:</span>
              <span
                className={`px-2 py-1 rounded text-sm ${isStreaming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {isStreaming.toString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">Is Connecting:</span>
              <span
                className={`px-2 py-1 rounded text-sm ${isConnecting ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {isConnecting.toString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">Is Completed:</span>
              <span
                className={`px-2 py-1 rounded text-sm ${isCompleted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {isCompleted.toString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">Workflow Steps:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {workflowSteps.length}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">Answers Collected:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                {answers.length}
              </span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <span className="font-medium text-red-800">Stream Error:</span>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Event and Error Logs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Event & Error Logs</h2>

          {/* Event Log */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">
              Event Log ({eventLog.length} events):
            </h3>
            <div className="h-32 overflow-y-auto bg-gray-50 p-2 rounded border text-sm">
              {eventLog.length === 0 ? (
                <p className="text-gray-500">No events logged yet...</p>
              ) : (
                eventLog.map((log, index) => (
                  <div key={index} className="mb-1 p-1 hover:bg-white rounded">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Error Log */}
          <div>
            <h3 className="font-medium text-red-700 mb-2">
              Error Log ({errorLog.length} errors):
            </h3>
            <div className="h-32 overflow-y-auto bg-red-50 p-2 rounded border text-sm">
              {errorLog.length === 0 ? (
                <p className="text-gray-500">No errors logged yet...</p>
              ) : (
                errorLog.map((log, index) => (
                  <div
                    key={index}
                    className="mb-1 p-1 text-red-700 hover:bg-red-100 rounded"
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Steps Display */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Workflow Steps ({workflowSteps.length})
          {isStreaming && (
            <span className="ml-2 text-sm text-blue-600 animate-pulse">
              • Live Streaming
            </span>
          )}
        </h2>

        {workflowSteps.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No workflow steps yet. Start a workflow to see steps appear in
            real-time.
          </p>
        ) : (
          <div className="space-y-4">
            {workflowSteps.map((step: WorkflowStepState) =>
              renderWorkflowStep(step)
            )}
          </div>
        )}
      </div>

      {/* Answers Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Collected Answers ({answers.length})
        </h2>

        {answers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No answers collected yet. Complete a workflow to see answers here.
          </p>
        ) : (
          <div className="space-y-4">
            {answers.map((answer: StoredAnswer, index: number) =>
              renderAnswer(answer, index)
            )}
          </div>
        )}
      </div>

      {/* Raw State Debug Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Raw State Debug (JSON)</h2>
        <details className="cursor-pointer">
          <summary className="font-medium text-blue-600 hover:text-blue-800">
            Click to view raw hook state data
          </summary>
          <pre className="mt-3 p-4 bg-gray-100 rounded overflow-x-auto text-xs">
            {JSON.stringify(
              {
                workflowSteps,
                answers,
                isStreaming,
                isConnecting,
                isCompleted,
                error,
              },
              null,
              2
            )}
          </pre>
        </details>
      </div>

      {/* Add custom CSS for animations using a style tag */}
      <style>
        {`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out forwards;
        }
        `}
      </style>
    </div>
  );
};

export default WorkflowStreamTester;
