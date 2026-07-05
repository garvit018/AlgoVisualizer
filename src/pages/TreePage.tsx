import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TreeNode, TreeStep } from '../types/step';
import {
  bstInsert, bstInsertPseudocode,
  bstSearch,
  treeTraversal,
  inorderPseudocode, preorderPseudocode, postorderPseudocode, levelorderPseudocode,
  buildBSTFromArray,
} from '../algorithms/trees/treeAlgorithms';
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
    if (valid.some(isNaN) || valid.length === 0) { setError('Enter comma-separated integers  e.g.  15, 8, 22, 4, 11'); return; }
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
            placeholder={`e.g.  15, 8, 22, 4, 11, 20, 29  — type your own values here`}
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

type AlgoId = 'insert' | 'search' | 'inorder' | 'preorder' | 'postorder' | 'levelorder';

const ALGO_META: Record<AlgoId, { name: string; pseudocode: string[] }> = {
  insert: { name: 'BST Insert', pseudocode: bstInsertPseudocode },
  search: { name: 'BST Search', pseudocode: ['search(node, target):', '  if node == null: not found', '  if target == node.val: found!', '  if target < node.val: go left', '  else: go right'] },
  inorder: { name: 'In-order', pseudocode: inorderPseudocode },
  preorder: { name: 'Pre-order', pseudocode: preorderPseudocode },
  postorder: { name: 'Post-order', pseudocode: postorderPseudocode },
  levelorder: { name: 'Level-order', pseudocode: levelorderPseudocode },
};

// Layout algorithm: compute x,y positions for each tree node
interface LayoutNode extends TreeNode {
  lx: number;
  ly: number;
  children?: LayoutNode[];
}

function layoutTree(root: TreeNode | null): LayoutNode[] {
  if (!root) return [];
  const result: LayoutNode[] = [];
  const xOffsets: Record<number, number> = {};

  function getX(depth: number): number {
    xOffsets[depth] = (xOffsets[depth] ?? 0) + 1;
    return xOffsets[depth];
  }

  function countLeaves(node: TreeNode): number {
    if (!node.left && !node.right) return 1;
    return (node.left ? countLeaves(node.left) : 0) + (node.right ? countLeaves(node.right) : 0);
  }

  function assignPositions(node: TreeNode, depth: number, left: number, right: number): void {
    const mid = (left + right) / 2;
    const lx = 40 + mid * 55;
    const ly = 40 + depth * 72;
    result.push({ ...node, lx, ly });

    if (node.left) {
      const leftCount = countLeaves(node.left);
      assignPositions(node.left, depth + 1, left, left + leftCount);
    }
    if (node.right) {
      const leftCount = node.left ? countLeaves(node.left) : 0;
      assignPositions(node.right, depth + 1, left + leftCount, right);
    }
  }

  const totalLeaves = countLeaves(root);
  assignPositions(root, 0, 0, totalLeaves);
  return result;
}

