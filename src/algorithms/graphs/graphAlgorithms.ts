import type { GraphStep, GraphNode, GraphEdge } from '../../types/step';

type AdjList = Record<string, { to: string; weight: number }[]>;

function buildAdjList(nodes: GraphNode[], edges: GraphEdge[], directed: boolean): AdjList {
  const adj: AdjList = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => {
    adj[e.from].push({ to: e.to, weight: e.weight ?? 1 });
    if (!directed) adj[e.to].push({ to: e.from, weight: e.weight ?? 1 });
  });
  return adj;
}

// ── BFS ──────────────────────────────────────────────────────────────────────
export function bfs(nodes: GraphNode[], edges: GraphEdge[], startId: string, directed = false): GraphStep[] {
  const steps: GraphStep[] = [];
  const adj = buildAdjList(nodes, edges, directed);
  const visited: string[] = [];
  const frontier: string[] = [startId];
  const pathEdges: [string, string][] = [];

  steps.push({
    type: 'info', description: `BFS from node ${startId}. Using a queue (FIFO) to explore layer by layer.`,
    pseudocodeLine: 0, visitedNodes: [], frontier: [startId], pathEdges: [],
  });

  const queue: string[] = [startId];
  const seen = new Set<string>([startId]);

  while (queue.length) {
    const node = queue.shift()!;
    visited.push(node);

    steps.push({
      type: 'visit',
      description: `Visiting node ${node}. Exploring its neighbors.`,
      pseudocodeLine: 2,
      visitedNodes: [...visited],
      activeNode: node,
      frontier: [...queue],
      pathEdges: [...pathEdges],
    });

    for (const { to } of adj[node]) {
      if (!seen.has(to)) {
        seen.add(to);
        queue.push(to);
        pathEdges.push([node, to]);
        steps.push({
          type: 'enqueue',
          description: `Discovered neighbor ${to} from ${node}. Adding to queue.`,
          pseudocodeLine: 4,
          visitedNodes: [...visited],
          activeNode: to,
          frontier: [...queue],
          pathEdges: [...pathEdges],
        });
      }
    }
  }

  steps.push({
    type: 'info', description: 'BFS complete. All reachable nodes have been visited.',
    pseudocodeLine: 6, visitedNodes: [...visited], frontier: [], pathEdges: [...pathEdges],
  });
  return steps;
}

export const bfsPseudocode = [
  'BFS(graph, start):',
  '  queue = [start]; visited = {start}',
  '  while queue not empty:',
  '    node = queue.dequeue()',
  '    for neighbor in adj[node]:',
  '      if not visited: queue.enqueue(neighbor)',
  '  return visited',
];

// ── DFS ──────────────────────────────────────────────────────────────────────
export function dfs(nodes: GraphNode[], edges: GraphEdge[], startId: string, directed = false): GraphStep[] {
  const steps: GraphStep[] = [];
  const adj = buildAdjList(nodes, edges, directed);
  const visited: string[] = [];
  const pathEdges: [string, string][] = [];
  const seen = new Set<string>();

  steps.push({
    type: 'info', description: `DFS from node ${startId}. Using a stack (LIFO) to explore depth-first.`,
    pseudocodeLine: 0, visitedNodes: [], frontier: [], pathEdges: [],
  });

  function dfsHelper(node: string): void {
    seen.add(node);
    visited.push(node);
    steps.push({
      type: 'visit',
      description: `Visiting node ${node} (depth-first).`,
      pseudocodeLine: 2,
      visitedNodes: [...visited],
      activeNode: node,
      frontier: [],
      pathEdges: [...pathEdges],
    });

    for (const { to } of adj[node]) {
      if (!seen.has(to)) {
        pathEdges.push([node, to]);
        steps.push({
          type: 'enqueue',
          description: `Recursing into neighbor ${to} from ${node}.`,
          pseudocodeLine: 3,
          visitedNodes: [...visited],
          activeNode: to,
          frontier: [],
          pathEdges: [...pathEdges],
        });
        dfsHelper(to);
      }
    }
  }

  dfsHelper(startId);

  steps.push({
    type: 'info', description: 'DFS complete.',
    pseudocodeLine: 5, visitedNodes: [...visited], frontier: [], pathEdges: [...pathEdges],
  });
  return steps;
}

export const dfsPseudocode = [
  'DFS(graph, start):',
  '  visited = {}',
  '  dfsHelper(start):',
  '    for neighbor in adj[node]:',
  '      if not visited: dfsHelper(neighbor)',
  '  return visited',
];

