// src/components/workflow/ErrorMessageCard.tsx
import { FC } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Props interface for the ErrorMessageCard component.
 */
interface ErrorMessageCardProps {
  /** The error message to display */
  error: string;
  /** Optional title for the error card */
  title?: string;
  /** Whether to show the error as a critical system error */
  isCritical?: boolean;
}

/**
 * ErrorMessageCard component displays error messages in a styled card format.
 * Provides clear visual indication of errors with appropriate styling and iconography.
 *
 * @param error - The error message content to display
 * @param title - Optional title for the error (defaults to "Workflow Error")
 * @param isCritical - Whether this is a critical system error (affects styling)
 * @returns JSX element representing the error message card
 */
const ErrorMessageCard: FC<ErrorMessageCardProps> = ({
  error,
  title = 'Workflow Error',
  isCritical = false,
}) => {
  /**
   * Get the appropriate CSS classes based on error severity.
   */
  const getCardClasses = (): string => {
    const baseClasses =
      'bg-white p-6 rounded-lg shadow-md my-4 animate-slide-in border';

    if (isCritical) {
      return `${baseClasses} border-contradicted bg-contradicted`;
    }

    return `${baseClasses} border-contradicted`;
  };

  /**
   * Get the appropriate text color classes.
   */
  const getTextClasses = (): string => {
    return isCritical ? 'text-white' : 'text-contradicted';
  };

  /**
   * Get the appropriate icon color classes.
   */
  const getIconClasses = (): string => {
    return isCritical ? 'text-white' : 'text-contradicted';
  };

  return (
    <div className={getCardClasses()}>
      {/* Error header with icon and title */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-contradicted">
          <AlertTriangle size={20} className={getIconClasses()} />
        </div>

        <div>
          <h3 className={`font-semibold text-lg ${getTextClasses()}`}>
            {title}
          </h3>
          <p className="text-sm text-text-secondary">
            {isCritical ? 'Critical system error' : 'Processing error occurred'}
          </p>
        </div>
      </div>

      {/* Error message content */}
      <div className="bg-light-bg p-4 rounded-md border border-border">
        <h4 className="font-medium text-text mb-2 text-sm">Error Details:</h4>
        <div className="text-sm text-text whitespace-pre-wrap bg-white p-3 rounded border border-border">
          {error}
        </div>
      </div>

      {/* Help text */}
      <div className="mt-4 p-3 bg-background rounded-md border border-border">
        <p className="text-sm text-text-secondary">
          <strong>What to do:</strong>
          {isCritical
            ? ' This is a critical error. Please refresh the page and try again. If the problem persists, contact support.'
            : ' This error occurred during workflow processing. You can try submitting your request again.'}
        </p>
      </div>
    </div>
  );
};

export default ErrorMessageCard;
