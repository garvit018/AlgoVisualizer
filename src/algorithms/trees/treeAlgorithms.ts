import type { TreeStep, TreeNode } from '../../types/step';

let nodeIdCounter = 0;
function newNodeId(): string { return `n${++nodeIdCounter}`; }

function cloneTree(node: TreeNode | null | undefined): TreeNode | null {
  if (!node) return null;
  const left = cloneTree(node.left);
  const right = cloneTree(node.right);
  return { ...node, left: left === null ? undefined : left, right: right === null ? undefined : right };
}

// ── BST Insert ────────────────────────────────────────────────────────────────
export function bstInsert(initialValues: number[]): TreeStep[] {
  nodeIdCounter = 0;
  const steps: TreeStep[] = [];
  let root: TreeNode | null = null;

  function insert(node: TreeNode | null, value: number, path: string[]): TreeNode {
    if (!node) {
      const newNode: TreeNode = { id: newNodeId(), value, left: undefined, right: undefined };
      steps.push({
        type: 'insert',
        tree: cloneTree(root),
        highlightedNodeIds: [...path],
        traversalOrder: [],
        activeNodeId: newNode.id,
        description: `Inserting ${value} — position found, creating new node.`,
        pseudocodeLine: 3,
      });
      return newNode;
    }

    steps.push({
      type: 'compare',
      tree: cloneTree(root),
      highlightedNodeIds: [...path, node.id],
      traversalOrder: [],
      activeNodeId: node.id,
      description: `Comparing ${value} with node ${node.value}: go ${value < node.value ? 'left' : 'right'}`,
      pseudocodeLine: 1,
    });

    if (value < node.value) {
      node.left = insert(node.left ?? null, value, [...path, node.id]);
    } else if (value > node.value) {
      node.right = insert(node.right ?? null, value, [...path, node.id]);
    } else {
      steps.push({
        type: 'info',
        tree: cloneTree(root),
        highlightedNodeIds: [node.id],
        traversalOrder: [],
        activeNodeId: node.id,
        description: `Value ${value} already exists in the BST — no duplicate inserted.`,
        pseudocodeLine: 2,
      });
    }
    return node;
  }

  for (const val of initialValues) {
    steps.push({
      type: 'info',
      tree: cloneTree(root),
      highlightedNodeIds: [],
      traversalOrder: [],
      description: `Inserting ${val} into BST.`,
      pseudocodeLine: 0,
    });
    root = insert(root, val, []);
    steps.push({
      type: 'insert',
      tree: cloneTree(root),
      highlightedNodeIds: [],
      traversalOrder: [],
      description: `${val} inserted successfully.`,
      pseudocodeLine: 4,
    });
  }

  return steps;
}

export const bstInsertPseudocode = [
  'insert(root, value):',
  '  if value < node: go left',
  '  if value == node: duplicate',
  '  if null: create node here',
  '  return updated tree',
];

// ── BST Search ────────────────────────────────────────────────────────────────
export function bstSearch(root: TreeNode | null, target: number): TreeStep[] {
  const steps: TreeStep[] = [];

  steps.push({
    type: 'info', tree: cloneTree(root), highlightedNodeIds: [], traversalOrder: [],
    description: `Searching for ${target} in BST.`, pseudocodeLine: 0,
  });

  function search(node: TreeNode | null): boolean {
    if (!node) {
      steps.push({
        type: 'info', tree: cloneTree(root), highlightedNodeIds: [], traversalOrder: [],
        description: `${target} not found in BST.`, pseudocodeLine: 4,
      });
      return false;
    }

    steps.push({
      type: 'compare', tree: cloneTree(root), highlightedNodeIds: [node.id], traversalOrder: [],
      activeNodeId: node.id,
      description: `Comparing ${target} with node ${node.value}`,
      pseudocodeLine: 1,
    });

    if (target === node.value) {
      steps.push({
        type: 'mark-found', tree: cloneTree(root), highlightedNodeIds: [node.id], traversalOrder: [],
        activeNodeId: node.id,
        description: `Found ${target}!`,
        pseudocodeLine: 2,
      });
      return true;
    }

    return target < node.value ? search(node.left ?? null) : search(node.right ?? null);
  }

  search(root);
  return steps;
}

