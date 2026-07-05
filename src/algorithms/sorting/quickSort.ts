import type { SortStep } from '../../types/step';

export function quickSort(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    type: 'info',
    array: [...arr],
    highlights: [],
    comparisons,
    swaps,
    description: 'Starting Quick Sort. Choose a pivot, partition array, recurse on subarrays.',
    pseudocodeLine: 0,
  });

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    steps.push({
      type: 'set-pivot',
      array: [...arr],
      highlights: [{ index: high, state: 'pivot' }],
      comparisons,
      swaps,
      description: `Chose pivot = arr[${high}] = ${pivot}`,
      pseudocodeLine: 2,
    });

    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push({
        type: 'compare',
        array: [...arr],
        highlights: [
          { index: high, state: 'pivot' },
          { index: j, state: 'comparing' },
          ...(i >= low ? [{ index: i, state: 'active' as const }] : []),
        ],
        comparisons,
        swaps,
        description: `Comparing arr[${j}]=${arr[j]} with pivot=${pivot}`,
        pseudocodeLine: 4,
      });

      if (arr[j] <= pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        swaps++;
        steps.push({
          type: 'swap',
          array: [...arr],
          highlights: [
            { index: high, state: 'pivot' },
            { index: i, state: 'active' },
            { index: j, state: 'active' },
          ],
          comparisons,
          swaps,
          description: `arr[${j}]=${arr[j]} ≤ pivot, swapping with arr[${i}]=${arr[i]}`,
          pseudocodeLine: 6,
        });
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    swaps++;
    steps.push({
      type: 'swap',
      array: [...arr],
      highlights: [
        { index: i + 1, state: 'sorted' },
        { index: high, state: 'active' },
      ],
      comparisons,
      swaps,
      description: `Placing pivot ${pivot} in its final position at index ${i + 1}`,
      pseudocodeLine: 8,
    });

    return i + 1;
  }

  function quickSortHelper(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high);
      quickSortHelper(low, pi - 1);
      quickSortHelper(pi + 1, high);
    } else if (low === high) {
      steps.push({
        type: 'mark-sorted',
        array: [...arr],
        highlights: [{ index: low, state: 'sorted' }],
        comparisons,
        swaps,
        description: `Single element at index ${low} is already in place.`,
        pseudocodeLine: 1,
      });
    }
  }

  quickSortHelper(0, arr.length - 1);

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

export const quickSortPseudocode = [
  'quickSort(arr, low, high):',
  '  if low < high:',
  '  pivot = arr[high]',
  '  i = low - 1',
  '  for j = low to high-1:',
  '    if arr[j] <= pivot:',
  '      i++',
  '      swap(arr[i], arr[j])',
  '  swap(arr[i+1], arr[high])',
  '  quickSort(low, pi-1)',
  '  quickSort(pi+1, high)',
];

export const quickSortComplexity = {
  best: 'O(n log n)',
  average: 'O(n log n)',
  worst: 'O(n²)',
  space: 'O(log n)',
};