// ── Dijkstra ──────────────────────────────────────────────────────────────────
export function dijkstra(nodes: GraphNode[], edges: GraphEdge[], startId: string, directed = false): GraphStep[] {
  const steps: GraphStep[] = [];
  const adj = buildAdjList(nodes, edges, directed);
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited: string[] = [];

  nodes.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null; });
  dist[startId] = 0;

  const unvisited = new Set(nodes.map(n => n.id));
  const pathEdges: [string, string][] = [];

  steps.push({
    type: 'info', description: `Dijkstra from ${startId}. Initialize all distances to ∞, source to 0.`,
    pseudocodeLine: 0, visitedNodes: [], frontier: [], distances: { ...dist },
  });

  while (unvisited.size) {
    // Find min-dist unvisited
    let u: string | null = null;
    for (const id of unvisited) {
      if (u === null || dist[id] < dist[u]) u = id;
    }
    if (u === null || dist[u] === Infinity) break;

    unvisited.delete(u);
    visited.push(u);

    steps.push({
      type: 'visit',
      description: `Visiting node ${u} with current distance ${dist[u]}.`,
      pseudocodeLine: 3,
      visitedNodes: [...visited],
      activeNode: u,
      frontier: [...unvisited].filter(id => dist[id] < Infinity),
      pathEdges: [...pathEdges],
      distances: { ...dist },
    });

    for (const { to, weight } of adj[u]) {
      if (!unvisited.has(to)) continue;
      const newDist = dist[u] + weight;
      if (newDist < dist[to]) {
        dist[to] = newDist;
        prev[to] = u;
        pathEdges.push([u, to]);
        steps.push({
          type: 'relax',
          description: `Relaxed edge ${u}→${to}: distance updated to ${newDist}`,
          pseudocodeLine: 5,
          visitedNodes: [...visited],
          activeNode: to,
          frontier: [...unvisited].filter(id => dist[id] < Infinity),
          pathEdges: [...pathEdges],
          distances: { ...dist },
        });
      }
    }
  }

  steps.push({
    type: 'info', description: 'Dijkstra complete. Shortest distances computed.',
    pseudocodeLine: 7, visitedNodes: [...visited], frontier: [], pathEdges: [...pathEdges], distances: { ...dist },
  });
  return steps;
}

export const dijkstraPseudocode = [
  'dijkstra(graph, start):',
  '  dist[start]=0; dist[*]=∞',
  '  while unvisited not empty:',
  '    u = min-dist unvisited node',
  '    mark u visited',
  '    for neighbor v of u:',
  '      if dist[u]+w(u,v) < dist[v]: relax',
  '  return dist',
];

// ── Topological Sort ──────────────────────────────────────────────────────────
export function topologicalSort(nodes: GraphNode[], edges: GraphEdge[]): GraphStep[] {
  const steps: GraphStep[] = [];
  const adj: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};

  nodes.forEach(n => { adj[n.id] = []; inDegree[n.id] = 0; });
  edges.forEach(e => {
    adj[e.from].push(e.to);
    inDegree[e.to] = (inDegree[e.to] ?? 0) + 1;
  });

  const queue = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
  const result: string[] = [];
  const visited: string[] = [];

  steps.push({
    type: 'info', description: `Topological Sort (Kahn's). Start with nodes of in-degree 0: [${queue.join(', ')}]`,
    pseudocodeLine: 0, visitedNodes: [], frontier: [...queue], pathEdges: [],
  });

  while (queue.length) {
    const node = queue.shift()!;
    result.push(node);
    visited.push(node);

    steps.push({
      type: 'visit',
      description: `Processing ${node}. Topo order so far: [${result.join('→')}]`,
      pseudocodeLine: 3,
      visitedNodes: [...visited],
      activeNode: node,
      frontier: [...queue],
      pathEdges: [],
    });

    for (const neighbor of adj[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
        steps.push({
          type: 'enqueue',
          description: `Reduced in-degree of ${neighbor} to 0 — adding to queue.`,
          pseudocodeLine: 5,
          visitedNodes: [...visited],
          activeNode: neighbor,
          frontier: [...queue],
          pathEdges: [],
        });
      }
    }
  }

  const hasCycle = result.length !== nodes.length;
  steps.push({
    type: 'info',
    description: hasCycle
      ? '⚠ Cycle detected! Not all nodes were processed — topological sort impossible.'
      : `Topological order: [${result.join('→')}]`,
    pseudocodeLine: 7,
    visitedNodes: [...visited],
    frontier: [],
    pathEdges: [],
  });

  return steps;
}

export const topologicalSortPseudocode = [
  'topoSort(graph):',
  '  compute in-degrees for all nodes',
  '  queue = nodes with in-degree 0',
  '  while queue not empty:',
  '    node = queue.dequeue()',
  '    for neighbor: reduce in-degree',
  '    if in-degree==0: enqueue',
  '  if result.length != n: cycle!',
];

