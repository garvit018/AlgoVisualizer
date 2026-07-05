import type { SortStep } from '../../types/step';

export function bubbleSort(input: number[]): SortStep[] {
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
    description: 'Starting Bubble Sort. We repeatedly swap adjacent elements that are out of order.',
    pseudocodeLine: 0,
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      steps.push({
        type: 'compare',
        array: [...arr],
        highlights: [{ index: j, state: 'comparing' }, { index: j + 1, state: 'comparing' }],
        comparisons,
        swaps,
        description: `Comparing arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}`,
        pseudocodeLine: 3,
      });

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        steps.push({
          type: 'swap',
          array: [...arr],
          highlights: [{ index: j, state: 'active' }, { index: j + 1, state: 'active' }],
          comparisons,
          swaps,
          description: `Swapping arr[${j}]=${arr[j + 1]} and arr[${j + 1}]=${arr[j]} — they were out of order`,
          pseudocodeLine: 4,
        });
      }
    }

    steps.push({
      type: 'mark-sorted',
      array: [...arr],
      highlights: Array.from({ length: i + 1 }, (_, k) => ({
        index: n - 1 - k,
        state: 'sorted' as const,
      })),
      comparisons,
      swaps,
      description: `Element at index ${n - 1 - i} is now in its final sorted position.`,
      pseudocodeLine: 1,
    });
  }

  steps.push({
    type: 'mark-sorted',
    array: [...arr],
    highlights: arr.map((_, idx) => ({ index: idx, state: 'sorted' as const })),
    comparisons,
    swaps,
    description: 'Array is fully sorted!',
    pseudocodeLine: 6,
  });

  return steps;
}

export const bubbleSortPseudocode = [
  'for i = 0 to n-2:',
  '  for j = 0 to n-2-i:',
  '    comparisons++',
  '    if arr[j] > arr[j+1]:',
  '      swap(arr[j], arr[j+1])',
  '      swaps++',
  'return arr',
];

export const bubbleSortComplexity = {
  best: 'O(n)',
  average: 'O(n²)',
  worst: 'O(n²)',
  space: 'O(1)',
};
