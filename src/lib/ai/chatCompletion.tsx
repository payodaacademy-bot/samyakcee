interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  max_completion_tokens?: number;
  temperature?: number;
}

type Provider = 'OPEN_AI' | 'GEMINI' | 'ANTHROPIC';

export async function getChatCompletion(
  provider: Provider,
  model: string,
  messages: Message[],
  options: ChatCompletionOptions = {}
) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, model, messages, options }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'AI request failed');
  }

  return response.json();
}
