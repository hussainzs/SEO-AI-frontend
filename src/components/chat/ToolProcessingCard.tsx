import { FC } from 'react';
// Import icons for different states: FileSearch for processing, CheckCircle2 for completed.
import { CheckCircle2, LoaderCircle } from 'lucide-react'; // Added LoaderCircle for a different loading icon

interface ToolProcessingCardProps {
  // The main text content to display, typically indicating what tool is processing.
  content: string;
  // Optional boolean to indicate if the tool processing has completed. Defaults to false.
  isCompleted?: boolean;
}

const ToolProcessingCard: FC<ToolProcessingCardProps> = ({
  content,
  isCompleted = false,
}) => {
  // Determine the display text based on the completion status.
  const displayText: string = isCompleted
    ? 'Tool processed successfully!'
    : content || 'Processing tool...';

  // Choose the icon component. LoaderCircle for processing, CheckCircle2 for completed.
  const IconComponent = isCompleted ? CheckCircle2 : LoaderCircle;

  // Define CSS classes for the icon, changing color and animation based on completion.
  const iconClasses: string = `w-5 h-5 ${
    isCompleted ? 'text-verified' : 'text-primary animate-spin'
  }`;

  // Define CSS classes for the text, changing color based on completion.
  const textClasses: string = `font-medium text-sm ${
    isCompleted ? 'text-verified' : 'text-primary'
  }`;

  // Define CSS classes for the main container div, changing background and border based on completion.
  const containerClasses: string = `p-4 rounded-md shadow-md my-4 w-full animate-slide-in border ${
    isCompleted
      ? 'bg-verified-bg border-verified'
      : 'bg-primary-light border-primary-medium'
  }`;

  return (
    // Main container for the card. Applies dynamic styling based on 'isCompleted'.
    <div className={containerClasses}>
      <div className="flex items-center gap-3 p-2">
        <IconComponent className={iconClasses} />
        <p className={textClasses}>{displayText}</p>
      </div>
    </div>
  );
};

export default ToolProcessingCard;