// ── Tree Traversals ────────────────────────────────────────────────────────────
type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'levelorder';

export function treeTraversal(root: TreeNode | null, type: TraversalType): TreeStep[] {
  const steps: TreeStep[] = [];
  const order: number[] = [];

  steps.push({
    type: 'info', tree: cloneTree(root), highlightedNodeIds: [], traversalOrder: [],
    description: `Starting ${type} traversal.`, pseudocodeLine: 0,
  });

  if (type === 'inorder') {
    function inorder(node: TreeNode | null): void {
      if (!node) return;
      inorder(node.left ?? null);
      order.push(node.value);
      steps.push({
        type: 'traverse', tree: cloneTree(root), highlightedNodeIds: [node.id], traversalOrder: [...order],
        activeNodeId: node.id,
        description: `In-order: visiting ${node.value} (left→root→right)`,
        pseudocodeLine: 2,
      });
      inorder(node.right ?? null);
    }
    inorder(root);
  } else if (type === 'preorder') {
    function preorder(node: TreeNode | null): void {
      if (!node) return;
      order.push(node.value);
      steps.push({
        type: 'traverse', tree: cloneTree(root), highlightedNodeIds: [node.id], traversalOrder: [...order],
        activeNodeId: node.id,
        description: `Pre-order: visiting ${node.value} (root→left→right)`,
        pseudocodeLine: 1,
      });
      preorder(node.left ?? null);
      preorder(node.right ?? null);
    }
    preorder(root);
  } else if (type === 'postorder') {
    function postorder(node: TreeNode | null): void {
      if (!node) return;
      postorder(node.left ?? null);
      postorder(node.right ?? null);
      order.push(node.value);
      steps.push({
        type: 'traverse', tree: cloneTree(root), highlightedNodeIds: [node.id], traversalOrder: [...order],
        activeNodeId: node.id,
        description: `Post-order: visiting ${node.value} (left→right→root)`,
        pseudocodeLine: 3,
      });
    }
    postorder(root);
  } else {
    // Level order
    const queue: TreeNode[] = root ? [root] : [];
    while (queue.length) {
      const node = queue.shift()!;
      order.push(node.value);
      steps.push({
        type: 'traverse', tree: cloneTree(root), highlightedNodeIds: [node.id], traversalOrder: [...order],
        activeNodeId: node.id,
        description: `Level-order: visiting ${node.value}`,
        pseudocodeLine: 2,
      });
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  steps.push({
    type: 'info', tree: cloneTree(root), highlightedNodeIds: [], traversalOrder: [...order],
    description: `Traversal complete. Order: [${order.join(', ')}]`,
    pseudocodeLine: 5,
  });

  return steps;
}

export const inorderPseudocode = [
  'inorder(node):',
  '  inorder(node.left)',
  '  visit(node)',
  '  inorder(node.right)',
  '  // L→Root→R',
  'return order',
];

export const preorderPseudocode = [
  'preorder(node):',
  '  visit(node)',
  '  preorder(node.left)',
  '  preorder(node.right)',
  '  // Root→L→R',
  'return order',
];

export const postorderPseudocode = [
  'postorder(node):',
  '  postorder(node.left)',
  '  postorder(node.right)',
  '  visit(node)',
  '  // L→R→Root',
  'return order',
];

export const levelorderPseudocode = [
  'levelOrder(root):',
  '  queue = [root]',
  '  while queue not empty:',
  '    node = queue.dequeue()',
  '    enqueue left, right children',
  'return order',
];

// ── Build BST from array ───────────────────────────────────────────────────────
export function buildBSTFromArray(values: number[]): TreeNode | null {
  nodeIdCounter = 0;
  let root: TreeNode | null = null;

  function insertNode(node: TreeNode | null, value: number): TreeNode {
    if (!node) return { id: newNodeId(), value };
    if (value < node.value) return { ...node, left: insertNode(node.left ?? null, value) };
    if (value > node.value) return { ...node, right: insertNode(node.right ?? null, value) };
    return node;
  }

  for (const v of values) root = insertNode(root, v);
  return root;
}
