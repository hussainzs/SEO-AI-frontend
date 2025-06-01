// src/components/common/LoadingSpinner.tsx
import { FC } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Props interface for the LoadingSpinner component.
 */
interface LoadingSpinnerProps {
  /** Size of the spinner in pixels */
  size?: number;
  /** Additional CSS classes to apply */
  className?: string;
  /** Loading message to display alongside the spinner */
  message?: string;
}

/**
 * LoadingSpinner component displays a spinning loader icon with optional message.
 * Used to indicate loading states throughout the application.
 *
 * @param size - Size of the spinner in pixels (defaults to 32)
 * @param className - Additional CSS classes to apply
 * @param message - Optional loading message to display
 * @returns JSX element representing the loading spinner
 */
const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = 32,
  className = '',
  message,
}) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 size={size} className="animate-spin text-primary" />
      {message && (
        <span className="text-text-secondary text-sm">{message}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
