import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ListStep, ListNode } from '../types/step';
import {
  linkedListInsert, linkedListReverse, reverseListPseudocode,
  floydCycleDetection, floydPseudocode,
} from '../algorithms/linkedList/linkedListAlgorithms';
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
  const prevRef = React.useRef(values);

  if (prevRef.current !== values) {
    prevRef.current = values;
    setText(values.join(', '));
    setDirty(false);
    setError('');
  }

  const apply = () => {
    const valid = text.split(',').map(s => s.trim()).filter(Boolean).map(Number);
    if (valid.some(isNaN) || valid.length === 0) { setError('Enter comma-separated integers  e.g.  3, 7, 1, 9, 4'); return; }
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
            placeholder={`e.g.  3, 7, 1, 9, 4, 6  — type your own values here`}
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

type AlgoId = 'insert' | 'reverse' | 'cycle';

const NODE_W = 64, NODE_H = 44, ARROW_GAP = 28;

function ListSVG({ nodes, headId, highlightedIds, pointers }: {
  nodes: ListNode[];
  headId?: string;
  highlightedIds: string[];
  pointers?: Record<string, string>;
}) {
  if (nodes.length === 0) return (
    <div className="flex-1 flex items-center justify-center text-slate-600 font-mono text-sm">
      Empty list
    </div>
  );

  const totalWidth = nodes.length * (NODE_W + ARROW_GAP) + 60;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${totalWidth} 160`}
      style={{ background: '#020617', minHeight: 160 }}
      aria-label="Linked list visualization"
    >
      {nodes.map((node, i) => {
        const x = 30 + i * (NODE_W + ARROW_GAP);
        const y = 58;
        const isHighlighted = highlightedIds.includes(node.id);
        const isHead = node.id === headId;

        const pointerLabels = Object.entries(pointers ?? {})
          .filter(([, id]) => id === node.id)
          .map(([label]) => label);

        return (
          <g key={node.id}>
            {/* Arrow to next */}
            {node.nextId && nodes.find(n => n.id === node.nextId) && (
              <g>
                <line
                  x1={x + NODE_W} y1={y + NODE_H / 2}
                  x2={x + NODE_W + ARROW_GAP - 4} y2={y + NODE_H / 2}
                  stroke={isHighlighted ? '#6366f1' : '#334155'}
                  strokeWidth="1.5"
                />
                <polygon
                  points={`${x + NODE_W + ARROW_GAP - 4},${y + NODE_H / 2 - 4} ${x + NODE_W + ARROW_GAP + 2},${y + NODE_H / 2} ${x + NODE_W + ARROW_GAP - 4},${y + NODE_H / 2 + 4}`}
                  fill={isHighlighted ? '#6366f1' : '#334155'}
                />
              </g>
            )}

            {/* Null terminator */}
            {!node.nextId && (
              <text
                x={x + NODE_W + 10} y={y + NODE_H / 2 + 4}
                fill="#334155" fontSize="10" fontFamily="JetBrains Mono, monospace"
              >
                null
              </text>
            )}

            {/* Node box */}
            <rect
              x={x} y={y} width={NODE_W} height={NODE_H}
              rx={5}
              fill={isHighlighted ? '#1e3a5f' : '#1e293b'}
              stroke={isHighlighted ? '#6366f1' : isHead ? '#4f46e5' : '#334155'}
              strokeWidth={isHighlighted || isHead ? 2 : 1}
            />

            {/* Value */}
            <text
              x={x + NODE_W / 2} y={y + NODE_H / 2 + 1}
              fill={isHighlighted ? '#e2e8f0' : '#94a3b8'}
              fontSize="14" fontFamily="JetBrains Mono, monospace"
              textAnchor="middle" dominantBaseline="middle"
              fontWeight={isHighlighted ? '600' : '400'}
            >
              {node.value}
            </text>

            {/* Head label */}
            {isHead && (
              <text
                x={x + NODE_W / 2} y={y - 10}
                fill="#6366f1" fontSize="9" fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                head
              </text>
            )}

            {/* Pointer labels */}
            {pointerLabels.map((label, pi) => (
              <g key={label}>
                <rect
                  x={x + (pi * 32)} y={y + NODE_H + 8}
                  width={28} height={14} rx={3}
                  fill="#312e81" stroke="#4f46e5" strokeWidth="1"
                />
                <text
                  x={x + (pi * 32) + 14} y={y + NODE_H + 18}
                  fill="#a5b4fc" fontSize="9"
                  fontFamily="JetBrains Mono, monospace" textAnchor="middle"
                >
                  {label}
                </text>
                <line
                  x1={x + (pi * 32) + 14} y1={y + NODE_H + 8}
                  x2={x + NODE_W / 2} y2={y + NODE_H}
                  stroke="#4f46e5" strokeWidth="0.5" strokeDasharray="2,2"
                />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export const LinkedListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const algoId = (searchParams.get('algo') ?? 'reverse') as AlgoId;

  const [values, setValues] = useState([3, 7, 1, 9, 4, 6]);
  const [cycleAt, setCycleAt] = useState<number | undefined>(undefined);

  const steps = useMemo<ListStep[]>(() => {
    if (algoId === 'reverse') return linkedListReverse(values);
    if (algoId === 'cycle') return floydCycleDetection(values, cycleAt);
    return linkedListInsert(values, 'tail', Math.floor(Math.random() * 20) + 1);
  }, [algoId, values, cycleAt]);

  const { state, controls } = usePlayback(Math.max(steps.length, 1));
  useKeyboardShortcuts(controls);

  const currentStep = steps[state.currentStep];

  const pseudocode = algoId === 'cycle'
    ? floydPseudocode
    : algoId === 'reverse'
    ? reverseListPseudocode
    : ['insert(head, value, mode):', '  if mode==head: newNode.next=head', '  if mode==tail: traverse to end', '  if mode==index: traverse to idx', '  link newNode into position'];

  const handleRandomize = () => setValues(Array.from({ length: 6 }, () => Math.floor(Math.random() * 20) + 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tabs */}
      <div
        className="flex items-center gap-2 px-4 py-2 flex-wrap shrink-0"
        style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}
      >
        {[
          { id: 'reverse' as AlgoId, name: 'Reverse List' },
          { id: 'cycle' as AlgoId, name: "Floyd's Cycle" },
          { id: 'insert' as AlgoId, name: 'Insert Node' },
        ].map(({ id, name }) => (
          <button
            key={id}
            onClick={() => setSearchParams({ algo: id })}
            className="px-3 py-1 rounded text-xs font-mono transition-colors"
            style={{
              background: algoId === id ? '#4f46e5' : '#1e293b',
              color: algoId === id ? 'white' : '#64748b',
              border: '1px solid', borderColor: algoId === id ? '#4f46e5' : '#334155',
            }}
          >{name}</button>
        ))}

        {algoId === 'cycle' && (
          <div className="flex items-center gap-2 ml-4 border-l border-slate-800 pl-4">
            <label className="text-xs text-slate-500 font-mono">Cycle at index:</label>
            <select
              value={cycleAt ?? 'none'}
              onChange={e => setCycleAt(e.target.value === 'none' ? undefined : Number(e.target.value))}
              className="px-2 py-0.5 rounded text-xs font-mono"
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', outline: 'none' }}
            >
              <option value="none">No cycle</option>
              {values.map((_, i) => <option key={i} value={i}>Index {i}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Inline Input Bar */}
      <div className="shrink-0">
        <InlineInputBar values={values} onApply={setValues} onRandomize={handleRandomize} label="List Values" />
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 0, background: '#020617' }}>
            <ZoomableContainer>
              <ListSVG
                nodes={currentStep?.nodes ?? []}
                headId={currentStep?.headId}
                highlightedIds={currentStep?.highlightedIds ?? []}
                pointers={currentStep?.pointers}
              />
            </ZoomableContainer>
          </div>

          <ControlPanel state={state} controls={controls} />
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
          <div
            className="flex gap-2 flex-wrap text-xs font-mono p-2 rounded"
            style={{ background: '#0f172a', border: '1px solid #1e293b' }}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: '#1e3a5f', border: '1px solid #6366f1' }} />
              <span className="text-slate-500">Highlighted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: '#1e293b', border: '1px solid #4f46e5' }} />
              <span className="text-slate-500">Head</span>
            </div>
          </div>
          <CodePanel lines={pseudocode} activeLine={currentStep?.pseudocodeLine ?? 0} title="Pseudocode" />
        </div>
      </div>
    </div>
  );
};
