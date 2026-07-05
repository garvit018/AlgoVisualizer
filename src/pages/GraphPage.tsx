import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { GraphNode, GraphEdge, GraphStep, GridStep, GridCellState } from '../types/step';
import {
  bfs, bfsPseudocode, dfs, dfsPseudocode,
  dijkstra, dijkstraPseudocode, topologicalSort, topologicalSortPseudocode,
  cycleDetection, cycleDetectionPseudocode, kruskalMST, kruskalPseudocode
} from '../algorithms/graphs/graphAlgorithms';
import { gridBFS, gridAStar, gridBFSPseudocode, gridAStarPseudocode } from '../algorithms/graphs/gridAlgorithms';
import { usePlayback } from '../hooks/usePlayback';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { ControlPanel } from '../components/layout/ControlPanel';
import { CodePanel, StepDescription, CPInputModal, ZoomableContainer } from '../components/shared/SharedComponents';

type AlgoId = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'topo' | 'kruskal' | 'cycle';
type ViewMode = 'graph' | 'grid';

const ALGO_META: Record<AlgoId, { name: string; pseudocode: string[] }> = {
  bfs: { name: 'BFS', pseudocode: bfsPseudocode },
  dfs: { name: 'DFS', pseudocode: dfsPseudocode },
  dijkstra: { name: "Dijkstra's", pseudocode: dijkstraPseudocode },
  astar: { name: 'A* Search', pseudocode: gridAStarPseudocode },
  topo: { name: 'Topo Sort', pseudocode: topologicalSortPseudocode },
  kruskal: { name: "Kruskal MST", pseudocode: kruskalPseudocode },
  cycle: { name: 'Cycle Detection', pseudocode: cycleDetectionPseudocode },
};

const GRID_ALGOS: AlgoId[] = ['bfs', 'dfs', 'astar'];
const GRID_ROWS = 15, GRID_COLS = 25;

function randomGraph(n = 7, weighted = false): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = Array.from({ length: n }, (_, i) => ({
    id: `${i}`,
    label: `${i}`,
    x: 350 + Math.cos((i / n) * Math.PI * 2) * 200,
    y: 250 + Math.sin((i / n) * Math.PI * 2) * 150,
  }));
  const edges: GraphEdge[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    edges.push({ from: `${i}`, to: `${j}`, weight: weighted ? Math.floor(Math.random() * 9) + 1 : 1 });
    if (i < n - 2 && Math.random() > 0.5) {
      edges.push({ from: `${i}`, to: `${i + 2}`, weight: weighted ? Math.floor(Math.random() * 9) + 1 : 1 });
    }
  }
  return { nodes, edges };
}

function emptyGrid(): GridCellState[][] {
  return Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill('empty') as GridCellState[]);
}

type Coord = [number, number];

const GRID_COLORS: Record<GridCellState, string> = {
  empty: '#0f172a',
  wall: '#1e293b',
  start: '#4f46e5',
  end: '#10b981',
  visited: '#1e3a5f',
  frontier: '#f59e0b44',
  path: '#6366f1',
};

const NODE_COLORS = {
  default: '#1e293b',
  visited: '#1e3a5f',
  active: '#6366f1',
  frontier: '#f59e0b',
  path: '#10b981',
};

