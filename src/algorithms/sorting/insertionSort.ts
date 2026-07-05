import type { SortStep } from '../../types/step';

export function insertionSort(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  steps.push({
    type: 'info',
    array: [...arr],
    highlights: [{ index: 0, state: 'sorted' }],
    comparisons,
    swaps,
    description: 'Starting Insertion Sort. Build the sorted section one element at a time.',
    pseudocodeLine: 0,
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    steps.push({
      type: 'set-pivot',
      array: [...arr],
      highlights: [{ index: i, state: 'pivot' }],
      comparisons,
      swaps,
      description: `Picking arr[${i}]=${key} as the key to insert into the sorted portion.`,
      pseudocodeLine: 1,
    });

    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      comparisons++;
      steps.push({
        type: 'compare',
        array: [...arr],
        highlights: [{ index: j, state: 'comparing' }, { index: j + 1, state: 'pivot' }],
        comparisons,
        swaps,
        description: `arr[${j}]=${arr[j]} > key=${key}, shifting arr[${j}] right`,
        pseudocodeLine: 3,
      });
      arr[j + 1] = arr[j];
      swaps++;
      steps.push({
        type: 'swap',
        array: [...arr],
        highlights: [{ index: j + 1, state: 'active' }],
        comparisons,
        swaps,
        description: `Shifted arr[${j}]=${arr[j]} to position ${j + 1}`,
        pseudocodeLine: 4,
      });
      j--;
    }

    if (j + 1 !== i) {
      arr[j + 1] = key;
      steps.push({
        type: 'overwrite',
        array: [...arr],
        highlights: [{ index: j + 1, state: 'active' }],
        comparisons,
        swaps,
        description: `Inserted key=${key} at index ${j + 1}`,
        pseudocodeLine: 5,
      });
    }

    steps.push({
      type: 'mark-sorted',
      array: [...arr],
      highlights: Array.from({ length: i + 1 }, (_, k) => ({ index: k, state: 'sorted' as const })),
      comparisons,
      swaps,
      description: `First ${i + 1} elements are now sorted.`,
      pseudocodeLine: 6,
    });
  }

  steps.push({
    type: 'mark-sorted',
    array: [...arr],
    highlights: arr.map((_, idx) => ({ index: idx, state: 'sorted' as const })),
    comparisons,
    swaps,
    description: 'Array is fully sorted!',
    pseudocodeLine: 7,
  });

  return steps;
}

export const insertionSortPseudocode = [
  'for i = 1 to n-1:',
  '  key = arr[i]',
  '  j = i - 1',
  '  while j >= 0 and arr[j] > key:',
  '    arr[j+1] = arr[j]; j--',
  '  arr[j+1] = key',
  '  // first i+1 elements sorted',
  'return arr',
];

export const insertionSortComplexity = {
  best: 'O(n)',
  average: 'O(n²)',
  worst: 'O(n²)',
  space: 'O(1)',
};
