import { FC } from 'react';
import { StoredAnswer } from '../../types/workflowEvents';
import KeywordAnalysisDisplay from './answers/KeywordAnalysisDisplay';
import SuggestionsDisplay from './answers/SuggestionsDisplay';
import CompetitorAnalysisDisplay from './answers/CompetitorAnalysisDisplay';

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
 * Interface for competitor information
 */
interface CompetitorInfo {
  rank: number;
  url: string;
  title: string;
  published_date: string;
  highlights: string;
}

/**
 * Props interface for the AnswerDisplay component.
 */
interface AnswerDisplayProps {
  /** Array of collected answers from the workflow */
  answers: StoredAnswer[];
  /** Whether the workflow has completed */
  isCompleted: boolean;
}

/**
 * AnswerDisplay component displays the accumulated answers from the workflow.
 * Shows answers in formatted components once the workflow is complete.
 *
 * @param answers - Array of stored answers collected during workflow execution
 * @param isCompleted - Whether the workflow has completed successfully
 * @returns JSX element representing the answer display section
 */
const AnswerDisplay: FC<AnswerDisplayProps> = ({ answers, isCompleted }) => {
  /**
   * Don't render anything if there are no answers yet or workflow hasn't completed.
   * Answers should only be displayed once the entire workflow is done.
   */
  if (answers.length === 0 || !isCompleted) {
    return null;
  }

  /**
   * Extract data from different answer nodes for structured display
   */
  const extractAnswerData = (): {
    keywordData: {
      keywordMasterlist: KeywordData[];
      primaryKeywords: PrimaryKeywordData[];
      secondaryKeywords: PrimaryKeywordData[];
    } | null;
    suggestionsData: {
      suggestedUrlSlug: string;
      suggestedArticleHeadlines: string[];
      finalAnswer: string;
    } | null;
    competitorData: {
      competitiveAnalysis: string;
      competitorInformation: CompetitorInfo[];
    } | null;
  } => {
    // Initialize data structures for each answer type
    let keywordData: {
      keywordMasterlist: KeywordData[];
      primaryKeywords: PrimaryKeywordData[];
      secondaryKeywords: PrimaryKeywordData[];
    } | null = null;

    let suggestionsData: {
      suggestedUrlSlug: string;
      suggestedArticleHeadlines: string[];
      finalAnswer: string;
    } | null = null;

    let competitorData: {
      competitiveAnalysis: string;
      competitorInformation: CompetitorInfo[];
    } | null = null;

    // Process each answer to extract relevant data
    answers.forEach((answer: StoredAnswer) => {
      const data = answer.data;

      switch (answer.node) {
        case 'Masterlist and Primary Keyword Generator':
          keywordData = {
            keywordMasterlist: (data.keyword_masterlist as KeywordData[]) || [],
            primaryKeywords:
              (data.primary_keywords as PrimaryKeywordData[]) || [],
            secondaryKeywords:
              (data.secondary_keywords as PrimaryKeywordData[]) || [],
          };
          break;

        case 'Suggestions Generator':
          suggestionsData = {
            suggestedUrlSlug: (data.suggested_url_slug as string) || '',
            suggestedArticleHeadlines:
              (data.suggested_article_headlines as string[]) || [],
            finalAnswer: (data.final_answer as string) || '',
          };
          break;

        case 'Competitor Analysis':
          competitorData = {
            competitiveAnalysis: (data.competitive_analysis as string) || '',
            competitorInformation:
              (data.competitor_information as CompetitorInfo[]) || [],
          };
          break;

        default:
          console.warn(`Unknown answer node: ${answer.node}`);
          break;
      }
    });

    return { keywordData, suggestionsData, competitorData };
  };

  const { keywordData, suggestionsData, competitorData } = extractAnswerData();

  return (
    <div className="answer-display mt-8">
      {/* Main Answer Box with AI Pin */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-border animate-slide-in">
        {/* Answer header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="tag-ai">AI</span>
          <div>
            <h2 className="text-2xl font-bold text-text">Analysis Results</h2>
          </div>
        </div>

        {/* Answer content sections */}
        <div className="space-y-8">
          {/* 1. Keyword Analysis Section */}
          {keywordData && (
            <KeywordAnalysisDisplay
              keywordMasterlist={keywordData.keywordMasterlist}
              primaryKeywords={keywordData.primaryKeywords}
              secondaryKeywords={keywordData.secondaryKeywords}
            />
          )}

          {/* 2. Suggestions Section */}
          {suggestionsData && (
            <div className="border-t border-separator pt-8">
              <SuggestionsDisplay
                suggestedUrlSlug={suggestionsData.suggestedUrlSlug}
                suggestedArticleHeadlines={
                  suggestionsData.suggestedArticleHeadlines
                }
                finalAnswer={suggestionsData.finalAnswer}
              />
            </div>
          )}

          {/* 3. Competitor Analysis Section */}
          {competitorData && (
            <div className="border-t border-separator pt-8">
              <CompetitorAnalysisDisplay
                competitiveAnalysis={competitorData.competitiveAnalysis}
                competitorInformation={competitorData.competitorInformation}
              />
            </div>
          )}
        </div>
      </div>

      {/* Loading state for incomplete workflows */}
      {!isCompleted && answers.length > 0 && (
        <div className="mt-6 p-4 bg-primary-light rounded-md border border-primary-medium">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
            <span className="font-medium">Workflow still processing...</span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            More results may appear as the workflow continues.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnswerDisplay;
