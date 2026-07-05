import type { ListStep, ListNode } from '../../types/step';

let idCounter = 0;
function newId(): string { return `l${++idCounter}`; }

function cloneNodes(nodes: ListNode[]): ListNode[] {
  return nodes.map(n => ({ ...n }));
}

// ── Singly Linked List Insert ──────────────────────────────────────────────────
export function linkedListInsert(
  initialValues: number[],
  insertMode: 'head' | 'tail' | 'index',
  insertValue: number,
  insertIndex?: number
): ListStep[] {
  idCounter = 0;
  const steps: ListStep[] = [];
  const nodes: ListNode[] = initialValues.map(v => ({ id: newId(), value: v }));

  // Link them
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].nextId = nodes[i + 1].id;

  const headId = nodes[0]?.id;
  const tailId = nodes[nodes.length - 1]?.id;

  steps.push({
    type: 'info', nodes: cloneNodes(nodes), headId, tailId, highlightedIds: [],
    description: `Initial linked list: [${initialValues.join(' → ')}]`, pseudocodeLine: 0,
  });

  const newNode: ListNode = { id: newId(), value: insertValue };

  if (insertMode === 'head') {
    steps.push({
      type: 'set-pointer', nodes: cloneNodes(nodes), headId, tailId, highlightedIds: [newNode.id],
      description: `Inserting ${insertValue} at head.`, pseudocodeLine: 1,
    });
    newNode.nextId = nodes[0]?.id;
    nodes.unshift(newNode);
    steps.push({
      type: 'insert', nodes: cloneNodes(nodes), headId: newNode.id, tailId,
      highlightedIds: [newNode.id],
      description: `New head node ${insertValue} points to old head.`, pseudocodeLine: 2,
    });
  } else if (insertMode === 'tail') {
    if (nodes.length > 0) {
      steps.push({
        type: 'set-pointer', nodes: cloneNodes(nodes), headId, tailId, highlightedIds: [tailId!],
        description: `Traversing to tail to insert ${insertValue}.`, pseudocodeLine: 3,
      });
      nodes[nodes.length - 1].nextId = newNode.id;
    }
    nodes.push(newNode);
    steps.push({
      type: 'insert', nodes: cloneNodes(nodes), headId, tailId: newNode.id, highlightedIds: [newNode.id],
      description: `Inserted ${insertValue} at tail.`, pseudocodeLine: 4,
    });
  } else if (insertMode === 'index' && insertIndex !== undefined) {
    const idx = Math.max(0, Math.min(insertIndex, nodes.length));
    for (let i = 0; i < idx - 1; i++) {
      steps.push({
        type: 'set-pointer', nodes: cloneNodes(nodes), headId, tailId, highlightedIds: [nodes[i].id],
        description: `Traversing to index ${i}...`, pseudocodeLine: 5,
      });
    }
    const prevNode = nodes[idx - 1];
    newNode.nextId = prevNode?.nextId;
    if (prevNode) prevNode.nextId = newNode.id;
    nodes.splice(idx, 0, newNode);
    steps.push({
      type: 'insert', nodes: cloneNodes(nodes), headId: idx === 0 ? newNode.id : headId, tailId,
      highlightedIds: [newNode.id],
      description: `Inserted ${insertValue} at index ${idx}.`, pseudocodeLine: 6,
    });
  }

  return steps;
}

// ── Linked List Reverse ────────────────────────────────────────────────────────
export function linkedListReverse(initialValues: number[]): ListStep[] {
  idCounter = 0;
  const steps: ListStep[] = [];
  const nodes: ListNode[] = initialValues.map(v => ({ id: newId(), value: v }));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].nextId = nodes[i + 1].id;

  steps.push({
    type: 'info', nodes: cloneNodes(nodes), headId: nodes[0]?.id, tailId: nodes[nodes.length - 1]?.id,
    highlightedIds: [],
    description: `Reversing linked list [${initialValues.join(' → ')}]. Using 3 pointers: prev, curr, next.`,
    pseudocodeLine: 0,
  });

  let prev: string | undefined = undefined;
  let curr: number = 0;

  while (curr < nodes.length) {
    const currNode = nodes[curr];
    const nextId = currNode.nextId;

    steps.push({
      type: 'set-pointer', nodes: cloneNodes(nodes),
      headId: nodes[curr].id, tailId: nodes[nodes.length - 1]?.id,
      highlightedIds: [currNode.id, ...(prev ? [prev] : [])],
      pointers: { curr: currNode.id, ...(prev ? { prev } : {}), ...(nextId ? { next: nextId } : {}) },
      description: `curr=${currNode.value}, prev=${prev ? nodes.find(n => n.id === prev)?.value ?? 'null' : 'null'}. Reversing pointer.`,
      pseudocodeLine: 2,
    });

    currNode.nextId = prev;

    steps.push({
      type: 'reassign-next', nodes: cloneNodes(nodes),
      headId: nodes[0].id, tailId: nodes[nodes.length - 1].id,
      highlightedIds: [currNode.id],
      description: `curr.next = prev (${prev ? nodes.find(n => n.id === prev)?.value : 'null'})`,
      pseudocodeLine: 3,
    });

    prev = currNode.id;
    curr++;
  }

  // Rebuild the reversed array display
  const reversed = [...nodes].reverse();
  for (let i = 0; i < reversed.length - 1; i++) reversed[i].nextId = reversed[i + 1].id;
  reversed[reversed.length - 1].nextId = undefined;

  steps.push({
    type: 'info', nodes: cloneNodes(reversed), headId: reversed[0]?.id, tailId: reversed[reversed.length - 1]?.id,
    highlightedIds: reversed.map(n => n.id),
    description: `List reversed! [${[...initialValues].reverse().join(' → ')}]`,
    pseudocodeLine: 5,
  });

  return steps;
}

