import { FC, ReactNode } from 'react';

export interface OutputCardProps {
  children: ReactNode;
}

const OutputCard: FC<OutputCardProps> = ({ children }) => (
  <div className="card animate-slide-in">
    <div className="text-lg font-medium mb-3 text-text-secondary">
      Analysis Results
    </div>
    <div className="px-4 py-4 bg-light-bg rounded-md border border-border">
      {children}
    </div>
  </div>
);

export default OutputCard;
