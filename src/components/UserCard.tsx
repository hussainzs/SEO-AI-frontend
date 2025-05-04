import { FC, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, CheckCheck } from 'lucide-react';

// content is sent by the parent component
export interface UserCardProps {
  content: string;
}

const UserCard: FC<UserCardProps> = ({ content }) => {
  // Start with collapsed state as true for automatic collapse
  const [collapsed, setCollapsed] = useState<boolean>(true);

  // state to handle wether user copied the text or not
  const [copied, setCopied] = useState<boolean>(false);

  // Handle copy function
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="card animate-slide-in overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="tag-user">U</span>
          <span className="text-text-secondary">Your Input</span>
        </div>

        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="card-toggle"
        >
          {collapsed ? (
            <>
              <span>Show input</span>
              <ChevronDown size={16} />
            </>
          ) : (
            <>
              <span>Hide input</span>
              <ChevronUp size={16} />
            </>
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="relative px-4 py-4 text-text whitespace-pre-wrap mt-2 bg-light-bg rounded-md max-h-96 overflow-y-auto border border-border">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1 text-text hover:bg-primary hover:text-white rounded-md transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCheck size={14} className="text-verified" />
            ) : (
              <Copy size={14} />
            )}
          </button>
          {content}
        </div>
      )}
    </div>
  );
};

export default UserCard;
