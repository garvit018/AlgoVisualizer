# DSA Visualizer

A production-quality, interactive **Data Structures & Algorithms Visualizer** built with React 18 + TypeScript + Vite + Tailwind CSS.

## 🗺️ Site Flow

```mermaid
flowchart TD
    A([🌐 User Opens AlgoVisualizer]) --> B[🏠 Home Page]

    B --> B1[Browse 5 Algorithm Categories]
    B1 --> C1[📊 Sorting\n/sorting]
    B1 --> C2[◉ Graphs\n/graphs]
    B1 --> C3[⌥ Trees\n/trees]
    B1 --> C4[⇒ Linked List\n/linked-list]
    B1 --> C5[▤ Monotonic Stack\n/monotonic-stack]

    %% ── Sorting ──
    C1 --> S1{Select Algorithm}
    S1 --> S1A[Bubble Sort]
    S1 --> S1B[Selection Sort]
    S1 --> S1C[Insertion Sort]
    S1 --> S1D[Merge Sort]
    S1 --> S1E[Quick Sort]
    S1 --> S1F[Heap Sort]

    %% ── Graphs ──
    C2 --> G0{Graph Mode?}
    G0 -->|Node Graph| G1{Select Algorithm}
    G0 -->|Grid Mode| G2[Draw Walls / Set Start & End]
    G1 --> G1A[BFS]
    G1 --> G1B[DFS]
    G1 --> G1C["Dijkstra's"]
    G1 --> G1D[Topological Sort]
    G1 --> G1E[Kruskal MST]
    G1 --> G1F[Cycle Detection]
    G2 --> G2A[BFS Pathfinding]
    G2 --> G2B[A* Pathfinding]

    %% ── Trees ──
    C3 --> T1{Select Algorithm}
    T1 --> T1A[BST Insert]
    T1 --> T1B[BST Search]
    T1 --> T1C[In-order Traversal]
    T1 --> T1D[Pre-order Traversal]
    T1 --> T1E[Post-order Traversal]
    T1 --> T1F[Level-order Traversal]

    %% ── Linked List ──
    C4 --> L1{Select Algorithm}
    L1 --> L1A[Reverse List]
    L1 --> L1B[Insert at Head]
    L1 --> L1C[Insert at Tail]
    L1 --> L1D[Insert at Index]
    L1 --> L1E["Floyd's Cycle Detection"]

    %% ── Monotonic Stack ──
    C5 --> M1{Select Algorithm}
    M1 --> M1A[Next Greater Element]
    M1 --> M1B[Next Smaller Element]
    M1 --> M1C[Daily Temperatures]
    M1 --> M1D[Largest Rectangle]
    M1 --> M1E[Trapping Rain Water]

    %% ── Shared Visualizer Flow ──
    S1A & S1B & S1C & S1D & S1E & S1F --> V[⚙️ Visualizer Engine]
    G1A & G1B & G1C & G1D & G1E & G1F --> V
    G2A & G2B --> V
    T1A & T1B & T1C & T1D & T1E & T1F --> V
    L1A & L1B & L1C & L1D & L1E --> V
    M1A & M1B & M1C & M1D & M1E --> V

    V --> I{Setup Input}
    I -->|Custom| I1[Enter comma-separated values]
    I -->|Random| I2[Adjust size slider and generate]

    I1 & I2 --> R[Run Algorithm - Generates step objects]

    R --> P{Playback Controls}
    P --> P1[Play / Pause]
    P --> P2[Step Forward]
    P --> P3[Step Backward]
    P --> P4[Reset]
    P --> P5[Speed 0.25x to 4x]

    P1 & P2 & P3 --> VIS[🎨 SVG Visualizer - Updates in real-time]
    VIS --> INFO[Step Description]
    VIS --> CODE[Pseudocode Panel - Active line highlighted]
    VIS --> STATS[Complexity Panel - Comparisons and Swaps]

    P4 --> R
    VIS -->|Try another algorithm| B1
    VIS -->|Go back| B
```

## Features

### 5 Algorithm Categories

