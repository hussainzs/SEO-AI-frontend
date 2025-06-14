// src/components/workflow/WorkflowStepCard.tsx
import React, { FC } from 'react';
import { WorkflowStepState } from '../../types/workflowEvents';
import CircularPin from '../common/CircularPin';
import ShowMoreButton from '../common/ShowMoreButton';

/**
 * Props interface for the WorkflowStepCard component.
 */
interface WorkflowStepCardProps {
  /** The workflow step state containing all step information */
  step: WorkflowStepState;
  /** Function to toggle the expansion state of this step */
  onToggleExpansion: (stepId: string) => void;
}

/**
 * WorkflowStepCard component displays an individual workflow step with its status, content, and internal updates.
 * Handles the visual representation of workflow progress including loading states, completion status, and content transitions.
 *
 * @param step - The workflow step state object containing all step information
 * @param onToggleExpansion - Function to call when toggling the step's expansion state
 * @returns JSX element representing a single workflow step card
 */
const WorkflowStepCard: FC<WorkflowStepCardProps> = ({
  step,
  onToggleExpansion,
}) => {
  /**
   * Determine the status for the CircularPin based on step state.
   */
  const getPinStatus = (): 'pending' | 'current' | 'completed' => {
    if (step.isCompleted) return 'completed';
    if (step.isCurrent) return 'current';
    return 'pending';
  };

  /**
   * Handle the toggle expansion button click.
   */
  const handleToggleClick = (): void => {
    onToggleExpansion(step.id);
  };

  /**
   * Render the main content with appropriate loading and transition effects.
   */
  const renderMainContent = (): React.JSX.Element => {
    const contentClasses = step.isCurrent
      ? 'workflow-content-current animate-content-transition'
      : 'animate-content-transition';

    return (
      <div className={contentClasses}>
        <p className="text-text">
          {step.content ||
            (step.isLoading ? 'Processing...' : 'Waiting for content...')}
        </p>
      </div>
    );
  };
  /**
   * Render the internal content items as individual sub-cards.
   * Each item appears with a slide-in animation.
   */
  const renderInternalContent = (): React.JSX.Element | null => {
    if (step.internalContent.length === 0) {
      return null;
    }

    return (
      <div className="mt-4">
        <div className="space-y-2">
          {step.internalContent.map((content: string, index: number) => (
            <div
              key={index}
              className="workflow-internal-item animate-slide-in-left"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="flex-1 min-w-0">{content}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`workflow-step-card ${step.showDetails ? 'expanded' : 'collapsed'}`}
    >
      {step.showDetails ? (
        <div>
          {/* Header with expanded details */}
          <div className="flex items-start gap-4 mb-4">
            {/* Pass isLoading to show loader when step is active and not completed */}
            <CircularPin
              status={getPinStatus()}
              isLoading={step.isCurrent && !step.isCompleted}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-text">
                    {step.nodeName}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Status:{' '}
                    {step.isCurrent
                      ? 'Processing'
                      : step.isCompleted
                        ? 'Completed'
                        : 'Pending'}
                  </p>
                </div>
                <ShowMoreButton
                  isExpanded={step.showDetails}
                  onClick={handleToggleClick}
                />
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="ml-12">{renderMainContent()}</div>
          {/* Internal content updates */}
          {renderInternalContent()}
        </div>
      ) : (
        /* Collapsed view with minimal information */
        <div className="flex items-center gap-3">
          {/* Pass isLoading to show loader when step is active and not completed */}
          <CircularPin
            status={getPinStatus()}
            isLoading={step.isCurrent && !step.isCompleted}
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-text">{step.nodeName}</h3>
              <ShowMoreButton isExpanded={false} onClick={handleToggleClick} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowStepCard;
