import React, { FC, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks'; // add plugin for single-line breaks
import {
  Link,
  Lightbulb,
  Copy,
  CheckCheck,
  FileText,
  Sparkles,
} from 'lucide-react'; // add FileText and Sparkles icons

// API configuration constants - can be modified later
const API_BASE_URL: string = 'http://127.0.0.1:8000';
// const FULL_ARTICLE_ENDPOINT: string = '/agent/suggestfullarticle/';
const FULL_ARTICLE_ENDPOINT: string = '/api/test/keyword/suggestfullarticle'; // test endpoint

/**
 * Types for the tab functionality
 */
type TabType = 'sentence' | 'full-article';

/**
 * Interface for the full article API response
 */
interface FullArticleResponse {
  success: boolean;
  article_suggestion: string;
  message: string;
}

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
  // State for tab functionality
  const [activeTab, setActiveTab] = useState<TabType>('sentence');
  const [fullArticleContent, setFullArticleContent] = useState<string>('');
  const [isLoadingFullArticle, setIsLoadingFullArticle] =
    useState<boolean>(false);
  const [fullArticleError, setFullArticleError] = useState<string>('');

  /**
   * Fetches full article revision from the API
   */
  const fetchFullArticleRevision = async (): Promise<void> => {
    // Don't fetch if we already have content or are currently loading
    if (fullArticleContent || isLoadingFullArticle) return;

    setIsLoadingFullArticle(true);
    setFullArticleError('');

    try {
      const response = await fetch(`${API_BASE_URL}${FULL_ARTICLE_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: FullArticleResponse = await response.json();

      if (data.success) {
        setFullArticleContent(data.article_suggestion);
        setFullArticleError('');
      } else {
        setFullArticleError(data.message);
        setFullArticleContent('');
      }
    } catch (error) {
      console.error('Error fetching full article revision:', error);
      setFullArticleError(
        'Failed to generate full article suggestion. Please try again.'
      );
      setFullArticleContent('');
    } finally {
      setIsLoadingFullArticle(false);
    }
  };

  /**
   * Handles tab switching and triggers API call if needed
   */
  const handleTabSwitch = async (tab: TabType): Promise<void> => {
    setActiveTab(tab);

    if (tab === 'full-article') {
      await fetchFullArticleRevision();
    }
  };

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
   * Renders the tab buttons for switching between sentence and full article revision
   */
  const renderTabButtons = (): React.JSX.Element => {
    return (
      <div className="flex justify-center mb-6">
        <div className="flex bg-light-bg border border-border rounded-md p-1">
          <button
            onClick={() => handleTabSwitch('sentence')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sentence'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text hover:text-primary'
            }`}
          >
            Sentence Level Revision
          </button>
          <button
            onClick={() => handleTabSwitch('full-article')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'full-article'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text hover:text-primary'
            }`}
          >
            Full Article Revision
          </button>
        </div>
      </div>
    );
  };

  /**
   * Renders the loading state with pulse sparkles for full article generation
   */
  const renderFullArticleLoading = (): React.JSX.Element => {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex space-x-2 mb-4">
          {[...Array(2)].map((_, index) => (
            <Sparkles
              key={index}
              className="text-primary animate-pulse"
              size={24}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </div>
        <p className="text-text-secondary text-sm">
          Generating full article revision...
        </p>
      </div>
    );
  };

  /**
   * Renders the full article content with markdown
   */
  const renderFullArticleContent = (): React.JSX.Element => {
    if (isLoadingFullArticle) {
      return renderFullArticleLoading();
    }

    if (fullArticleError) {
      return (
        <div className="bg-contradicted border border-contradicted rounded-md p-4">
          <p className="text-contradicted text-sm">{fullArticleError}</p>
        </div>
      );
    }

    if (!fullArticleContent) {
      return <></>;
    }

    return (
      <div className="prose prose-sm max-w-none answer-content-text">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
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
          {fullArticleContent}
        </ReactMarkdown>
      </div>
    );
  };
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
   * Renders the final answer section with markdown content and tab functionality
   */
  const renderFinalAnswerSection = (): React.JSX.Element => {
    if (!finalAnswer) return <></>;

    return (
      <div className="mb-6">
        <hr className="border-t mb-3" />

        {/* icon + title for final suggestions */}
        <div className="flex items-center gap-2 mb-3">
          <FileText className="text-secondary" size={20} />
          <h3 className="answer-section-title">
            Finalized Suggestions for your article
          </h3>
        </div>

        {/* Tab buttons */}
        {renderTabButtons()}

        {/* Content based on active tab */}
        {activeTab === 'sentence' ? (
          <div className="prose prose-sm max-w-none answer-content-text finalized-suggestions-text">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
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
                  <strong className="font-semibold text-text">
                    {children}
                  </strong>
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
                  <ol className="list-decimal pl-6 mb-4 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="answer-content-text">{children}</li>
                ),
              }}
            >
              {finalAnswer}
            </ReactMarkdown>
          </div>
        ) : (
          renderFullArticleContent()
        )}
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
