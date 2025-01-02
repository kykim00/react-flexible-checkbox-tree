import { TNode, NodeId } from './types'

interface CreateNodesParams<T extends TNode, U extends TNode> {
  /** 부모 노드가 될 데이터 배열 (ex. 조직) */
  parents: T[]
  /** 자식 노드가 될 데이터 배열 (ex. 직원) */
  children?: U[]
  /** 부모 - 부모 상하관계를 체크할 key */
  parentKey: keyof T
  /** 자식 - 자식 상하관계를 체크할 key */
  childKey?: keyof U
  /** 부모 - 자식 상하관계를 체크할 key */
  parentToChildKey?: keyof U
  /** 출력 순서 */
  printChildFirst?: boolean
  /** 노드의 id 와 부모 노드 id 를 조합하여 unique 한 id 인 node.value 값을 자동 생성. 기본값 true. */
  enableUniqueId?: boolean
}

function parseValue<T extends TNode>(node: T, parentKey: keyof T, enableUniqueId = true) {
  return enableUniqueId ? `${node.id}_${node[parentKey] ?? ''}` : node.id
}

export const createNodes = <T extends TNode, U extends TNode>({
  parents,
  children,
  parentKey,
  childKey,
  parentToChildKey,
  printChildFirst = false,
  enableUniqueId = true,
}: CreateNodesParams<T, U>): TNode[] => {
  const tree: { [key: NodeId]: TNode } = {}
  const rootNodes: TNode[] = []

  for (const parent of parents) {
    const node: TNode = {
      ...parent,
      nodeType: 'parent',
      children: [],
      hasChildType: false,
      value: parseValue(parent, parentKey, enableUniqueId),
    }

    tree[parent.id] = node

    if (parent && parent[parentKey] != null) {
      const parentGroupId = parent[parentKey] as number
      if (!(parentGroupId in tree)) {
        tree[parentGroupId] = {
          ...parent,
          nodeType: 'parent',
          children: [],
          hasChildType: false,
          value: parseValue(parent, parentGroupId, enableUniqueId),
        }
      }
      tree[parentGroupId].children?.push(node)
    } else {
      rootNodes.push(node)
    }
  }

  if (children) {
    const childrenTree: { [key: NodeId]: TNode } = {}

    for (const child of children) {
      childrenTree[child.id] = {
        ...child,
        nodeType: 'children',
        children: [],
        hasChildType: true,
        value: parseValue(child, parentToChildKey || 'no-item', enableUniqueId), // value: ${child.id} or ${child.id}_${parent.id}
      }

      if (parentToChildKey && child[parentToChildKey] in tree) {
        const parentTypeFirstIndex =
          tree[child[parentToChildKey]].children?.findIndex((item) => item.nodeType === 'parent') === -1
            ? tree[child[parentToChildKey]].children?.length
            : tree[child[parentToChildKey]].children?.findIndex((item) => item.nodeType === 'parent')

        if (!childKey || !child[childKey]) {
          printChildFirst
            ? tree[child[parentToChildKey]].children?.splice(parentTypeFirstIndex!, 0, childrenTree[child.id])
            : tree[child[parentToChildKey]]?.children?.push(childrenTree[child.id])
        }
      }

      if (childKey && child[childKey]) {
        const parentIdOfChild = child[childKey] as number
        if (!(parentIdOfChild in childrenTree)) {
          childrenTree[parentIdOfChild] = {
            ...child,
            nodeType: 'children',
            children: [],
            hasChildType: true,
            value: parseValue(child, parentIdOfChild, enableUniqueId),
          }
        }
        childrenTree[parentIdOfChild].children?.push(childrenTree[child.id])
      }
    }
  }

  const updateHasChildType = (nodes: TNode[]): void => {
    const stack: TNode[] = [...nodes]
    const visited: Set<NodeId> = new Set()

    while (stack.length > 0) {
      const node = stack[stack.length - 1]

      if (visited.has(node.id)) {
        stack.pop()
        continue
      }

      let allChildrenVisited = true
      for (const child of node.children || []) {
        if (!visited.has(child.id)) {
          stack.push(child)
          allChildrenVisited = false
        }
      }

      if (allChildrenVisited) {
        visited.add(node.id)
        node.hasChildType = node.nodeType === 'children' || (node.children || []).some((child) => child.hasChildType)

        if (node.hasChildType && node.parent_node_id) {
          const parent = nodes.find((n) => n.id === node.parent_node_id)
          if (parent && !visited.has(parent.id)) {
            stack.push(parent)
          }
        }
      }
    }
  }

  updateHasChildType(rootNodes)

  return rootNodes
}