export const reverseListPseudocode = [
  'reverse(head):',
  '  prev = null; curr = head',
  '  while curr != null:',
  '    next = curr.next',
  '    curr.next = prev',
  '    prev = curr; curr = next',
  '  return prev',
];

// ── Floyd's Cycle Detection ────────────────────────────────────────────────────
export function floydCycleDetection(values: number[], cycleAt?: number): ListStep[] {
  idCounter = 0;
  const steps: ListStep[] = [];
  const nodes: ListNode[] = values.map(v => ({ id: newId(), value: v }));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].nextId = nodes[i + 1].id;

  // Optionally create a cycle
  if (cycleAt !== undefined && cycleAt >= 0 && cycleAt < nodes.length) {
    nodes[nodes.length - 1].nextId = nodes[cycleAt].id;
  }

  steps.push({
    type: 'info', nodes: cloneNodes(nodes), headId: nodes[0]?.id, highlightedIds: [],
    description: `Floyd's Cycle Detection: slow pointer moves 1 step, fast pointer moves 2 steps.${cycleAt !== undefined ? ` Cycle exists at node index ${cycleAt}.` : ' No cycle.'}`,
    pseudocodeLine: 0,
  });

  let slowIdx = 0, fastIdx = 0;
  const maxSteps = values.length * 2 + 2;

  for (let step = 0; step < maxSteps; step++) {
    const slowNode = nodes[slowIdx];
    const fastNode = nodes[fastIdx];

    steps.push({
      type: 'slow-fast', nodes: cloneNodes(nodes), headId: nodes[0]?.id,
      highlightedIds: [slowNode.id, fastNode.id],
      pointers: { slow: slowNode.id, fast: fastNode.id },
      description: `slow at ${slowNode.value}, fast at ${fastNode.value}`,
      pseudocodeLine: 2,
    });

    if (slowNode.id === fastNode.id && step > 0) {
      steps.push({
        type: 'mark-found', nodes: cloneNodes(nodes), headId: nodes[0]?.id,
        highlightedIds: [slowNode.id],
        pointers: { slow: slowNode.id, fast: fastNode.id },
        description: `Slow and fast met at node ${slowNode.value} — CYCLE DETECTED!`,
        pseudocodeLine: 4,
      });
      return steps;
    }

    // Advance slow by 1, fast by 2 (handle cycle artificially with modular index)
    const nextSlowId = slowNode.nextId;
    if (!nextSlowId) break;
    const nextFastId = fastNode.nextId ? nodes.find(n => n.id === fastNode.nextId)?.nextId : undefined;
    if (!nextFastId) {
      // Fast reached end — no cycle
      break;
    }

    slowIdx = nodes.findIndex(n => n.id === nextSlowId);
    fastIdx = nodes.findIndex(n => n.id === nextFastId);
    if (slowIdx === -1 || fastIdx === -1) break;
  }

  steps.push({
    type: 'info', nodes: cloneNodes(nodes), headId: nodes[0]?.id, highlightedIds: [],
    description: `Fast pointer reached null — NO CYCLE detected.`, pseudocodeLine: 6,
  });

  return steps;
}

export const floydPseudocode = [
  'floyd(head):',
  '  slow = fast = head',
  '  while fast and fast.next:',
  '    slow = slow.next',
  '    fast = fast.next.next',
  '    if slow == fast: CYCLE!',
  '  return NO CYCLE',
];
