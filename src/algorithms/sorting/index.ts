// Sorting algorithms index
export { bubbleSort, bubbleSortPseudocode, bubbleSortComplexity } from './bubbleSort';
export { selectionSort, selectionSortPseudocode, selectionSortComplexity } from './selectionSort';
export { insertionSort, insertionSortPseudocode, insertionSortComplexity } from './insertionSort';
export { mergeSort, mergeSortPseudocode, mergeSortComplexity } from './mergeSort';
export { quickSort, quickSortPseudocode, quickSortComplexity } from './quickSort';
export { heapSort, heapSortPseudocode, heapSortComplexity } from './heapSort';

import type { SortStep } from '../../types/step';
import {
  bubbleSort, bubbleSortPseudocode, bubbleSortComplexity,
  selectionSort, selectionSortPseudocode, selectionSortComplexity,
  insertionSort, insertionSortPseudocode, insertionSortComplexity,
  mergeSort, mergeSortPseudocode, mergeSortComplexity,
  quickSort, quickSortPseudocode, quickSortComplexity,
  heapSort, heapSortPseudocode, heapSortComplexity,
} from './';

export interface SortingAlgorithmMeta {
  id: string;
  name: string;
  fn: (input: number[]) => SortStep[];
  pseudocode: string[];
  complexity: { best: string; average: string; worst: string; space: string };
}

export const SORTING_ALGORITHMS: SortingAlgorithmMeta[] = [
  { id: 'bubble', name: 'Bubble Sort', fn: bubbleSort, pseudocode: bubbleSortPseudocode, complexity: bubbleSortComplexity },
  { id: 'selection', name: 'Selection Sort', fn: selectionSort, pseudocode: selectionSortPseudocode, complexity: selectionSortComplexity },
  { id: 'insertion', name: 'Insertion Sort', fn: insertionSort, pseudocode: insertionSortPseudocode, complexity: insertionSortComplexity },
  { id: 'merge', name: 'Merge Sort', fn: mergeSort, pseudocode: mergeSortPseudocode, complexity: mergeSortComplexity },
  { id: 'quick', name: 'Quick Sort', fn: quickSort, pseudocode: quickSortPseudocode, complexity: quickSortComplexity },
  { id: 'heap', name: 'Heap Sort', fn: heapSort, pseudocode: heapSortPseudocode, complexity: heapSortComplexity },
];
