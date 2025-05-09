import { FC } from 'react';
import { Cog } from 'lucide-react'; // Icon for tool invocation

interface ToolCallCardProps {
  toolName: string;
  toolArgs: Record<string, string>;
}

const ToolCallCard: FC<ToolCallCardProps> = ({ toolName, toolArgs }) => {
  return (
    <div className="card animate-slide-in border border-border">
      {/* Card header with tool icon and name */}
      <div className="flex gap-3 items-center mb-3">
        <span className="flex items-center justify-center p-2 bg-primary-light rounded-full text-primary">
          <Cog size={20} />
        </span>
        <span className="text-lg font-medium text-text-secondary">
          Tool Invoked:{' '}
          <span className="font-semibold text-text">{toolName}</span>
        </span>
      </div>

      {/* Tool arguments section */}
      <div className="px-4 py-3 bg-light-bg rounded-md border border-border">
        <h4 className="font-medium text-text mb-2 text-sm">
          Ran with Arguments:
        </h4>
        <pre className="text-xs bg-background p-3 rounded-md overflow-x-auto text-text-secondary">
          {JSON.stringify(toolArgs, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ToolCallCard;
