import { useState } from 'react';
import { getApiKey, setApiKey, getModel, setModel, getEndpoint, setEndpoint, PRESETS } from '../api/llm';

function getGhToken() { return localStorage.getItem('dw_gh_token') || ''; }
function setGhToken(t: string) { localStorage.setItem('dw_gh_token', t); }

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [key, setKey] = useState(getApiKey);
  const [model, setMdl] = useState(getModel);
  const [endpoint, setEp] = useState(getEndpoint);
  const [ghToken, setGhTk] = useState(getGhToken);
  const [preset, setPreset] = useState(() => {
    const ep = getEndpoint();
    const idx = PRESETS.findIndex(p => p.endpoint === ep);
    return idx >= 0 ? idx : PRESETS.length - 1;
  });

  if (!open) return null;

  function applyPreset(idx: number) {
    setPreset(idx);
    const p = PRESETS[idx];
    if (p.endpoint) setEp(p.endpoint);
    if (p.models.length) setMdl(p.models[0]);
  }

  function save() {
    setApiKey(key);
    setModel(model);
    setEndpoint(endpoint);
    setGhToken(ghToken);
    onClose();
  }

  const currentPreset = PRESETS[preset];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="t-card t-border border rounded-lg p-4 sm:p-6 w-full max-w-lg shadow-xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4" 
        onClick={e => e.stopPropagation()}
      >
        {/* GitHub Section */}
        <h2 className="text-sm sm:text-base font-bold text-neon-green uppercase tracking-widest mb-3">⑂ GitHub</h2>
        <label className="block text-xs sm:text-sm text-text-muted mb-1.5">Personal Access Token <span className="opacity-50">(optional, for 5000 req/hr)</span></label>
        <input 
          type="password" 
          value={ghToken} 
          onChange={e => setGhTk(e.target.value)} 
          placeholder="ghp_..."
          className="w-full t-surface t-border border rounded px-3 py-2.5 sm:py-2 text-sm sm:text-xs mb-5 focus:outline-none focus:border-neon-green/50"
        />

        {/* LLM Section */}
        <h2 className="text-sm sm:text-base font-bold text-neon-cyan uppercase tracking-widest mb-3">◈ LLM</h2>
        <label className="block text-xs sm:text-sm text-text-muted mb-1.5">Provider Preset</label>
        <div className="flex flex-wrap gap-1.5 sm:gap-1 mb-4">
          {PRESETS.map((p, i) => (
            <button 
              key={p.name} 
              onClick={() => applyPreset(i)}
              className={`px-3 py-2 sm:px-2.5 sm:py-1 text-sm sm:text-[11px] rounded transition-colors border min-h-[44px] sm:min-h-0 ${preset === i ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30' : 'text-text-muted t-border hover:text-text-primary'}`}
            >{p.name}</button>
          ))}
        </div>

        <label className="block text-xs sm:text-sm text-text-muted mb-1.5">API Endpoint</label>
        <input 
          value={endpoint} 
          onChange={e => setEp(e.target.value)} 
          placeholder="https://api.example.com/v1/chat/completions"
          className="w-full t-surface t-border border rounded px-3 py-2.5 sm:py-2 text-sm sm:text-xs mb-4 focus:outline-none focus:border-neon-cyan/50"
        />

        <label className="block text-xs sm:text-sm text-text-muted mb-1.5">Model</label>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input 
            value={model} 
            onChange={e => setMdl(e.target.value)} 
            placeholder="model name"
            className="flex-1 t-surface t-border border rounded px-3 py-2.5 sm:py-2 text-sm sm:text-xs focus:outline-none focus:border-neon-cyan/50"
          />
          {currentPreset.models.length > 0 && (
            <select 
              value={currentPreset.models.includes(model) ? model : ''} 
              onChange={e => e.target.value && setMdl(e.target.value)}
              className="t-surface t-border border rounded px-3 py-2.5 sm:px-2 sm:py-2 text-sm sm:text-xs focus:outline-none focus:border-neon-cyan/50 min-h-[44px] sm:min-h-0"
            >
              <option value="">presets</option>
              {currentPreset.models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
        </div>

        <label className="block text-xs sm:text-sm text-text-muted mb-1.5">API Key</label>
        <input 
          type="password" 
          value={key} 
          onChange={e => setKey(e.target.value)} 
          placeholder="sk-..."
          className="w-full t-surface t-border border rounded px-3 py-2.5 sm:py-2 text-sm sm:text-xs mb-6 focus:outline-none focus:border-neon-cyan/50"
        />

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-3 sm:py-1.5 text-sm sm:text-xs text-text-muted t-border border rounded hover:text-text-primary transition-colors min-h-[44px] sm:min-h-0"
          >Cancel</button>
          <button 
            onClick={save} 
            className="px-4 py-3 sm:py-1.5 text-sm sm:text-xs text-neon-cyan border border-neon-cyan/30 rounded bg-neon-cyan/10 hover:bg-neon-cyan/20 transition-colors min-h-[44px] sm:min-h-0"
          >Save</button>
        </div>
      </div>
    </div>
  );
}
