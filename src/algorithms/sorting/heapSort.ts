import type { SortStep } from '../../types/step';

export function heapSort(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  steps.push({
    type: 'info',
    array: [...arr],
    highlights: [],
    comparisons,
    swaps,
    description: 'Starting Heap Sort. First build a max-heap, then extract max elements one by one.',
    pseudocodeLine: 0,
  });

  function heapify(size: number, root: number): void {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    if (left < size) {
      comparisons++;
      steps.push({
        type: 'compare',
        array: [...arr],
        highlights: [{ index: largest, state: 'comparing' }, { index: left, state: 'comparing' }],
        comparisons,
        swaps,
        description: `Heapify: comparing root arr[${largest}]=${arr[largest]} with left child arr[${left}]=${arr[left]}`,
        pseudocodeLine: 4,
      });
      if (arr[left] > arr[largest]) largest = left;
    }

    if (right < size) {
      comparisons++;
      steps.push({
        type: 'compare',
        array: [...arr],
        highlights: [{ index: largest, state: 'comparing' }, { index: right, state: 'comparing' }],
        comparisons,
        swaps,
        description: `Heapify: comparing current largest arr[${largest}]=${arr[largest]} with right child arr[${right}]=${arr[right]}`,
        pseudocodeLine: 5,
      });
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== root) {
      [arr[root], arr[largest]] = [arr[largest], arr[root]];
      swaps++;
      steps.push({
        type: 'swap',
        array: [...arr],
        highlights: [{ index: root, state: 'active' }, { index: largest, state: 'active' }],
        comparisons,
        swaps,
        description: `Swapping arr[${root}]=${arr[largest]} and arr[${largest}]=${arr[root]} to restore heap`,
        pseudocodeLine: 6,
      });
      heapify(size, largest);
    }
  }

  // Build max heap
  steps.push({
    type: 'info',
    array: [...arr],
    highlights: [],
    comparisons,
    swaps,
    description: 'Phase 1: Building max-heap from the array.',
    pseudocodeLine: 1,
  });

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  steps.push({
    type: 'info',
    array: [...arr],
    highlights: [],
    comparisons,
    swaps,
    description: 'Max-heap built! Phase 2: Extract max elements to sort the array.',
    pseudocodeLine: 2,
  });

  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    swaps++;
    steps.push({
      type: 'swap',
      array: [...arr],
      highlights: [{ index: 0, state: 'active' }, { index: i, state: 'sorted' }],
      comparisons,
      swaps,
      description: `Moved max element ${arr[i]} to its final position at index ${i}`,
      pseudocodeLine: 8,
    });
    heapify(i, 0);
  }

  steps.push({
    type: 'mark-sorted',
    array: [...arr],
    highlights: arr.map((_, idx) => ({ index: idx, state: 'sorted' as const })),
    comparisons,
    swaps,
    description: 'Array is fully sorted!',
    pseudocodeLine: 10,
  });

  return steps;
}

export const heapSortPseudocode = [
  'heapSort(arr):',
  '  buildMaxHeap(arr)',
  '  for i = n-1 to 1:',
  '    swap(arr[0], arr[i])',
  'heapify(arr, size, root):',
  '  largest = max(root, left, right)',
  '  if left < size: compare',
  '  if right < size: compare',
  '  if largest != root:',
  '    swap(arr[root], arr[largest])',
  '    heapify(arr, size, largest)',
];

export const heapSortComplexity = {
  best: 'O(n log n)',
  average: 'O(n log n)',
  worst: 'O(n log n)',
  space: 'O(1)',
};
