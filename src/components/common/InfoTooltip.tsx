import { FC, useState } from 'react';
import { Info } from 'lucide-react';

/**
 * Props interface for the InfoTooltip component.
 */
interface InfoTooltipProps {
  /** The descriptive text to show in the tooltip */
  description: string;
  /** Optional custom size for the info icon */
  size?: number;
  /** Optional custom className for styling */
  className?: string;
}

/**
 * InfoTooltip component displays an info icon that shows a tooltip with descriptive text on hover.
 * Uses CSS-only tooltip approach for better performance and accessibility.
 *
 * @param description - The text to display in the tooltip
 * @param size - Optional size for the info icon (default: 14)
 * @param className - Optional additional CSS classes
 * @returns JSX element representing an info tooltip
 */
const InfoTooltip: FC<InfoTooltipProps> = ({
  description,
  size = 14,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  /**
   * Handle mouse enter event to show tooltip.
   */
  const handleMouseEnter = (): void => {
    setIsVisible(true);
  };

  /**
   * Handle mouse leave event to hide tooltip.
   */
  const handleMouseLeave = (): void => {
    setIsVisible(false);
  };

  return (
    <div className={`info-tooltip-container ${className}`}>
      <div
        className="info-tooltip-trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label="More information"
      >
        <Info
          size={size}
          className="text-text-secondary hover:text-primary cursor-help transition-colors duration-200"
        />
      </div>

      {isVisible && (
        <div className="info-tooltip-content">
          <div className="info-tooltip-arrow" />
          <p className="info-tooltip-text">{description}</p>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
