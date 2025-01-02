import { useCallback, useMemo, useState } from 'react'
import { CheckedNodeStatus, getAllCheckedNodes } from './getAllCheckedNodes'
import { CheckModel, TNode, NodeId } from './types'
import { getChildrenNodesValues, getAllChildrenNodes, getAllLeafNodes } from './getChildrenValues'
import { memoizedFlattenNodes } from './flattenNodes'

export type TreeExpandedState = Record<string, boolean>

function getInitialTreeExpandedState(initialExpanded: NodeId[], data: TNode[], acc: TreeExpandedState = {}): TreeExpandedState {
  data.forEach((node) => {
    const id = node.value || node.id
    acc[id] = initialExpanded.includes(id)

    if (Array.isArray(node.children)) {
      getInitialTreeExpandedState(initialExpanded, node.children, acc)
    }
  })

  return acc
}

function getInitialCheckedState(initialState: NodeId[], data: TNode[]): NodeId[] {
  const acc: NodeId[] = []

  initialState.forEach((node) => acc.push(...getChildrenNodesValues(node, data)))

  return Array.from(new Set(acc))
}

export interface UseTreeInput {
  /** 초기 확장된 노드 상태 */
  initialExpandedState?: NodeId[]
  /** 초기 선택된 노드 값 */
  initialSelectedState?: NodeId | null
  /** 초기 체크된 노드 상태 */
  initialCheckedState?: NodeId[]
  /** 노드 확장 시 콜백 */
  onNodeExpand?: (value: NodeId) => void
  /** 노드 축소 시 콜백 */
  onNodeCollapse?: (value: NodeId) => void
  /** checked 에 포함될 수 있는 노드를 지정하는 값. 'leaf', 'all' 이 올 수 있다. 기본값은 'leaf' */
  checkModel?: CheckModel
}

export interface UseTreeReturnType {
  /** 확장된 노드 상태 */
  expandedState: TreeExpandedState
  /** 선택된 노드 값 */
  selectedState?: NodeId | null
  /** 체크된 노드 값 배열 */
  checkedState: NodeId[]

  /** 트리 데이터 초기화 */
  initialize: (data: TNode[], forceExpand?: number | boolean) => void
  /** 노드 확장/축소 토글 */
  toggleExpanded: (value: NodeId) => void
  /** 노드 축소 */
  collapse: (value: NodeId) => void
  /** 노드 확장 */
  expand: (value: NodeId) => void
  /** 노드 일부 확장 */
  expandToLevel: (level: number | boolean, data: TNode[] | undefined, expandedState: TreeExpandedState) => void
  /** 모든 노드 확장 */
  expandAllNodes: () => void
  /** 모든 노드 축소 */
  collapseAllNodes: () => void

  /** 노드 선택 */
  select: (value: NodeId) => void
  /** 노드 선택 해제 */
  deselect: (value: NodeId) => void

  /** 노드 체크 */
  checkNode: (value: NodeId) => NodeId[]
  /** 노드 체크 해제 */
  uncheckNode: (value: NodeId) => NodeId[]
  /** 모든 노드 체크 */
  checkAllNodes: () => void
  /** 모든 노드 체크 해제 */
  uncheckAllNodes: () => void

  /** 체크된 노드 정보 */
  checkedNodeStatus: CheckedNodeStatus[]
  /** 노드 체크 여부 확인 */
  isNodeChecked: (value: NodeId) => boolean
  /** 노드 부분 체크 여부 확인 */
  isNodeIndeterminate: (value: NodeId) => boolean
}

