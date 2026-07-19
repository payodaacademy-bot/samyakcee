'use client';

import { useState, useCallback } from 'react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  max_completion_tokens?: number;
  temperature?: number;
}

interface UseChatReturn {
  response: string | null;
  isLoading: boolean;
  error: Error | null;
  sendMessage: (messages: Message[], options?: ChatOptions) => void;
}

type Provider = 'OPEN_AI' | 'GEMINI' | 'ANTHROPIC';

export function useChat(provider: Provider, model: string, streaming = false): UseChatReturn {
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (messages: Message[], options: ChatOptions = {}) => {
      setIsLoading(true);
      setError(null);
      setResponse(null);

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, model, messages, options, streaming }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(errData.error || 'AI request failed');
        }

        if (streaming && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let accumulated = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;
            setResponse(accumulated);
          }
        } else {
          const data = await res.json();
          setResponse(data.choices?.[0]?.message?.content || '');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    },
    [provider, model, streaming]
  );

  return { response, isLoading, error, sendMessage };
}
