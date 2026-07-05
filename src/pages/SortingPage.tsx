import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SORTING_ALGORITHMS } from '../algorithms/sorting/index';
import type { SortStep } from '../types/step';
import { usePlayback } from '../hooks/usePlayback';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { ControlPanel } from '../components/layout/ControlPanel';
import { CodePanel, StepDescription, ComplexityPanel, ZoomableContainer } from '../components/shared/SharedComponents';

const STATE_COLORS: Record<string, string> = {
  default: '#334155',
  comparing: '#f59e0b',
  active: '#3b82f6',
  sorted: '#10b981',
  pivot: '#8b5cf6',
  pointer: '#6366f1',
};

function randomArray(n: number): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
}

// ─────────────────────────────────────────────────────────────────────────────
// InputBar — always-visible, clearly editable text field
// ─────────────────────────────────────────────────────────────────────────────
interface InputBarProps {
  values: number[];
  size: number;
  onApply: (vals: number[]) => void;
  onRandomize: () => void;
  onSizeChange: (n: number) => void;
}

const InputBar: React.FC<InputBarProps> = ({ values, size, onApply, onRandomize, onSizeChange }) => {
  const [text, setText] = useState(() => values.join(', '));
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  // Keep text in sync when values change from outside (random / size slider)
  const prevValuesRef = useRef(values);
  if (prevValuesRef.current !== values) {
    prevValuesRef.current = values;
    setText(values.join(', '));
    setDirty(false);
    setError('');
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    setError('');
    setDirty(true);
  };

  const apply = () => {
    const parts = text.split(',').map(s => s.trim()).filter(Boolean);
    const nums = parts.map(Number);
    if (nums.some(isNaN) || nums.length === 0) {
      setError('Please enter comma-separated integers  e.g.  5, 3, 8, 1, 9, 2');
      return;
    }
    if (nums.length > 100) {
      setError('Maximum 100 elements allowed');
      return;
    }
    setError('');
    setDirty(false);
    onApply(nums);
  };

  const reset = () => {
    setText(values.join(', '));
    setDirty(false);
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') apply();
    if (e.key === 'Escape') reset();
  };

  return (
    <div style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '10px 14px' }}>
      <div className="flex items-center gap-3 flex-wrap">

        {/* ── Label ── */}
        <label
          htmlFor="sort-custom-input"
          className="shrink-0 text-xs font-semibold font-mono"
          style={{ color: '#94a3b8', minWidth: 70 }}
        >
          Your Input:
        </label>

        {/* ── Text field — always visible & editable ── */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            id="sort-custom-input"
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g.  64, 25, 12, 22, 11   — type your own numbers, separated by commas"
            spellCheck={false}
            className="flex-1 min-w-0 px-3 py-1.5 text-xs font-mono rounded"
            style={{
              background: '#1e293b',
              border: `1.5px solid ${error ? '#ef4444' : dirty ? '#6366f1' : '#334155'}`,
              color: '#e2e8f0',
              outline: 'none',
              transition: 'border-color 120ms',
            }}
          />

          {/* Apply — appears only when user has typed */}
          {dirty && (
            <button
              onClick={apply}
              className="shrink-0 px-3 py-1.5 rounded text-xs font-mono font-semibold"
              style={{ background: '#4f46e5', color: 'white', whiteSpace: 'nowrap' }}
            >
              ↵ Apply
            </button>
          )}

          {/* Cancel — appears only when user has typed */}
          {dirty && (
            <button
              onClick={reset}
              className="shrink-0 px-2 py-1.5 rounded text-xs font-mono"
              style={{ background: '#1e293b', color: '#64748b', border: '1px solid #334155', whiteSpace: 'nowrap' }}
            >
              ✕ Reset
            </button>
          )}
        </div>

        {/* ── Random button ── */}
        <button
          onClick={onRandomize}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono"
          style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', whiteSpace: 'nowrap' }}
        >
          ⟳ Random
        </button>

        {/* ── Size slider ── */}
        <div className="flex items-center gap-2 shrink-0 pl-3" style={{ borderLeft: '1px solid #1e293b' }}>
          <span className="text-xs font-mono" style={{ color: '#64748b' }}>n = {size}</span>
          <input
            type="range"
            min={5}
            max={80}
            value={size}
            onChange={e => onSizeChange(Number(e.target.value))}
            aria-label="Array size"
            className="w-20"
            style={{ accentColor: '#6366f1' }}
          />
        </div>
      </div>

      {/* ── Hint / error line ── */}
      <div className="mt-1.5" style={{ paddingLeft: 85 }}>
        {error ? (
          <span className="text-xs font-mono" style={{ color: '#f87171' }}>⚠ {error}</span>
        ) : dirty ? (
          <span className="text-xs font-mono" style={{ color: '#818cf8' }}>
            Press Enter or click Apply to visualize  ·  Esc to reset
          </span>
        ) : (
          <span className="text-xs font-mono" style={{ color: '#334155' }}>
            Edit the values above and press Enter — or click ⟳ Random to generate a new array
          </span>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SortingPage
// ─────────────────────────────────────────────────────────────────────────────
export const SortingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const algoId = searchParams.get('algo') ?? 'bubble';
  const algo = SORTING_ALGORITHMS.find(a => a.id === algoId) ?? SORTING_ALGORITHMS[0];

  const [size, setSize] = useState(20);
  const [inputArray, setInputArray] = useState<number[]>(() => randomArray(20));

  const steps: SortStep[] = useMemo(() => algo.fn(inputArray), [algo, inputArray]);
  const { state, controls } = usePlayback(steps.length);
  useKeyboardShortcuts(controls);

  const currentStep = steps[state.currentStep] ?? steps[0];

  const highlightMap = useMemo(() => {
    const map: Record<number, string> = {};
    currentStep?.highlights.forEach(h => { map[h.index] = h.state; });
    return map;
  }, [currentStep]);

  const maxVal = useMemo(() => Math.max(...inputArray, 1), [inputArray]);

  const handleRandomize = useCallback(() => {
    setInputArray(randomArray(size));
  }, [size]);

  const handleSizeChange = useCallback((n: number) => {
    setSize(n);
    setInputArray(randomArray(n));
  }, []);

  const handleApply = useCallback((vals: number[]) => {
    setInputArray(vals);
    setSize(vals.length);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Algorithm tabs ── */}
      <div
        className="flex items-center gap-1 px-4 py-2 overflow-x-auto shrink-0"
        style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}
      >
        {SORTING_ALGORITHMS.map(a => (
          <button
            key={a.id}
            id={`tab-${a.id}`}
            onClick={() => setSearchParams({ algo: a.id })}
            className="px-3 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors"
            style={{
              background: algo.id === a.id ? '#4f46e5' : '#1e293b',
              color: algo.id === a.id ? 'white' : '#64748b',
              border: '1px solid',
              borderColor: algo.id === a.id ? '#4f46e5' : '#334155',
            }}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* ── Input Bar ── */}
      <div className="shrink-0">
        <InputBar
          values={inputArray}
          size={size}
          onApply={handleApply}
          onRandomize={handleRandomize}
          onSizeChange={handleSizeChange}
        />
      </div>

      {/* ── Main content area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Visualization + controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Bar chart */}
          <div
            style={{ flex: 1, background: '#020617', position: 'relative', minHeight: 0 }}
            aria-label="Sorting visualization"
          >
            <ZoomableContainer>
              <svg
                width="100%"
                height="100%"
                style={{ position: 'absolute', inset: 0, display: 'block' }}
              >
              {currentStep?.array.map((val, i) => {
                const barState = highlightMap[i] ?? 'default';
                const color = STATE_COLORS[barState] ?? STATE_COLORS.default;
                const n = currentStep.array.length;
                const barWidthPct = (1 / n) * 100 * 0.85;
                const gapPct = (1 / n) * 100 * 0.15;
                const barXPct = (i / n) * 100 + gapPct / 2;
                const heightPct = Math.max((val / maxVal) * 94, 1);

                return (
                  <g key={i}>
                    <rect
                      x={`${barXPct}%`}
                      y={`${100 - heightPct}%`}
                      width={`${Math.max(barWidthPct - 0.1, 0.1)}%`}
                      height={`${heightPct}%`}
                      fill={color}
                      rx="2"
                      style={{ transition: 'fill 80ms ease' }}
                    />
                    {n <= 30 && (
                      <text
                        x={`${barXPct + barWidthPct / 2}%`}
                        y="99%"
                        fill="#475569"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {val}
                      </text>
                    )}
                  </g>
                );
              })}
              </svg>
            </ZoomableContainer>
          </div>

          {/* Color legend */}
          <div
            className="flex items-center gap-4 px-4 py-2 flex-wrap shrink-0"
            style={{ borderTop: '1px solid #1e293b', background: '#020617' }}
          >
            {[
              { label: 'Default', color: '#334155' },
              { label: 'Comparing', color: '#f59e0b' },
              { label: 'Swapping', color: '#3b82f6' },
              { label: 'Sorted', color: '#10b981' },
              { label: 'Pivot', color: '#8b5cf6' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: item.color }} />
                <span className="text-xs text-slate-500 font-mono">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Playback controls */}
          <ControlPanel state={state} controls={controls} />
        </div>

        {/* Right info panel */}
        <div
          className="flex flex-col gap-3 p-3 overflow-y-auto shrink-0"
          style={{ width: 280, background: '#0a0f1e', borderLeft: '1px solid #1e293b' }}
        >
          <StepDescription
            description={currentStep?.description ?? ''}
            stepIndex={state.currentStep}
            totalSteps={steps.length}
          />
          <ComplexityPanel
            complexity={algo.complexity}
            stats={{ comparisons: currentStep?.comparisons, swaps: currentStep?.swaps }}
          />
          <CodePanel
            lines={algo.pseudocode}
            activeLine={currentStep?.pseudocodeLine ?? 0}
            title={`${algo.name} Pseudocode`}
          />
        </div>
      </div>
    </div>
  );
};
