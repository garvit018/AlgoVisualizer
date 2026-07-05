import type { GridStep, GridCellState } from '../../types/step';

type Grid = GridCellState[][];
type Coord = [number, number];

function cloneGrid(g: Grid): Grid {
  return g.map(row => [...row]);
}

function key(r: number, c: number): string {
  return `${r},${c}`;
}

const DIRS: Coord[] = [[-1,0],[1,0],[0,-1],[0,1]];

// ── BFS Grid ──────────────────────────────────────────────────────────────────
export function gridBFS(grid: Grid, start: Coord, end: Coord): GridStep[] {
  const steps: GridStep[] = [];
  const rows = grid.length, cols = grid[0].length;
  const g = cloneGrid(grid);
  const prev: Record<string, Coord | null> = {};
  const visited = new Set<string>();
  const queue: Coord[] = [start];
  visited.add(key(...start));
  prev[key(...start)] = null;

  steps.push({ type: 'info', description: 'BFS: Exploring cells layer by layer using a queue.', pseudocodeLine: 0, grid: cloneGrid(g), activeCell: start });

  while (queue.length) {
    const [r, c] = queue.shift()!;

    if (r === end[0] && c === end[1]) {
      // Trace path
      let cur: Coord | null = end;
      while (cur) {
        const pr: number = cur[0];
        const pc: number = cur[1];
        if (g[pr][pc] !== 'start' && g[pr][pc] !== 'end') g[pr][pc] = 'path';
        cur = prev[key(pr, pc)] ?? null;
      }
      steps.push({ type: 'mark-path', description: 'Reached the end! Tracing shortest path.', pseudocodeLine: 5, grid: cloneGrid(g) });
      return steps;
    }

    if (g[r][c] !== 'start') g[r][c] = 'visited';
    steps.push({ type: 'visit', description: `Visiting cell (${r},${c}).`, pseudocodeLine: 2, grid: cloneGrid(g), activeCell: [r, c] });

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited.has(key(nr, nc)) || g[nr][nc] === 'wall') continue;
      visited.add(key(nr, nc));
      prev[key(nr, nc)] = [r, c];
      queue.push([nr, nc]);
      if (g[nr][nc] !== 'end') g[nr][nc] = 'frontier';
      steps.push({ type: 'enqueue', description: `Adding (${nr},${nc}) to frontier.`, pseudocodeLine: 3, grid: cloneGrid(g), activeCell: [nr, nc] });
    }
  }

  steps.push({ type: 'info', description: 'No path found to destination.', pseudocodeLine: 6, grid: cloneGrid(g) });
  return steps;
}

// ── A* Grid ───────────────────────────────────────────────────────────────────
function heuristic(a: Coord, b: Coord): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

export function gridAStar(grid: Grid, start: Coord, end: Coord): GridStep[] {
  const steps: GridStep[] = [];
  const rows = grid.length, cols = grid[0].length;
  const g = cloneGrid(grid);

  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const prev: Record<string, Coord | null> = {};
  const open = new Set<string>();
  const closed = new Set<string>();

  const sk = key(...start);
  gScore[sk] = 0;
  fScore[sk] = heuristic(start, end);
  open.add(sk);
  prev[sk] = null;

  steps.push({ type: 'info', description: 'A*: Using heuristic (Manhattan distance) to guide search toward the goal.', pseudocodeLine: 0, grid: cloneGrid(g) });

  while (open.size) {
    // Pick lowest fScore
    let current: string | null = null;
    for (const k of open) {
      if (current === null || (fScore[k] ?? Infinity) < (fScore[current] ?? Infinity)) current = k;
    }
    if (!current) break;

    const [r, c] = current.split(',').map(Number) as [number, number];

    if (r === end[0] && c === end[1]) {
      let cur: Coord | null = [r, c];
      while (cur) {
        const pr: number = cur[0];
        const pc: number = cur[1];
        if (g[pr][pc] !== 'start' && g[pr][pc] !== 'end') g[pr][pc] = 'path';
        cur = prev[key(pr, pc)] ?? null;
      }
      steps.push({ type: 'mark-path', description: `A* found optimal path! Length: ${gScore[current]}`, pseudocodeLine: 6, grid: cloneGrid(g) });
      return steps;
    }

    open.delete(current);
    closed.add(current);
    if (g[r][c] !== 'start') g[r][c] = 'visited';

    steps.push({
      type: 'visit',
      description: `Processing (${r},${c}) — g=${gScore[current] ?? 0}, f=${fScore[current]?.toFixed(1) ?? 0}`,
      pseudocodeLine: 3,
      grid: cloneGrid(g),
      activeCell: [r, c],
      distances: { ...gScore },
    });

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const nk = key(nr, nc);
      if (closed.has(nk) || g[nr][nc] === 'wall') continue;

      const tentativeG = (gScore[current] ?? 0) + 1;
      if (tentativeG < (gScore[nk] ?? Infinity)) {
        prev[nk] = [r, c];
        gScore[nk] = tentativeG;
        fScore[nk] = tentativeG + heuristic([nr, nc], end);
        open.add(nk);
        if (g[nr][nc] !== 'end') g[nr][nc] = 'frontier';
        steps.push({
          type: 'enqueue',
          description: `Updated (${nr},${nc}): g=${tentativeG}, h=${heuristic([nr, nc], end)}, f=${fScore[nk].toFixed(1)}`,
          pseudocodeLine: 5,
          grid: cloneGrid(g),
          activeCell: [nr, nc],
          distances: { ...gScore },
        });
      }
    }
  }

  steps.push({ type: 'info', description: 'No path found!', pseudocodeLine: 8, grid: cloneGrid(g) });
  return steps;
}

export const gridBFSPseudocode = [
  'BFS(grid, start, end):',
  '  queue = [start]',
  '  while queue not empty:',
  '    cell = queue.dequeue()',
  '    for neighbor: if not wall/visited:',
  '      enqueue; track parent',
  '  trace path from end to start',
];

export const gridAStarPseudocode = [
  'A*(grid, start, end):',
  '  open = {start}; g[start] = 0',
  '  f[start] = h(start, end)',
  '  while open not empty:',
  '    u = lowest f in open',
  '    for neighbor: relax g, f',
  '    if u == end: trace path',
  '  return path or no-path',
];
