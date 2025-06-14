import React, { FC, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ExternalLink, Calendar, Award, Globe } from 'lucide-react';

/**
 * Interface for competitor information data structure
 */
interface CompetitorInfo {
  rank: number;
  url: string;
  title: string;
  published_date: string;
  highlights: string;
}

/**
 * Props interface for the CompetitorAnalysisDisplay component
 */
interface CompetitorAnalysisDisplayProps {
  /** Competitive analysis summary text (markdown) */
  competitiveAnalysis: string;
  /** Array of competitor information objects */
  competitorInformation: CompetitorInfo[];
}

/**
 * CompetitorAnalysisDisplay component displays competitor analysis summary
 * and competitor information cards with rich preview styling.
 */
const CompetitorAnalysisDisplay: FC<CompetitorAnalysisDisplayProps> = ({
  competitiveAnalysis,
  competitorInformation,
}) => {
  const [openCardIds, setOpenCardIds] = useState<Set<number>>(new Set());

  /**
   * Extracts domain name from URL for display
   */
  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      console.error('Error extracting domain:', error);
      return url;
    }
  };

  /**
   * Gets favicon URL for the domain
   */
  const getFaviconUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch (error) {
      console.error('Error getting favicon:', error);
      return '';
    }
  };

  /**
   * Formats published date for display
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  /**
   * Gets rank badge color - all primary color with white text
   */
  const getRankBadgeColor = (): string => {
    return 'bg-primary text-white';
  };

  /**
   * Toggles expanded state for competitor card
   */
  const toggleCardExpanded = (rank: number): void => {
    setOpenCardIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rank)) {
        newSet.delete(rank);
      } else {
        newSet.add(rank);
      }
      return newSet;
    });
  };

  /**
   * Renders the competitive analysis summary section
   */
  const renderCompetitiveAnalysisSection = (): React.JSX.Element => {
    if (!competitiveAnalysis) return <></>;

    return (
      <div className="mb-8">
        <h3 className="answer-section-title">Competitor Analysis Summary</h3>

        <div className="bg-white border border-border rounded-md p-6">
          <div className="prose prose-sm max-w-none answer-content-text">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                // Custom styling for markdown elements
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
              {competitiveAnalysis}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renders a single competitor information card
   */
  const renderCompetitorCard = (
    competitor: CompetitorInfo,
    index: number
  ): React.JSX.Element => {
    const isExpanded = openCardIds.has(competitor.rank);
    const domain = extractDomain(competitor.url);
    const faviconUrl = getFaviconUrl(competitor.url);

    return (
      <div
        key={`competitor-${competitor.rank}-${index}`}
        className="bg-white border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        {/* Card Header */}
        <div
          className="p-4 cursor-pointer"
          onClick={() => toggleCardExpanded(competitor.rank)}
        >
          <div className="flex items-start gap-4">
            {/* Rank Badge */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankBadgeColor()}`}
            >
              {competitor.rank}
            </div>

            {/* Site Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {/* Favicon */}
                {faviconUrl && (
                  <img
                    src={faviconUrl}
                    alt={`${domain} favicon`}
                    className="w-4 h-4 rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <Globe size={16} className="text-text-secondary" />
                <span className="text-sm font-medium text-primary truncate">
                  {domain}
                </span>
              </div>

              <h4 className="font-semibold answer-content-text leading-tight mb-2 line-clamp-2">
                {competitor.title}
              </h4>

              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{formatDate(competitor.published_date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award size={12} />
                  <span>Rank #{competitor.rank}</span>
                </div>
              </div>
            </div>

            {/* External Link Button */}
            <a
              href={competitor.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-text-secondary hover:text-primary hover:bg-primary-light rounded-md transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-border">
            <div className="pt-4">
              <h5 className="answer-content-text font-medium text-text mb-2">
                Article Highlights:
              </h5>
              <p className="answer-content-text text-text-secondary leading-relaxed bg-light-bg p-3 rounded-md">
                {competitor.highlights}
              </p>

              <div className="mt-3 pt-3 border-t border-border">
                <a
                  href={competitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary font-medium transition-colors"
                >
                  Read full article
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Renders the competitor information cards section
   */
  const renderCompetitorCardsSection = (): React.JSX.Element => {
    if (!competitorInformation || competitorInformation.length === 0)
      return <></>;

    return (
      <div>
        <h3 className="answer-section-title">
          Here are some of your top competitors we analyzed
        </h3>
        <div className="space-y-4">
          {competitorInformation.map(
            (competitor: CompetitorInfo, index: number) =>
              renderCompetitorCard(competitor, index)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="competitor-analysis-display">
      {renderCompetitiveAnalysisSection()}
      {renderCompetitorCardsSection()}
    </div>
  );
};

export default CompetitorAnalysisDisplay;
