import React, { useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { StackStep } from '../types/step';
import {
  nextGreaterElement, nextGreaterPseudocode,
  nextSmallerElement,
  dailyTemperatures, dailyTempsPseudocode,
  largestRectangleHistogram, histogramPseudocode,
  trappingRainWater, rainWaterPseudocode,
} from '../algorithms/monotonicStack/stackAlgorithms';
import { usePlayback } from '../hooks/usePlayback';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { ControlPanel } from '../components/layout/ControlPanel';
import { CodePanel, StepDescription, ZoomableContainer } from '../components/shared/SharedComponents';

// ── Input bar: always-visible labeled text field ──────────────────────────────
function InlineInputBar({ values, onApply, onRandomize, label = 'Values' }: {
  values: number[];
  onApply: (v: number[]) => void;
  onRandomize: () => void;
  label?: string;
}) {
  const [text, setText] = useState(() => values.join(', '));
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const prevRef = useRef(values);

  if (prevRef.current !== values) {
    prevRef.current = values;
    setText(values.join(', '));
    setDirty(false);
    setError('');
  }

  const apply = () => {
    const valid = text.split(',').map(s => s.trim()).filter(Boolean).map(Number);
    if (valid.some(isNaN) || valid.length === 0) { setError('Enter comma-separated integers  e.g.  4, 5, 2, 10, 8'); return; }
    setError(''); setDirty(false); onApply(valid);
  };
  const reset = () => { setText(values.join(', ')); setDirty(false); setError(''); };

  return (
    <div style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '10px 14px' }}>
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-xs font-semibold font-mono shrink-0" style={{ color: '#94a3b8', minWidth: 70 }}>
          {label}:
        </label>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="text"
            value={text}
            onChange={e => { setText(e.target.value); setError(''); setDirty(true); }}
            onKeyDown={e => { if (e.key === 'Enter') apply(); if (e.key === 'Escape') reset(); }}
            placeholder={`e.g.  4, 5, 2, 10, 8  — type your own values here`}
            spellCheck={false}
            className="flex-1 min-w-0 px-3 py-1.5 rounded text-xs font-mono"
            style={{
              background: '#1e293b',
              border: `1.5px solid ${error ? '#ef4444' : dirty ? '#6366f1' : '#334155'}`,
              color: '#e2e8f0',
              outline: 'none',
              transition: 'border-color 120ms',
            }}
          />
          {dirty && (
            <button onClick={apply} className="shrink-0 px-3 py-1.5 rounded text-xs font-mono font-semibold"
              style={{ background: '#4f46e5', color: 'white', whiteSpace: 'nowrap' }}>↵ Apply</button>
          )}
          {dirty && (
            <button onClick={reset} className="shrink-0 px-2 py-1.5 rounded text-xs font-mono"
              style={{ background: '#1e293b', color: '#64748b', border: '1px solid #334155', whiteSpace: 'nowrap' }}>✕ Reset</button>
          )}
        </div>
        <button onClick={onRandomize} className="shrink-0 px-3 py-1.5 rounded text-xs font-mono"
          style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', whiteSpace: 'nowrap' }}>⟳ Random</button>
      </div>
      <div className="mt-1.5" style={{ paddingLeft: 82 }}>
        {error ? (
          <span className="text-xs font-mono" style={{ color: '#f87171' }}>⚠ {error}</span>
        ) : dirty ? (
          <span className="text-xs font-mono" style={{ color: '#818cf8' }}>Press Enter or Apply to visualize · Esc to reset</span>
        ) : (
          <span className="text-xs font-mono" style={{ color: '#334155' }}>Edit values above and press Enter · or click ⟳ Random</span>
        )}
      </div>
    </div>
  );
}

type AlgoId = 'next-greater' | 'next-smaller' | 'daily-temps' | 'histogram' | 'rain-water';

