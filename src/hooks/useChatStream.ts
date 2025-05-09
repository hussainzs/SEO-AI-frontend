import { useState, useCallback, useRef, useEffect } from 'react';
import { AgentChatRequest, ChatEvent } from '../types/chatEventTypes';

const API_ENDPOINT = 'http://127.0.0.1:8000/api/test-agent/chat/stream';

/**
 * Interface for the return value of the useChatStream hook.
 * It includes the messages received from the stream, loading state,
 * connection state, error message, and a function to start the stream.
 */
export interface UseChatStreamReturn {
  messages: ChatEvent[];
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
  startStream: (query: string) => Promise<void>;
}

/**
 * Custom React hook to manage a Server-Sent Events (SSE) stream for chat.
 * It handles making the POST request, reading the stream, decoding messages,
 * and managing state for messages, loading, and errors.
 */
export const useChatStream = (): UseChatStreamReturn => {
  const [messages, setMessages] = useState<ChatEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (query: string) => {
      // Guards against double clicks: checks isLoading state and if an AbortController is already active.
      if (isLoading || abortControllerRef.current) {
        console.warn('Stream is already in progress or being initiated.');
        return;
      }

      // Reset state for new query
      setMessages([]);
      setIsLoading(true);
      setIsConnecting(true);
      setError(null);

      // refresh the abort controller for the new request
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      // Now we send a POST request to the server with the query
      try {
        const requestBody: AgentChatRequest = { query }; // query was passed as a param to this function
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(requestBody),
          signal,
        });

        // Check if the response from server is ok (status in the range 200-299)
        if (!response.ok) {
          let errorText = `Network response was not ok: ${response.status} ${response.statusText}.`;
          try {
            const bodyText = await response.text();
            if (bodyText) errorText += `\nServer message: ${bodyText}`;
          } catch (e) {
            // Log the error to provide debugging information
            console.error('Error reading server response body:', e);
          }
          throw new Error(errorText);
        }

        // Check if the response body is null
        if (!response.body) {
          throw new Error('Response body is null, cannot read stream.');
        }

        // Getting to this point means the response is ok and we can start reading the stream
        const reader = response.body.getReader(); //getReader will give us .read() method to read the next chunk in stream
        const decoder = new TextDecoder('utf-8'); // We need a decoder to convert the stream of bytes into text
        let buffer = '';

        // This loop will read the stream until it's closed or an error occurs
        while (true) {
          // Read the next chunk from the stream
          const { done, value } = await reader.read();

          // if reader.read() returns done: true, it means the stream is closed
          // if signal.aborted is true, it means the stream was aborted
          if (done || signal.aborted) {
            break;
          }

          // This check relies on React having processed state updates after an `await`.
          if (isConnecting) {
            setIsConnecting(false);
          }

          // Decode the chunk as text and append it to the buffer. stream=true because we want to keep the stream open
          buffer += decoder.decode(value, { stream: true });

          let eolIndex;
          // This loop processes all *complete* SSE messages found in the buffer.
          while ((eolIndex = buffer.indexOf('\n\n')) >= 0) {
            // 1. Extract a single, complete SSE message (everything up to '\n\n').
            const messageLine = buffer.substring(0, eolIndex).trim();
            // 2. Remove the processed message AND its delimiter ('\n\n') from the start of the buffer.What remains in 'buffer' is any data that came after this message.
            // We do this because SSE may send one complete message and then a partial part of next message in the same chunk.
            buffer = buffer.substring(eolIndex + 2);

            // Check if the message line starts with 'data:' Standard SSE format. data: is 5 characters long so we start from index 5
            if (messageLine.startsWith('data:')) {
              const jsonString = messageLine.substring(5).trim();
              if (jsonString) {
                // Parse the JSON string into a JavaScript object. If parsing fails, we log the error and stop consuming the stream.
                try {
                  // Parse the Json as ChatEvent type. Each ChatEvent type has different properties but all have a 'type' property.
                  const eventData = JSON.parse(jsonString) as ChatEvent;
                  setMessages((prevMessages) => [...prevMessages, eventData]);

                  if (eventData.type === 'complete') {
                    setIsLoading(false);
                    reader.cancel(); // Signal reader to stop, leads to `done: true`
                    break; // Exit message processing loop for this chunk
                  }
                } catch (e) {
                  console.error(
                    'Failed to parse JSON from SSE event:',
                    jsonString,
                    e
                  );
                }
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Stream fetch aborted.');
        } else {
          console.error('SSE stream error:', err);
          setError(
            err instanceof Error
              ? err.message
              : 'An unknown error occurred during streaming.'
          );
        }
      } finally {
        setIsLoading(false);
        setIsConnecting(false); // Ensures isConnecting is false even if no data was received but stream closed/errored
        abortControllerRef.current = null;
      }
    },
    [isLoading, isConnecting]
  ); // `isLoading` for guard, `isConnecting` as it's part of the hook's managed state lifecycle.

  // Run useEffect to clean up the abort controller when the component mounts. The empty dependency array means this effect runs only once when the component mounts.
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log('Aborting stream due to component unmount.');
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { messages, isLoading, isConnecting, error, startStream };
};
