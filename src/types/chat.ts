/**
 * Defines the structure for the request sent to the agent's chat stream endpoint.
 */
export interface AgentChatRequest {
  query: string;
}

/**
 * Represents an answer message from the AI.
 */
export interface AnswerMessage {
  type: 'answer';
  content: string;
}

/**
 * Represents a tool call initiated by the AI.
 */
export interface ToolCallMessage {
  type: 'tool_call';
  tool_name: string;
  tool_args: Record<string, string>;
}

/**
 * Indicates that a tool is currently being processed.
 */
export interface ToolProcessingMessage {
  type: 'tool_processing';
  content: string;
}

/**
 * Signals the successful completion of the workflow.
 */
export interface CompleteMessage {
  type: 'complete';
  content: string;
}

/**
 * Represents an error message from the workflow.
 */
export interface ErrorMessage {
  type: 'error';
  content: string;
}

/**
 * A union type representing all possible messages that can be received from the stream.
 */
export type ChatEvent =
  | AnswerMessage
  | ToolCallMessage
  | ToolProcessingMessage
  | CompleteMessage
  | ErrorMessage;
