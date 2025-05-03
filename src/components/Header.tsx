import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white shadow-header">
      <div className="max-w-7xl mx-auto py-3">
        <div className="flex items-center gap-2">
          <FileText className="text-primary" size={28} />
          <h1 className="text-primary">
            <span className="font-bold text-3xl">SEO Assistant</span>{' '}
            <span className="text-text-secondary text-lg">for Journalists</span>
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
