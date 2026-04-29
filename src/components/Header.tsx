import type { ReactNode } from 'react';
import type { TimeRange } from '../types';

const tabs: { label: string; value: TimeRange }[] = [
  { label: '24H', value: 'daily' },
  { label: '48H', value: '48h' },
  { label: '7D', value: 'weekly' },
  { label: '30D', value: 'monthly' },
];

export default function Header({ activeRange, onRangeChange, dark, onToggleTheme, children }: {
  activeRange: TimeRange;
  onRangeChange: (r: TimeRange) => void;
  dark: boolean;
  onToggleTheme: () => void;
  children?: ReactNode;
}) {
  return (
    <header className="t-card t-border border-b px-3 sm:px-6 py-2.5 flex items-center justify-between shrink-0 z-50">
      <div className="flex items-center gap-2">
        <div className="status-dot" />
        <h1 className="text-lg sm:text-xl font-bold tracking-widest glitch-hover">
          <span className="text-neon-cyan glow-cyan">DECK</span>
          <span className="text-neon-magenta glow-magenta">WATCH</span>
        </h1>
      </div>
      
      {/* Mobile: Stack buttons vertically on very small screens */}
      <div className="flex items-center gap-1 sm:gap-3">
        <span className="text-text-muted text-[10px] uppercase tracking-wider hidden lg:inline animate-flicker">
          ◈ signal active
        </span>
        
        {/* Time range tabs - scrollable on mobile */}
        <nav className="flex gap-0.5 t-border border rounded p-0.5 overflow-x-auto" role="tablist" aria-label="Time range">
          {tabs.map(t => (
            <button
              key={t.value}
              role="tab"
              aria-selected={activeRange === t.value}
              onClick={() => onRangeChange(t.value)}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-xs tracking-wider transition-all rounded-sm min-w-[44px] sm:min-w-0 ${
                activeRange === t.value
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 font-bold'
                  : 'text-text-muted hover:text-text-primary border border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        
        <button
          onClick={onToggleTheme}
          className="px-2.5 py-2 sm:px-2 sm:py-1 text-base sm:text-xs text-text-muted hover:text-neon-yellow transition-colors min-w-[44px] sm:min-w-0"
          aria-label="Toggle theme"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? '☀' : '☾'}
        </button>
        <button 
          onClick={() => (children as any)?.props?.onClick?.()} 
          className="px-2.5 py-2 sm:px-2 sm:py-1 text-base sm:text-xs text-text-muted hover:text-neon-cyan transition-colors min-w-[44px] sm:min-w-0" 
          aria-label="Settings"
        >⚙</button>
      </div>
    </header>
  );
}
