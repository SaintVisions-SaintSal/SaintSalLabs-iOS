/* ═══════════════════════════════════════════════════
   SAINTSALLABS — AGENT PIPELINE HOOK
   Unified state for Quick Build + SuperGrok SSE pipeline
   Replaces: useBuilderProject.js + useGrokOrchestrator.js
   US Patent #10,290,222 · HACP Protocol
═══════════════════════════════════════════════════ */
import { useState, useCallback, useRef } from 'react';
import { connectAgentSSE, MCP_BASE, MCP_KEY } from '../lib/api';

const HEADERS = {
  'Content-Type': 'application/json',
  'x-sal-key': MCP_KEY,
};

/* ── Agent Metadata ──────────────────────────────── */
export const AGENTS = {
  grok:   { name: 'Grok',   role: 'Planning & Strategy',  icon: '🧠', color: '#FF6B35' },
  stitch: { name: 'Stitch', role: 'Design & UI',          icon: '🎨', color: '#818CF8' },
  claude: { name: 'Claude', role: 'Code & Logic',          icon: '⚡', color: '#00FF88' },
};

/* ── Agent States ────────────────────────────────── */
export const AGENT_IDLE     = 'idle';
export const AGENT_THINKING = 'thinking';
export const AGENT_COMPLETE = 'complete';
export const AGENT_ERROR    = 'error';

/* ── Pipeline Phases ─────────────────────────────── */
export const PHASE_IDLE       = 'idle';
export const PHASE_PLANNING   = 'planning';
export const PHASE_BUILDING   = 'building';
export const PHASE_WIRING     = 'wiring';
export const PHASE_COMPLETE   = 'complete';
export const PHASE_ERROR      = 'error';

