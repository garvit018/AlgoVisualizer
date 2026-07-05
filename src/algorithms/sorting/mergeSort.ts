import type { SortStep } from '../../types/step';

export function mergeSort(input: number[]): SortStep[] {
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
    description: 'Starting Merge Sort. Divide the array in half recursively, then merge sorted halves.',
    pseudocodeLine: 0,
  });

  function mergeSortHelper(a: number[], left: number, right: number): void {
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);

    steps.push({
      type: 'info',
      array: [...arr],
      highlights: Array.from({ length: right - left + 1 }, (_, i) => ({
        index: left + i,
        state: 'comparing' as const,
      })),
      comparisons,
      swaps,
      description: `Dividing arr[${left}..${right}] at midpoint ${mid}`,
      pseudocodeLine: 1,
    });

    mergeSortHelper(a, left, mid);
    mergeSortHelper(a, mid + 1, right);

    // Merge
    const leftArr = a.slice(left, mid + 1);
    const rightArr = a.slice(mid + 1, right + 1);

    steps.push({
      type: 'merge',
      array: [...arr],
      highlights: [
        ...Array.from({ length: mid - left + 1 }, (_, i) => ({ index: left + i, state: 'pivot' as const })),
        ...Array.from({ length: right - mid }, (_, i) => ({ index: mid + 1 + i, state: 'active' as const })),
      ],
      comparisons,
      swaps,
      description: `Merging arr[${left}..${mid}] and arr[${mid + 1}..${right}]`,
      pseudocodeLine: 5,
    });

    let i = 0, j = 0, k = left;
    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      if (leftArr[i] <= rightArr[j]) {
        a[k] = leftArr[i];
        arr[k] = a[k];
        i++;
      } else {
        a[k] = rightArr[j];
        arr[k] = a[k];
        j++;
      }
      swaps++;
      steps.push({
        type: 'overwrite',
        array: [...arr],
        highlights: [{ index: k, state: 'active' }],
        comparisons,
        swaps,
        description: `Placed ${a[k]} at index ${k}`,
        pseudocodeLine: 7,
      });
      k++;
    }

    while (i < leftArr.length) {
      a[k] = leftArr[i];
      arr[k] = a[k];
      swaps++;
      steps.push({
        type: 'overwrite',
        array: [...arr],
        highlights: [{ index: k, state: 'active' }],
        comparisons,
        swaps,
        description: `Copying remaining left element ${a[k]} to index ${k}`,
        pseudocodeLine: 8,
      });
      i++; k++;
    }

    while (j < rightArr.length) {
      a[k] = rightArr[j];
      arr[k] = a[k];
      swaps++;
      steps.push({
        type: 'overwrite',
        array: [...arr],
        highlights: [{ index: k, state: 'active' }],
        comparisons,
        swaps,
        description: `Copying remaining right element ${a[k]} to index ${k}`,
        pseudocodeLine: 9,
      });
      j++; k++;
    }

    steps.push({
      type: 'mark-sorted',
      array: [...arr],
      highlights: Array.from({ length: right - left + 1 }, (_, i) => ({
        index: left + i,
        state: 'sorted' as const,
      })),
      comparisons,
      swaps,
      description: `arr[${left}..${right}] is now sorted.`,
      pseudocodeLine: 10,
    });
  }

  mergeSortHelper(arr, 0, arr.length - 1);

  steps.push({
    type: 'mark-sorted',
    array: [...arr],
    highlights: arr.map((_, idx) => ({ index: idx, state: 'sorted' as const })),
    comparisons,
    swaps,
    description: 'Array is fully sorted!',
    pseudocodeLine: 11,
  });

  return steps;
}

export const mergeSortPseudocode = [
  'mergeSort(arr, left, right):',
  '  mid = (left + right) / 2',
  '  mergeSort(arr, left, mid)',
  '  mergeSort(arr, mid+1, right)',
  '  merge(arr, left, mid, right)',
  'merge(arr, left, mid, right):',
  '  copy to temp arrays',
  '  while both non-empty: pick smaller',
  '  copy remaining left',
  '  copy remaining right',
  '  // subarray sorted',
  'return arr',
];

export const mergeSortComplexity = {
  best: 'O(n log n)',
  average: 'O(n log n)',
  worst: 'O(n log n)',
  space: 'O(n)',
};
