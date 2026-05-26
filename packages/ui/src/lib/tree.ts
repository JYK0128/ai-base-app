export interface TreeNode<T> {
  readonly id: string
  readonly value: T
  readonly children?: readonly TreeNode<T>[]
}

export type TreeNodeDropPosition = 'before' | 'after' | 'inside'

export interface TreeNodeMoveInput {
  readonly sourceId: string
  readonly targetId: string
  readonly position: TreeNodeDropPosition
}

export interface TreeNodeLocation<T> {
  readonly node: TreeNode<T>
  readonly parent?: TreeNode<T>
  readonly index: number
  readonly path: readonly TreeNode<T>[]
}

export interface TreeNodeMoveResult<T> {
  readonly root: TreeNode<T>
  readonly tree: Tree<T>
  readonly source: TreeNodeLocation<T>
  readonly target: TreeNodeLocation<T>
  readonly parentId: string
  readonly index: number
  readonly position: TreeNodeDropPosition
}

/**
 * 트리 노드를 다른 노드의 앞/뒤/자식 위치로 이동한다.
 * 루트 이동, 자기 자신/자손으로의 이동, 실제 변경이 없는 이동은 허용하지 않는다.
 */
export function moveTreeNode<T>(
  root: TreeNode<T>,
  input: TreeNodeMoveInput,
): TreeNodeMoveResult<T> | undefined {
  const tree = new Tree(root)
  const sourcePath = tree.path((node) => node.id === input.sourceId)
  const targetPath = tree.path((node) => node.id === input.targetId)

  if (!sourcePath || !targetPath) {
    return undefined
  }

  const source = createTreeNodeLocation(sourcePath)
  const target = createTreeNodeLocation(targetPath)

  if (
    source.node.id === root.id
    || source.node.id === target.node.id
    || targetPath.some((node) => node.id === source.node.id)
  ) {
    return undefined
  }

  const destination = resolveTreeNodeDestination(source, target, input.position)

  if (!destination) {
    return undefined
  }

  const sourceParentId = source.parent?.id
  if (sourceParentId === destination.parentId && source.index === destination.index) {
    return undefined
  }

  const removedTree = tree.remove(source.node.id)
  const movedTree = removedTree?.insert(
    destination.parentId,
    source.node,
    destination.index,
  )

  if (!movedTree) {
    return undefined
  }

  return {
    root: movedTree.root,
    tree: movedTree,
    source,
    target,
    parentId: destination.parentId,
    index: destination.index,
    position: input.position,
  }
}

function createTreeNodeLocation<T>(
  path: readonly TreeNode<T>[],
): TreeNodeLocation<T> {
  const node = path[path.length - 1]
  const parent = path[path.length - 2]
  const index = parent
    ? childrenOfTreeNode(parent).findIndex((child) => child.id === node.id)
    : -1

  return {
    node,
    parent,
    index,
    path,
  }
}

function resolveTreeNodeDestination<T>(
  source: TreeNodeLocation<T>,
  target: TreeNodeLocation<T>,
  position: TreeNodeDropPosition,
): { readonly parentId: string, readonly index: number } | undefined {
  if (position === 'inside') {
    const index = childrenOfTreeNode(target.node).length

    return adjustTreeNodeDestinationIndex(source, {
      parentId: target.node.id,
      index,
    })
  }

  if (!target.parent) {
    return undefined
  }

  return adjustTreeNodeDestinationIndex(source, {
    parentId: target.parent.id,
    index: target.index + (position === 'after' ? 1 : 0),
  })
}

function adjustTreeNodeDestinationIndex<T>(
  source: TreeNodeLocation<T>,
  destination: { readonly parentId: string, readonly index: number },
): { readonly parentId: string, readonly index: number } {
  if (source.parent?.id !== destination.parentId || source.index >= destination.index) {
    return destination
  }

  return {
    parentId: destination.parentId,
    index: destination.index - 1,
  }
}

