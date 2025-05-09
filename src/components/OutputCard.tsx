// src/components/OutputCard.tsx
import { FC } from 'react';
import { ChatEvent } from '../types/chatEventTypes';
import AnswerCard from './chat/AnswerCard';
import ToolCallCard from './chat/ToolCallCard';
import ToolProcessingCard from './chat/ToolProcessingCard';
import ErrorCard from './chat/ErrorCard';
import InitialLoading from './chat/InitialLoading';

export interface OutputCardProps {
  messages: ChatEvent[];
  isConnecting: boolean; // True when stream is initiated but first message not yet received
  streamError: string | null; // Errors from the stream connection itself
}

const OutputCard: FC<OutputCardProps> = ({
  messages,
  isConnecting,
  streamError,
}) => {
  // 1. Display stream connection errors first
  if (streamError) {
    // Pass a specific title for stream errors, 'content' will be the error message string
    return <ErrorCard title="Stream Connection Error" content={streamError} />;
  }

  // 2. Show initial loading indicator if connecting and no messages have arrived yet
  if (isConnecting && messages.length === 0) {
    return <InitialLoading />;
  }

  // 3. If not connecting, no stream error, and no messages, display nothing.
  if (!isConnecting && messages.length === 0 && !streamError) {
    return null;
  }

  // 4. Render the list of messages using their respective components
  return (
    <>
      {messages.map((msg, index) => {
        const key = `chat-msg-${msg.type}-${index}`; // Unique key for each message
        // msg is a ChatEvent object which can be multiple interfaces but all have a 'type' property
        // We can use a switch statement to determine the type of message and render accordingly
        switch (msg.type) {
          case 'answer':
            return <AnswerCard key={key} content={msg.content} />;
          case 'tool_call':
            return (
              <ToolCallCard
                key={key}
                toolName={msg.tool_name}
                toolArgs={msg.tool_args}
              />
            );
          case 'tool_processing':
            return <ToolProcessingCard key={key} content={msg.content} />;
          case 'error': // This is a workflow error from the backend
            // Pass a specific title for workflow errors
            return (
              <ErrorCard
                key={key}
                title="Workflow Operation Error"
                content={msg.content}
              />
            );
          case 'complete':
            return null; // 'complete' messages do not render UI
          default:
            // This should not happen if the backend is sending correct types
            console.warn('Received unknown message type in OutputCard:', msg);
            return (
              <p className="text-red-500 text-2xl">Unknown message type</p>
            );
        }
      })}
    </>
  );
};

export default OutputCard;
