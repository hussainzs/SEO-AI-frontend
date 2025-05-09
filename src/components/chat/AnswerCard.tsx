// src/components/chat/AnswerCard.tsx
import { FC } from 'react';

interface AnswerCardProps {
  content: string;
}

const AnswerCard: FC<AnswerCardProps> = ({ content }) => {
  return (
    <div className="card animate-slide-in">
      <div className="flex gap-2 items-center mb-3">
        <span className="tag-ai"> AI </span>
        <span className="text-lg font-medium text-text-secondary"> Answer </span>
      </div>
      <div className="px-4 py-4 bg-light-bg rounded-md border border-border">
        {/* Using whitespace-pre-wrap to preserve newlines and spaces from the AI's response */}
        <p className="text-text whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};

export default AnswerCard;
