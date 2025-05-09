import { FC } from 'react';
import { FileSearch } from 'lucide-react';

interface ToolProcessingCardProps {
  content: string;
}

const ToolProcessingCard: FC<ToolProcessingCardProps> = ({ content }) => {
  return (
    <div className="p-6 rounded-md shadow-md my-4 w-full animate-slide-in bg-primary-light border border-primary-medium">
      <div className="flex items-center gap-3 p-4">
        <FileSearch className="w-5 h-5 text-primary animate-pulse" />
        <p className="text-primary font-medium text-sm">
          {content || 'Tool is currently processing...'}
        </p>
      </div>
    </div>
  );
};

export default ToolProcessingCard;
