import type { StackStep } from '../../types/step';

function makeStep(
  partial: Partial<StackStep> & { description: string; pseudocodeLine: number },
  array: number[], stack: number[], result: (number | null)[], currentIndex: number, highlightIndices: number[]
): StackStep {
  return {
    type: partial.type ?? 'info',
    description: partial.description,
    pseudocodeLine: partial.pseudocodeLine,
    array, stack: [...stack], result: [...result], currentIndex, highlightIndices,
    actionReason: partial.actionReason,
  };
}

// ── Next Greater Element ────────────────────────────────────────────────────────
export function nextGreaterElement(arr: number[]): StackStep[] {
  const steps: StackStep[] = [];
  const n = arr.length;
  const result: (number | null)[] = new Array(n).fill(null);
  const stack: number[] = []; // stores indices

  steps.push(makeStep({ type: 'info', description: 'Find the next greater element for each position using a monotonic stack.', pseudocodeLine: 0 }, arr, stack, result, -1, []));

  for (let i = 0; i < n; i++) {
    steps.push(makeStep({ type: 'compare', description: `Processing arr[${i}] = ${arr[i]}`, pseudocodeLine: 1 }, arr, stack, result, i, [i]));

    while (stack.length && arr[i] > arr[stack[stack.length - 1]]) {
      const top = stack.pop()!;
      result[top] = arr[i];
      steps.push(makeStep({
        type: 'pop',
        description: `arr[${i}]=${arr[i]} > arr[${top}]=${arr[top]} — found next greater! result[${top}] = ${arr[i]}`,
        actionReason: `Popped ${arr[top]} — found greater element ${arr[i]}`,
        pseudocodeLine: 3,
      }, arr, stack, result, i, [i, top]));
    }

    stack.push(i);
    steps.push(makeStep({ type: 'push', description: `Push index ${i} (value ${arr[i]}) onto stack.`, pseudocodeLine: 5 }, arr, stack, result, i, [i]));
  }

  steps.push(makeStep({ type: 'info', description: `Result: [${result.map(v => v ?? '-1').join(', ')}]`, pseudocodeLine: 6 }, arr, stack, result, -1, []));
  return steps;
}

export const nextGreaterPseudocode = [
  'nextGreater(arr):',
  '  for i = 0 to n-1:',
  '    while stack not empty:',
  '      if arr[i] > arr[stack.top]:',
  '        result[stack.pop] = arr[i]',
  '    stack.push(i)',
  '  return result',
];

// ── Next Smaller Element ────────────────────────────────────────────────────────
export function nextSmallerElement(arr: number[]): StackStep[] {
  const steps: StackStep[] = [];
  const n = arr.length;
  const result: (number | null)[] = new Array(n).fill(null);
  const stack: number[] = [];

  steps.push(makeStep({ type: 'info', description: 'Find the next smaller element for each position.', pseudocodeLine: 0 }, arr, stack, result, -1, []));

  for (let i = 0; i < n; i++) {
    steps.push(makeStep({ type: 'compare', description: `Processing arr[${i}] = ${arr[i]}`, pseudocodeLine: 1 }, arr, stack, result, i, [i]));

    while (stack.length && arr[i] < arr[stack[stack.length - 1]]) {
      const top = stack.pop()!;
      result[top] = arr[i];
      steps.push(makeStep({
        type: 'pop',
        description: `arr[${i}]=${arr[i]} < arr[${top}]=${arr[top]} — found next smaller! result[${top}] = ${arr[i]}`,
        actionReason: `Popped ${arr[top]} — found smaller element ${arr[i]}`,
        pseudocodeLine: 3,
      }, arr, stack, result, i, [i, top]));
    }

    stack.push(i);
    steps.push(makeStep({ type: 'push', description: `Push index ${i} onto stack.`, pseudocodeLine: 5 }, arr, stack, result, i, [i]));
  }

  steps.push(makeStep({ type: 'info', description: `Result: [${result.map(v => v ?? '-1').join(', ')}]`, pseudocodeLine: 6 }, arr, stack, result, -1, []));
  return steps;
}

// ── Daily Temperatures ────────────────────────────────────────────────────────
export function dailyTemperatures(temps: number[]): StackStep[] {
  const steps: StackStep[] = [];
  const n = temps.length;
  const result: (number | null)[] = new Array(n).fill(0);
  const stack: number[] = [];

  steps.push(makeStep({ type: 'info', description: 'Daily Temperatures: for each day, find how many days until a warmer temperature.', pseudocodeLine: 0 }, temps, stack, result, -1, []));

  for (let i = 0; i < n; i++) {
    steps.push(makeStep({ type: 'compare', description: `Day ${i}: temp = ${temps[i]}°`, pseudocodeLine: 1 }, temps, stack, result, i, [i]));

    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const top = stack.pop()!;
      result[top] = i - top;
      steps.push(makeStep({
        type: 'pop',
        description: `Warmer day found! Day ${i} (${temps[i]}°) > Day ${top} (${temps[top]}°). Wait = ${i - top} days.`,
        actionReason: `Popped day ${top} — warmer day found ${i-top} days later`,
        pseudocodeLine: 3,
      }, temps, stack, result, i, [i, top]));
    }

    stack.push(i);
    steps.push(makeStep({ type: 'push', description: `Pushing day ${i} onto stack (no warmer day found yet).`, pseudocodeLine: 5 }, temps, stack, result, i, [i]));
  }

  steps.push(makeStep({ type: 'info', description: `Result: [${result.join(', ')}]`, pseudocodeLine: 6 }, temps, stack, result, -1, []));
  return steps;
}