export function useTree({
  initialSelectedState = null,
  initialCheckedState = [],
  initialExpandedState = [],
  onNodeCollapse,
  onNodeExpand,
  checkModel,
}: UseTreeInput = {}): UseTreeReturnType {
  const [data, setData] = useState<TNode[]>([])
  const [expandedState, setExpandedState] = useState<TreeExpandedState>({})
  const [selectedState, setSelectedState] = useState<NodeId | null>(initialSelectedState)
  const [checkedState, setCheckedState] = useState<NodeId[]>(initialCheckedState)

  const initialize = useCallback(
    (_data: TNode[], forceExpand?: number | boolean) => {
      setCheckedState((current) => getInitialCheckedState(current, _data))
      setData(_data)
      const initialTreeExpandedState = getInitialTreeExpandedState(initialExpandedState, _data)

      forceExpand ? expandToLevel(forceExpand, _data, initialTreeExpandedState) : setExpandedState(initialTreeExpandedState)
    },
    [selectedState],
  )

  const toggleExpanded = useCallback(
    (value: NodeId) => {
      setExpandedState((current) => {
        const nextState = { ...current, [value]: !current[value] }
        nextState[value] ? onNodeExpand?.(value) : onNodeCollapse?.(value)
        return nextState
      })
    },
    [onNodeCollapse, onNodeExpand],
  )

  const collapse = useCallback(
    (value: NodeId) => {
      setExpandedState((current) => {
        if (current[value] !== false) {
          onNodeCollapse?.(value)
        }
        return { ...current, [value]: false }
      })
    },
    [onNodeCollapse],
  )

  const expand = useCallback(
    (value: NodeId) => {
      setExpandedState((current) => {
        if (current[value] !== true) {
          onNodeExpand?.(value)
        }
        return { ...current, [value]: true }
      })
    },
    [onNodeExpand],
  )

  const expandToLevel = useCallback((level: number | boolean, _data = data, _expandedState: TreeExpandedState) => {
    if (level === true) {
      setExpandedState(Object.fromEntries(Object.entries(_expandedState).map(([id]) => [id, true])))
      return
    }

    if (!level) {
      setExpandedState(Object.fromEntries(Object.entries(_expandedState).map(([id]) => [id, false])))
      return
    }

    const flatNodes = memoizedFlattenNodes({ nodes: _data })
    const targetNodes = Object.values(flatNodes).filter((node) => node.treeDepth <= level)

    const next = { ..._expandedState }
    Object.keys(next).forEach((key) => {
      next[key] = targetNodes.some((node) => node.value === key)
    })

    setExpandedState(next)
  }, [])

  const expandAllNodes = useCallback(() => {
    setExpandedState((current) => {
      const next = { ...current }
      Object.keys(next).forEach((key) => {
        next[key] = true
      })
      return next
    })
  }, [])

  const collapseAllNodes = useCallback(() => {
    setExpandedState((current) => {
      const next = { ...current }
      Object.keys(next).forEach((key) => {
        next[key] = false
      })
      return next
    })
  }, [])

  const select = useCallback((value: NodeId) => {
    setSelectedState(value)
  }, [])

  const deselect = useCallback(() => {
    setSelectedState('')
  }, [])

  const checkNode = useCallback(
    (value: NodeId) => {
      const checkedNodes = getChildrenNodesValues(value, data)

      const newCheckedState = Array.from(new Set([...checkedState, ...checkedNodes]))

      if (checkModel === 'all') {
        newCheckedState.push(value) // 부모 노드도 checkedState에 포함
      }
      setCheckedState(newCheckedState)
      return newCheckedState
    },
    [data, checkModel, checkedState],
  )

  const uncheckNode = useCallback(
    (value: NodeId) => {
      const checkedNodes = getChildrenNodesValues(value, data)
      const newCheckedState = checkedState.filter((item) => !checkedNodes.includes(item))
      setCheckedState(newCheckedState)
      return newCheckedState
    },
    [data, checkedState],
  )

  const checkAllNodes = useCallback(() => {
    if (checkModel === 'all') {
      setCheckedState(() => getAllChildrenNodes(data))
    } else {
      setCheckedState(() => getAllLeafNodes(data))
    }
  }, [data, checkModel])

  const uncheckAllNodes = useCallback(() => {
    setCheckedState([])
  }, [])

  const checkedNodeStatus = useMemo(() => getAllCheckedNodes(data, checkedState).result, [data, checkedState])

  const _isNodeChecked = useCallback(
    (value: NodeId) => checkedNodeStatus.find((checkedNode) => checkedNode.value === value)?.checked || false,
    [data, checkedState],
  )

  const _isNodeIndeterminate = useCallback(
    (value: NodeId) => checkedNodeStatus.find((checkedNode) => checkedNode.value === value)?.indeterminate || false,
    [data, checkedState],
  )

  return {
    expandedState,
    selectedState,
    checkedState,
    initialize,

    toggleExpanded,
    collapse,
    expand,
    expandToLevel,
    expandAllNodes,
    collapseAllNodes,

    select,
    deselect,

    checkNode,
    uncheckNode,
    checkAllNodes,
    uncheckAllNodes,

    checkedNodeStatus,
    isNodeChecked: _isNodeChecked,
    isNodeIndeterminate: _isNodeIndeterminate,
  }
}

export type TreeController = UseTreeReturnType
