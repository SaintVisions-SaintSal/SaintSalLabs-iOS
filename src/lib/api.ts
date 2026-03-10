/**
 * SaintSal Labs — Real API Client
 * Direct connections to Anthropic, OpenAI, Gemini, xAI
 * NO fake backend — every call hits a real API
 */
import {
  ANTHROPIC_API_KEY,
  OPENAI_API_KEY,
  GEMINI_API_KEY,
  XAI_API_KEY,
  SAL_MODELS,
  SAL_SYSTEM_PROMPT,
  BUILDER_SYSTEM_PROMPT,
} from '@/config/api';
import type { SALModelTier } from '@/types';

// ─── Anthropic Claude Streaming ──────────────────────────────

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
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: anthropicMessages,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      onError(`Anthropic API error ${res.status}: ${err}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) { onError('No response body'); return; }

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

// ─── xAI / Grok Streaming ────────────────────────────────────

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

    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: xaiMessages,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      onError(`xAI API error ${res.status}: ${err}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) { onError('No response body'); return; }

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

// ─── OpenAI Chat (non-streaming for search synthesis) ────────

export async function openaiChat(
  messages: { role: string; content: string }[],
  model: string = 'gpt-4o-mini'
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// ─── Gemini Search (grounding with Google Search) ────────────

export async function geminiSearch(query: string): Promise<{
  answer: string;
  sources: { title: string; url: string; snippet: string }[];
}> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }],
        tools: [{ google_search: {} }],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text || 'No results found.';

  // Extract grounding sources
  const groundingMeta = candidate?.groundingMetadata;
  const chunks = groundingMeta?.groundingChunks || [];
  const sources = chunks
    .filter((c: any) => c.web)
    .map((c: any) => ({
      title: c.web.title || 'Source',
      url: c.web.uri || '',
      snippet: '',
    }));

  return { answer: text, sources };
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
