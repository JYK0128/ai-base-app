import { describe, expect, it } from 'vitest'

import { moveTreeNode, type TreeNode } from './tree'

interface NodeValue {
  readonly label: string
}

const createTree = (): TreeNode<NodeValue> => ({
  id: 'root',
  value: { label: 'Root' },
  children: [
    {
      id: 'a',
      value: { label: 'A' },
      children: [
        { id: 'a1', value: { label: 'A1' } },
        { id: 'a2', value: { label: 'A2' } },
      ],
    },
    {
      id: 'b',
      value: { label: 'B' },
      children: [
        { id: 'b1', value: { label: 'B1' } },
      ],
    },
    { id: 'c', value: { label: 'C' } },
  ],
})

describe('moveTreeNode', () => {
  it('moves a parent before another parent', () => {
    const result = moveTreeNode(createTree(), {
      sourceId: 'c',
      targetId: 'a',
      position: 'before',
    })

    expect(serialize(result?.root)).toBe('c|a[a1,a2]|b[b1]')
  })

  it('moves a parent after another parent', () => {
    const result = moveTreeNode(createTree(), {
      sourceId: 'a',
      targetId: 'c',
      position: 'after',
    })

    expect(serialize(result?.root)).toBe('b[b1]|c|a[a1,a2]')
  })

  it('moves a parent inside another parent', () => {
    const result = moveTreeNode(createTree(), {
      sourceId: 'b',
      targetId: 'a',
      position: 'inside',
    })

    expect(serialize(result?.root)).toBe('a[a1,a2,b[b1]]|c')
  })

  it('moves a parent before a child', () => {
    const result = moveTreeNode(createTree(), {
      sourceId: 'b',
      targetId: 'a1',
      position: 'before',
    })

    expect(serialize(result?.root)).toBe('a[b[b1],a1,a2]|c')
  })

  it('moves a parent after a child', () => {
    const result = moveTreeNode(createTree(), {
      sourceId: 'b',
      targetId: 'a1',
      position: 'after',
    })

    expect(serialize(result?.root)).toBe('a[a1,b[b1],a2]|c')
  })

  it('moves a child before another child in the same parent', () => {
    const result = moveTreeNode(createTree(), {
      sourceId: 'a2',
      targetId: 'a1',
      position: 'before',
    })

    expect(serialize(result?.root)).toBe('a[a2,a1]|b[b1]|c')
  })

  it('moves a child after a parent', () => {
    const result = moveTreeNode(createTree(), {
      sourceId: 'a1',
      targetId: 'b',
      position: 'after',
    })

    expect(serialize(result?.root)).toBe('a[a2]|b[b1]|a1|c')
  })

  it('moves a child inside another child', () => {
    const result = moveTreeNode(createTree(), {
      sourceId: 'a1',
      targetId: 'b1',
      position: 'inside',
    })

    expect(serialize(result?.root)).toBe('a[a2]|b[b1[a1]]|c')
  })

  it('moves a node back inside the root', () => {
    const result = moveTreeNode(createTree(), {
      sourceId: 'a1',
      targetId: 'root',
      position: 'inside',
    })

    expect(serialize(result?.root)).toBe('a[a2]|b[b1]|c|a1')
  })

  it('rejects moving the root', () => {
    const result = moveTreeNode(createTree(), {
      sourceId: 'root',
      targetId: 'a',
      position: 'inside',
    })

    expect(result).toBeUndefined()
  })

  it('rejects moving a node into itself', () => {
    const result = moveTreeNode(createTree(), {
      sourceId: 'a',
      targetId: 'a',
      position: 'inside',
    })

    expect(result).toBeUndefined()
  })

  it('rejects moving a node relative to its descendant', () => {
    const beforeResult = moveTreeNode(createTree(), {
      sourceId: 'a',
      targetId: 'a1',
      position: 'before',
    })
    const afterResult = moveTreeNode(createTree(), {
      sourceId: 'a',
      targetId: 'a1',
      position: 'after',
    })
    const insideResult = moveTreeNode(createTree(), {
      sourceId: 'a',
      targetId: 'a1',
      position: 'inside',
    })

    expect(beforeResult).toBeUndefined()
    expect(afterResult).toBeUndefined()
    expect(insideResult).toBeUndefined()
  })

  it('rejects before and after drops against the root', () => {
    const beforeResult = moveTreeNode(createTree(), {
      sourceId: 'a',
      targetId: 'root',
      position: 'before',
    })
    const afterResult = moveTreeNode(createTree(), {
      sourceId: 'a',
      targetId: 'root',
      position: 'after',
    })

    expect(beforeResult).toBeUndefined()
    expect(afterResult).toBeUndefined()
  })

  it('rejects missing source and target ids', () => {
    const missingSource = moveTreeNode(createTree(), {
      sourceId: 'missing',
      targetId: 'a',
      position: 'inside',
    })
    const missingTarget = moveTreeNode(createTree(), {
      sourceId: 'a',
      targetId: 'missing',
      position: 'inside',
    })

    expect(missingSource).toBeUndefined()
    expect(missingTarget).toBeUndefined()
  })

  it('rejects no-op adjacent moves', () => {
    const beforeResult = moveTreeNode(createTree(), {
      sourceId: 'a',
      targetId: 'b',
      position: 'before',
    })
    const afterResult = moveTreeNode(createTree(), {
      sourceId: 'b',
      targetId: 'a',
      position: 'after',
    })

    expect(beforeResult).toBeUndefined()
    expect(afterResult).toBeUndefined()
  })
})

function serialize(root: TreeNode<NodeValue> | undefined): string {
  return root?.children?.map(serializeNode).join('|') ?? ''
}

function serializeNode(node: TreeNode<NodeValue>): string {
  const children = node.children ?? []

  if (children.length === 0) {
    return node.id
  }

  return `${node.id}[${children.map(serializeNode).join(',')}]`
}
