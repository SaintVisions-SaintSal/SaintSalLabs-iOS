/**
 * SaintSal Labs — API Client (Secure Backend Gateway)
 * All AI calls route through https://saintsallabs-api.onrender.com
 * NO API keys stored in the mobile bundle.
 */
import {
  API_GATEWAY_URL,
  API_GATEWAY_KEY,
  SAL_MODELS,
  SAL_SYSTEM_PROMPT,
  BUILDER_SYSTEM_PROMPT,
} from '@/config/api';
import type { SALModelTier } from '@/types';

// ─── Gateway fetch helper ────────────────────────────────────

function gatewayHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-sal-key': API_GATEWAY_KEY,
  };
}

// ─── Anthropic Claude Streaming (via gateway) ────────────────

export async function streamAnthropicChat(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  model: string,
  onChunk: (text: string) => void,
  onDone: (fullText: string, modelUsed: string) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const anthropicMessages = messages.map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }));

    const res = await fetch(`${API_GATEWAY_URL}/api/chat/anthropic`, {
      method: 'POST',
      headers: gatewayHeaders(),
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages: anthropicMessages,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      // If model not found, try fallback model
      if (res.status === 404 && model.includes('haiku')) {
        console.log('Haiku model not found, falling back to claude-3-haiku-20240307');
        return streamAnthropicChat(
          messages,
          systemPrompt,
          'claude-3-haiku-20240307',
          onChunk,
          onDone,
          onError
        );
      }
      onError(`API error ${res.status}: ${err}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content_block_delta' && data.delta?.text) {
              fullText += data.delta.text;
              onChunk(data.delta.text);
            }
            if (data.type === 'message_stop') {
              onDone(fullText, model);
              return;
            }
          } catch {
            // skip malformed
          }
        }
      }
    }
    onDone(fullText, model);
  } catch (err: any) {
    onError(err.message || 'Connection failed');
  }
}

// ─── xAI / Grok Streaming (via gateway) ──────────────────────

export async function streamXAIChat(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  model: string,
  onChunk: (text: string) => void,
  onDone: (fullText: string, modelUsed: string) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const xaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const res = await fetch(`${API_GATEWAY_URL}/api/chat/xai`, {
      method: 'POST',
      headers: gatewayHeaders(),
      body: JSON.stringify({
        model,
        messages: xaiMessages,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      onError(`API error ${res.status}: ${err}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const delta = data.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              onChunk(delta);
            }
          } catch {
            // skip malformed
          }
        } else if (line === 'data: [DONE]') {
          onDone(fullText, model);
          return;
        }
      }
    }
    onDone(fullText, model);
  } catch (err: any) {
    onError(err.message || 'Connection failed');
  }
}

// ─── OpenAI Chat (non-streaming, via gateway) ────────────────

export async function openaiChat(
  messages: { role: string; content: string }[],
  model: string = 'gpt-4o-mini'
): Promise<string> {
  const res = await fetch(`${API_GATEWAY_URL}/api/chat/openai`, {
    method: 'POST',
    headers: gatewayHeaders(),
    body: JSON.stringify({ model, messages, max_tokens: 2048 }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// ─── Gemini Search (via gateway — handles failover server-side) ─

export async function geminiSearch(query: string): Promise<{
  answer: string;
  sources: { title: string; url: string; snippet: string }[];
}> {
  try {
    const res = await fetch(`${API_GATEWAY_URL}/api/search/gemini`, {
      method: 'POST',
      headers: gatewayHeaders(),
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error(`Search API error: ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Search failed:', err.message);
    return { answer: 'Search is temporarily unavailable. Please try again.', sources: [] };
  }
}

// ─── Unified Chat Dispatcher ─────────────────────────────────

export function streamChat(
  messages: { role: string; content: string }[],
  tier: SALModelTier,
  systemPrompt: string,
  onChunk: (text: string) => void,
  onDone: (fullText: string, modelUsed: string) => void,
  onError: (error: string) => void
): void {
  const modelConfig = SAL_MODELS[tier];

  if (modelConfig.provider === 'xai') {
    streamXAIChat(messages, systemPrompt, modelConfig.model, onChunk, onDone, onError);
  } else {
    streamAnthropicChat(messages, systemPrompt, modelConfig.model, onChunk, onDone, onError);
  }
}

// ─── Builder Chat (always Claude Sonnet for code gen) ────────

export function streamBuilderChat(
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onDone: (fullText: string, modelUsed: string) => void,
  onError: (error: string) => void
): void {
  streamAnthropicChat(
    messages,
    BUILDER_SYSTEM_PROMPT,
    'claude-sonnet-4-20250514',
    onChunk,
    onDone,
    onError
  );
}
