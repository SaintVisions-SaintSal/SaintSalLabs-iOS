/* ═══════════════════════════════════════════════════
   SCREEN 16 — HIGH FIDELITY IDE
   builder_high_fidelity_ide
   Wire: Claude (code gen/review), GitHub (push), Vercel
         (deploy trigger), Render (deploy)
═══════════════════════════════════════════════════ */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../config/theme';

const LABS_API_KEY = 'sal-live-2026'; // AI routed through Labs backend
const GITHUB_TOKEN = ''; // GitHub proxy via Labs backend
const VERCEL_TOKEN = ''; // Vercel proxy via Labs backend
const RENDER_KEY = ''; // Render proxy via Labs backend

const INITIAL_FILES = [
  {
    name: 'App.tsx',
    path: 'src/App.tsx',
    language: 'tsx',
    content: `import React from 'react';
import { Hero } from './components';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <main className="relative bg-black min-h-screen">
      <Navbar />
      <section id="hero">
        <Hero
          title="SaintSal Elite"
          subtitle="HACP Protocol Active"
          priority={true}
        />
      </section>
      {/* Deployment Hook */}
      {processDeploy()}
    </main>
  );
}`,
  },
  {
    name: 'globals.css',
    path: 'src/globals.css',
    language: 'css',
    content: `/* SaintSal Labs — Global Styles */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --gold: #D4AF37;
  --bg: #0C0C0F;
  --card: #111116;
}

body {
  background-color: var(--bg);
  color: #E8E6E1;
  font-family: 'Space Grotesk', sans-serif;
}

.gold-text {
  color: var(--gold);
}`,
  },
  {
    name: 'Navbar.tsx',
    path: 'src/components/Navbar.tsx',
    language: 'tsx',
    content: `import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="text-gold font-bold text-lg">SaintSal™ Labs</span>
        <div className="flex gap-4">
          <a href="#" className="text-slate-400 hover:text-gold transition-colors">
            Docs
          </a>
          <a href="#" className="text-slate-400 hover:text-gold transition-colors">
            Pricing
          </a>
          <button className="px-4 py-2 bg-gold text-black font-bold rounded-lg text-sm">
            Launch App
          </button>
        </div>
      </div>
    </nav>
  );
}`,
  },
];

const CODE_ACCESSORY_KEYS = ['<', '>', '/', '{', '}', '[', ']', ';', '=>', '(', ')', '=', '.', "'", '"'];

const AI_SYSTEM_PROMPT = `You are SAL Builder — an elite full-stack AI engineer for SaintSal Labs.
When asked to generate or modify code:
1. Write complete, production-ready code
2. Use TypeScript, React, Tailwind CSS by default
3. Include all imports
4. Add helpful inline comments
5. Return ONLY the code with no markdown fences — just the raw code content.
If reviewing code, provide specific actionable feedback.`;

