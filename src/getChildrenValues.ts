import { TNode, NodeId } from './types'
import { memoizedFlattenNodes } from './flattenNodes'

export function findTreeNode(value: NodeId, data: TNode[]): TNode | null {
  for (const node of data) {
    const nodeValue = node.value || node.id
    if (nodeValue === value) {
      return node
    }

    if (Array.isArray(node.children)) {
      const childNode = findTreeNode(value, node.children)
      if (childNode) {
        return childNode
      }
    }
  }

  return null
}

export function getChildrenNodesValues(value: NodeId, data: TNode[], acc: NodeId[] = []): NodeId[] {
  const node = findTreeNode(value, data)

  if (!node) {
    return acc
  }

  const nodeValue = node.value || node.id

  if (!Array.isArray(node.children) || node.children.length === 0) {
    return [nodeValue]
  }

  node.children.forEach((child) => {
    if (Array.isArray(child.children) && child.children.length > 0) {
      getChildrenNodesValues(child.value || child.id, data, acc)
    } else {
      acc.push(child.value || child.id)
    }
  })

  return acc
}

export function getAllChildrenNodes(data: TNode[]) {
  return data.reduce((acc, node) => {
    if (Array.isArray(node.children) && node.children.length > 0) {
      acc.push(...getAllChildrenNodes(node.children))
    } else {
      acc.push(node.value || node.id)
    }

    return acc
  }, [] as string[])
}

export function getAllLeafNodes(data: TNode[]) {
  const flatNodes = memoizedFlattenNodes({ nodes: data })

  return Object.values(flatNodes)
    .filter((node) => !node.children || !node.children.length)
    .map((node) => node.value || node.id)
}