| Category | Algorithms |
|---|---|
| **Sorting** | Bubble, Selection, Insertion, Merge, Quick, Heap Sort |
| **Graphs** | BFS, DFS, Dijkstra's, A*, Topological Sort, Kruskal's MST, Cycle Detection |
| **Trees** | BST Insert, BST Search, In-order, Pre-order, Post-order, Level-order |
| **Linked List** | Reverse, Insert (head/tail/index), Floyd's Cycle Detection |
| **Monotonic Stack** | Next Greater/Smaller Element, Daily Temperatures, Largest Rectangle in Histogram, Trapping Rain Water |

### Global Features (every visualizer)
- **Step-by-step playback** — Play, Pause, Step Forward/Back, Reset
- **Speed control** — 0.25x to 4x playback speed
- **Custom input** — Enter comma-separated values for any algorithm
- **Random generation** — Size slider (5–100 elements for sorting)
- **Pseudocode sync** — Active line highlighted in sync with the current step
- **Complexity panel** — Best/Avg/Worst/Space with live comparison/swap counts
- **Keyboard shortcuts** — Space (play/pause), ← → (step), R (reset)
- **Light/dark mode** — Persisted in localStorage

### Graph Visualizer Extras
- Interactive SVG canvas — drag nodes, Shift+click to add edges
- Toggle directed/undirected and weighted/unweighted
- **Grid mode** — paint walls, set start/end for BFS and A* pathfinding

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
  algorithms/
    sorting/          bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort
    graphs/           graphAlgorithms, gridAlgorithms
    trees/            treeAlgorithms
    linkedList/       linkedListAlgorithms
    monotonicStack/   stackAlgorithms
  components/
    layout/           Sidebar, Navbar, ControlPanel
    shared/           CodePanel, StepDescription, ComplexityPanel, CustomInputModal
  hooks/              usePlayback, useKeyboardShortcuts, useTheme
  pages/              SortingPage, GraphPage, TreePage, LinkedListPage, MonotonicStackPage, HomePage
  types/              step.ts (all shared TypeScript types)
```

## Architecture: Step-Object Pattern

Every algorithm returns an array of **step objects** instead of running imperatively:

```ts
interface SortStep {
  type: 'compare' | 'swap' | 'mark-sorted' | ...;
  array: number[];          // snapshot of array state
  highlights: Highlight[];  // which indices are highlighted and in what state
  comparisons: number;
  swaps: number;
  description: string;      // plain English explanation of this step
  pseudocodeLine: number;   // which pseudocode line is active
}
```

This cleanly decouples algorithm logic from animation timing. Playback speed, step forward/backward, and scrubbing all work without touching algorithm code.

## Adding a New Algorithm

1. **Create the generator** in `src/algorithms/<category>/myAlgo.ts`:
   ```ts
   export function myAlgo(input: number[]): SortStep[] {
     const steps: SortStep[] = [];
     // ... compute steps
     return steps;
   }
   export const myAlgoPseudocode = ['line 1', 'line 2', ...];
   export const myAlgoComplexity = { best: 'O(n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(1)' };
   ```

2. **Register it** in the relevant index file (e.g., `src/algorithms/sorting/index.ts`):
   ```ts
   SORTING_ALGORITHMS.push({ id: 'myalgo', name: 'My Algo', fn: myAlgo, pseudocode: myAlgoPseudocode, complexity: myAlgoComplexity });
   ```

3. **Add a tab** in the corresponding page component. The visualizer reuses the same `ControlPanel`, `CodePanel`, and `StepDescription` components automatically.

## Tech Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite** with `@tailwindcss/vite` plugin
- **Tailwind CSS v4** for utility styling
- **React Router** for category-based routing
- **SVG** for all visualizations (sorting bars, graph canvas, tree layout, linked list)

## Color State Palette

| State | Color | Usage |
|---|---|---|
| Default | Slate-700 | Unvisited/idle elements |
| Comparing | Amber-400 | Elements being compared |
| Active/Swap | Blue-400 | Elements being swapped or actively processed |
| Sorted/Visited | Emerald-500 | Finalized/visited elements |
| Pivot | Violet-500 | Pivot selection in Quick Sort |
| Accent | Indigo-500 | Active nodes, start node, pointers |
