import { FC, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface UserCardProps {
  content: string;
}

const UserCard: FC<UserCardProps> = ({ content }) => {
  // Start with collapsed state as true for automatic collapse
  const [collapsed, setCollapsed] = useState<boolean>(true);

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
        <div className="px-4 py-4 text-text whitespace-pre-wrap mt-2 bg-light-bg rounded-md max-h-96 overflow-y-auto border border-border">
          {content}
        </div>
      )}
    </div>
  );
};

export default UserCard;