function childrenOfTreeNode<T>(node: TreeNode<T>): readonly TreeNode<T>[] {
  return node.children ?? []
}

/**
 * 트리를 컬렉션처럼 다루는 iterable 클래스다.
 */
export class Tree<T> implements Iterable<TreeNode<T>> {
  readonly root: TreeNode<T>

  constructor(root: TreeNode<T>) {
    this.root = Tree.normalizeNode(root)
  }

  static from<T>(root: TreeNode<T>): Tree<T> {
    return new Tree(root)
  }

  static createNode<T>(node: TreeNode<T>): TreeNode<T> {
    return Tree.normalizeNode(node)
  }

  static isLeaf<T>(node: TreeNode<T>): boolean {
    return Tree.childrenOf(node).length === 0
  }

  [Symbol.iterator](): Iterator<TreeNode<T>> {
    return this.values()
  }

  *values(): Generator<TreeNode<T>> {
    yield* this.walkNode(this.root)
  }

  /**
   * 트리를 전위 순회한다.
   */
  forEach(visitor: (node: TreeNode<T>) => void): void {
    for (const node of this) {
      visitor(node)
    }
  }

  /**
   * 조건을 만족하는 첫 번째 노드를 찾는다.
   */
  find(
    predicate: (node: TreeNode<T>) => boolean,
  ): TreeNode<T> | undefined {
    for (const node of this) {
      if (predicate(node)) {
        return node
      }
    }

    return undefined
  }

  /**
   * 각 노드 값을 변환하고 트리 구조는 유지한다.
   */
  map<U>(mapper: (node: TreeNode<T>) => U): Tree<U> {
    return new Tree(Tree.mapNode(this.root, mapper))
  }

  /**
   * 트리를 하나의 누적 값으로 접는다.
   */
  reduce<U>(
    reducer: (accumulator: U, node: TreeNode<T>) => U,
    initialValue: U,
  ): U {
    let accumulator = initialValue

    for (const node of this) {
      accumulator = reducer(accumulator, node)
    }

    return accumulator
  }

  /**
   * 순회 순서대로 모든 노드를 배열로 모은다.
   */
  toArray(): TreeNode<T>[] {
    return [...this]
  }

  /**
   * 트리의 모든 노드 개수를 센다.
   */
  count(): number {
    return this.reduce((count) => count + 1, 0)
  }

  /**
   * 루트에서 리프까지의 최대 깊이를 구한다.
   */
  depth(): number {
    return Tree.depthOfNode(this.root)
  }

  /**
   * 조건을 만족하는 첫 번째 노드까지의 경로를 반환한다.
   */
  path(
    predicate: (node: TreeNode<T>) => boolean,
  ): TreeNode<T>[] | undefined {
    const path: TreeNode<T>[] = []

    if (Tree.buildPath(this.root, predicate, path)) {
      return path
    }

    return undefined
  }

  /**
   * id가 일치하는 노드를 새 노드로 교체한다.
   */
  replace(id: string, nextNode: TreeNode<T>): Tree<T> | undefined {
    const nextRoot = Tree.replaceNode(this.root, id, nextNode)

    if (!nextRoot) {
      return undefined
    }

    return new Tree(nextRoot)
  }

  /**
   * id가 일치하는 노드를 트리에서 제거한다.
   */
  remove(id: string): Tree<T> | undefined {
    const nextRoot = Tree.removeNode(this.root, id)

    if (!nextRoot) {
      return undefined
    }

    return new Tree(nextRoot)
  }

  /**
   * parentId에 해당하는 노드의 자식으로 새 노드를 삽입한다.
   */
  insert(
    parentId: string,
    nextNode: TreeNode<T>,
    index: number = Number.POSITIVE_INFINITY,
  ): Tree<T> | undefined {
    const nextRoot = Tree.insertNode(this.root, parentId, nextNode, index)

    if (!nextRoot) {
      return undefined
    }

    return new Tree(nextRoot)
  }

