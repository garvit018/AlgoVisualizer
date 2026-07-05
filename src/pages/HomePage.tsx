import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  {
    path: '/sorting',
    title: 'Sorting',
    desc: 'Visualize 6 sorting algorithms — Bubble, Selection, Insertion, Merge, Quick, Heap. Watch comparisons and swaps in real time.',
    algos: ['Bubble Sort', 'Merge Sort', 'Quick Sort', 'Heap Sort'],
    icon: '▶▶',
    color: '#4f46e5',
  },
  {
    path: '/graphs',
    title: 'Graphs',
    desc: 'Build custom graphs, explore BFS/DFS, find shortest paths with Dijkstra & A*, detect cycles, and compute MSTs.',
    algos: ['BFS / DFS', "Dijkstra's", 'A* Search', 'Kruskal MST'],
    icon: '◉',
    color: '#0891b2',
  },
  {
    path: '/trees',
    title: 'Trees',
    desc: 'Insert into a BST, search nodes, and visualize all four traversal orders with animated step-by-step SVG rendering.',
    algos: ['BST Insert', 'In-order', 'Pre-order', 'Level-order'],
    icon: '⌥',
    color: '#059669',
  },
  {
    path: '/linked-list',
    title: 'Linked List',
    desc: "Reverse lists, insert at head/tail/index, and watch Floyd's slow-fast pointer cycle detection unfold step by step.",
    algos: ['Reverse', 'Insert', "Floyd's Cycle"],
    icon: '⇒',
    color: '#d97706',
  },
  {
    path: '/monotonic-stack',
    title: 'Monotonic Stack',
    desc: 'Tackle classic stack problems: Next Greater/Smaller Element, Daily Temperatures, Histogram, and Trapping Rain Water.',
    algos: ['Next Greater', 'Daily Temps', 'Histogram', 'Rain Water'],
    icon: '▤',
    color: '#7c3aed',
  },
];

export const HomePage: React.FC = () => {
  return (
    <div
      className="min-h-full px-6 py-12 max-w-4xl mx-auto"
      style={{ background: '#020617' }}
    >
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg text-lg font-bold"
            style={{ background: '#4f46e5', color: 'white', fontFamily: 'JetBrains Mono, monospace' }}
          >
            ∑
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 leading-none font-mono">
              AlgoVisualizer
            </h1>
            <p className="text-sm text-slate-500 font-mono mt-0.5">
              Step-through data structures & algorithms
            </p>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
          An interactive developer tool for visualizing algorithms one step at a time.
          Choose an algorithm, generate or enter custom input, then use the playback controls
          to step forward, backward, or play through the full execution.
        </p>

        <div
          className="mt-4 p-3 rounded-lg flex gap-6 flex-wrap"
          style={{ background: '#0f172a', border: '1px solid #1e293b' }}
        >
          {[
            ['Space', 'Play / Pause'],
            ['→', 'Step Forward'],
            ['←', 'Step Backward'],
            ['R', 'Reset'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <kbd
                className="px-1.5 py-0.5 rounded font-mono text-slate-300"
                style={{ background: '#1e293b', border: '1px solid #334155' }}
              >
                {key}
              </kbd>
              <span className="text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map(cat => (
          <Link
            key={cat.path}
            to={cat.path}
            className="block no-underline rounded-lg p-4 transition-colors group"
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${cat.color}55`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#1e293b';
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex items-center justify-center w-9 h-9 rounded shrink-0 text-base font-bold"
                style={{ background: `${cat.color}20`, color: cat.color, fontFamily: 'monospace' }}
              >
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-slate-200 font-mono mb-1 group-hover:text-white transition-colors">
                  {cat.title}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                  {cat.desc}
                </p>
                <div className="flex flex-wrap gap-1">
                  {cat.algos.map(a => (
                    <span
                      key={a}
                      className="px-1.5 py-0.5 rounded text-xs font-mono"
                      style={{ background: '#1e293b', color: '#64748b', border: '1px solid #334155' }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-slate-900">
        <p className="text-xs text-slate-700 font-mono text-center">
          All algorithms run in your browser · No server required · Step-by-step execution
        </p>
      </div>
    </div>
  );
};
