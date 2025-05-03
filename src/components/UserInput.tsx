import { FC, useState, ChangeEvent, FormEvent } from 'react';

export interface UserInputProps {
  onAnalyze: (text: string) => void;
}

const UserInput: FC<UserInputProps> = ({ onAnalyze }) => {
  const [text, setText] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAnalyze(trimmed);
    setText(''); // Clear the textarea after submission
  };

  return (
    <div className="card animate-slide-in">
      <form onSubmit={handleSubmit} className="w-full">
        <label
          htmlFor="article-input"
          className="block text-lg font-medium mb-3 text-text-secondary"
        >
          Paste your article draft here...
        </label>

        <textarea
          id="article-input"
          className="input-base h-64"
          placeholder="Paste your article draft here…"
          value={text}
          onChange={handleChange}
        />

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!text.trim()}
          >
            Analyze Content
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserInput;