export const dailyTempsPseudocode = [
  'dailyTemps(T):',
  '  for i = 0 to n-1:',
  '    while stack and T[i] > T[top]:',
  '      result[stack.pop] = i - top',
  '    stack.push(i)',
  '  remaining in stack: result=0',
  '  return result',
];

// ── Largest Rectangle in Histogram ─────────────────────────────────────────────
export function largestRectangleHistogram(heights: number[]): StackStep[] {
  const steps: StackStep[] = [];
  const n = heights.length;
  const result: (number | null)[] = new Array(n).fill(null);
  const stack: number[] = [];
  let maxArea = 0;

  steps.push(makeStep({ type: 'info', description: 'Largest Rectangle in Histogram: use stack to track bars in increasing height order.', pseudocodeLine: 0 }, heights, stack, result, -1, []));

  const extended = [...heights, 0]; // sentinel

  for (let i = 0; i <= n; i++) {
    steps.push(makeStep({ type: 'compare', description: i < n ? `Processing bar[${i}] = height ${heights[i]}` : 'Sentinel 0: flushing remaining bars from stack.', pseudocodeLine: 1 }, heights, stack, result, i < n ? i : n - 1, i < n ? [i] : []));

    while (stack.length && extended[i] < extended[stack[stack.length - 1]]) {
      const h = extended[stack.pop()!];
      const w = stack.length ? i - stack[stack.length - 1] - 1 : i;
      const area = h * w;
      maxArea = Math.max(maxArea, area);
      steps.push(makeStep({
        type: 'pop',
        description: `Popped height ${h}, width = ${w}, area = ${area}. Max so far: ${maxArea}`,
        actionReason: `Popped h=${h} — computed area=${area}`,
        pseudocodeLine: 3,
      }, heights, stack, result, i < n ? i : n - 1, stack.length ? [stack[stack.length - 1], i] : []));
    }

    if (i < n) {
      stack.push(i);
      steps.push(makeStep({ type: 'push', description: `Pushing bar[${i}] = ${heights[i]}. Stack is non-decreasing.`, pseudocodeLine: 5 }, heights, stack, result, i, [i]));
    }
  }

  steps.push(makeStep({ type: 'info', description: `Maximum rectangle area = ${maxArea}`, pseudocodeLine: 6 }, heights, stack, result, -1, []));
  return steps;
}

export const histogramPseudocode = [
  'largestRect(heights):',
  '  for i = 0 to n (with sentinel):',
  '    while stack and h[i] < h[top]:',
  '      area = h[pop] * width',
  '      maxArea = max(maxArea, area)',
  '    stack.push(i)',
  '  return maxArea',
];

// ── Trapping Rain Water ────────────────────────────────────────────────────────
export function trappingRainWater(heights: number[]): StackStep[] {
  const steps: StackStep[] = [];
  const n = heights.length;
  const result: (number | null)[] = new Array(n).fill(0);
  const stack: number[] = [];
  let totalWater = 0;

  steps.push(makeStep({ type: 'info', description: 'Trapping Rain Water: stack-based approach. Water trapped between walls.', pseudocodeLine: 0 }, heights, stack, result, -1, []));

  for (let i = 0; i < n; i++) {
    steps.push(makeStep({ type: 'compare', description: `Processing bar[${i}] = height ${heights[i]}`, pseudocodeLine: 1 }, heights, stack, result, i, [i]));

    while (stack.length && heights[i] > heights[stack[stack.length - 1]]) {
      const mid = stack.pop()!;
      if (stack.length) {
        const left = stack[stack.length - 1];
        const h = Math.min(heights[left], heights[i]) - heights[mid];
        const w = i - left - 1;
        const water = h * w;
        totalWater += water;
        result[mid] = water;
        steps.push(makeStep({
          type: 'pop',
          description: `Water trapped above bar[${mid}]: height=${h}, width=${w}, water=${water}. Total: ${totalWater}`,
          actionReason: `Trapped ${water} units above index ${mid}`,
          pseudocodeLine: 4,
        }, heights, stack, result, i, [left, mid, i]));
      }
    }

    stack.push(i);
    steps.push(makeStep({ type: 'push', description: `Push bar[${i}] = ${heights[i]} onto stack.`, pseudocodeLine: 6 }, heights, stack, result, i, [i]));
  }

  steps.push(makeStep({ type: 'info', description: `Total water trapped = ${totalWater} units`, pseudocodeLine: 7 }, heights, stack, result, -1, []));
  return steps;
}

export const rainWaterPseudocode = [
  'trap(heights):',
  '  for i = 0 to n-1:',
  '    while stack and h[i] > h[top]:',
  '      mid = stack.pop()',
  '      if stack not empty:',
  '        water += min(h[left],h[i])-h[mid]) * width',
  '    stack.push(i)',
  '  return totalWater',
];
