import React, { FC, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks'; // add plugin for single-line breaks
import { Link, Lightbulb, Copy, CheckCheck, FileText } from 'lucide-react'; // add FileText icon

/**
 * Props interface for the SuggestionsDisplay component
 */
interface SuggestionsDisplayProps {
  /** Suggested URL slug string */
  suggestedUrlSlug: string;
  /** Array of suggested article headlines */
  suggestedArticleHeadlines: string[];
  /** Final answer markdown content */
  finalAnswer: string;
}

/**
 * SuggestionsDisplay component displays AI-generated suggestions including
 * URL slug, article headlines, and final markdown content with copy functionality.
 */
const SuggestionsDisplay: FC<SuggestionsDisplayProps> = ({
  suggestedUrlSlug,
  suggestedArticleHeadlines,
  finalAnswer,
}) => {
  // State for copy functionality
  const [copiedSlug, setCopiedSlug] = useState<boolean>(false);
  const [copiedHeadlines, setCopiedHeadlines] = useState<
    Record<number, boolean>
  >({});

  /**
   * Handles copying text to clipboard with visual feedback
   */
  const handleCopy = async (
    text: string,
    type: 'slug' | 'headline',
    index?: number
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);

      if (type === 'slug') {
        setCopiedSlug(true);
        setTimeout(() => setCopiedSlug(false), 3000);
      } else if (type === 'headline' && index !== undefined) {
        setCopiedHeadlines((prev) => ({ ...prev, [index]: true }));
        setTimeout(() => {
          setCopiedHeadlines((prev) => ({ ...prev, [index]: false }));
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  /**
   * Renders the URL slug section with copy functionality
   */
  const renderUrlSlugSection = (): React.JSX.Element => {
    if (!suggestedUrlSlug) return <></>;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Link className="text-primary" size={20} />
          <h3 className="answer-section-title">Suggested URL Slug</h3>
        </div>

        {/* removed bg-primary-light to eliminate background */}
        <div className="relative border border-primary rounded-md p-4">
          <button
            onClick={() => handleCopy(suggestedUrlSlug, 'slug')}
            className="absolute top-2 right-2 p-1 text-text hover:bg-primary hover:text-white rounded-md transition-colors"
            title="Copy URL slug"
          >
            {copiedSlug ? (
              <CheckCheck size={16} className="text-verified" />
            ) : (
              <Copy size={16} />
            )}
          </button>

          {/* use text-primary for slug text, removed any border/bg classes */}
          <code className="text-primary pr-8 block">{suggestedUrlSlug}</code>
        </div>
      </div>
    );
  };

  /**
   * Renders the article headlines section with copy functionality
   */
  const renderHeadlinesSection = (): React.JSX.Element => {
    if (!suggestedArticleHeadlines || suggestedArticleHeadlines.length === 0)
      return <></>;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="text-additional" size={20} />
          <h3 className="answer-section-title">Suggested Article Headlines</h3>
        </div>

        <div className="space-y-3">
          {suggestedArticleHeadlines.map((headline: string, index: number) => (
            <div
              key={`headline-${index}`}
              className="relative bg-white border border-border rounded-md p-4 hover:shadow-sm transition-shadow"
            >
              <button
                onClick={() => handleCopy(headline, 'headline', index)}
                className="absolute top-2 right-2 p-1 text-text hover:bg-primary hover:text-white rounded-md transition-colors"
                title="Copy headline"
              >
                {copiedHeadlines[index] ? (
                  <CheckCheck size={16} className="text-verified" />
                ) : (
                  <Copy size={16} />
                )}
              </button>

              <p className="answer-content-text font-medium pr-8 leading-relaxed">
                {headline}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Renders the final answer section with markdown content
   */
  const renderFinalAnswerSection = (): React.JSX.Element => {
    if (!finalAnswer) return <></>;

    return (
      <div className="mb-6">
        {/* icon + title for final suggestions */}
        <div className="flex items-center gap-2 mb-3">
          <FileText className="text-secondary" size={20} />
          <h3 className="answer-section-title">
            Finalized Suggestions for your article
          </h3>
        </div>

        <div className="prose prose-sm max-w-none answer-content-text finalized-suggestions-text">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]} // include remarkBreaks here
            components={{
              // Custom styling for markdown elements to match our design system
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold answer-content-text mb-4">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold answer-content-text mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-medium answer-content-text mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="answer-content-text mb-3 leading-relaxed">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-text">{children}</strong>
              ),
              code: ({ children }) => (
                <code className="bg-primary-light text-primary px-1 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-light-bg border border-border rounded-md p-4 overflow-x-auto">
                  {children}
                </pre>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="answer-content-text">{children}</li>
              ),
            }}
          >
            {finalAnswer}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  return (
    <div className="suggestions-display">
      {renderUrlSlugSection()}
      {renderHeadlinesSection()}
      {renderFinalAnswerSection()}
    </div>
  );
};

export default SuggestionsDisplay;
