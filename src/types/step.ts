// Shared element state type used across all visualizers
export type ElementState =
  | 'default'
  | 'comparing'
  | 'active'
  | 'sorted'
  | 'pivot'
  | 'pointer'
  | 'visited'
  | 'frontier'
  | 'path'
  | 'wall'
  | 'start'
  | 'end'
  | 'push'
  | 'pop'
  | 'processing';

export interface Highlight {
  index: number;
  state: ElementState;
}

// Base step all categories extend
export interface BaseStep {
  description: string;
  pseudocodeLine: number;
}

// ── Sorting ──────────────────────────────────────────────────────────────────
export type SortStepType = 'compare' | 'swap' | 'mark-sorted' | 'set-pivot' | 'overwrite' | 'merge' | 'info';

export interface SortStep extends BaseStep {
  type: SortStepType;
  array: number[];
  highlights: Highlight[];
  comparisons: number;
  swaps: number;
}

// ── Graph ─────────────────────────────────────────────────────────────────────
export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
}

export type GraphStepType =
  | 'visit'
  | 'enqueue'
  | 'dequeue'
  | 'relax'
  | 'mark-path'
  | 'mark-visited'
  | 'set-active'
  | 'info';

export interface GraphStep extends BaseStep {
  type: GraphStepType;
  visitedNodes: string[];
  activeNode?: string;
  frontier: string[];
  pathEdges?: [string, string][];
  distances?: Record<string, number>;
  highlightEdges?: [string, string][];
}

// Grid-based pathfinding
export type GridCellState = 'empty' | 'wall' | 'start' | 'end' | 'visited' | 'frontier' | 'path';

export interface GridStep extends BaseStep {
  type: 'visit' | 'enqueue' | 'mark-path' | 'info';
  grid: GridCellState[][];
  activeCell?: [number, number];
  distances?: Record<string, number>;
}

// ── Tree ──────────────────────────────────────────────────────────────────────
export interface TreeNode {
  id: string;
  value: number;
  left?: TreeNode;
  right?: TreeNode;
  height?: number; // for AVL
  state?: ElementState;
}

export type TreeStepType = 'visit' | 'compare' | 'insert' | 'delete' | 'traverse' | 'mark-found' | 'info';

export interface TreeStep extends BaseStep {
  type: TreeStepType;
  tree: TreeNode | null;
  highlightedNodeIds: string[];
  traversalOrder: number[];
  activeNodeId?: string;
}

// ── Linked List ────────────────────────────────────────────────────────────────
export interface ListNode {
  id: string;
  value: number;
  nextId?: string;
  prevId?: string; // doubly linked
  state?: ElementState;
}

export type ListStepType =
  | 'set-pointer'
  | 'compare'
  | 'insert'
  | 'delete'
  | 'reassign-next'
  | 'reassign-prev'
  | 'mark-found'
  | 'slow-fast'
  | 'info';

export interface ListStep extends BaseStep {
  type: ListStepType;
  nodes: ListNode[];
  headId?: string;
  tailId?: string;
  highlightedIds: string[];
  pointers?: Record<string, string>; // e.g. { slow: 'n1', fast: 'n3' }
}

// ── Monotonic Stack ────────────────────────────────────────────────────────────
export type StackStepType = 'push' | 'pop' | 'compare' | 'set-result' | 'info';

export interface StackStep extends BaseStep {
  type: StackStepType;
  array: number[];
  stack: number[]; // indices on stack
  result: (number | null)[];
  currentIndex: number;
  highlightIndices: number[];
  actionReason?: string;
}
