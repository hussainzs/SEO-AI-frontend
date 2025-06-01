// src/components/workflow/WorkflowDisplay.tsx
import { FC, useState, useEffect } from 'react';
import { WorkflowStepState } from '../../types/workflowEvents';
import WorkflowStepCard from './WorkflowStepCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ShowMoreButton from '../common/ShowMoreButton';

/**
 * Props interface for the WorkflowDisplay component.
 */
interface WorkflowDisplayProps {
  /** Array of workflow step states to display */
  workflowSteps: WorkflowStepState[];
  /** Whether the workflow is currently streaming/processing */
  isStreaming: boolean;
  /** Whether the initial connection is being established */
  isConnecting: boolean;
  /** Whether the workflow has completed successfully */
  isCompleted: boolean;
  /** Function to toggle expansion of a specific step */
  onToggleStepExpansion: (stepId: string) => void;
}

/**
 * WorkflowDisplay component orchestrates the rendering of all workflow step cards.
 * Handles the overall workflow visualization including loading states and completion indicators.
 *
 * @param workflowSteps - Array of workflow step states to render
 * @param isStreaming - Whether the workflow is currently active
 * @param isConnecting - Whether the initial connection is being established
 * @param isCompleted - Whether the workflow has completed
 * @param onToggleStepExpansion - Function to call when toggling step expansion
 * @returns JSX element representing the complete workflow display
 */
const WorkflowDisplay: FC<WorkflowDisplayProps> = ({
  workflowSteps,
  isStreaming,
  isConnecting,
  isCompleted,
  onToggleStepExpansion,
}) => {
  // State to control whether to show workflow steps after completion
  const [showCompletedSteps, setShowCompletedSteps] =
    useState<boolean>(!isCompleted);

  // Automatically collapse steps when workflow is completed
  useEffect(() => {
    if (isCompleted) {
      setShowCompletedSteps(false);
    }
  }, [isCompleted]);

  /**
   * Show initial loading spinner when connecting but no steps have appeared yet.
   */
  if (isConnecting && workflowSteps.length === 0) {
    return (
      <div className="py-8">
        <LoadingSpinner
          size={40}
          message="Starting workflow..."
          className="justify-center"
        />
      </div>
    );
  }

  /**
   * Show empty state when not connecting and no steps are available.
   */
  if (!isConnecting && !isStreaming && workflowSteps.length === 0) {
    return null;
  }

  return (
    <div className="workflow-display">
      {/* Workflow header with status indicator and ShowMoreButton for completed steps */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-text">Workflow Progress</h2>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            {isStreaming && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary-light rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm text-primary font-medium">
                  Processing
                </span>
              </div>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2 px-3 py-1 bg-verified rounded-full">
                <div className="w-2 h-2 bg-verified rounded-full"></div>
                <span className="text-sm text-verified font-medium">
                  Completed
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ShowMoreButton replaces the step counter and toggles completed steps visibility */}
        {isCompleted && (
          <ShowMoreButton
            isExpanded={showCompletedSteps}
            onClick={() => setShowCompletedSteps(!showCompletedSteps)}
            expandedText="Show More"
            collapsedText="Hide Steps"
          />
        )}
        {/* When not completed, show the step counter as before */}
        {!isCompleted && (
          <div className="text-sm text-text-secondary">
            {workflowSteps.length} step{workflowSteps.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Workflow steps container */}
      <div className="space-y-3">
        {/* When completed, show steps only if showCompletedSteps is true */}
        {isCompleted ? (
          showCompletedSteps && (
            <>
              {/* Render all workflow steps as cards */}
              {workflowSteps.map((step: WorkflowStepState) => (
                <WorkflowStepCard
                  key={step.id}
                  step={step}
                  onToggleExpansion={onToggleStepExpansion}
                />
              ))}
            </>
          )
        ) : (
          // Active workflow - show all steps
          <>
            {workflowSteps.map((step: WorkflowStepState) => (
              <WorkflowStepCard
                key={step.id}
                step={step}
                onToggleExpansion={onToggleStepExpansion}
              />
            ))}
          </>
        )}
      </div>

      {/* Bottom loading indicator when streaming */}
      {isStreaming && workflowSteps.length > 0 && (
        <div className="mt-6 py-4">
          <LoadingSpinner
            size={24}
            message="Processing next steps..."
            className="justify-center"
          />
        </div>
      )}
    </div>
  );
};

export default WorkflowDisplay;
