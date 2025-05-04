import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white shadow-header">
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex items-center gap-2">
          <FileText className="text-primary" size={28} />
          <h1 className="text-primary">
            <span className="font-bold text-xl sm:text-2xl md:text-3xl">SEO Assistant</span>{' '}
            <span className="text-text-secondary mx-1 text-sm sm:text-base md:text-lg">for Journalists</span>
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
