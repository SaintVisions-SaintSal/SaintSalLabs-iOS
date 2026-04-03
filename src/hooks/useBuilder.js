// src/hooks/useBuilder.js
// Builder v2 Elite — 4-tier model routing handled by backend.

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

const API = 'https://www.saintsallabs.com';
const KEY = 'saintvision_gateway_2025';

export function useBuilder(userId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState('');
  const [buildMeta, setBuildMeta] = useState(null); // { model, tier, cost, elapsed, buildId }

  const generate = useCallback(async (prompt) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/builder/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': KEY },
        body: JSON.stringify({ prompt, history, framework: 'auto', user_id: userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'insufficient_credits') {
          Alert.alert(
            'Upgrade Required',
            'You need more Builder credits. Upgrade your plan to continue building.',
            [
              { text: 'Upgrade', onPress: () => {} },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
          return;
        }
        throw new Error(data.message || `Build failed: ${res.status}`);
      }

      setPreviewHtml(data.preview_html || '');
      setFiles(data.files || []);
      setSummary(data.summary || '');
      setBuildMeta({
        model: data.model_used,
        tier: data.tier,
        cost: data.compute_cost,
        elapsed: data.elapsed_seconds,
        buildId: data.build_id,
      });

      setHistory(prev => [
        ...prev,
        { role: 'user', content: prompt },
        { role: 'assistant', content: data.summary || 'Built.' },
      ]);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [history, userId]);

  const edit = useCallback(async (prompt) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/builder/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sal-key': KEY },
        body: JSON.stringify({
          prompt,
          current_code: previewHtml,
          history,
          user_id: userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Edit failed');

      setPreviewHtml(data.preview_html || '');
      setFiles(data.files || []);
      setSummary(data.summary || '');
      setBuildMeta({
        model: data.model_used,
        tier: data.tier,
        cost: data.compute_cost,
        elapsed: data.elapsed_seconds,
        buildId: data.build_id,
      });

      setHistory(prev => [
        ...prev,
        { role: 'user', content: prompt },
        { role: 'assistant', content: data.summary || 'Edited.' },
      ]);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [history, previewHtml, userId]);

  const reset = useCallback(() => {
    setPreviewHtml(null);
    setFiles([]);
    setHistory([]);
    setSummary('');
    setBuildMeta(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    previewHtml,
    files,
    history,
    summary,
    buildMeta,
    generate,
    edit,
    reset,
  };
}
