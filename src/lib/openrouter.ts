type OpenRouterMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function openrouterChatJSON<T>(opts: {
  model?: string;
  messages: OpenRouterMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // Optional but recommended by OpenRouter:
      'HTTP-Referer': 'https://kaza-web-1.vercel.app',
      'X-Title': 'Kaza',
    },
    body: JSON.stringify({
      model: opts.model ?? 'openai/gpt-4o-mini',
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 1200,
      response_format: { type: 'json_object' },
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const json = JSON.parse(text);
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenRouter returned no content');
  return JSON.parse(content) as T;
}
