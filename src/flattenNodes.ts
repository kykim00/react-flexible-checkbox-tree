import { FlatNode, TNode } from './types'
import { memoize } from './memoize'

type FlatNodes = { [key: string]: FlatNode }

function flattenNodes({ nodes, parent = {} as TNode, depth = 1 }: { nodes: TNode[]; parent?: TNode; depth?: number }): FlatNodes {
  const flatNodes: FlatNodes = {}

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return flatNodes
  }

  nodes.forEach((node, index) => {
    const isParent = Array.isArray(node.children) && node.children.length > 0
    const nodeId = node.value || node.id
    let leafCount = 0

    if (node.children) {
      const childNodes = flattenNodes({ nodes: node.children, parent: node, depth: depth + 1 })
      Object.assign(flatNodes, childNodes)

      leafCount = Object.values(childNodes).reduce((count, childNode) => count + (childNode.isLeaf ? 1 : 0), 0)
    }

    Object.assign(flatNodes, {
      [nodeId]: {
        ...node,
        parent,
        value: nodeId,
        isChild: parent && 'id' in parent && parent.id !== undefined,
        isParent,
        isLeaf: !isParent,
        treeDepth: depth,
        index,
        childrenCount: leafCount,
      },
    })
  })

  return flatNodes
}

export const memoizedFlattenNodes = memoize(flattenNodes)
