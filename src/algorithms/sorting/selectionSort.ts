import type { SortStep } from '../../types/step';

export function selectionSort(input: number[]): SortStep[] {
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
    description: 'Starting Selection Sort. Find the minimum in the unsorted region and swap it to the front.',
    pseudocodeLine: 0,
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({
      type: 'set-pivot',
      array: [...arr],
      highlights: [{ index: i, state: 'pivot' }],
      comparisons,
      swaps,
      description: `Pass ${i + 1}: Assume index ${i} (value ${arr[i]}) is the minimum.`,
      pseudocodeLine: 1,
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      steps.push({
        type: 'compare',
        array: [...arr],
        highlights: [
          { index: minIdx, state: 'pivot' },
          { index: j, state: 'comparing' },
        ],
        comparisons,
        swaps,
        description: `Comparing current min arr[${minIdx}]=${arr[minIdx]} with arr[${j}]=${arr[j]}`,
        pseudocodeLine: 3,
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push({
          type: 'set-pivot',
          array: [...arr],
          highlights: [{ index: minIdx, state: 'pivot' }],
          comparisons,
          swaps,
          description: `New minimum found at index ${minIdx} (value ${arr[minIdx]})`,
          pseudocodeLine: 4,
        });
      }
    }

    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swaps++;
      steps.push({
        type: 'swap',
        array: [...arr],
        highlights: [{ index: i, state: 'active' }, { index: minIdx, state: 'active' }],
        comparisons,
        swaps,
        description: `Swapping arr[${i}]=${arr[minIdx]} with minimum arr[${minIdx}]=${arr[i]}`,
        pseudocodeLine: 6,
      });
    }

    steps.push({
      type: 'mark-sorted',
      array: [...arr],
      highlights: Array.from({ length: i + 1 }, (_, k) => ({ index: k, state: 'sorted' as const })),
      comparisons,
      swaps,
      description: `Index ${i} is now in its final sorted position.`,
      pseudocodeLine: 7,
    });
  }

  steps.push({
    type: 'mark-sorted',
    array: [...arr],
    highlights: arr.map((_, idx) => ({ index: idx, state: 'sorted' as const })),
    comparisons,
    swaps,
    description: 'Array is fully sorted!',
    pseudocodeLine: 8,
  });

  return steps;
}

export const selectionSortPseudocode = [
  'for i = 0 to n-2:',
  '  minIdx = i',
  '  for j = i+1 to n-1:',
  '    if arr[j] < arr[minIdx]:',
  '      minIdx = j',
  '    comparisons++',
  '  swap(arr[i], arr[minIdx])',
  '  swaps++',
  'return arr',
];

export const selectionSortComplexity = {
  best: 'O(n²)',
  average: 'O(n²)',
  worst: 'O(n²)',
  space: 'O(1)',
};