function TreeSVG({ tree, highlightedIds, activeNodeId, traversalOrder }: {
  tree: TreeNode | null;
  highlightedIds: string[];
  activeNodeId?: string;
  traversalOrder: number[];
}) {
  if (!tree) return (
    <div className="flex-1 flex items-center justify-center text-slate-600 text-sm font-mono">
      Empty tree — add values using the input
    </div>
  );

  const layoutNodes = useMemo(() => layoutTree(tree), [tree]);
  const idMap = useMemo(() => {
    const m: Record<string, LayoutNode> = {};
    layoutNodes.forEach(n => { m[n.id] = n; });
    return m;
  }, [layoutNodes]);

  const maxX = Math.max(...layoutNodes.map(n => n.lx), 400);
  const maxY = Math.max(...layoutNodes.map(n => n.ly), 300);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${maxX + 60} ${maxY + 60}`}
      style={{ background: '#020617' }}
      aria-label="Binary tree visualization"
    >
      {/* Edges */}
      {layoutNodes.map(node => {
        const edges: React.ReactNode[] = [];
        if (node.left) {
          const child = idMap[node.left.id];
          if (child) {
            edges.push(
              <line
                key={`${node.id}-left`}
                x1={node.lx} y1={node.ly + 18}
                x2={child.lx} y2={child.ly - 18}
                stroke="#334155" strokeWidth="1"
              />
            );
          }
        }
        if (node.right) {
          const child = idMap[node.right.id];
          if (child) {
            edges.push(
              <line
                key={`${node.id}-right`}
                x1={node.lx} y1={node.ly + 18}
                x2={child.lx} y2={child.ly - 18}
                stroke="#334155" strokeWidth="1"
              />
            );
          }
        }
        return edges;
      })}

      {/* Nodes */}
      {layoutNodes.map(node => {
        const isActive = node.id === activeNodeId;
        const isHighlighted = highlightedIds.includes(node.id);
        const fill = isActive ? '#4f46e5' : isHighlighted ? '#1e3a5f' : '#1e293b';
        const stroke = isActive ? '#6366f1' : isHighlighted ? '#3b82f6' : '#334155';
        const textColor = isActive ? 'white' : isHighlighted ? '#60a5fa' : '#94a3b8';

        return (
          <g key={node.id} transform={`translate(${node.lx},${node.ly})`}>
            <circle
              r={20}
              fill={fill}
              stroke={stroke}
              strokeWidth={isActive ? 2 : 1}
            />
            <text
              fill={textColor}
              fontSize="13"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ userSelect: 'none' }}
            >
              {node.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function randomBST(): number[] {
  const n = 9;
  const vals = new Set<number>();
  while (vals.size < n) vals.add(Math.floor(Math.random() * 90) + 5);
  return [...vals];
}

export const TreePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const algoId = (searchParams.get('algo') ?? 'insert') as AlgoId;
  const meta = ALGO_META[algoId];

  const [values, setValues] = useState<number[]>(() => randomBST());
  const [searchTarget, setSearchTarget] = useState(50);

  const currentTree = useMemo(() => buildBSTFromArray(values), [values]);

  const steps = useMemo<TreeStep[]>(() => {
    if (algoId === 'insert') return bstInsert(values);
    if (algoId === 'search') return bstSearch(currentTree, searchTarget);
    const traversalType = algoId as 'inorder' | 'preorder' | 'postorder' | 'levelorder';
    return treeTraversal(currentTree, traversalType);
  }, [algoId, values, currentTree, searchTarget]);

  const { state, controls } = usePlayback(Math.max(steps.length, 1));
  useKeyboardShortcuts(controls);

  const currentStep = steps[state.currentStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto shrink-0" style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
        {Object.entries(ALGO_META).map(([id, m]) => (
          <button key={id} onClick={() => setSearchParams({ algo: id })}
            className="px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors"
            style={{ background: algoId === id ? '#4f46e5' : '#1e293b', color: algoId === id ? 'white' : '#64748b', border: '1px solid', borderColor: algoId === id ? '#4f46e5' : '#334155' }}
          >{m.name}</button>
        ))}
        {algoId === 'search' && (
          <div className="flex items-center gap-2 ml-4 border-l border-slate-800 pl-4">
            <span className="text-xs text-slate-500 font-mono">Search value:</span>
            <input type="number" value={searchTarget} onChange={e => setSearchTarget(Number(e.target.value))}
              className="w-16 px-2 py-0.5 rounded text-xs font-mono"
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', outline: 'none' }}
            />
          </div>
        )}
      </div>

      {/* Inline Input Bar */}
      <div className="shrink-0">
        <InlineInputBar values={values} onApply={setValues} onRandomize={() => setValues(randomBST())} label="BST Values" />
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Tree SVG */}
          <div style={{ flex: 1, overflow: 'hidden', background: '#020617', padding: 16 }}>
            <ZoomableContainer>
              <TreeSVG
                tree={currentStep?.tree ?? currentTree}
                highlightedIds={currentStep?.highlightedNodeIds ?? []}
                activeNodeId={currentStep?.activeNodeId}
                traversalOrder={currentStep?.traversalOrder ?? []}
              />
            </ZoomableContainer>
          </div>

          {/* Traversal order */}
          {currentStep?.traversalOrder && currentStep.traversalOrder.length > 0 && (
            <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0" style={{ borderTop: '1px solid #1e293b', background: '#020617' }}>
              <span className="text-xs text-slate-500 font-mono shrink-0">Order:</span>
              {currentStep.traversalOrder.map((v, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs font-mono shrink-0"
                  style={{ background: i === currentStep.traversalOrder.length - 1 ? '#4f46e5' : '#1e293b', color: i === currentStep.traversalOrder.length - 1 ? 'white' : '#64748b' }}
                >{v}</span>
              ))}
            </div>
          )}

          <ControlPanel state={state} controls={controls} />
        </div>

        <div className="flex flex-col gap-3 p-3 overflow-y-auto shrink-0" style={{ width: 264, background: '#0a0f1e', borderLeft: '1px solid #1e293b' }}>
          <StepDescription description={currentStep?.description ?? ''} stepIndex={state.currentStep} totalSteps={steps.length} />
          <CodePanel lines={meta.pseudocode} activeLine={currentStep?.pseudocodeLine ?? 0} title={`${meta.name} Pseudocode`} />
        </div>
      </div>
    </div>
  );
};
