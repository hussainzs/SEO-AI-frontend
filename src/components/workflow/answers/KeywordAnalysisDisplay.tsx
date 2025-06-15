import React, { FC } from 'react';
import { TrendingUp, Target, Search } from 'lucide-react';
import InfoTooltip from '../../common/InfoTooltip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

/**
 * Interface for keyword data structure
 */
interface KeywordData {
  text: string;
  monthly_search_volume: string;
  competition: string;
  competition_index: string;
  rank: string;
}

/**
 * Interface for primary/secondary keyword structure
 */
interface PrimaryKeywordData {
  keyword: string;
  reasoning: string;
}

/**
 * Props interface for the KeywordAnalysisDisplay component
 */
interface KeywordAnalysisDisplayProps {
  /** Array of keyword masterlist data */
  keywordMasterlist: KeywordData[];
  /** Array of primary keywords with reasoning */
  primaryKeywords: PrimaryKeywordData[];
  /** Array of secondary keywords with reasoning */
  secondaryKeywords: PrimaryKeywordData[];
}

/**
 * KeywordAnalysisDisplay component displays formatted keyword analysis data
 * with visual metrics and organized sections for primary and secondary keywords.
 */
const KeywordAnalysisDisplay: FC<KeywordAnalysisDisplayProps> = ({
  keywordMasterlist,
  primaryKeywords,
  secondaryKeywords,
}) => {
  /**
   * Gets the appropriate text color class based on competition level
   */
  const getCompetitionTextColor = (competition: string): string => {
    switch (competition.toUpperCase()) {
      case 'LOW':
        return 'text-competition-low';
      case 'MEDIUM':
        return 'text-competition-medium';
      case 'HIGH':
        return 'text-competition-high';
      default:
        return 'text-competition-na';
    }
  };

  /**
   * Calculates the width of the search volume bar based on max volume
   */
  const getSearchVolumeBarWidth = (
    volume: string,
    maxVolume: number
  ): number => {
    const numVolume = parseInt(volume) || 0;
    return Math.max((numVolume / maxVolume) * 100, 5); // Minimum 5% width for visibility
  };

  /**
   * Finds the maximum search volume for bar chart scaling
   */
  const maxSearchVolume = Math.max(
    ...keywordMasterlist.map(
      (keyword: KeywordData) => parseInt(keyword.monthly_search_volume) || 0
    ),
    1 // Minimum of 1 to avoid division by zero
  );

  /**
   * Renders a keyword data table row with visual elements
   */
  const renderKeywordRow = (
    keyword: KeywordData,
    index: number
  ): React.JSX.Element => {
    const searchVolume = parseInt(keyword.monthly_search_volume) || 0;
    const barWidth = getSearchVolumeBarWidth(
      keyword.monthly_search_volume,
      maxSearchVolume
    );

    return (
      <div
        key={`${keyword.text}-${index}`}
        className="bg-white p-4 rounded-md border border-border hover:shadow-md transition-shadow"
      >
        {/* Keyword rank and text */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold">
              {keyword.rank}
            </div>
            <h4 className="font-semibold text-text answer-content-text text-lg">
              {keyword.text}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-medium">
              Competition Level:
            </span>
            <InfoTooltip
              description="The amount of advertisers bidding on each keyword determines the level of competition (low, medium, or high). When Competition for a term is high (i.e., more advertisers are bidding on that keyword), you must bid high to get top places."
              size={12}
            />
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getCompetitionTextColor(keyword.competition)}`}
            >
              {keyword.competition || 'N/A'}
            </span>
          </div>
        </div>
        {/* Search volume visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between answer-content-text">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary flex items-center gap-1">
                <Search size={14} />
                Monthly Searches
              </span>
              <InfoTooltip
                description="The average monthly search volume for this keyword in the past year. Some keywords have seasonality - refer to the description of primary and secondary keywords to understand if those keywords had seasonality."
                size={12}
              />
            </div>
            <span className="font-semibold text-text">
              {searchVolume.toLocaleString()}
            </span>
          </div>

          {/* Progress bar for search volume */}
          <div className="w-full bg-primary-light rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${barWidth}%` }}
            />
          </div>
          {/* Competition index */}
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <span>Competition Index: {keyword.competition_index}</span>
              <InfoTooltip
                description="Shows how competitive ad placement is for a keyword, specific to location = USA and search network = Google Search. The level of competition from 0-100 is determined by the number of ad slots filled divided by the total number of ad slots available. Extremely low competition, i.e. 1, or slightly below medium competitiveness, i.e. 32."
                size={12}
              />
            </div>
            <span>{barWidth.toFixed(1)}% of max volume</span>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renders primary or secondary keyword section
   */
  const renderKeywordSection = (
    title: string,
    keywords: PrimaryKeywordData[],
    icon: React.ReactNode
  ): React.JSX.Element => {
    if (keywords.length === 0) return <></>;

    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="answer-section-title">{title}</h3>
        </div>
        <div className="space-y-4">
          {keywords.map((keyword: PrimaryKeywordData, index: number) => (
            <div
              key={`${keyword.keyword}-${index}`}
              className="bg-white p-5 rounded-md border border-border shadow-sm"
            >
              <h4 className="font-semibold answer-content-text text-lg text-primary mb-2">
                {keyword.keyword}
              </h4>
              <div className="prose prose-sm max-w-none answer-content-text">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
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
                  }}
                >
                  {keyword.reasoning}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="keyword-analysis-display">
      {/* Keyword Masterlist Section */}
      {keywordMasterlist.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary" size={24} />
            <h3 className="answer-section-title">
              Here are the top keywords we found for your article along with
              their metrics:
            </h3>
          </div>

          <div className="grid gap-4">
            {keywordMasterlist.map((keyword: KeywordData, index: number) =>
              renderKeywordRow(keyword, index)
            )}
          </div>
        </div>
      )}

      {/* Primary Keywords Section */}
      {renderKeywordSection(
        'We have chosen these Primary Keywords for your article',
        primaryKeywords,
        <Target className="text-verified" size={24} />
      )}

      {/* Secondary Keywords Section */}
      {renderKeywordSection(
        'Secondary Keywords for your article',
        secondaryKeywords,
        <Search className="text-additional" size={24} />
      )}
    </div>
  );
};

export default KeywordAnalysisDisplay;
