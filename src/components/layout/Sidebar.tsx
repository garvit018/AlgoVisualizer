import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  subItems?: { path: string; label: string }[];
}

const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 4h4M2 8h8M2 12h12" strokeLinecap="round"/>
  </svg>
);

const GraphIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="3" cy="3" r="2"/>
    <circle cx="13" cy="3" r="2"/>
    <circle cx="8" cy="13" r="2"/>
    <path d="M5 3h6M4.5 4.5l2.5 7M11.5 4.5L9 11.5"/>
  </svg>
);

const TreeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="2" r="1.5"/>
    <circle cx="4" cy="9" r="1.5"/>
    <circle cx="12" cy="9" r="1.5"/>
    <circle cx="2" cy="14" r="1.5"/>
    <circle cx="6" cy="14" r="1.5"/>
    <path d="M8 3.5v4M8 7.5L4 7.5M8 7.5L12 7.5M4 10.5v2M4 12.5L2 12.5M4 12.5L6 12.5"/>
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="5" width="4" height="6" rx="1"/>
    <rect x="6" y="5" width="4" height="6" rx="1"/>
    <rect x="11" y="5" width="4" height="6" rx="1"/>
    <path d="M5 8h1M10 8h1" strokeLinecap="round"/>
  </svg>
);

const StackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="10" width="12" height="3" rx="1"/>
    <rect x="2" y="6.5" width="12" height="3" rx="1"/>
    <rect x="2" y="3" width="12" height="3" rx="1"/>
    <path d="M8 1v1.5" strokeLinecap="round"/>
    <path d="M7 1.5l1-1.5 1 1.5" strokeLinejoin="round"/>
  </svg>
);

const navItems: NavItem[] = [
  {
    path: '/sorting',
    label: 'Sorting',
    icon: <SortIcon />,
    subItems: [
      { path: '/sorting?algo=bubble', label: 'Bubble Sort' },
      { path: '/sorting?algo=selection', label: 'Selection Sort' },
      { path: '/sorting?algo=insertion', label: 'Insertion Sort' },
      { path: '/sorting?algo=merge', label: 'Merge Sort' },
      { path: '/sorting?algo=quick', label: 'Quick Sort' },
      { path: '/sorting?algo=heap', label: 'Heap Sort' },
    ],
  },
  {
    path: '/graphs',
    label: 'Graphs',
    icon: <GraphIcon />,
    subItems: [
      { path: '/graphs?algo=bfs', label: 'BFS' },
      { path: '/graphs?algo=dfs', label: 'DFS' },
      { path: '/graphs?algo=dijkstra', label: "Dijkstra's" },
      { path: '/graphs?algo=astar', label: 'A* Search' },
      { path: '/graphs?algo=topo', label: 'Topological Sort' },
      { path: '/graphs?algo=kruskal', label: "Kruskal's MST" },
      { path: '/graphs?algo=cycle', label: 'Cycle Detection' },
    ],
  },
  {
    path: '/trees',
    label: 'Trees',
    icon: <TreeIcon />,
    subItems: [
      { path: '/trees?algo=insert', label: 'BST Insert' },
      { path: '/trees?algo=search', label: 'BST Search' },
      { path: '/trees?algo=inorder', label: 'In-order' },
      { path: '/trees?algo=preorder', label: 'Pre-order' },
      { path: '/trees?algo=postorder', label: 'Post-order' },
      { path: '/trees?algo=levelorder', label: 'Level-order' },
    ],
  },
  {
    path: '/linked-list',
    label: 'Linked List',
    icon: <ListIcon />,
    subItems: [
      { path: '/linked-list?algo=insert', label: 'Insert' },
      { path: '/linked-list?algo=reverse', label: 'Reverse' },
      { path: '/linked-list?algo=cycle', label: "Floyd's Cycle" },
    ],
  },
  {
    path: '/monotonic-stack',
    label: 'Monotonic Stack',
    icon: <StackIcon />,
    subItems: [
      { path: '/monotonic-stack?algo=next-greater', label: 'Next Greater Element' },
      { path: '/monotonic-stack?algo=next-smaller', label: 'Next Smaller Element' },
      { path: '/monotonic-stack?algo=daily-temps', label: 'Daily Temperatures' },
      { path: '/monotonic-stack?algo=histogram', label: 'Largest Rectangle' },
      { path: '/monotonic-stack?algo=rain-water', label: 'Trapping Rain Water' },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  return (
    <aside
      className={`
        fixed left-0 top-12 bottom-0 z-40
        w-56 border-r border-slate-800 dark:border-slate-800
        bg-slate-950 dark:bg-slate-950
        flex flex-col overflow-y-auto
        transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      style={{ background: 'var(--sidebar-bg, #020617)', borderColor: '#1e293b' }}
    >
      <div className="px-3 py-4 flex-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3 px-2">
          Algorithms
        </p>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
            return (
              <div key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive: active }) => `
                    flex items-center gap-2.5 px-2 py-1.5 rounded text-sm font-medium
                    transition-colors duration-100
                    ${active
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }
                  `}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {item.label}
                </NavLink>
                {isActive && item.subItems && (
                  <div className="mt-0.5 ml-4 space-y-0.5">
                    {item.subItems.map((sub) => {
                      const subActive = location.pathname + location.search === sub.path ||
                        (location.pathname === item.path && location.search === `?algo=${sub.path.split('?algo=')[1]}`);
                      return (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={`
                            block px-2 py-1 rounded text-xs font-mono transition-colors
                            ${subActive
                              ? 'text-indigo-400 bg-indigo-600/10'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                            }
                          `}
                        >
                          {sub.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-600 font-mono">
        v1.0 · AlgoVisualizer
      </div>
    </aside>
  );
};