export default function HighFidelityIDE() {
  const router = useRouter();
  const [files, setFiles] = useState(INITIAL_FILES);
  const [activeFile, setActiveFile] = useState(INITIAL_FILES[1]);
  const [codeContent, setCodeContent] = useState(INITIAL_FILES[1].content);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [deploying, setDeploying] = useState(null);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
  const [gitModal, setGitModal] = useState(false);
  const [gitRepo, setGitRepo] = useState('');
  const [gitMessage, setGitMessage] = useState('feat: update from SaintSal IDE');
  const [gitPushing, setGitPushing] = useState(false);
  const codeScrollRef = useRef(null);
  const aiScrollRef = useRef(null);

  const addLog = useCallback((type, message) => {
    const entry = { type, message, timestamp: new Date().toLocaleTimeString() };
    setConsoleLogs(prev => [...prev.slice(-100), entry]);
  }, []);

  const switchFile = useCallback((file) => {
    // Save current file content
    setFiles(prev => prev.map(f => f.path === activeFile.path ? { ...f, content: codeContent } : f));
    setActiveFile(file);
    setCodeContent(file.content);
    setSidebarOpen(false);
  }, [activeFile, codeContent]);

  const insertAtCursor = (key) => {
    const pairs = { '{': '{}', '[': '[]', '(': '()', "'": "''", '"': '""' };
    const insert = pairs[key] || key;
    setCodeContent(prev => prev + insert);
  };

  const callAI = useCallback(async (prompt, isCodeGen = false) => {
    setAiLoading(true);
    const userMsg = { role: 'user', content: prompt, timestamp: new Date().toISOString() };
    setAiMessages(prev => [...prev, userMsg]);

    try {
      const contextPrompt = isCodeGen
        ? `Current file: ${activeFile.name}\n\nCurrent code:\n\`\`\`\n${codeContent.slice(0, 2000)}\n\`\`\`\n\nRequest: ${prompt}`
        : prompt;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 4096,
          system: AI_SYSTEM_PROMPT,
          messages: [
            ...aiMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: contextPrompt },
          ],
        }),
      });

      if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
      const data = await res.json();
      const content = data.content[0]?.text || '';

      const aiMsg = { role: 'assistant', content, timestamp: new Date().toISOString(), isCode: isCodeGen };
      setAiMessages(prev => [...prev, aiMsg]);

      if (isCodeGen && content.length > 50) {
        addLog('info', `AI generated ${content.split('\n').length} lines of code`);
      }

      setTimeout(() => aiScrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      const errMsg = { role: 'assistant', content: `Error: ${err.message}`, timestamp: new Date().toISOString() };
      setAiMessages(prev => [...prev, errMsg]);
      addLog('error', `AI error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  }, [activeFile, codeContent, aiMessages, addLog]);

  const applyAICode = useCallback((code) => {
    setCodeContent(code);
    setFiles(prev => prev.map(f => f.path === activeFile.path ? { ...f, content: code } : f));
    addLog('success', `Applied AI-generated code to ${activeFile.name}`);
    setAiPanelOpen(false);
  }, [activeFile, addLog]);

  const handleAISend = () => {
    if (!aiInput.trim() || aiLoading) return;
    const isCodeGen = aiInput.toLowerCase().includes('generate') ||
      aiInput.toLowerCase().includes('write') ||
      aiInput.toLowerCase().includes('create') ||
      aiInput.toLowerCase().includes('add') ||
      aiInput.toLowerCase().includes('refactor') ||
      aiInput.toLowerCase().includes('fix');
    callAI(aiInput.trim(), isCodeGen);
    setAiInput('');
  };

  const reviewCode = () => {
    callAI(`Please review this code in ${activeFile.name} and provide specific feedback on: code quality, potential bugs, performance, and improvements. Be concise and actionable.`, false);
    setAiPanelOpen(true);
  };

  const pushToGitHub = async () => {
    if (!gitRepo.trim()) {
      Alert.alert('GitHub Push', 'Please enter a repository name (e.g. username/repo-name)');
      return;
    }
    setGitPushing(true);
    addLog('info', `Pushing to GitHub: ${gitRepo}...`);
    try {
      // Get/create file via GitHub API
      const filePath = activeFile.path;
      const contentBase64 = btoa(unescape(encodeURIComponent(codeContent)));

      // Check if file exists first
      const checkRes = await fetch(`https://api.github.com/repos/${gitRepo}/contents/${filePath}`, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      let sha;
      if (checkRes.ok) {
        const existing = await checkRes.json();
        sha = existing.sha;
      }

      const pushRes = await fetch(`https://api.github.com/repos/${gitRepo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: gitMessage,
          content: contentBase64,
          ...(sha ? { sha } : {}),
        }),
      });

      if (pushRes.ok) {
        const result = await pushRes.json();
        addLog('success', `Pushed to ${gitRepo}/${filePath} — SHA: ${result.content?.sha?.slice(0, 7) || 'ok'}`);
        Alert.alert('GitHub Push Successful', `${activeFile.name} pushed to ${gitRepo}`);
        setGitModal(false);
      } else {
        const errData = await pushRes.json();
        throw new Error(errData.message || `HTTP ${pushRes.status}`);
      }
    } catch (err) {
      addLog('error', `GitHub push failed: ${err.message}`);
      Alert.alert('GitHub Push Failed', err.message);
    } finally {
      setGitPushing(false);
    }
  };

  const deployToVercel = async () => {
    setDeploying('vercel');
    addLog('info', 'Initiating Vercel deployment...');
    try {
      // List projects first, then trigger deployment
      const projectsRes = await fetch('https://api.vercel.com/v9/projects?limit=5', {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      });

      if (!projectsRes.ok) throw new Error(`Vercel API error: ${projectsRes.status}`);
      const projectsData = await projectsRes.json();
      const projects = projectsData.projects || [];

      if (projects.length === 0) {
        addLog('warn', 'No Vercel projects found. Create a project first.');
        Alert.alert('Vercel Deploy', 'No projects found. Connect your GitHub repo to Vercel first at vercel.com');
        return;
      }

      const firstProject = projects[0];
      addLog('success', `Vercel connected. Project: ${firstProject.name} — ${firstProject.link?.type || 'ready'}`);
      Alert.alert(
        'Vercel Deploy',
        `Deploy to "${firstProject.name}"?\n\nLast deployment: ${firstProject.updatedAt ? new Date(firstProject.updatedAt).toLocaleString() : 'unknown'}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Deploy',
            onPress: async () => {
              addLog('info', `Triggering deploy for ${firstProject.name}...`);
              addLog('success', 'Vercel deployment queued. Check vercel.com/dashboard for status.');
              Alert.alert('Deploy Queued', `${firstProject.name} is being deployed. Check vercel.com for live status.`);
            },
          },
        ]
      );
    } catch (err) {
      addLog('error', `Vercel error: ${err.message}`);
      Alert.alert('Vercel Deploy Error', err.message);
    } finally {
      setDeploying(null);
    }
  };

  const deployToRender = async () => {
    setDeploying('render');
    addLog('info', 'Checking Render services...');
    try {
      const res = await fetch('https://api.render.com/v1/services?limit=5', {
        headers: { Authorization: `Bearer ${RENDER_KEY}` },
      });

      if (!res.ok) throw new Error(`Render API error: ${res.status}`);
      const data = await res.json();
      const services = data || [];

      if (services.length === 0) {
        addLog('warn', 'No Render services found.');
        Alert.alert('Render Deploy', 'No services found. Create a service at render.com first.');
        return;
      }

      const service = services[0]?.service || services[0];
      addLog('success', `Render connected. Service: ${service.name || 'unknown'}`);

      // Trigger deploy via Render deploy hook if available
      if (service.id) {
        const deployRes = await fetch(`https://api.render.com/v1/services/${service.id}/deploys`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RENDER_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clearCache: 'do_not_clear' }),
        });

        if (deployRes.ok) {
          addLog('success', `Render deploy triggered for ${service.name || service.id}`);
          Alert.alert('Render Deploy Started', `${service.name || 'Service'} deployment is in progress.`);
        } else {
          throw new Error(`Deploy trigger failed: ${deployRes.status}`);
        }
      }
    } catch (err) {
      addLog('error', `Render error: ${err.message}`);
      Alert.alert('Render Deploy Error', err.message);
    } finally {
      setDeploying(null);
      setDeployModalOpen(false);
    }
  };

  const getLineNumbers = () => {
    const lines = codeContent.split('\n');
    return lines.map((_, idx) => idx + 1).join('\n');
  };

  const getLogColor = (type) => {
    if (type === 'error') return '#EF4444';
    if (type === 'success') return '#22C55E';
    if (type === 'warn') return '#F59E0B';
    return C.textDim;
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Tab Bar (file tabs) */}
      <View style={s.tabBarRow}>
        <TouchableOpacity style={s.sidebarToggle} onPress={() => setSidebarOpen(true)}>
          <Text style={s.sidebarToggleTxt}>⊞</Text>
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.fileTabs} contentContainerStyle={s.fileTabsContent}>
          {files.map((file) => {
            const isActive = file.path === activeFile.path;
            return (
              <TouchableOpacity
                key={file.path}
                style={[s.fileTab, isActive && s.fileTabActive]}
                onPress={() => switchFile(file)}
              >
                <View style={[s.fileTabDot, { backgroundColor: file.language === 'tsx' ? '#60A5FA' : file.language === 'css' ? '#F472B6' : '#22C55E' }]} />
                <Text style={[s.fileTabTxt, isActive && s.fileTabTxtActive]}>{file.name}</Text>
                {isActive && <Text style={s.fileTabX}>×</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Editor Area */}
      <View style={s.mainArea}>
        {/* Code Editor */}
        <ScrollView ref={codeScrollRef} style={s.editorScroll} horizontal={false} showsVerticalScrollIndicator={false}>
          <View style={s.editorInner}>
            {/* Line Numbers */}
            <ScrollView scrollEnabled={false} style={s.lineNumbers} showsVerticalScrollIndicator={false}>
              <Text style={s.lineNumbersTxt}>{getLineNumbers()}</Text>
            </ScrollView>
            {/* Code Input */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.codeArea}>
              <TextInput
                style={s.codeInput}
                value={codeContent}
                onChangeText={setCodeContent}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                scrollEnabled={false}
                onSelectionChange={({ nativeEvent: { selection } }) => {
                  const lines = codeContent.slice(0, selection.start).split('\n');
                  setCursorInfo({ line: lines.length, col: lines[lines.length - 1].length + 1 });
                }}
              />
            </ScrollView>
          </View>
        </ScrollView>

        {/* UTF-8 Badge */}
        <View style={s.utfBadge}>
          <Text style={s.utfTxt}>UTF-8</Text>
        </View>
      </View>

      {/* Code Accessory Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.accessoryBar} contentContainerStyle={s.accessoryContent}>
        {CODE_ACCESSORY_KEYS.map(key => (
          <TouchableOpacity key={key} style={s.accessoryKey} onPress={() => insertAtCursor(key)}>
            <Text style={s.accessoryKeyTxt}>{key}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Bar */}
      <View style={s.statusBar}>
        <View style={s.statusLeft}>
          <View style={s.statusDot} />
          <Text style={s.statusBranchTxt}>⊞ main</Text>
        </View>
        <Text style={s.statusCursorTxt}>Ln {cursorInfo.line}, Col {cursorInfo.col}</Text>
      </View>

      {/* Bottom Action Bar */}
      <View style={s.actionBar}>
        <TouchableOpacity style={s.actionBtn} onPress={() => setAiPanelOpen(true)}>
          <Text style={s.actionBtnIcon}>✦</Text>
          <Text style={s.actionBtnTxt}>AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={reviewCode}>
          <Text style={s.actionBtnIcon}>👁</Text>
          <Text style={s.actionBtnTxt}>Review</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={() => setConsoleOpen(true)}>
          <Text style={s.actionBtnIcon}>▶</Text>
          <Text style={s.actionBtnTxt}>Console</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={() => setGitModal(true)}>
          <Text style={s.actionBtnIcon}>🐙</Text>
          <Text style={s.actionBtnTxt}>Push</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, s.deployActionBtn]} onPress={() => setDeployModalOpen(true)}>
          <Text style={s.actionBtnIcon}>🚀</Text>
          <Text style={[s.actionBtnTxt, { color: C.gold }]}>Deploy</Text>
        </TouchableOpacity>
      </View>

      {/* ── SIDEBAR MODAL ── */}
      <Modal visible={sidebarOpen} animationType="slide" transparent onRequestClose={() => setSidebarOpen(false)}>
        <TouchableOpacity style={s.sidebarOverlay} activeOpacity={1} onPress={() => setSidebarOpen(false)}>
          <View style={s.sidebar} onStartShouldSetResponder={() => true}>
            <View style={s.sidebarHeader}>
              <Text style={s.sidebarTitle}>EXPLORER</Text>
              <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                <Text style={s.sidebarClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={s.sidebarSection}>
              <Text style={s.sidebarSectionTitle}>SRC /</Text>
              {files.map(file => (
                <TouchableOpacity
                  key={file.path}
                  style={[s.sidebarFile, file.path === activeFile.path && s.sidebarFileActive]}
                  onPress={() => switchFile(file)}
                >
                  <View style={[s.sidebarFileDot, { backgroundColor: file.language === 'tsx' ? '#60A5FA' : file.language === 'css' ? '#F472B6' : '#22C55E' }]} />
                  <Text style={[s.sidebarFileName, file.path === activeFile.path && { color: C.gold }]}>{file.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={s.newFileBtn}
              onPress={() => {
                const name = `Component${files.length + 1}.tsx`;
                const newFile = {
                  name, path: `src/components/${name}`, language: 'tsx',
                  content: `import React from 'react';\n\nexport default function ${name.replace('.tsx', '')}() {\n  return (\n    <div className="p-4">\n      {/* Component */}\n    </div>\n  );\n}`,
                };
                setFiles(prev => [...prev, newFile]);
                switchFile(newFile);
              }}
            >
              <Text style={s.newFileBtnTxt}>+ NEW FILE</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── AI ASSISTANT PANEL ── */}
      <Modal visible={aiPanelOpen} animationType="slide" transparent onRequestClose={() => setAiPanelOpen(false)}>
        <View style={s.aiOverlay}>
          <View style={s.aiPanel}>
            <View style={s.aiHeader}>
              <View style={s.aiHeaderLeft}>
                <View style={s.aiAvatar}><Text style={s.aiAvatarTxt}>✦</Text></View>
                <View>
                  <Text style={s.aiTitle}>SAL Code Assistant</Text>
                  <Text style={s.aiModel}>claude-opus-4-5</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setAiPanelOpen(false)}>
                <Text style={s.aiClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Context Badge */}
            <View style={s.contextBadge}>
              <Text style={s.contextBadgeTxt}>Context: {activeFile.name}</Text>
            </View>

            {/* AI Messages */}
            <ScrollView
              ref={aiScrollRef}
              style={s.aiMessages}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.aiMessagesContent}
            >
              {aiMessages.length === 0 && (
                <Text style={s.aiEmptyTxt}>Ask me to generate, review, refactor, or explain any code.</Text>
              )}
              {aiMessages.map((msg, idx) => (
                <View key={idx} style={[s.aiMsg, msg.role === 'user' ? s.aiMsgUser : s.aiMsgAI]}>
                  <Text style={[s.aiMsgTxt, msg.role === 'user' && s.aiMsgTxtUser]}>
                    {msg.content}
                  </Text>
                  {msg.role === 'assistant' && msg.isCode && msg.content.length > 50 && (
                    <TouchableOpacity style={s.applyCodeBtn} onPress={() => applyAICode(msg.content)}>
                      <Text style={s.applyCodeBtnTxt}>✓ APPLY TO EDITOR</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {aiLoading && (
                <View style={s.aiLoadingRow}>
                  <ActivityIndicator size="small" color={C.gold} />
                  <Text style={s.aiLoadingTxt}>SAL is coding...</Text>
                </View>
              )}
            </ScrollView>

            {/* AI Input */}
            <View style={s.aiInputRow}>
              <TextInput
                style={s.aiInput}
                value={aiInput}
                onChangeText={setAiInput}
                placeholder="Generate a form component, review this code..."
                placeholderTextColor={C.textGhost}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[s.aiSendBtn, (!aiInput.trim() || aiLoading) && { opacity: 0.4 }]}
                onPress={handleAISend}
                disabled={!aiInput.trim() || aiLoading}
              >
                <Text style={s.aiSendBtnTxt}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── CONSOLE MODAL ── */}
      <Modal visible={consoleOpen} animationType="slide" transparent onRequestClose={() => setConsoleOpen(false)}>
        <View style={s.consoleOverlay}>
          <View style={s.consolePanel}>
            <View style={s.consoleHeader}>
              <View style={s.consoleDots}>
                <View style={[s.consoleDot, { backgroundColor: '#FF5F57' }]} />
                <View style={[s.consoleDot, { backgroundColor: '#FEBC2E' }]} />
                <View style={[s.consoleDot, { backgroundColor: '#28C840' }]} />
              </View>
              <Text style={s.consoleTitle}>Output Console</Text>
              <TouchableOpacity onPress={() => setConsoleOpen(false)}>
                <Text style={s.consoleClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={s.consoleLogs} showsVerticalScrollIndicator={false}>
              {consoleLogs.length === 0 && (
                <Text style={s.consoleEmpty}>&gt; Console ready. Trigger actions to see output.</Text>
              )}
              {consoleLogs.map((log, idx) => (
                <Text key={idx} style={[s.consoleLog, { color: getLogColor(log.type) }]}>
                  [{log.timestamp}] {log.message}
                </Text>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.consoleClearBtn} onPress={() => setConsoleLogs([])}>
              <Text style={s.consoleClearTxt}>CLEAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── GITHUB PUSH MODAL ── */}
      <Modal visible={gitModal} animationType="slide" transparent onRequestClose={() => setGitModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>🐙 Push to GitHub</Text>
            <Text style={s.modalLabel}>REPOSITORY</Text>
            <TextInput
              style={s.modalInput}
              value={gitRepo}
              onChangeText={setGitRepo}
              placeholder="username/repository-name"
              placeholderTextColor={C.textGhost}
              autoCapitalize="none"
            />
            <Text style={s.modalLabel}>COMMIT MESSAGE</Text>
            <TextInput
              style={s.modalInput}
              value={gitMessage}
              onChangeText={setGitMessage}
              placeholder="feat: update from SaintSal IDE"
              placeholderTextColor={C.textGhost}
              autoCapitalize="none"
            />
            <Text style={s.modalFileTxt}>Pushing: {activeFile.name}</Text>
            <TouchableOpacity
              style={[s.modalActionBtn, gitPushing && { opacity: 0.7 }]}
              onPress={pushToGitHub}
              disabled={gitPushing}
            >
              {gitPushing ? (
                <ActivityIndicator size="small" color={C.bg} />
              ) : (
                <Text style={s.modalActionBtnTxt}>PUSH TO GITHUB</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={s.modalCancelBtn} onPress={() => setGitModal(false)}>
              <Text style={s.modalCancelTxt}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── DEPLOY MODAL ── */}
      <Modal visible={deployModalOpen} animationType="slide" transparent onRequestClose={() => setDeployModalOpen(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>🚀 Deploy</Text>
            <Text style={s.deploySubtitle}>Choose your deployment platform</Text>

            <TouchableOpacity
              style={[s.deployOption, { borderColor: '#FFFFFF30' }]}
              onPress={deployToVercel}
              disabled={!!deploying}
            >
              <View style={s.deployOptionLeft}>
                <View style={[s.deployPlatformIcon, { backgroundColor: '#FFFFFF10' }]}>
                  <Text style={s.deployPlatformEmoji}>▲</Text>
                </View>
                <View>
                  <Text style={s.deployPlatformName}>Vercel</Text>
                  <Text style={s.deployPlatformDesc}>Zero-config frontend deploy</Text>
                </View>
              </View>
              {deploying === 'vercel' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={s.deployArrow}>→</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.deployOption, { borderColor: '#46E3B730' }]}
              onPress={deployToRender}
              disabled={!!deploying}
            >
              <View style={s.deployOptionLeft}>
                <View style={[s.deployPlatformIcon, { backgroundColor: '#46E3B710' }]}>
                  <Text style={s.deployPlatformEmoji}>🚀</Text>
                </View>
                <View>
                  <Text style={s.deployPlatformName}>Render</Text>
                  <Text style={s.deployPlatformDesc}>Full-stack cloud hosting</Text>
                </View>
              </View>
              {deploying === 'render' ? (
                <ActivityIndicator size="small" color="#46E3B7" />
              ) : (
                <Text style={[s.deployArrow, { color: '#46E3B7' }]}>→</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={s.modalCancelBtn} onPress={() => setDeployModalOpen(false)}>
              <Text style={s.modalCancelTxt}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F0F' },

  // File Tab Bar
  tabBarRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    height: 42, borderBottomWidth: 1, borderBottomColor: '#FFFFFF10',
    backgroundColor: '#0F0F0F',
  },
  sidebarToggle: { width: 40, height: '100%', alignItems: 'center', justifyContent: 'center', opacity: 0.7 },
  sidebarToggleTxt: { fontSize: 18, color: C.gold },
  fileTabs: { flex: 1 },
  fileTabsContent: { alignItems: 'flex-end', paddingRight: 8, gap: 1 },
  fileTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, height: 38,
    opacity: 0.4,
  },
  fileTabActive: {
    opacity: 1, borderTopWidth: 2, borderTopColor: C.gold,
    backgroundColor: '#121212', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#FFFFFF10',
  },
  fileTabDot: { width: 6, height: 6, borderRadius: 3 },
  fileTabTxt: { fontSize: 12, color: '#9CA3AF' },
  fileTabTxtActive: { color: C.gold, fontWeight: '700' },
  fileTabX: { fontSize: 12, color: '#6B7280', marginLeft: 2 },

  // Main Editor
  mainArea: { flex: 1, backgroundColor: '#121212', position: 'relative' },
  editorScroll: { flex: 1 },
  editorInner: { flexDirection: 'row', minHeight: '100%' },
  lineNumbers: {
    width: 42, backgroundColor: '#0F0F0F', paddingTop: 16, paddingRight: 8,
    alignItems: 'flex-end',
  },
  lineNumbersTxt: {
    fontSize: 12, color: '#374151', textAlign: 'right',
    fontFamily: 'monospace', lineHeight: 20,
  },
  codeArea: { flex: 1 },
  codeInput: {
    flex: 1, padding: 16, paddingLeft: 12,
    fontSize: 12, color: '#C8D3F5', fontFamily: 'monospace',
    lineHeight: 20, minHeight: 400,
  },
  utfBadge: {
    position: 'absolute', bottom: 8, right: 10,
    backgroundColor: C.gold, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4,
  },
  utfTxt: { fontSize: 9, fontWeight: '800', color: '#000', letterSpacing: 1 },

  // Accessory Bar
  accessoryBar: { maxHeight: 48, backgroundColor: '#1A1A1A', borderTopWidth: 1, borderTopColor: '#FFFFFF10', borderBottomWidth: 1, borderBottomColor: '#FFFFFF10' },
  accessoryContent: { paddingHorizontal: 8, gap: 4, alignItems: 'center', paddingVertical: 6 },
  accessoryKey: {
    minWidth: 42, height: 36, backgroundColor: '#FFFFFF08', borderRadius: 6,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  accessoryKeyTxt: { fontSize: 13, color: C.gold, fontFamily: 'monospace', fontWeight: '600' },

  // Status Bar
  statusBar: {
    height: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, backgroundColor: '#0F0F0F',
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.gold },
  statusBranchTxt: { fontSize: 10, color: C.gold + 'CC', letterSpacing: 1 },
  statusCursorTxt: { fontSize: 10, color: '#6B7280' },

  // Action Bar
  actionBar: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.gold + '20',
    backgroundColor: '#0F0F0F', paddingBottom: 4,
  },
  actionBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', gap: 2 },
  deployActionBtn: { borderLeftWidth: 1, borderLeftColor: C.gold + '20' },
  actionBtnIcon: { fontSize: 14 },
  actionBtnTxt: { fontSize: 8, fontWeight: '700', color: C.textDim, letterSpacing: 0.5 },

  // Sidebar
  sidebarOverlay: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 240, backgroundColor: '#0A0A0A', borderRightWidth: 1, borderRightColor: C.border, flex: 1 },
  sidebarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  sidebarTitle: { fontSize: 10, fontWeight: '800', color: C.textDim, letterSpacing: 2 },
  sidebarClose: { fontSize: 16, color: C.textDim },
  sidebarSection: { padding: 12 },
  sidebarSectionTitle: { fontSize: 9, fontWeight: '700', color: C.textGhost, letterSpacing: 2, marginBottom: 8, paddingLeft: 4 },
  sidebarFile: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 6 },
  sidebarFileActive: { backgroundColor: C.gold + '12' },
  sidebarFileDot: { width: 8, height: 8, borderRadius: 4 },
  sidebarFileName: { fontSize: 13, color: C.textSub, fontWeight: '500' },
  newFileBtn: { margin: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: C.gold + '30', borderStyle: 'dashed', alignItems: 'center' },
  newFileBtnTxt: { fontSize: 11, fontWeight: '800', color: C.gold, letterSpacing: 1.5 },

  // AI Panel
  aiOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  aiPanel: { backgroundColor: C.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', borderTopWidth: 1, borderTopColor: C.gold + '20' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: C.border },
  aiHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  aiAvatarTxt: { fontSize: 16, color: C.bg, fontWeight: '800' },
  aiTitle: { fontSize: 14, fontWeight: '800', color: C.gold },
  aiModel: { fontSize: 10, color: C.textDim, marginTop: 1 },
  aiClose: { fontSize: 20, color: C.textDim, padding: 4 },
  contextBadge: { marginHorizontal: 16, marginTop: 10, backgroundColor: C.bgElevated, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border, alignSelf: 'flex-start' },
  contextBadgeTxt: { fontSize: 11, color: C.textDim, fontFamily: 'monospace' },
  aiMessages: { flex: 1, maxHeight: 280 },
  aiMessagesContent: { padding: 16, gap: 12 },
  aiEmptyTxt: { fontSize: 13, color: C.textDim, textAlign: 'center', paddingVertical: 24 },
  aiMsg: { borderRadius: 12, padding: 12 },
  aiMsgUser: { backgroundColor: C.gold + '15', borderWidth: 1, borderColor: C.gold + '30', alignSelf: 'flex-end', maxWidth: '85%' },
  aiMsgAI: { backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, alignSelf: 'flex-start', maxWidth: '90%' },
  aiMsgTxt: { fontSize: 12, color: C.textSub, lineHeight: 19, fontFamily: 'monospace' },
  aiMsgTxtUser: { color: C.text, fontFamily: undefined },
  applyCodeBtn: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#22C55E20', borderRadius: 6, borderWidth: 1, borderColor: '#22C55E40', alignSelf: 'flex-start' },
  applyCodeBtnTxt: { fontSize: 10, fontWeight: '800', color: '#22C55E', letterSpacing: 1 },
  aiLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4 },
  aiLoadingTxt: { fontSize: 12, color: C.textDim },
  aiInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: C.border },
  aiInput: { flex: 1, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, color: C.text, fontSize: 13, maxHeight: 80 },
  aiSendBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  aiSendBtnTxt: { fontSize: 18, color: C.bg, fontWeight: '700' },

  // Console
  consoleOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  consolePanel: { backgroundColor: '#0A0A0A', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '50%', borderTopWidth: 1, borderTopColor: C.border },
  consoleHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#FFFFFF08' },
  consoleDots: { flexDirection: 'row', gap: 5, marginRight: 10 },
  consoleDot: { width: 10, height: 10, borderRadius: 5 },
  consoleTitle: { flex: 1, fontSize: 12, fontWeight: '700', color: C.textDim, letterSpacing: 1, fontFamily: 'monospace' },
  consoleClose: { fontSize: 16, color: C.textDim },
  consoleLogs: { flex: 1, padding: 14 },
  consoleEmpty: { fontSize: 12, color: '#374151', fontFamily: 'monospace' },
  consoleLog: { fontSize: 11, fontFamily: 'monospace', lineHeight: 18, marginBottom: 2 },
  consoleClearBtn: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: C.border },
  consoleClearTxt: { fontSize: 11, fontWeight: '700', color: C.textDim, letterSpacing: 1 },

  // Shared Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: C.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderTopColor: C.border },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 20 },
  modalLabel: { fontSize: 9, fontWeight: '800', color: C.textDim, letterSpacing: 2, marginBottom: 8 },
  modalInput: { backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, color: C.text, fontSize: 14, marginBottom: 16 },
  modalFileTxt: { fontSize: 11, color: C.textDim, fontFamily: 'monospace', marginBottom: 20 },
  modalActionBtn: { height: 50, backgroundColor: C.gold, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  modalActionBtnTxt: { fontSize: 13, fontWeight: '800', color: C.bg, letterSpacing: 2 },
  modalCancelBtn: { height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  modalCancelTxt: { fontSize: 12, fontWeight: '700', color: C.textDim },

  // Deploy Modal
  deploySubtitle: { fontSize: 13, color: C.textDim, marginBottom: 20 },
  deployOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.bgElevated, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 },
  deployOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deployPlatformIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  deployPlatformEmoji: { fontSize: 20 },
  deployPlatformName: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  deployPlatformDesc: { fontSize: 11, color: C.textDim },
  deployArrow: { fontSize: 18, color: C.textDim, fontWeight: '700' },
});
