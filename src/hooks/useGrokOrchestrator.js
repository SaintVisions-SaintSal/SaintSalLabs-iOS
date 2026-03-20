/* ═══════════════════════════════════════════════════
   SAINTSALLABS — SUPERGROK ORCHESTRATOR HOOK
   4-Agent Visible Thinking Pipeline
   Grok 4 → Captain/Harper/Benjamin/Lucas → Synthesis
   US Patent #10,290,222 · HACP Protocol
═══════════════════════════════════════════════════ */
import { useState, useCallback, useRef } from 'react';
import { superGrokOrchestrate, grokChat, stitchGenerate } from '../lib/api';

/* ── Agent metadata for UI rendering ─────────────── */
export const AGENTS = {
  captain:     { name: 'Captain',  role: 'Orchestrator',       icon: '👑', color: '#F59E0B', desc: 'Task decomposition & strategy' },
  harper:      { name: 'Harper',   role: 'Research & Facts',   icon: '🔍', color: '#3B82F6', desc: 'Validates choices, checks data' },
  benjamin:    { name: 'Benjamin', role: 'Logic & Architecture',icon: '🧠', color: '#818CF8', desc: 'System design, code structure' },
  lucas:       { name: 'Lucas',    role: 'Creative & UX',      icon: '🎨', color: '#EC4899', desc: 'User experience, visual flow' },
  synthesizer: { name: 'Captain',  role: 'Final Synthesis',    icon: '⚡', color: '#22C55E', desc: 'Merges all findings into plan' },
};

/* ── Phase states ────────────────────────────────── */
const PHASE_IDLE      = 'idle';
const PHASE_THINKING  = 'thinking';
const PHASE_COMPLETE  = 'complete';
const PHASE_ERROR     = 'error';

export default function useGrokOrchestrator() {
  const [orchestrating, setOrchestrating] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [currentLabel, setCurrentLabel] = useState('');
  const [phaseStates, setPhaseStates] = useState({
    captain:     PHASE_IDLE,
    harper:      PHASE_IDLE,
    benjamin:    PHASE_IDLE,
    lucas:       PHASE_IDLE,
    synthesizer: PHASE_IDLE,
  });
  const [agentOutputs, setAgentOutputs] = useState({});
  const [synthesis, setSynthesis] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const cancelledRef = useRef(false);

  /* ── Add log entry ─────────────────────────────── */
  const addLog = useCallback((agent, type, content) => {
    setLogs(prev => [...prev, {
      agent,
      type, // 'thinking' | 'result' | 'error' | 'phase'
      content,
      timestamp: Date.now(),
    }]);
  }, []);

  /* ── Run full orchestration ────────────────────── */
  const orchestrate = useCallback(async (prompt) => {
    cancelledRef.current = false;
    setOrchestrating(true);
    setError(null);
    setSynthesis(null);
    setAgentOutputs({});
    setLogs([]);
    setPhaseStates({
      captain:     PHASE_IDLE,
      harper:      PHASE_IDLE,
      benjamin:    PHASE_IDLE,
      lucas:       PHASE_IDLE,
      synthesizer: PHASE_IDLE,
    });

    addLog('system', 'phase', `SuperGrok activated — "${prompt.slice(0, 60)}..."`);

    const result = await superGrokOrchestrate({
      prompt,

      onPhase: (agent, label) => {
        if (cancelledRef.current) return;
        setCurrentAgent(agent);
        setCurrentLabel(label);
        setPhaseStates(prev => ({ ...prev, [agent]: PHASE_THINKING }));
        addLog(agent, 'phase', label);
      },

      onAgentThinking: (agent) => {
        if (cancelledRef.current) return;
        addLog(agent, 'thinking', `${AGENTS[agent]?.name} is analyzing...`);
      },

      onAgentResult: (agent, data) => {
        if (cancelledRef.current) return;
        setPhaseStates(prev => ({ ...prev, [agent]: PHASE_COMPLETE }));
        setAgentOutputs(prev => ({ ...prev, [agent]: data }));

        const preview = (data.content || '').slice(0, 200);
        addLog(agent, 'result', preview + (data.content?.length > 200 ? '...' : ''));

        // Log reasoning if present
        if (data.reasoning) {
          addLog(agent, 'thinking', `[Reasoning] ${data.reasoning.slice(0, 150)}...`);
        }
      },

      onSynthesis: (data) => {
        if (cancelledRef.current) return;
        setPhaseStates(prev => ({ ...prev, synthesizer: PHASE_COMPLETE }));
        setSynthesis(data);
        addLog('synthesizer', 'result', 'Final plan synthesized');
      },

      onError: (msg) => {
        setError(msg);
        addLog('system', 'error', msg);
      },
    });

    setOrchestrating(false);
    setCurrentAgent(null);
    setCurrentLabel('');
    return result;
  }, [addLog]);

  /* ── Cancel ────────────────────────────────────── */
  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setOrchestrating(false);
    setCurrentAgent(null);
  }, []);

  /* ── Reset ─────────────────────────────────────── */
  const reset = useCallback(() => {
    cancelledRef.current = true;
    setOrchestrating(false);
    setCurrentAgent(null);
    setCurrentLabel('');
    setPhaseStates({
      captain: PHASE_IDLE, harper: PHASE_IDLE,
      benjamin: PHASE_IDLE, lucas: PHASE_IDLE,
      synthesizer: PHASE_IDLE,
    });
    setAgentOutputs({});
    setSynthesis(null);
    setError(null);
    setLogs([]);
  }, []);

  /* ── Execute plan (send to builder) ────────────── */
  const executePlan = useCallback(async (plan) => {
    addLog('system', 'phase', 'Executing plan via SAL Builder...');
    // This will be called by the builder screen to feed the plan
    // into the code generation pipeline
    return plan;
  }, [addLog]);

  /* ── Stitch design generation ──────────────────── */
  const generateDesign = useCallback(async (designPrompt) => {
    addLog('lucas', 'phase', 'Requesting Stitch design generation...');
    try {
      const result = await stitchGenerate({ prompt: designPrompt, mode: 'pro' });
      addLog('lucas', 'result', 'Stitch design generated');
      return result;
    } catch (err) {
      addLog('lucas', 'error', `Stitch error: ${err.message}`);
      return null;
    }
  }, [addLog]);

  return {
    // State
    orchestrating,
    currentAgent,
    currentLabel,
    phaseStates,
    agentOutputs,
    synthesis,
    error,
    logs,

    // Actions
    orchestrate,
    cancel,
    reset,
    executePlan,
    generateDesign,
  };
}