// ── Cycle Detection ────────────────────────────────────────────────────────────
export function cycleDetection(nodes: GraphNode[], edges: GraphEdge[], directed: boolean): GraphStep[] {
  const steps: GraphStep[] = [];
  const adj: Record<string, string[]> = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => {
    adj[e.from].push(e.to);
    if (!directed) adj[e.to].push(e.from);
  });

  const visited: string[] = [];
  const inStack = new Set<string>();
  const parentMap: Record<string, string> = {};
  let cycleFound = false;

  steps.push({
    type: 'info', description: `Cycle Detection using DFS${directed ? ' (directed — track recursion stack)' : ' (undirected — track parent)'}`,
    pseudocodeLine: 0, visitedNodes: [], frontier: [], pathEdges: [],
  });

  function dfsCheck(node: string, parent: string | null): boolean {
    visited.push(node);
    inStack.add(node);
    if (parent !== null) parentMap[node] = parent;

    steps.push({
      type: 'visit', description: `Visiting ${node}${directed ? ` (in recursion stack)` : ''}`,
      pseudocodeLine: 2, visitedNodes: [...visited], activeNode: node, frontier: [], pathEdges: [],
    });

    for (const neighbor of adj[node]) {
      if (!visited.includes(neighbor)) {
        if (dfsCheck(neighbor, node)) return true;
      } else if (directed ? inStack.has(neighbor) : neighbor !== parent) {
        cycleFound = true;
        
        // Trace back the cycle using parentMap
        const cycleEdges: [string, string][] = [[node, neighbor]];
        let curr = node;
        while (curr !== neighbor && parentMap[curr] !== undefined) {
          cycleEdges.push([parentMap[curr], curr]);
          curr = parentMap[curr];
        }

        steps.push({
          type: 'info', description: `🔴 Back edge found: ${node}→${neighbor}. CYCLE DETECTED!`,
          pseudocodeLine: 5, visitedNodes: [...visited], activeNode: neighbor, frontier: [], pathEdges: [],
          highlightEdges: cycleEdges,
        });
        return true;
      }
    }

    inStack.delete(node);
    return false;
  }

  for (const node of nodes) {
    if (!visited.includes(node.id)) {
      dfsCheck(node.id, null);
      if (cycleFound) break;
    }
  }

  if (!cycleFound) {
    steps.push({
      type: 'info', description: '✅ No cycle detected. The graph is acyclic.',
      pseudocodeLine: 7, visitedNodes: [...visited], frontier: [], pathEdges: [],
    });
  }

  return steps;
}

export const cycleDetectionPseudocode = [
  'detectCycle(graph):',
  '  visited = {}; inStack = {}',
  '  for each node: dfs(node)',
  'dfs(node, parent):',
  '  visited.add(node); inStack.add(node)',
  '  for neighbor in adj[node]:',
  '    if inStack[neighbor]: CYCLE!',
  '  inStack.remove(node)',
];

// ── Kruskal MST ────────────────────────────────────────────────────────────────
export function kruskalMST(nodes: GraphNode[], edges: GraphEdge[]): GraphStep[] {
  const steps: GraphStep[] = [];

  const parent: Record<string, string> = {};
  const rank: Record<string, number> = {};
  nodes.forEach(n => { parent[n.id] = n.id; rank[n.id] = 0; });

  function find(x: string): string {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x: string, y: string): boolean {
    const px = find(x), py = find(y);
    if (px === py) return false;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
    return true;
  }

  const sorted = [...edges].sort((a, b) => (a.weight ?? 1) - (b.weight ?? 1));
  const mstEdges: [string, string][] = [];
  const visited: string[] = [];

  steps.push({
    type: 'info', description: `Kruskal MST. Sort all edges by weight: [${sorted.map(e => `${e.from}-${e.to}(${e.weight ?? 1})`).join(', ')}]`,
    pseudocodeLine: 0, visitedNodes: [], frontier: [], pathEdges: [],
  });

  for (const edge of sorted) {
    steps.push({
      type: 'compare', description: `Considering edge ${edge.from}-${edge.to} (weight ${edge.weight ?? 1})`,
      pseudocodeLine: 3, visitedNodes: [...visited], activeNode: edge.from, frontier: [], pathEdges: [...mstEdges],
      highlightEdges: [[edge.from, edge.to]],
    });

    if (union(edge.from, edge.to)) {
      mstEdges.push([edge.from, edge.to]);
      if (!visited.includes(edge.from)) visited.push(edge.from);
      if (!visited.includes(edge.to)) visited.push(edge.to);
      steps.push({
        type: 'mark-path', description: `Added edge ${edge.from}-${edge.to} to MST (no cycle formed).`,
        pseudocodeLine: 5, visitedNodes: [...visited], activeNode: edge.to, frontier: [], pathEdges: [...mstEdges],
      });
    } else {
      steps.push({
        type: 'info', description: `Skipped edge ${edge.from}-${edge.to} — would form a cycle.`,
        pseudocodeLine: 6, visitedNodes: [...visited], frontier: [], pathEdges: [...mstEdges],
      });
    }
  }

  const totalWeight = mstEdges.reduce((sum, [f, t]) => {
    const e = edges.find(e => (e.from === f && e.to === t) || (e.from === t && e.to === f));
    return sum + (e?.weight ?? 1);
  }, 0);

  steps.push({
    type: 'info', description: `MST complete! ${mstEdges.length} edges, total weight = ${totalWeight}`,
    pseudocodeLine: 7, visitedNodes: [...visited], frontier: [], pathEdges: [...mstEdges],
  });

  return steps;
}

export const kruskalPseudocode = [
  'kruskal(graph):',
  '  sort edges by weight',
  '  init Union-Find',
  '  for each edge (u,v,w):',
  '    if find(u) != find(v):',
  '      add to MST; union(u,v)',
  '    else: skip (cycle)',
  '  return MST',
];
