import { FC, useState } from 'react';
import './index.css';

import Header from './components/Header';
import UserInput from './components/UserInput';
import UserCard from './components/UserCard';
import OutputCard from './components/OutputCard';

import { FileSearch } from 'lucide-react';

const App: FC = () => {
  const [userInput, setUserInput] = useState<string | null>(null);

  // This function will be called when the user submits the form in UserInput component.
  const handleAnalyze = (text: string) => {
    setUserInput(text);
    // → TODO: call FastAPI and push results into state
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {userInput === null ? (
          <UserInput onAnalyze={handleAnalyze} />
        ) : (
          <>
            <UserCard content={userInput} />
            <OutputCard>
              <p className="text-text-secondary flex items-center gap-2">
                <span className="animate-pulse">
                  <FileSearch />
                </span>{' '}
                Analyzing...
              </p>
            </OutputCard>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
