// src/components/workflow/AnswerDisplay.tsx
import React, { FC } from 'react';
import { StoredAnswer } from '../../types/workflowEvents';

/**
 * Props interface for the AnswerDisplay component.
 */
interface AnswerDisplayProps {
  /** Array of collected answers from the workflow */
  answers: StoredAnswer[];
  /** Whether the workflow has completed */
  isCompleted: boolean;
}

/**
 * AnswerDisplay component displays the accumulated answers from the workflow.
 * Shows answers as formatted JSON once the workflow is complete.
 *
 * @param answers - Array of stored answers collected during workflow execution
 * @param isCompleted - Whether the workflow has completed successfully
 * @returns JSX element representing the answer display section
 */
const AnswerDisplay: FC<AnswerDisplayProps> = ({ answers, isCompleted }) => {
  /**
   * Don't render anything if there are no answers yet or workflow hasn't completed.
   * Answers should only be displayed once the entire workflow is done.
   */
  if (answers.length === 0 || !isCompleted) {
    return null;
  }

  /**
   * Format the answer data for display.
   * Handles both string and object content appropriately.
   */
  const formatAnswerData = (data: Record<string, unknown>): string => {
    try {
      // Return data as plain text
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\\n');
    } catch (error) {
      console.error('Error formatting answer data:', error);
      return 'Error formatting answer data';
    }
  };

  /**
   * Render an individual answer card.
   */
  const renderAnswerCard = (
    answer: StoredAnswer,
    index: number
  ): React.JSX.Element => {
    return (
      <div
        key={index}
        className="bg-white p-6 rounded-lg shadow-md border border-border animate-slide-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Answer header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="tag-ai">AI</span>
            <div>
              <h4 className="font-semibold text-lg text-text">
                Answer from: {answer.node}
              </h4>
              <p className="text-sm text-text-secondary">
                Received at: {answer.receivedAt.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Answer content */}
        <div className="bg-light-bg p-4 rounded-md border border-border">
          <h5 className="font-medium text-text mb-2 text-sm">Answer Data:</h5>
          <pre className="text-sm bg-white p-4 rounded-md overflow-x-auto text-text border border-border whitespace-pre-wrap">
            {formatAnswerData(answer.data)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="answer-display mt-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-text">Workflow Results</h2>
        </div>
      </div>

      {/* Answers container */}
      <div className="space-y-4">
        {answers.map((answer: StoredAnswer, index: number) =>
          renderAnswerCard(answer, index)
        )}
      </div>

      {/* Loading state for incomplete workflows */}
      {!isCompleted && answers.length > 0 && (
        <div className="mt-6 p-4 bg-primary-light rounded-md border border-primary-medium">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
            <span className="font-medium">Workflow still processing...</span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            More results may appear as the workflow continues.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnswerDisplay;