/* ── Default Files ───────────────────────────────── */
const DEFAULT_FILES = [
  {
    path: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My App</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="app">
    <h1>Welcome to SAL Builder</h1>
    <p>Describe what you want to build...</p>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
  },
  {
    path: 'style.css',
    language: 'css',
    content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #050508;
  color: #E8E6E1;
  font-family: -apple-system, 'Inter', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
#app { text-align: center; padding: 2rem; }
h1 { color: #00FF88; font-size: 2rem; margin-bottom: 0.5rem; }
p { color: #9CA3AF; }`,
  },
  {
    path: 'app.js',
    language: 'javascript',
    content: `// SAL Builder — Your app logic here
console.log('SAL Builder initialized');`,
  },
];


/* ═══════════════════════════════════════════════════
   HOOK
═══════════════════════════════════════════════════ */
export default function useAgentPipeline() {

  /* ── File / Project State (from useBuilderProject) ─ */
  const [projectId, setProjectId]       = useState(null);
  const [projectName, setProjectName]   = useState('Untitled Project');
  const [files, setFiles]               = useState(DEFAULT_FILES);
  const [activeFilePath, setActiveFilePath] = useState('index.html');
  const [previewEntry, setPreviewEntry] = useState('index.html');

  /* ── Conversation ──────────────────────────────── */
  const [conversation, setConversation] = useState([]);

  /* ── Generation State (shared) ─────────────────── */
  const [generating, setGenerating]     = useState(false);
  const [error, setError]               = useState(null);
  const [thought, setThought]           = useState('');
  const [nextSteps, setNextSteps]       = useState([]);

  /* ── Pipeline State (SuperGrok SSE) ────────────── */
  const [phase, setPhase]               = useState(PHASE_IDLE);
  const [agentStates, setAgentStates]   = useState({
    grok:   AGENT_IDLE,
    stitch: AGENT_IDLE,
    claude: AGENT_IDLE,
  });
  const [agentMessages, setAgentMessages] = useState({
    grok: '', stitch: '', claude: '',
  });
  const [plan, setPlan]                 = useState(null);
  const [design, setDesign]             = useState(null);
  const [terminalBuffer, setTerminalBuffer] = useState([]);
  const [buildModel, setBuildModel]     = useState('');

  /* ── Refs ──────────────────────────────────────── */
  const abortRef = useRef(null);
  // Refs that track latest state for SSE callbacks (avoids stale closures)
  const planRef = useRef(null);
  const filesRef = useRef(DEFAULT_FILES);
  const buildModelRef = useRef('');

  // Keep refs in sync with state
  planRef.current = plan;
  filesRef.current = files;
  buildModelRef.current = buildModel;

  /* ── Derived ───────────────────────────────────── */
  const activeFile = files.find(f => f.path === activeFilePath) || files[0];


  /* ═══════════════════════════════════════════════
     QUICK BUILD (JSON endpoint, no SSE)
  ═══════════════════════════════════════════════ */
  const quickBuild = useCallback(async (prompt) => {
    setGenerating(true);
    setError(null);
    setThought('');
    resetPipelineState();

    const userMsg = { role: 'user', content: prompt };
    const newConvo = [...conversation, userMsg];
    setConversation(newConvo);

    try {
      const controller = new AbortController();
      abortRef.current = { abort: () => controller.abort() };

      const res = await fetch(`${MCP_BASE}/api/builder/v2/generate`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          prompt,
          project_id: projectId,
          files: files.length > 0 ? files : undefined,
          conversation: newConvo.slice(-10),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();

      if (data.files?.length > 0) {
        setFiles(data.files);
        setActiveFilePath(data.preview_entry || data.files[0].path);
        setPreviewEntry(data.preview_entry || 'index.html');
      }

      if (data.thought) setThought(data.thought);
      if (data.next_steps) setNextSteps(data.next_steps);

      setConversation(prev => [...prev, {
        role: 'assistant',
        content: data.thought || 'Code generated successfully.',
        filesGenerated: data.files?.length || 0,
      }]);

      return data;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      setError(err.message);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
        isError: true,
      }]);
      return null;
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, [conversation, files, projectId]);


  /* ═══════════════════════════════════════════════
     SUPERGROK PIPELINE (SSE endpoint)
  ═══════════════════════════════════════════════ */
  const startPipeline = useCallback((prompt) => {
    setGenerating(true);
    setError(null);
    setThought('');
    resetPipelineState();

    const userMsg = { role: 'user', content: prompt };
    setConversation(prev => [...prev, userMsg]);

    // Add terminal initialization line
    setTerminalBuffer([{ type: 'system', text: `> SAL Pipeline initialized — "${prompt.slice(0, 80)}..."`, ts: Date.now() }]);

    const handle = connectAgentSSE({
      prompt,
      mode: 'supergrok',
      files: files.length > 0 ? files : undefined,
      projectId,

      /* ── Planning (Grok) ── */
      onPlanning: (data) => {
        setPhase(PHASE_PLANNING);
        setAgentStates(prev => ({ ...prev, grok: AGENT_THINKING }));
        setAgentMessages(prev => ({ ...prev, grok: data.message || 'Analyzing request...' }));
        setTerminalBuffer(prev => [...prev,
          { type: 'agent', agent: 'grok', text: `[GROK] ${data.message || 'Planning...'}`, ts: Date.now() },
        ]);
      },

      /* ── Plan Ready ── */
      onPlanReady: (data) => {
        setAgentStates(prev => ({ ...prev, grok: AGENT_COMPLETE }));
        setPlan(data.plan || null);
        setAgentMessages(prev => ({ ...prev, grok: data.plan?.title || 'Plan ready' }));
        setTerminalBuffer(prev => [...prev,
          { type: 'success', text: `[GROK] Plan ready: ${data.plan?.title || 'Untitled'}`, ts: Date.now() },
          { type: 'info', text: `  Components: ${(data.plan?.components || []).join(', ')}`, ts: Date.now() },
          { type: 'info', text: `  APIs: ${(data.plan?.apis || []).join(', ')}`, ts: Date.now() },
          { type: 'info', text: `  Complexity: ${data.plan?.complexity || 'unknown'} · Est: ${data.plan?.estimated_time || '?'}`, ts: Date.now() },
        ]);
      },

      /* ── Building (Stitch) ── */
      onBuilding: (data) => {
        setPhase(PHASE_BUILDING);
        setAgentStates(prev => ({ ...prev, stitch: AGENT_THINKING }));
        setAgentMessages(prev => ({ ...prev, stitch: data.message || 'Generating design...' }));
        setTerminalBuffer(prev => [...prev,
          { type: 'agent', agent: 'stitch', text: `[STITCH] ${data.message || 'Building...'}`, ts: Date.now() },
        ]);
      },

      /* ── Stitch Ready ── */
      onStitchReady: (data) => {
        setAgentStates(prev => ({ ...prev, stitch: AGENT_COMPLETE }));
        setDesign(data.design || null);
        setAgentMessages(prev => ({ ...prev, stitch: 'Design system generated' }));
        setTerminalBuffer(prev => [...prev,
          { type: 'success', text: '[STITCH] Design system ready', ts: Date.now() },
        ]);
      },

      /* ── Wiring (Claude) ── */
      onWiring: (data) => {
        setPhase(PHASE_WIRING);
        setAgentStates(prev => ({ ...prev, claude: AGENT_THINKING }));
        setAgentMessages(prev => ({ ...prev, claude: data.message || 'Wiring code...' }));
        setTerminalBuffer(prev => [...prev,
          { type: 'agent', agent: 'claude', text: `[CLAUDE] ${data.message || 'Wiring...'}`, ts: Date.now() },
        ]);
      },

      /* ── Files Ready ── */
      onFilesReady: (data) => {
        setAgentStates(prev => ({ ...prev, claude: AGENT_COMPLETE }));
        setBuildModel(data.model || '');

        if (data.files?.length > 0) {
          // Map files from SSE format {name, content} to our format {path, language, content}
          const mapped = data.files.map(f => ({
            path: f.name,
            language: guessLanguage(f.name),
            content: f.content,
          }));
          setFiles(mapped);
          const htmlFile = mapped.find(f => f.path.endsWith('.html'));
          const entryPath = htmlFile?.path || mapped[0]?.path || 'index.html';
          setActiveFilePath(entryPath);
          setPreviewEntry(entryPath);
        }

        setAgentMessages(prev => ({ ...prev, claude: `${data.files?.length || 0} files generated` }));
        setTerminalBuffer(prev => [...prev,
          { type: 'success', text: `[CLAUDE] ${data.files?.length || 0} files ready · ${data.model || 'claude'}`, ts: Date.now() },
          ...((data.files || []).map(f => ({ type: 'file', text: `  + ${f.name} (${f.content?.length || 0} chars)`, ts: Date.now() }))),
        ]);
      },

      /* ── Complete ── */
      onComplete: (data) => {
        setPhase(PHASE_COMPLETE);
        setGenerating(false);
        setBuildModel(data.model || buildModelRef.current);
        setTerminalBuffer(prev => [...prev,
          { type: 'complete', text: `\n✓ BUILD COMPLETE · ${data.model || ''}`, ts: Date.now() },
        ]);

        // Add assistant message to conversation (use refs to avoid stale closures)
        const currentPlan = planRef.current;
        const currentFiles = filesRef.current;
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: currentPlan?.title ? `Built: ${currentPlan.title}` : 'Build complete.',
          filesGenerated: currentFiles.length,
        }]);

        abortRef.current = null;
      },

      /* ── Error ── */
      onError: (msg) => {
        setPhase(PHASE_ERROR);
        setError(msg);
        setGenerating(false);
        setTerminalBuffer(prev => [...prev,
          { type: 'error', text: `✗ ERROR: ${msg}`, ts: Date.now() },
        ]);
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: `Pipeline error: ${msg}`,
          isError: true,
        }]);
        abortRef.current = null;
      },
    });

    abortRef.current = handle;
  }, [files, projectId]);


  /* ═══════════════════════════════════════════════
     SHARED ACTIONS
  ═══════════════════════════════════════════════ */

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setGenerating(false);
    setPhase(PHASE_IDLE);
  }, []);

  function resetPipelineState() {
    setPhase(PHASE_IDLE);
    setAgentStates({ grok: AGENT_IDLE, stitch: AGENT_IDLE, claude: AGENT_IDLE });
    setAgentMessages({ grok: '', stitch: '', claude: '' });
    setPlan(null);
    setDesign(null);
    setTerminalBuffer([]);
    setBuildModel('');
  }

  const resetProject = useCallback(() => {
    cancel();
    setProjectId(null);
    setProjectName('Untitled Project');
    setFiles(DEFAULT_FILES);
    setActiveFilePath('index.html');
    setPreviewEntry('index.html');
    setConversation([]);
    setError(null);
    setThought('');
    setNextSteps([]);
    resetPipelineState();
  }, [cancel]);

  /* ── File CRUD ─────────────────────────────────── */
  const updateFile = useCallback((path, newContent) => {
    setFiles(prev => prev.map(f => f.path === path ? { ...f, content: newContent } : f));
  }, []);

  const addFile = useCallback((path, language = 'text', content = '') => {
    setFiles(prev => {
      if (prev.find(f => f.path === path)) return prev;
      return [...prev, { path, language, content }];
    });
    setActiveFilePath(path);
  }, []);

  const deleteFile = useCallback((path) => {
    setFiles(prev => {
      const next = prev.filter(f => f.path !== path);
      if (activeFilePath === path && next.length > 0) setActiveFilePath(next[0].path);
      return next;
    });
  }, [activeFilePath]);

  const renameFile = useCallback((oldPath, newPath) => {
    setFiles(prev => prev.map(f => f.path === oldPath ? { ...f, path: newPath } : f));
    if (activeFilePath === oldPath) setActiveFilePath(newPath);
    if (previewEntry === oldPath) setPreviewEntry(newPath);
  }, [activeFilePath, previewEntry]);

  /* ── Preview Builder ───────────────────────────── */
  const buildPreviewHtml = useCallback(() => {
    const htmlFile = files.find(f => f.path === previewEntry);
    if (!htmlFile) {
      const cssFiles = files.filter(f => f.language === 'css');
      const jsFiles = files.filter(f => f.language === 'javascript' || f.language === 'js');
      return `<!DOCTYPE html>
<html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>${cssFiles.map(f => f.content).join('\n')}</style></head>
<body><div id="app"></div><script>${jsFiles.map(f => f.content).join('\n')}</script></body></html>`;
    }

    let html = htmlFile.content;

    // Inline CSS
    html = html.replace(
      /<link\s+rel=["']stylesheet["']\s+href=["']([^"']+)["']\s*\/?>/gi,
      (match, href) => {
        const cssFile = files.find(f => f.path === href || f.path === './' + href);
        return cssFile ? `<style>\n${cssFile.content}\n</style>` : match;
      }
    );

    // Inline JS
    html = html.replace(
      /<script\s+src=["']([^"']+)["']\s*><\/script>/gi,
      (match, src) => {
        const jsFile = files.find(f => f.path === src || f.path === './' + src);
        return jsFile ? `<script>\n${jsFile.content}\n</script>` : match;
      }
    );

    return html;
  }, [files, previewEntry]);


  /* ═══════════════════════════════════════════════
     RETURN
  ═══════════════════════════════════════════════ */
  return {
    // Project state
    projectId, projectName, files, activeFile, activeFilePath, previewEntry,

    // Conversation
    conversation,

    // Generation state
    generating, error, thought, nextSteps,

    // Pipeline state (SuperGrok)
    phase, agentStates, agentMessages, plan, design, terminalBuffer, buildModel,

    // Actions
    quickBuild,
    startPipeline,
    cancel,
    resetProject,
    setProjectName,
    setActiveFilePath,
    updateFile,
    addFile,
    deleteFile,
    renameFile,
    buildPreviewHtml,
  };
}


/* ═══════════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════════ */
function guessLanguage(filename) {
  if (!filename) return 'text';
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = {
    html: 'html', htm: 'html',
    css: 'css', scss: 'css', less: 'css',
    js: 'javascript', jsx: 'javascript', mjs: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    json: 'json',
    md: 'markdown',
    py: 'python',
    svg: 'html',
  };
  return map[ext] || 'text';
}
