import { FlatNode, TNode } from './types.ts'
import { memoize } from './utils/memoize.ts'

type FlatNodes = { [key: string]: FlatNode }

function flattenNodes(nodes: TNode[], parent = {} as FlatNode, depth = 1): FlatNodes {
  const flatNodes: FlatNodes = {}

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return flatNodes
  }

  nodes.forEach((node, index) => {
    const isParent = Array.isArray(node.children) && node.children.length > 0

    const nodeId = `${node.id}_${parent?.id ?? ''}`

    if (flatNodes[nodeId] !== undefined) {
      throw new Error(`parent ${parent?.id} 에 node.id ${node.id}가 중복되었습니다.`)
    }

    Object.assign(flatNodes, {
      [nodeId]: {
        ...node,
        parent,
        isChild: parent && 'id' in parent && parent.id !== undefined,
        isParent,
        isLeaf: !isParent,
        showCheckbox: node.showCheckbox !== undefined ? node.showCheckbox : true,
        treeDepth: depth,
        index,
      },
    })

    if (node.children) {
      flattenNodes(node.children, flatNodes[nodeId], depth + 1)
    }
  })

  return flatNodes
}

export const memoizedFlattenNodes = memoize(flattenNodes)
