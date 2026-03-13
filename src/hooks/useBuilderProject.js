/* ═══════════════════════════════════════════════════
   SAINTSALLABS — BUILDER PROJECT HOOK
   Manages project state: files, active file,
   conversation history, generation, deployment
═══════════════════════════════════════════════════ */
import { useState, useCallback, useRef } from 'react';
import { API_BASE, API_KEY } from '../lib/api';

const HEADERS = {
  'Content-Type': 'application/json',
  'x-sal-key': API_KEY,
};

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
  background: #0C0C0F;
  color: #E8E6E1;
  font-family: -apple-system, 'Inter', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
#app { text-align: center; padding: 2rem; }
h1 { color: #F59E0B; font-size: 2rem; margin-bottom: 0.5rem; }
p { color: #9CA3AF; }`,
  },
  {
    path: 'app.js',
    language: 'javascript',
    content: `// SAL Builder — Your app logic here
console.log('SAL Builder v2 initialized');`,
  },
];

export default function useBuilderProject() {
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeFilePath, setActiveFilePath] = useState('index.html');
  const [previewEntry, setPreviewEntry] = useState('index.html');
  const [conversation, setConversation] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [thought, setThought] = useState('');
  const [nextSteps, setNextSteps] = useState([]);
  const abortRef = useRef(null);

  /* ── Active file helper ───────────────────────── */
  const activeFile = files.find(f => f.path === activeFilePath) || files[0];

  /* ── Generate code via LLM ────────────────────── */
  const generate = useCallback(async (prompt) => {
    setGenerating(true);
    setError(null);
    setThought('');

    // Add user message to conversation
    const userMsg = { role: 'user', content: prompt };
    const newConvo = [...conversation, userMsg];
    setConversation(newConvo);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`${API_BASE}/api/builder/v2/generate`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          prompt,
          project_id: projectId,
          files: files.length > 0 ? files : undefined,
          conversation: newConvo.slice(-10), // last 10 messages for context
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();

      if (data.files && data.files.length > 0) {
        setFiles(data.files);
        setActiveFilePath(data.preview_entry || data.files[0].path);
        setPreviewEntry(data.preview_entry || 'index.html');
      }

      if (data.thought) setThought(data.thought);
      if (data.next_steps) setNextSteps(data.next_steps);

      // Add assistant response to conversation
      const assistantMsg = {
        role: 'assistant',
        content: data.thought || 'Code generated successfully.',
        filesGenerated: data.files?.length || 0,
      };
      setConversation(prev => [...prev, assistantMsg]);

      return data;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      setError(err.message);
      // Add error to conversation
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: `⚠ Error: ${err.message}`,
        isError: true,
      }]);
      return null;
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, [conversation, files, projectId]);

  /* ── Cancel generation ────────────────────────── */
  const cancelGeneration = useCallback(() => {
    abortRef.current?.abort();
    setGenerating(false);
  }, []);

  /* ── Update a single file ─────────────────────── */
  const updateFile = useCallback((path, newContent) => {
    setFiles(prev => prev.map(f =>
      f.path === path ? { ...f, content: newContent } : f
    ));
  }, []);

  /* ── Add a new file ───────────────────────────── */
  const addFile = useCallback((path, language = 'text', content = '') => {
    setFiles(prev => {
      if (prev.find(f => f.path === path)) return prev;
      return [...prev, { path, language, content }];
    });
    setActiveFilePath(path);
  }, []);

  /* ── Delete a file ────────────────────────────── */
  const deleteFile = useCallback((path) => {
    setFiles(prev => {
      const next = prev.filter(f => f.path !== path);
      if (activeFilePath === path && next.length > 0) {
        setActiveFilePath(next[0].path);
      }
      return next;
    });
  }, [activeFilePath]);

  /* ── Rename a file ────────────────────────────── */
  const renameFile = useCallback((oldPath, newPath) => {
    setFiles(prev => prev.map(f =>
      f.path === oldPath ? { ...f, path: newPath } : f
    ));
    if (activeFilePath === oldPath) setActiveFilePath(newPath);
    if (previewEntry === oldPath) setPreviewEntry(newPath);
  }, [activeFilePath, previewEntry]);

  /* ── Build preview HTML ───────────────────────── */
  const buildPreviewHtml = useCallback(() => {
    // Find the entry HTML file
    const htmlFile = files.find(f => f.path === previewEntry);
    if (!htmlFile) {
      // Fallback: build a basic page from all files
      const cssFiles = files.filter(f => f.language === 'css');
      const jsFiles = files.filter(f => f.language === 'javascript' || f.language === 'js');
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>${cssFiles.map(f => f.content).join('\n')}</style>
</head>
<body>
<div id="app"></div>
<script>${jsFiles.map(f => f.content).join('\n')}</script>
</body>
</html>`;
    }

    // Inline CSS and JS into the HTML
    let html = htmlFile.content;

    // Inline <link rel="stylesheet" href="...">
    html = html.replace(
      /<link\s+rel=["']stylesheet["']\s+href=["']([^"']+)["']\s*\/?>/gi,
      (match, href) => {
        const cssFile = files.find(f => f.path === href || f.path === './' + href);
        if (cssFile) return `<style>\n${cssFile.content}\n</style>`;
        return match;
      }
    );

    // Inline <script src="...">
    html = html.replace(
      /<script\s+src=["']([^"']+)["']\s*><\/script>/gi,
      (match, src) => {
        const jsFile = files.find(f => f.path === src || f.path === './' + src);
        if (jsFile) return `<script>\n${jsFile.content}\n</script>`;
        return match;
      }
    );

    return html;
  }, [files, previewEntry]);

  /* ── Reset project ────────────────────────────── */
  const resetProject = useCallback(() => {
    setProjectId(null);
    setProjectName('Untitled Project');
    setFiles(DEFAULT_FILES);
    setActiveFilePath('index.html');
    setPreviewEntry('index.html');
    setConversation([]);
    setError(null);
    setThought('');
    setNextSteps([]);
  }, []);

  return {
    // State
    projectId,
    projectName,
    files,
    activeFile,
    activeFilePath,
    previewEntry,
    conversation,
    generating,
    error,
    thought,
    nextSteps,

    // Actions
    generate,
    cancelGeneration,
    setActiveFilePath,
    updateFile,
    addFile,
    deleteFile,
    renameFile,
    buildPreviewHtml,
    resetProject,
    setProjectName,
  };
}
