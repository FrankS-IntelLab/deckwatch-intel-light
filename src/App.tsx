import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimeRange, GitHubRepo } from './types';
import { fetchTrending } from './api/github';
import Header from './components/Header';
import TitansPanel from './components/TitansPanel';
import UndergroundPanel from './components/UndergroundPanel';
import ChatPanel from './components/ChatPanel';
import ReportGenerator from './components/ReportGenerator';
import SettingsModal from './components/SettingsModal';
import RepoQueryPopup from './components/RepoQueryPopup';
import HistoryPanel from './components/HistoryPanel';
import { RepoPopupProvider, useRepoPopup } from './context/RepoPopupContext';
import { HistoryProvider } from './context/HistoryContext';
import './index.css';

type AITab = 'chat' | 'report' | 'history';

export default function App() {
  return (
    <HistoryProvider>
      <RepoPopupProvider>
        <AppInner />
      </RepoPopupProvider>
    </HistoryProvider>
  );
}

function AppInner() {
  const [range, setRange] = useState<TimeRange>('weekly');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiTab, setAiTab] = useState<AITab>('chat');
  const [aiOpen, setAiOpen] = useState(false);
  const [allRepos, setAllRepos] = useState<GitHubRepo[]>([]);
  const [dark, setDark] = useState(() => localStorage.getItem('dw_theme') === 'dark');
  const [aiHeight, setAiHeight] = useState(() => Number(localStorage.getItem('dw_ai_height')) || 280);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const { leftRepo, rightRepo, closePopup } = useRepoPopup();

  const rangeLabel = { daily: 'Last 24h', '48h': 'Last 48h', weekly: 'Last 7 days', monthly: 'Last 30 days' }[range];

  useEffect(() => {
    document.body.classList.toggle('theme-dark', dark);
    localStorage.setItem('dw_theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    fetchTrending(range, 15)
      .then(repos => setAllRepos(repos))
      .catch(() => setAllRepos([]));
  }, [range]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    startH.current = aiHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [aiHeight]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragging.current = true;
    startY.current = e.touches[0].clientY;
    startH.current = aiHeight;
  }, [aiHeight]);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      const delta = startY.current - e.clientY;
      const newH = Math.min(Math.max(startH.current + delta, 150), window.innerHeight - 120);
      setAiHeight(newH);
    }
    function onTouchMove(e: TouchEvent) {
      if (!dragging.current) return;
      const delta = startY.current - e.touches[0].clientY;
      const newH = Math.min(Math.max(startH.current + delta, 150), window.innerHeight - 120);
      setAiHeight(newH);
    }
    function onEnd() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem('dw_ai_height', String(aiHeight));
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [aiHeight]);

  return (
    <div className="h-screen flex flex-col t-bg">
      <Header activeRange={range} onRangeChange={setRange} dark={dark} onToggleTheme={() => setDark(!dark)}>
        <button onClick={() => setSettingsOpen(true)} className="px-2 py-1 text-xs text-text-muted hover:text-neon-cyan transition-colors" aria-label="Settings">⚙</button>
      </Header>

      <main className="flex-1 min-h-0 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 py-3 sm:py-4 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        <TitansPanel timeRange={rangeLabel} range={range} />
        <UndergroundPanel range={range} timeRange={rangeLabel} />
      </main>

      {/* Mobile-friendly AI button */}
      <button
        onClick={() => setAiOpen(!aiOpen)}
        className={`fixed bottom-4 right-4 sm:hidden z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-lg transition-colors ${
          aiOpen ? 'bg-neon-magenta text-white' : 't-card t-border border text-text-muted hover:text-neon-magenta'
        }`}
        aria-label="Toggle AI Panel"
      >
        ◈
      </button>

      {aiOpen && (
        <div className="t-card t-border border-t shrink-0 flex flex-col fixed sm:relative inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-auto z-50 sm:z-auto" style={{ height: aiHeight }}>
          {/* Drag handle */}
          <div
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            className="h-3 sm:h-2 cursor-row-resize flex items-center justify-center shrink-0 hover:bg-neon-cyan/10 transition-colors group active:bg-neon-cyan/20"
            title="Drag to resize"
          >
            <div className="w-12 sm:w-10 h-1 sm:h-0.5 rounded-full bg-text-muted/30 group-hover:bg-neon-cyan/50 transition-colors" />
          </div>

          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-1.5 t-border border-b shrink-0">
            <span className="text-neon-magenta text-xs font-bold tracking-widest glow-magenta">◈ AI INTEL</span>
            <div className="flex gap-0.5 ml-2 sm:ml-3 t-border border rounded p-0.5">
              {(['chat', 'report', 'history'] as const).map(t => (
                <button key={t} onClick={() => setAiTab(t)}
                  className={`px-2.5 py-1 sm:px-3 sm:py-0.5 text-xs sm:text-[11px] rounded-sm transition-colors min-h-[36px] sm:min-h-0 ${aiTab === t ? 'bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/30' : 'text-text-muted hover:text-text-primary border border-transparent'}`}
                >{t === 'chat' ? 'Chat' : t === 'report' ? 'Report' : 'History'}</button>
              ))}
            </div>
            <span className="text-text-muted text-[10px] ml-auto hidden sm:inline">{rangeLabel} • {allRepos.length} repos</span>
            <button onClick={() => setAiOpen(false)} className="text-text-muted hover:text-text-primary text-base sm:text-sm ml-2 p-2 sm:p-0">✕</button>
          </div>
          <div className="flex-1 min-h-0">
            {aiTab === 'chat' ? <ChatPanel repos={allRepos} label={rangeLabel} /> : aiTab === 'report' ? <ReportGenerator repos={allRepos} label={rangeLabel} /> : <HistoryPanel />}
          </div>
        </div>
      )}

      {leftRepo && <RepoQueryPopup repo={leftRepo} side="left" onClose={() => closePopup('left')} />}
      {rightRepo && <RepoQueryPopup repo={rightRepo} side="right" onClose={() => closePopup('right')} />}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
