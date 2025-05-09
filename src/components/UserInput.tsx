// src/components/UserInput.tsx
import { FC, useState, ChangeEvent, FormEvent } from 'react';

export interface UserInputProps {
  // This is a function passed by parent. When submit button is clicked, it will be called in handleSubmit and execute the function passed by parent
  onAnalyze: (text: string) => void;
  isLoading: boolean; // indicate if analysis is in progress so we can disable the submit button and textarea to avoid double submission
}

const UserInput: FC<UserInputProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState<string>('');

  // Whenever new text is entered in the textarea, update the state to show the text in the textarea.
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    // Prevent submission if text is empty or if analysis is already in progress
    if (!trimmed || isLoading) return;

    onAnalyze(trimmed);
    setText(''); // Clear textarea after submission. App.tsx hides this component after submission, so clearing should be fine.
  };

  return (
    <div className="card animate-slide-in">
      <form onSubmit={handleSubmit} className="w-full">
        <label
          htmlFor="article-input"
          className="block font-medium text-2xl mb-5 text-text text-center"
        >
          Paste your article draft here
        </label>

        <textarea
          id="article-input"
          className="input-base h-64"
          placeholder="Once upon a time, in a land far, far away..."
          value={text}
          onChange={handleChange}
          disabled={isLoading} // Disable textarea during loading
        />

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!text.trim() || isLoading} // Disable button if no text or during loading
          >
            {isLoading ? 'Analyzing...' : 'Analyze Content'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserInput;