  /**
   * id가 일치하는 노드를 targetId 기준 위치로 이동한다.
   */
  move(input: TreeNodeMoveInput): Tree<T> | undefined {
    return moveTreeNode(this.root, input)?.tree
  }

  private *walkNode(node: TreeNode<T>): Generator<TreeNode<T>> {
    yield node

    for (const child of Tree.childrenOf(node)) {
      yield* this.walkNode(child)
    }
  }

  private static childrenOf<T>(node: TreeNode<T>): readonly TreeNode<T>[] {
    return node.children ?? []
  }

  private static normalizeNode<T>(node: TreeNode<T>): TreeNode<T> {
    return {
      id: node.id,
      value: node.value,
      children: node.children?.map((child) => Tree.normalizeNode(child)) ?? [],
    }
  }

  private static mapNode<T, U>(
    node: TreeNode<T>,
    mapper: (node: TreeNode<T>) => U,
  ): TreeNode<U> {
    return {
      id: node.id,
      value: mapper(node),
      children: Tree.childrenOf(node).map((child) => Tree.mapNode(child, mapper)),
    }
  }

  private static depthOfNode<T>(node: TreeNode<T>): number {
    const children = Tree.childrenOf(node)

    if (children.length === 0) {
      return 1
    }

    return 1 + Math.max(...children.map((child) => Tree.depthOfNode(child)))
  }

  private static buildPath<T>(
    node: TreeNode<T>,
    predicate: (node: TreeNode<T>) => boolean,
    path: TreeNode<T>[],
  ): boolean {
    path.push(node)

    if (predicate(node)) {
      return true
    }

    for (const child of Tree.childrenOf(node)) {
      if (Tree.buildPath(child, predicate, path)) {
        return true
      }
    }

    path.pop()
    return false
  }

  private static replaceNode<T>(
    node: TreeNode<T>,
    id: string,
    nextNode: TreeNode<T>,
  ): TreeNode<T> | undefined {
    if (node.id === id) {
      return Tree.normalizeNode(nextNode)
    }

    let changed = false
    const nextChildren = Tree.childrenOf(node).map((child) => {
      const nextChild = Tree.replaceNode(child, id, nextNode)

      if (nextChild) {
        changed = true
        return nextChild
      }

      return child
    })

    if (!changed) {
      return undefined
    }

    return {
      id: node.id,
      value: node.value,
      children: nextChildren,
    }
  }

  private static removeNode<T>(
    node: TreeNode<T>,
    id: string,
  ): TreeNode<T> | undefined {
    let changed = false
    const nextChildren: TreeNode<T>[] = []

    for (const child of Tree.childrenOf(node)) {
      if (child.id === id) {
        changed = true
        continue
      }

      const nextChild = Tree.removeNode(child, id)

      if (nextChild) {
        changed = true
        nextChildren.push(nextChild)
        continue
      }

      nextChildren.push(child)
    }

    if (!changed) {
      return undefined
    }

    return {
      id: node.id,
      value: node.value,
      children: nextChildren,
    }
  }

  private static insertNode<T>(
    node: TreeNode<T>,
    parentId: string,
    nextNode: TreeNode<T>,
    index: number,
  ): TreeNode<T> | undefined {
    if (node.id === parentId) {
      const nextChildren = [...Tree.childrenOf(node)]
      const insertIndex = Math.max(0, Math.min(index, nextChildren.length))

      nextChildren.splice(insertIndex, 0, Tree.normalizeNode(nextNode))

      return {
        id: node.id,
        value: node.value,
        children: nextChildren,
      }
    }

    let changed = false
    const nextChildren = Tree.childrenOf(node).map((child) => {
      const nextChild = Tree.insertNode(child, parentId, nextNode, index)

      if (nextChild) {
        changed = true
        return nextChild
      }

      return child
    })

    if (!changed) {
      return undefined
    }

    return {
      id: node.id,
      value: node.value,
      children: nextChildren,
    }
  }
}
