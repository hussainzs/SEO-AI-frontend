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
