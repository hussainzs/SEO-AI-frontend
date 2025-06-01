// src/App.tsx
import { FC, useState, useEffect } from 'react';
import './index.css';

import Header from './components/Header';
import UserInput from './components/UserInput';
import UserCard from './components/UserCard';
import WorkflowDisplay from './components/workflow/WorkflowDisplay';
import AnswerDisplay from './components/workflow/AnswerDisplay';
import ErrorMessageCard from './components/workflow/ErrorMessageCard';
import { useWorkflowStream } from './hooks/useWorkflowStream';

/**
 * Main application component that orchestrates the workflow analysis interface.
 * Manages user input, workflow execution, and result display using the workflow stream system.
 *
 * @returns JSX element representing the complete application
 */
const App: FC = () => {
  // Use the workflow stream hook to manage workflow state and execution
  const {
    workflowSteps,
    answers,
    isStreaming,
    isConnecting,
    isCompleted,
    error: streamError,
    startWorkflowStream,
    toggleStepExpansion,
  } = useWorkflowStream();

  // State to store the user's submitted query for display in UserCard
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  // State to store user input validation error message
  const [inputError, setInputError] = useState<string | null>(null);

  /**
   * Effect to scroll to the top of the page when the workflow is completed and answers are displayed.
   * This provides a better user experience by showing the results immediately.
   */
  useEffect(() => {
    // Check if the workflow is completed and there are answers to display
    if (isCompleted && answers.length > 0) {
      // Scroll to the top of the page smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isCompleted, answers]); // Dependencies for the effect

  /**
   * Handles the analysis request from the user input form.
   * Stores the query and initiates the workflow stream.
   *
   * @param text - The user's article content to analyze
   */
  const handleAnalyze = async (text: string): Promise<void> => {
    // Count words in the input text
    const wordCount = text.trim().split(/\s+/).length;

    // Check if input has at least 50 words
    if (wordCount < 50) {
      setInputError(
        'Input should be more than 50 words for comprehensive output. Please input your entire article draft.'
      );
      return;
    }

    // Clear any previous error message
    setInputError(null);

    try {
      setSubmittedQuery(text); // Store the query for display in UserCard component
      await startWorkflowStream(text); // Initiate the workflow stream via the useWorkflowStream hook
    } catch (error) {
      console.error('Error starting workflow analysis:', error);
      // Error handling is managed by the useWorkflowStream hook
    }
  };

  /**
   * Determines if the workflow is currently active (streaming or connecting).
   */
  const isWorkflowActive = (): boolean => {
    return isStreaming || isConnecting;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex flex-col flex-grow container mx-auto px-4 py-4 max-w-5xl">
        {/* Show UserInput form only if no query has been submitted yet */}
        {submittedQuery === null ? (
          <div className="flex flex-grow items-center">
            <div className="w-full">
              {/* Display input validation error if any */}
              {inputError && (
                <div className="mb-4 p-3 bg-contradicted text-contradicted rounded border border-contradicted">
                  {inputError}
                </div>
              )}
              <UserInput
                onAnalyze={handleAnalyze}
                isLoading={isWorkflowActive()}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Display the user's input query once submitted as a collapsible card */}
            <UserCard content={submittedQuery} />

            {/* Display stream connection errors */}
            {streamError && (
              <ErrorMessageCard
                error={streamError}
                title="Stream Connection Error"
                isCritical={true}
              />
            )}

            {/* Display workflow progress */}
            <WorkflowDisplay
              workflowSteps={workflowSteps}
              isStreaming={isStreaming}
              isConnecting={isConnecting}
              isCompleted={isCompleted}
              onToggleStepExpansion={toggleStepExpansion}
            />

            {/* Section separator: horizontal line between workflow and answers */}
            <hr className="border-t border-separator" />

            {/* Display collected answers */}
            <AnswerDisplay answers={answers} isCompleted={isCompleted} />
          </>
        )}
      </main>
    </div>
  );
};

export default App;

// just for testing purposes
// import WorkflowStreamTester from './components/tester';

// function App() {
//   return (
//     <div className="App">
//       <WorkflowStreamTester />
//     </div>
//   );
// }

// export default App;
