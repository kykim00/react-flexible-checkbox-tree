import { TNode } from './types.ts'

type CreateNodesInputNode = Exclude<TNode, 'value'>

interface CreateNodesParams<T extends CreateNodesInputNode, U extends CreateNodesInputNode> {
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
  /** 노드의 id 와 부모 노드 id 를 조합하여 unique 한 id 를 자동 생성. 기본값 true. */
  enableUniqueId?: boolean
}

function parseValue<T extends CreateNodesInputNode>(node: T, parentKey: keyof T, enableUniqueId = true) {
  return enableUniqueId ? `${node.id}_${node[parentKey] ?? ''}` : String(node.id)
}

export const createNodes = <T extends CreateNodesInputNode, U extends CreateNodesInputNode>({
  parents,
  children,
  parentKey,
  childKey,
  parentToChildKey,
  printChildFirst = false,
  enableUniqueId = true,
}: CreateNodesParams<T, U>): TNode[] => {
  const tree: { [key: string]: TNode } = {}
  const rootNodes: TNode[] = []

  for (const parent of parents) {
    const node: TNode = {
      ...parent,
      value: parseValue(parent, parentKey, enableUniqueId),
      children: [],
    }

    tree[parent.id] = node

    if (parent && parent[parentKey] != null) {
      const parentGroupId = parent[parentKey] as number
      if (!(parentGroupId in tree)) {
        tree[parentGroupId] = {
          ...parent,
          value: parseValue(parent, parentGroupId, enableUniqueId),
          children: [],
        }
      }
      tree[parentGroupId].children?.push(node)
    } else {
      rootNodes.push(node)
    }
  }

  if (children) {
    const childrenTree: { [key: string]: TNode } = {}

    for (const child of children) {
      childrenTree[child.id] = { ...child, children: [], value: parseValue(child, parentToChildKey || 'no-item', enableUniqueId) }

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
            value: parseValue(child, parentIdOfChild, enableUniqueId),
            children: [],
          }
        }
        childrenTree[parentIdOfChild].children?.push(childrenTree[child.id])
      }
    }
  }

  return rootNodes
}
