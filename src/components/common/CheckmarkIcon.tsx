// src/components/common/CheckmarkIcon.tsx
import { FC } from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * Props interface for the CheckmarkIcon component.
 */
interface CheckmarkIconProps {
  /** Size of the checkmark in pixels */
  size?: number;
  /** Additional CSS classes to apply */
  className?: string;
  /** Color variant for the checkmark */
  variant?: 'success' | 'primary';
}

/**
 * CheckmarkIcon component displays a checkmark icon with customizable styling.
 * Used to indicate successful completion of tasks or steps.
 *
 * @param size - Size of the checkmark in pixels (defaults to 20)
 * @param className - Additional CSS classes to apply
 * @param variant - Color variant (defaults to 'success')
 * @returns JSX element representing the checkmark icon
 */
const CheckmarkIcon: FC<CheckmarkIconProps> = ({
  size = 20,
  className = '',
  variant = 'success',
}) => {
  /**
   * Get the appropriate color classes based on variant.
   */
  const getColorClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'text-primary';
      case 'success':
      default:
        return 'text-verified';
    }
  };

  return (
    <CheckCircle size={size} className={`${getColorClasses()} ${className}`} />
  );
};

export default CheckmarkIcon;
