import { FlatNode, TNode } from '../types.ts'
import { memoize } from './memoize.ts'

type FlatNodes = { [key: string]: FlatNode }
function flattenNodes(nodes: TNode[], parent = {} as FlatNode, depth = 1): FlatNodes {
  const flatNodes: FlatNodes = {}

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return flatNodes
  }

  nodes.forEach((node, index) => {
    const isParent = Array.isArray(node.children) && node.children.length > 0
    const nodeId = node.value || `${node.id}_${parent?.id ?? ''}`

    Object.assign(flatNodes, {
      [nodeId]: {
        ...node,
        parent,
        value: nodeId,
        isChild: parent && 'id' in parent && parent.id !== undefined,
        isParent,
        isLeaf: !isParent,
        showCheckbox: node.showCheckbox !== undefined ? node.showCheckbox : true,
        treeDepth: depth,
        index,
      },
    })

    if (node.children) {
      const childNodes = flattenNodes(node.children, parent, depth + 1)
      Object.assign(flatNodes, childNodes)
    }
  })

  return flatNodes
}

export const memoizedFlattenNodes = memoize(flattenNodes)