const ALGO_META: Record<AlgoId, { name: string; pseudocode: string[]; fn: (a: number[]) => StackStep[] }> = {
  'next-greater': { name: 'Next Greater Element', pseudocode: nextGreaterPseudocode, fn: nextGreaterElement },
  'next-smaller': { name: 'Next Smaller Element', pseudocode: nextGreaterPseudocode, fn: nextSmallerElement },
  'daily-temps': { name: 'Daily Temperatures', pseudocode: dailyTempsPseudocode, fn: dailyTemperatures },
  'histogram': { name: 'Largest Rectangle', pseudocode: histogramPseudocode, fn: largestRectangleHistogram },
  'rain-water': { name: 'Trapping Rain Water', pseudocode: rainWaterPseudocode, fn: trappingRainWater },
};

const DEFAULT_INPUTS: Record<AlgoId, number[]> = {
  'next-greater': [4, 5, 2, 10, 8],
  'next-smaller': [4, 5, 2, 10, 8],
  'daily-temps': [73, 74, 75, 71, 69, 72, 76, 73],
  'histogram': [2, 1, 5, 6, 2, 3],
  'rain-water': [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
};

function BarChart({ step, algoId }: { step: StackStep; algoId: AlgoId }) {
  const { array, currentIndex, highlightIndices, result } = step;
  const maxVal = Math.max(...array, 1);
  const isHistogram = algoId === 'histogram';
  const isRainWater = algoId === 'rain-water';

  return (
    <ZoomableContainer>
      <div className="flex items-end gap-1 h-full min-h-[12rem] px-4 py-4 justify-center" style={{ background: '#020617' }}>
        {array.map((val, i) => {
        const isProcessing = i === currentIndex;
        const isHighlighted = highlightIndices.includes(i);
        const isResolved = result[i] !== null;

        const color = isProcessing ? '#6366f1'
          : isHighlighted ? '#f59e0b'
          : isResolved ? '#10b981'
          : '#334155';

        const heightPct = (val / maxVal) * 100;

        return (
          <div key={i} className="flex flex-col items-center gap-1">
            {/* Result label */}
            <span className="text-xs font-mono" style={{ color: isResolved ? '#10b981' : '#334155', minWidth: 20, textAlign: 'center' }}>
              {result[i] !== null ? result[i] : ''}
            </span>

            {/* Rain water overlay */}
            {isRainWater && result[i] !== null && result[i]! > 0 && (
              <div
                style={{
                  width: '100%',
                  height: `${((result[i] as number) / maxVal) * 150}%`,
                  background: 'rgba(59,130,246,0.3)',
                  border: '1px solid rgba(59,130,246,0.5)',
                  position: 'relative',
                  bottom: 0,
                }}
              />
            )}

            {/* Bar */}
            <div
              style={{
                width: 32,
                height: `${Math.max(heightPct, 4)}%`,
                background: color,
                borderRadius: '3px 3px 0 0',
                transition: 'background 100ms',
                maxHeight: 148,
              }}
            />
            {/* Index label */}
            <span className="text-xs font-mono" style={{ color: isProcessing ? '#6366f1' : '#475569' }}>
              {i}
            </span>
            {/* Value label */}
            <span className="text-xs font-mono" style={{ color: '#334155' }}>
              {val}
            </span>
          </div>
        );
      })}
      </div>
    </ZoomableContainer>
  );
}

function StackPanel({ step }: { step: StackStep }) {
  const { stack, array, actionReason } = step;

  return (
    <div
      className="flex flex-col rounded-lg overflow-hidden"
      style={{ border: '1px solid #1e293b', background: '#0f172a' }}
    >
      <div className="px-3 py-2 border-b border-slate-800">
        <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Stack (top→bottom)</span>
      </div>
      <div className="p-3 flex-1 flex flex-col-reverse gap-1 min-h-24 max-h-48 overflow-auto">
        {stack.length === 0 ? (
          <span className="text-xs text-slate-700 font-mono text-center py-2">empty</span>
        ) : (
          [...stack].reverse().map((idx, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-2.5 py-1 rounded text-xs font-mono"
              style={{
                background: i === 0 ? '#1e3a5f' : '#1e293b',
                border: '1px solid',
                borderColor: i === 0 ? '#3b82f6' : '#334155',
                color: i === 0 ? '#60a5fa' : '#64748b',
              }}
            >
              <span>idx {idx}</span>
              <span style={{ color: '#94a3b8' }}>= {array[idx]}</span>
            </div>
          ))
        )}
      </div>
      {actionReason && (
        <div className="px-3 py-2 border-t border-slate-800">
          <span className="text-xs font-mono" style={{ color: '#f59e0b' }}>← {actionReason}</span>
        </div>
      )}
    </div>
  );
}

export const MonotonicStackPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const algoId = (searchParams.get('algo') ?? 'next-greater') as AlgoId;
  const meta = ALGO_META[algoId];

  const [inputArray, setInputArray] = useState<number[]>(DEFAULT_INPUTS[algoId]);

  const steps = useMemo<StackStep[]>(() => meta.fn(inputArray), [meta, inputArray]);
  const { state, controls } = usePlayback(Math.max(steps.length, 1));
  useKeyboardShortcuts(controls);

  const currentStep = steps[state.currentStep];

  const handleAlgoChange = (id: AlgoId) => {
    setSearchParams({ algo: id });
    setInputArray(DEFAULT_INPUTS[id]);
  };

  const handleRandomize = () => setInputArray(
    Array.from({ length: 8 },
      () => algoId === 'daily-temps' ? Math.floor(Math.random() * 40) + 60
        : Math.floor(Math.random() * 8) + 1)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto shrink-0" style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
        {Object.entries(ALGO_META).map(([id, m]) => (
          <button key={id} onClick={() => handleAlgoChange(id as AlgoId)}
            className="px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors"
            style={{ background: algoId === id ? '#4f46e5' : '#1e293b', color: algoId === id ? 'white' : '#64748b', border: '1px solid', borderColor: algoId === id ? '#4f46e5' : '#334155' }}
          >{m.name}</button>
        ))}
      </div>

      {/* Inline Input Bar */}
      <div className="shrink-0">
        <InlineInputBar values={inputArray} onApply={setInputArray} onRandomize={handleRandomize} />
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main visualization: bar chart + stack side by side */}
          <div className="flex-1 flex gap-0 overflow-hidden">
            {/* Bar chart */}
            <div className="flex-1 overflow-hidden" style={{ background: '#020617' }}>
              {currentStep && <BarChart step={currentStep} algoId={algoId} />}
              {/* Color legend */}
              <div
                className="flex items-center gap-4 px-4 py-2"
                style={{ borderTop: '1px solid #1e293b' }}
              >
                {[
                  { color: '#6366f1', label: 'Processing' },
                  { color: '#f59e0b', label: 'Highlighted' },
                  { color: '#10b981', label: 'Resolved' },
                  { color: '#334155', label: 'Pending' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ background: color }} />
                    <span className="text-xs text-slate-500 font-mono">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stack panel (right of bars) */}
            <div
              className="w-52 p-3 border-l overflow-y-auto"
              style={{ background: '#020617', borderColor: '#1e293b' }}
            >
              {currentStep && <StackPanel step={currentStep} />}
              {/* Result so far */}
              {currentStep && (
                <div className="mt-3 rounded p-2.5" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
                  <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1.5">Result</p>
                  <div className="flex flex-wrap gap-1">
                    {currentStep.result.map((v, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-xs font-mono"
                        style={{
                          background: v !== null ? '#0f3327' : '#1e293b',
                          color: v !== null ? '#10b981' : '#334155',
                        }}
                      >
                        [{i}]:{v !== null ? v : '?'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <ControlPanel
            state={state}
            controls={controls}
          />
        </div>

        <div
          className="flex flex-col gap-3 p-3 overflow-y-auto shrink-0"
          style={{ width: 264, background: '#0a0f1e', borderLeft: '1px solid #1e293b' }}
        >
          <StepDescription
            description={currentStep?.description ?? ''}
            stepIndex={state.currentStep}
            totalSteps={steps.length}
          />
          <CodePanel
            lines={meta.pseudocode}
            activeLine={currentStep?.pseudocodeLine ?? 0}
            title={`${meta.name} Pseudocode`}
          />
        </div>
      </div>
    </div>
  );
};
