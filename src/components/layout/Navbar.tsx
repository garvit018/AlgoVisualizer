import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const KeyboardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 16h12"/>
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { theme, toggle } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-4 gap-3"
        style={{ background: '#020617', borderBottom: '1px solid #1e293b' }}
      >
        {/* Hamburger (mobile) */}
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors lg:hidden"
        >
          <MenuIcon />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline" style={{ textDecoration: 'none' }}>
          <span
            className="flex items-center justify-center w-6 h-6 rounded"
            style={{ background: '#4f46e5', fontSize: '12px', fontWeight: 700, color: 'white' }}
          >
            ∑
          </span>
          <span className="text-sm font-semibold text-slate-200 tracking-tight font-mono">
            Algo<span style={{ color: '#6366f1' }}>Visualizer</span>
          </span>
        </Link>

        <div className="flex-1" />

        {/* Keyboard shortcuts hint */}
        <button
          onClick={() => setShowShortcuts(s => !s)}
          aria-label="Keyboard shortcuts"
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors text-xs font-mono"
        >
          <KeyboardIcon />
          Shortcuts
        </button>

        {/* Theme toggle */}
        <button
          id="theme-toggle"
          onClick={toggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="rounded-lg p-6 min-w-72"
            style={{ background: '#0f172a', border: '1px solid #1e293b' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-slate-200 mb-4 font-mono">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              {[
                ['Space', 'Play / Pause'],
                ['→', 'Step Forward'],
                ['←', 'Step Backward'],
                ['R', 'Reset'],
              ].map(([key, action]) => (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <kbd className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {key}
                  </kbd>
                  <span className="text-slate-400">{action}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-4 w-full py-1.5 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors font-mono"
            >
              Close [Esc]
            </button>
          </div>
        </div>
      )}
    </>
  );
};
