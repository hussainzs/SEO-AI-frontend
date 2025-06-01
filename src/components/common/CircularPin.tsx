// src/components/common/CircularPin.tsx
import React, { FC } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

/**
 * Props interface for the CircularPin component.
 * Used to display the status indicator for workflow steps.
 */
interface CircularPinProps {
  /** Current status of the workflow step */
  status: 'pending' | 'current' | 'completed';
  /** Whether to show a loading spinner inside the pin */
  isLoading?: boolean;
  /** Size of the pin in pixels */
  size?: number;
}

/**
 * CircularPin component displays a colored circular indicator with optional loading spinner or checkmark.
 * Used in workflow step cards to show the current status of each step.
 *
 * @param status - The current status of the step (pending, current, or completed)
 * @param isLoading - Whether to show loading spinner (defaults to false)
 * @param size - Size of the pin in pixels (defaults to 32)
 * @returns JSX element representing the circular status pin
 */
const CircularPin: FC<CircularPinProps> = ({
  status,
  isLoading = false,
  size = 32,
}) => {
  /**
   * Determine the CSS classes for the pin based on status.
   * Uses custom workflow pin classes defined in index.css.
   */
  const getPinClasses = (): string => {
    const baseClasses = 'workflow-pin-container';

    switch (status) {
      case 'current':
        return `${baseClasses} workflow-pin-current`;
      case 'completed':
        return `${baseClasses} workflow-pin-completed`;
      case 'pending':
      default:
        return `${baseClasses} workflow-pin-pending`;
    }
  };

  /**
   * Render the appropriate icon based on status and loading state.
   * Shows loading spinner when current and loading, checkmark when completed.
   */
  const renderIcon = (): React.JSX.Element | null => {
    const iconSize = Math.floor(size * 0.5); // Icon is half the size of the pin

    if (status === 'completed') {
      return <CheckCircle size={iconSize} className="text-white" />;
    }

    if (status === 'current' && isLoading) {
      return <Loader2 size={iconSize} className="text-white animate-spin" />;
    }

    return null;
  };

  return (
    <div
      className={getPinClasses()}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {renderIcon()}
    </div>
  );
};

export default CircularPin;