export const GraphPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const algoId = (searchParams.get('algo') ?? 'bfs') as AlgoId;
  const meta = ALGO_META[algoId] ?? ALGO_META.bfs;

  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [directed, setDirected] = useState(false);
  const [weighted, setWeighted] = useState(false);

  // Graph state
  const [nodes, setNodes] = useState<GraphNode[]>(() => randomGraph(7).nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(() => randomGraph(7).edges);
  const [startNode, setStartNode] = useState('0');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [edgeFrom, setEdgeFrom] = useState<string | null>(null);
  const [showCPModal, setShowCPModal] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleCPInput = useCallback((text: string) => {
    const tokens = text.trim().split(/\s+/).filter(Boolean);
    if (tokens.length < 2) return;
    const n = parseInt(tokens[0]);
    const m = parseInt(tokens[1]);
    if (isNaN(n) || isNaN(m)) return;
    
    const newNodes: GraphNode[] = Array.from({ length: n }, (_, i) => ({
      id: String(i),
      label: String(i),
      x: 350 + Math.cos((i / n) * Math.PI * 2) * 200,
      y: 250 + Math.sin((i / n) * Math.PI * 2) * 150,
    }));
    
    const newEdges: GraphEdge[] = [];
    let idx = 2;
    for (let i = 0; i < m; i++) {
      if (idx >= tokens.length - 1) break;
      const u = tokens[idx++];
      const v = tokens[idx++];
      let w = 1;
      if (weighted && idx < tokens.length && !isNaN(Number(tokens[idx]))) {
        w = parseInt(tokens[idx++]);
      }
      newEdges.push({ from: u, to: v, weight: w });
    }
    
    setNodes(newNodes);
    setEdges(newEdges);
    setStartNode('0');
  }, [weighted]);

  // Grid state
  const [grid, setGrid] = useState<GridCellState[][]>(emptyGrid);
  const [gridStart, setGridStart] = useState<Coord>([2, 2]);
  const [gridEnd, setGridEnd] = useState<Coord>([12, 22]);
  const [paintMode, setPaintMode] = useState<'wall' | 'erase'>('wall');
  const [isPainting, setIsPainting] = useState(false);

  const useGrid = viewMode === 'grid' && GRID_ALGOS.includes(algoId);

  // Compute steps
  const graphSteps = useMemo<GraphStep[]>(() => {
    if (useGrid || nodes.length === 0) return [];
    switch (algoId) {
      case 'bfs': return bfs(nodes, edges, startNode, directed);
      case 'dfs': return dfs(nodes, edges, startNode, directed);
      case 'dijkstra': return dijkstra(nodes, edges, startNode, directed);
      case 'topo': return topologicalSort(nodes, edges);
      case 'kruskal': return kruskalMST(nodes, edges);
      case 'cycle': return cycleDetection(nodes, edges, directed);
      default: return bfs(nodes, edges, startNode, directed);
    }
  }, [algoId, nodes, edges, startNode, directed, useGrid]);

  const gridSteps = useMemo<GridStep[]>(() => {
    if (!useGrid) return [];
    const g = emptyGrid();
    grid.forEach((row, r) => row.forEach((cell, c) => { g[r][c] = cell; }));
    g[gridStart[0]][gridStart[1]] = 'start';
    g[gridEnd[0]][gridEnd[1]] = 'end';
    if (algoId === 'astar') return gridAStar(g, gridStart, gridEnd);
    return gridBFS(g, gridStart, gridEnd);
  }, [useGrid, grid, gridStart, gridEnd, algoId]);

  const steps = useGrid ? gridSteps : graphSteps;
  const { state, controls } = usePlayback(Math.max(steps.length, 1));
  useKeyboardShortcuts(controls);

  const currentGraphStep = graphSteps[state.currentStep] as GraphStep | undefined;
  const currentGridStep = gridSteps[state.currentStep] as GridStep | undefined;

  // Node drag
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.shiftKey) { setEdgeFrom(f => f === id ? null : (f ? (setEdges(es => [...es, { from: f, to: id, weight: 1 }]), null) : id)); return; }
    setDraggingId(id);
  }, []);

  const handleSvgMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setNodes(ns => ns.map(n => n.id === draggingId
      ? { ...n, x: e.clientX - rect.left, y: e.clientY - rect.top }
      : n));
  }, [draggingId]);

  const handleSvgMouseUp = useCallback(() => setDraggingId(null), []);

  const handleAddNode = useCallback(() => {
    setNodes(ns => {
      const nextId = ns.length > 0 ? Math.max(...ns.map(n => Number(n.id) || 0)) + 1 : 0;
      const id = String(nextId);
      return [...ns, {
        id, label: id,
        x: 300 + Math.random() * 100, y: 200 + Math.random() * 100,
      }];
    });
  }, []);

  const handleNodeDoubleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNodes(ns => {
      const nextNodes = ns.filter(n => n.id !== id);
      setStartNode(prev => (prev === id ? (nextNodes[0]?.id ?? '') : prev));
      return nextNodes;
    });
    setEdges(es => es.filter(e => e.from !== id && e.to !== id));
  }, []);

  // Grid painting
  const paintCell = useCallback((r: number, c: number) => {
    setGrid(g => {
      const next = g.map(row => [...row]) as GridCellState[][];
      if (r === gridStart[0] && c === gridStart[1]) return next;
      if (r === gridEnd[0] && c === gridEnd[1]) return next;
      next[r][c] = paintMode === 'wall' ? 'wall' : 'empty';
      return next;
    });
  }, [paintMode, gridStart, gridEnd]);

  const randomize = useCallback(() => {
    const { nodes: n, edges: e } = randomGraph(7, weighted);
    setNodes(n); setEdges(e); setStartNode('0');
  }, [weighted]);

  const clearGrid = useCallback(() => {
    setGrid(emptyGrid());
  }, []);

  const pseudocode = useGrid
    ? (algoId === 'astar' ? gridAStarPseudocode : gridBFSPseudocode)
    : meta.pseudocode;

  const description = useGrid
    ? (currentGridStep?.description ?? '')
    : (currentGraphStep?.description ?? '');

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-4 py-2 overflow-x-auto flex-wrap"
        style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}
      >
        {/* Algo tabs */}
        {Object.entries(ALGO_META).map(([id, m]) => (
          <button
            key={id}
            onClick={() => { setSearchParams({ algo: id }); if (!GRID_ALGOS.includes(id as AlgoId)) setViewMode('graph'); }}
            className="px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors"
            style={{
              background: algoId === id ? '#4f46e5' : '#1e293b',
              color: algoId === id ? 'white' : '#64748b',
              border: '1px solid', borderColor: algoId === id ? '#4f46e5' : '#334155',
            }}
          >{m.name}</button>
        ))}

        <div className="flex-1" />

        {/* Mode toggles */}
        {GRID_ALGOS.includes(algoId) && (
          <div className="flex items-center gap-1 border border-slate-700 rounded overflow-hidden">
            {(['graph', 'grid'] as ViewMode[]).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className="px-2 py-1 text-xs font-mono capitalize transition-colors"
                style={{ background: viewMode === m ? '#4f46e5' : 'transparent', color: viewMode === m ? 'white' : '#64748b' }}
              >{m}</button>
            ))}
          </div>
        )}
        {viewMode === 'graph' && (
          <>
            <button onClick={() => setDirected(d => !d)}
              className="px-2 py-1 rounded text-xs font-mono transition-colors"
              style={{ background: directed ? '#1e3a5f' : '#1e293b', color: directed ? '#60a5fa' : '#64748b', border: '1px solid #334155' }}
            >{directed ? 'Directed' : 'Undirected'}</button>
            <button onClick={() => setWeighted(w => !w)}
              className="px-2 py-1 rounded text-xs font-mono transition-colors"
              style={{ background: weighted ? '#1e3a5f' : '#1e293b', color: weighted ? '#60a5fa' : '#64748b', border: '1px solid #334155' }}
            >{weighted ? 'Weighted' : 'Unweighted'}</button>
            <button onClick={handleAddNode}
              className="px-2 py-1 rounded text-xs font-mono"
              style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
            >+ Node</button>
            <button onClick={() => setShowCPModal(true)}
              className="px-2 py-1 rounded text-xs font-mono font-medium"
              style={{ background: '#4f46e5', color: 'white' }}
            >Custom Input</button>
          </>
        )}
        {viewMode === 'grid' && (
          <>
            <button onClick={() => setPaintMode(m => m === 'wall' ? 'erase' : 'wall')}
              className="px-2 py-1 rounded text-xs font-mono"
              style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
            >{paintMode === 'wall' ? '🧱 Wall' : '⬜ Erase'}</button>
            <button onClick={clearGrid}
              className="px-2 py-1 rounded text-xs font-mono"
              style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
            >Clear</button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!useGrid ? (
            // Graph SVG canvas
            <div className="flex-1 w-full overflow-hidden" style={{ background: '#020617' }}>
              <ZoomableContainer>
                <svg
                  ref={svgRef}
                  className="min-w-[2000px] min-h-[2000px]"
                style={{ background: '#020617', cursor: draggingId ? 'grabbing' : 'default' }}
                onMouseMove={handleSvgMouseMove}
                onMouseUp={handleSvgMouseUp}
                aria-label="Graph canvas"
              >
              {/* Edge arrows */}
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 8 3.5, 0 7" fill="#334155" />
                </marker>
                <marker id="arrowhead-path" markerWidth="8" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 8 3.5, 0 7" fill="#10b981" />
                </marker>
                <marker id="arrowhead-highlight" markerWidth="8" markerHeight="7" refX="8" refY="3.5" orient="auto">
                  <polygon points="0 0, 8 3.5, 0 7" fill="#f59e0b" />
                </marker>
              </defs>

              {edges.map((e, i) => {
                const from = nodes.find(n => n.id === e.from);
                const to = nodes.find(n => n.id === e.to);
                if (!from || !to) return null;
                const isPath = currentGraphStep?.pathEdges?.some(
                  ([f, t]) => (f === e.from && t === e.to) || (!directed && f === e.to && t === e.from)
                );
                const isHighlight = currentGraphStep?.highlightEdges?.some(
                  ([f, t]) => (f === e.from && t === e.to) || (f === e.to && t === e.from)
                );
                const color = isPath ? '#10b981' : isHighlight ? '#f59e0b' : '#334155';
                const dx = to.x - from.x, dy = to.y - from.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const ex = to.x - (dx / len) * 20, ey = to.y - (dy / len) * 20;

                return (
                  <g 
                    key={i}
                    onDoubleClick={(ev) => {
                      if (!weighted) return;
                      ev.stopPropagation();
                      const newWeight = window.prompt(`Enter new weight for edge ${from.label} -> ${to.label}:`, String(e.weight ?? 1));
                      if (newWeight !== null && newWeight.trim() !== '') {
                        const val = parseFloat(newWeight);
                        if (!isNaN(val)) {
                          setEdges(es => es.map((edge, idx) => idx === i ? { ...edge, weight: val } : edge));
                        }
                      }
                    }}
                    style={{ cursor: weighted ? 'pointer' : 'default' }}
                  >
                    {/* Transparent thicker line for easier clicking */}
                    <line
                      x1={from.x} y1={from.y} x2={ex} y2={ey}
                      stroke="transparent" strokeWidth={15}
                    />
                    <line
                      x1={from.x} y1={from.y} x2={ex} y2={ey}
                      stroke={color} strokeWidth={isPath || isHighlight ? 2.5 : 1}
                      markerEnd={directed ? `url(#arrowhead${isPath ? '-path' : isHighlight ? '-highlight' : ''})` : undefined}
                    />
                    {weighted && e.weight !== undefined && (
                      <text
                        x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                        fill="#64748b" fontSize="11" fontFamily="JetBrains Mono, monospace" textAnchor="middle"
                      >
                        {e.weight}
                      </text>
                    )}
                  </g>
                );
              })}

              {nodes.map(node => {
                const isActive = currentGraphStep?.activeNode === node.id;
                const isVisited = currentGraphStep?.visitedNodes.includes(node.id);
                const isFrontier = currentGraphStep?.frontier.includes(node.id);
                const isStart = node.id === startNode;
                const color = isActive ? NODE_COLORS.active
                  : isFrontier ? NODE_COLORS.frontier
                  : isVisited ? NODE_COLORS.visited
                  : isStart ? '#312e81'
                  : NODE_COLORS.default;
                const textColor = isActive ? 'white' : isVisited ? '#60a5fa' : '#94a3b8';

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x},${node.y})`}
                    style={{ cursor: 'grab' }}
                    onMouseDown={e => handleNodeMouseDown(e, node.id)}
                    onClick={() => !draggingId && setStartNode(node.id)}
                    onDoubleClick={e => handleNodeDoubleClick(e, node.id)}
                  >
                    <circle
                      r={18}
                      fill={color}
                      stroke={isStart ? '#6366f1' : isActive ? '#6366f1' : '#334155'}
                      strokeWidth={isStart || isActive ? 2 : 1}
                    />
                    <text
                      fill={textColor} fontSize="12" fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle" dominantBaseline="middle" style={{ userSelect: 'none' }}
                    >
                      {node.label}
                    </text>
                    {currentGraphStep?.distances?.[node.id] !== undefined &&
                     currentGraphStep.distances[node.id] < Infinity && (
                      <text
                        y={26} fill="#6366f1" fontSize="9"
                        fontFamily="JetBrains Mono, monospace" textAnchor="middle"
                      >
                        {currentGraphStep.distances[node.id]}
                      </text>
                    )}
                  </g>
                );
              })}
                </svg>
              </ZoomableContainer>
            </div>
          ) : (
            // Grid canvas
            <div
              className="flex-1 flex items-center justify-center overflow-auto"
              style={{ background: '#020617' }}
            >
              <div
                className="inline-grid gap-px"
                style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 22px)` }}
                onMouseLeave={() => setIsPainting(false)}
              >
                {(currentGridStep?.grid ?? (() => {
                  const g = emptyGrid();
                  grid.forEach((row, r) => row.forEach((cell, c) => { g[r][c] = cell; }));
                  g[gridStart[0]][gridStart[1]] = 'start';
                  g[gridEnd[0]][gridEnd[1]] = 'end';
                  return g;
                })()).map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      style={{
                        width: 22, height: 22,
                        background: GRID_COLORS[cell],
                        border: '1px solid #0a0f1e',
                        cursor: 'pointer',
                        transition: 'background 80ms',
                      }}
                      onMouseDown={() => { setIsPainting(true); paintCell(r, c); }}
                      onMouseEnter={() => { if (isPainting) paintCell(r, c); }}
                      onMouseUp={() => setIsPainting(false)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Graph hint */}
          {!useGrid && (
            <div
              className="px-4 py-1.5 flex gap-4 flex-wrap"
              style={{ borderTop: '1px solid #1e293b', background: '#020617' }}
            >
              <span className="text-xs text-slate-600 font-mono">Click node to set start · Drag to move · Shift+click two nodes to add edge · Dbl-click node/edge to delete/edit</span>
              {['default', 'visited', 'active', 'frontier', 'path'].map(s => (
                <div key={s} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: NODE_COLORS[s as keyof typeof NODE_COLORS] }} />
                  <span className="text-xs text-slate-600 font-mono capitalize">{s}</span>
                </div>
              ))}
            </div>
          )}

          <ControlPanel
            state={state}
            controls={controls}
            onRandomize={!useGrid ? randomize : clearGrid}
          />
        </div>

        {/* Right panel */}
        <div
          className="w-64 flex flex-col gap-3 p-3 overflow-y-auto border-l"
          style={{ background: '#0a0f1e', borderColor: '#1e293b' }}
        >
          <StepDescription
            description={description}
            stepIndex={state.currentStep}
            totalSteps={steps.length}
          />
          {!useGrid && currentGraphStep?.distances && (
            <div className="rounded p-2 text-xs font-mono" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
              <p className="text-slate-500 mb-1 uppercase tracking-widest text-xs">Distances</p>
              {Object.entries(currentGraphStep.distances).filter(([,v]) => v < Infinity).map(([id, d]) => {
                const n = nodes.find(n => n.id === id);
                return <div key={id} className="flex justify-between text-slate-400"><span>{n?.label ?? id}</span><span style={{ color: '#6366f1' }}>{d}</span></div>;
              })}
            </div>
          )}
          <CodePanel lines={pseudocode} activeLine={currentGraphStep?.pseudocodeLine ?? currentGridStep?.pseudocodeLine ?? 0} title={`${meta.name} Pseudocode`} />
        </div>
      </div>

      <CPInputModal
        isOpen={showCPModal}
        onClose={() => setShowCPModal(false)}
        onSubmit={handleCPInput}
      />
    </div>
  );
};
