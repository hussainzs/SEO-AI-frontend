import { FC, ReactNode } from 'react';

export interface OutputCardProps {
  children: ReactNode;
}

const OutputCard: FC<OutputCardProps> = ({ children }) => (
  <div className="card animate-slide-in">
    <div className="flex gap-2 items-center mb-3">
      <span className="tag-ai"> AI </span>
      <span className="text-lg font-medium text-text-secondary"> Answer </span>
    </div>

    <div className="px-4 py-4 bg-light-bg rounded-md border border-border">
      {children}
    </div>
  </div>
);

export default OutputCard;
