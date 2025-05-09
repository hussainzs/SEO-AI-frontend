// src/components/chat/ErrorCard.tsx
import { FC } from 'react';

/**
 * ErrorCard component displays a simple error message in a styled card.
 * Intended for debugging and developer feedback.
 *
 * @param {string} title - The title of the error message.
 * @param {string} content - The detailed error content.
 * @returns {JSX.Element} The rendered error card.
 */
interface ErrorCardProps {
  title: string;
  content: string;
}

const ErrorCard: FC<ErrorCardProps> = ({ title, content }) => {
  return (
    <div className="card bg-contradicted text-white border-contradicted">
      <div className="mb-2 text-md font-semibold">{title}</div>
      <div className="text-sm whitespace-pre-wrap">{content}</div>
    </div>
  );
};

export default ErrorCard;
