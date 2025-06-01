// src/components/common/ShowMoreButton.tsx
import { FC } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Props interface for the ShowMoreButton component.
 */
interface ShowMoreButtonProps {
  /** Whether the content is currently expanded */
  isExpanded: boolean;
  /** Function to call when the button is clicked */
  onClick: () => void;
  /** Custom text for the expanded state */
  expandedText?: string;
  /** Custom text for the collapsed state */
  collapsedText?: string;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * ShowMoreButton component displays a toggle button for expanding/collapsing content.
 * Shows different text and chevron direction based on expansion state.
 *
 * @param isExpanded - Whether the content is currently expanded
 * @param onClick - Function to call when the button is clicked
 * @param expandedText - Custom text for expanded state (defaults to "Hide Details")
 * @param collapsedText - Custom text for collapsed state (defaults to "Show Details")
 * @param className - Additional CSS classes to apply
 * @returns JSX element representing the show more/less button
 */
const ShowMoreButton: FC<ShowMoreButtonProps> = ({
  isExpanded,
  onClick,
  expandedText = 'Hide Details',
  collapsedText = 'Show Details',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`card-toggle ${className}`}
      type="button"
    >
      <span className="workflow-show-more-btn">
        {isExpanded ? expandedText : collapsedText}
      </span>
      {isExpanded ? (
        <ChevronUp size={16} className="text-text-secondary" />
      ) : (
        <ChevronDown size={16} className="text-text-secondary" />
      )}
    </button>
  );
};

export default ShowMoreButton;
