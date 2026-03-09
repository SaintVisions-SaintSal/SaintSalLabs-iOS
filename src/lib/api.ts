/**
 * SaintSal Labs — API Client
 * Connects to the SAL Engine v4 FastAPI backend
 */
import { API_BASE, XAI_API_KEY, XAI_BASE_URL } from '@/config/api';
import { useStore } from '@/lib/store';
import type { ChatMessage, SearchResult, BuilderFile } from '@/types';

class SALClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  private get headers(): Record<string, string> {
    const token = useStore.getState().authToken;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // ─── CHAT ───────────────────────────────────────────────────

  async chat(message: string, model: string = 'auto', system: string = ''): Promise<{
    content: string;
    model_used: string;
    provider: string;
    tokens_in: number;
    tokens_out: number;
    cost: number;
    latency_ms: number;
  }> {
    const res = await fetch(`${this.baseUrl}/v1/chat`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ message, model, system, stream: false }),
    });
    if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
    return res.json();
  }

  async *chatStream(
    message: string,
    model: string = 'auto',
    system: string = ''
  ): AsyncGenerator<{ type: string; content?: string; model?: string; provider?: string }> {
    const res = await fetch(`${this.baseUrl}/v1/chat/stream`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ message, model, system, stream: true }),
    });

    if (!res.ok) throw new Error(`Stream failed: ${res.status}`);
    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

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
            yield data;
          } catch {
            // skip malformed
          }
        }
      }
    }
  }

  // ─── SEARCH ─────────────────────────────────────────────────

  async search(query: string, maxResults: number = 10, deep: boolean = false): Promise<{
    results: SearchResult[];
    answer: string;
    sources_used: string[];
  }> {
    const res = await fetch(`${this.baseUrl}/v1/search`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, max_results: maxResults, use_rag: true, deep }),
    });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    return res.json();
  }

  // ─── BUILDER ────────────────────────────────────────────────

  async build(prompt: string, framework: string = 'nextjs', deployTo?: string): Promise<{
    files: BuilderFile[];
    build_type: string;
    preview_html: string;
    deploy_url: string;
    repo_url: string;
    metadata: Record<string, any>;
  }> {
    const res = await fetch(`${this.baseUrl}/v1/builder`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ prompt, framework, deploy_to: deployTo }),
    });
    if (!res.ok) throw new Error(`Build failed: ${res.status}`);
    return res.json();
  }

  async builderIterate(feedback: string, files: BuilderFile[]): Promise<{ files: BuilderFile[] }> {
    const res = await fetch(`${this.baseUrl}/v1/builder/iterate`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ feedback, files }),
    });
    if (!res.ok) throw new Error(`Iterate failed: ${res.status}`);
    return res.json();
  }

  // ─── MEDIA GENERATION ──────────────────────────────────────

  async generateImage(prompt: string, provider: string = 'dalle'): Promise<{ url: string }> {
    const res = await fetch(`${this.baseUrl}/v1/generate/image`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ prompt, provider }),
    });
    if (!res.ok) throw new Error(`Image gen failed: ${res.status}`);
    return res.json();
  }

  async generateVideo(prompt: string, imageUrl?: string): Promise<{ url: string }> {
    const res = await fetch(`${this.baseUrl}/v1/generate/video`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ prompt, image_url: imageUrl }),
    });
    if (!res.ok) throw new Error(`Video gen failed: ${res.status}`);
    return res.json();
  }

  // ─── MODELS & TIER ─────────────────────────────────────────

  async getModels(): Promise<{ models: any[]; tier: string }> {
    const res = await fetch(`${this.baseUrl}/v1/models`, { headers: this.headers });
    if (!res.ok) throw new Error(`Models failed: ${res.status}`);
    return res.json();
  }

  async getTierInfo(): Promise<{ tier: string; price: number; limits: any }> {
    const res = await fetch(`${this.baseUrl}/v1/tier`, { headers: this.headers });
    if (!res.ok) throw new Error(`Tier failed: ${res.status}`);
    return res.json();
  }

  // ─── GROK / xAI DIRECT ──────────────────────────────────────

  async grokChat(message: string, model: string = 'grok-3'): Promise<{
    content: string;
    model: string;
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  }> {
    const res = await fetch(`${XAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }],
        stream: false,
      }),
    });
    if (!res.ok) throw new Error(`Grok chat failed: ${res.status}`);
    const data = await res.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage,
    };
  }

  async *grokStream(
    message: string,
    model: string = 'grok-3'
  ): AsyncGenerator<{ content: string; done: boolean }> {
    const res = await fetch(`${XAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }],
        stream: true,
      }),
    });

    if (!res.ok) throw new Error(`Grok stream failed: ${res.status}`);
    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

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
            if (delta) yield { content: delta, done: false };
          } catch {
            // skip malformed
          }
        } else if (line === 'data: [DONE]') {
          yield { content: '', done: true };
        }
      }
    }
  }

  // ─── HEALTH ─────────────────────────────────────────────────

  async health(): Promise<{ status: string; engine: string }> {
    const res = await fetch(`${this.baseUrl}/health`);
    return res.json();
  }
}

export const salClient = new SALClient();
