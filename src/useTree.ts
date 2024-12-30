import { useCallback, useState } from 'react'
import { CheckedNodeStatus, getAllCheckedNodes, isNodeChecked, isNodeIndeterminate } from './utils/checkHandler.ts'
import type { TreeNodeData } from './types'
import { getChildrenNodesValues, getAllChildrenNodes, getAllLeafNodes } from './utils/getChildrenValues.ts'

export type TreeExpandedState = Record<string, boolean>

function getInitialTreeExpandedState(
  initialState: TreeExpandedState,
  data: TreeNodeData[],
  value: string | undefined,
  acc: TreeExpandedState = {},
): TreeExpandedState {
  data.forEach((node) => {
    acc[node.value] = node.value in initialState ? initialState[node.value] : node.value === value

    if (Array.isArray(node.children)) {
      getInitialTreeExpandedState(initialState, node.children, value, acc)
    }
  })

  return acc
}

function getInitialCheckedState(initialState: string[], data: TreeNodeData[]): string[] {
  const acc: string[] = []

  initialState.forEach((node) => acc.push(...getChildrenNodesValues(node, data)))

  return Array.from(new Set(acc))
}

export interface UseTreeInput {
  /** 초기 확장된 노드 상태 */
  initialExpandedState?: TreeExpandedState
  /** 초기 선택된 노드 값 */
  initialSelectedState?: string
  /** 초기 체크된 노드 상태 */
  initialCheckedState?: string[]
  /** 노드 확장 시 콜백 */
  onNodeExpand?: (value: string) => void
  /** 노드 축소 시 콜백 */
  onNodeCollapse?: (value: string) => void
  /** 체크 시 부모 노드를 checkedState에 포함할지 여부 */
  includeParentInCheckedState?: boolean
}

export interface UseTreeReturnType {
  /** 확장된 노드 상태 */
  expandedState: TreeExpandedState
  /** 선택된 노드 값 */
  selectedState: string
  /** 체크된 노드 값 배열 */
  checkedState: string[]

  /** 트리 데이터 초기화 */
  initialize: (data: TreeNodeData[]) => void
  /** 노드 확장/축소 토글 */
  toggleExpanded: (value: string) => void
  /** 노드 축소 */
  collapse: (value: string) => void
  /** 노드 확장 */
  expand: (value: string) => void
  /** 모든 노드 확장 */
  expandAllNodes: () => void
  /** 모든 노드 축소 */
  collapseAllNodes: () => void
  /** 확장된 노드 상태 설정 */
  setExpandedState: React.Dispatch<React.SetStateAction<TreeExpandedState>>

  /** 노드 선택 */
  select: (value: string) => void
  /** 노드 선택 해제 */
  deselect: (value: string) => void
  /** 선택된 노드 상태 설정 */
  setSelectedState: React.Dispatch<React.SetStateAction<string>>

  /** 노드 체크 */
  checkNode: (value: string) => void
  /** 노드 체크 해제 */
  uncheckNode: (value: string) => void
  /** 모든 노드 체크 */
  checkAllNodes: () => void
  /** 모든 노드 체크 해제 */
  uncheckAllNodes: () => void
  /** 체크된 노드 상태 설정 */
  setCheckedState: React.Dispatch<React.SetStateAction<string[]>>

  /** 체크된 노드 정보 가져오기 */
  getCheckedNodes: () => CheckedNodeStatus[]
  /** 노드 체크 여부 확인 */
  isNodeChecked: (value: string) => boolean
  /** 노드 부분 체크 여부 확인 */
  isNodeIndeterminate: (value: string) => boolean
}

export function useTree({
  initialSelectedState,
  initialCheckedState = [],
  initialExpandedState = {},
  onNodeCollapse,
  onNodeExpand,
  includeParentInCheckedState,
}: UseTreeInput = {}): UseTreeReturnType {
  const [data, setData] = useState<TreeNodeData[]>([])
  const [expandedState, setExpandedState] = useState<TreeExpandedState>(initialExpandedState)
  const [selectedState, setSelectedState] = useState<string>(initialSelectedState || '')
  const [checkedState, setCheckedState] = useState<string[]>(initialCheckedState)

  const initialize = useCallback(
    (_data: TreeNodeData[]) => {
      setExpandedState((current) => getInitialTreeExpandedState(current, _data, selectedState))
      setCheckedState((current) => getInitialCheckedState(current, _data))
      setData(_data)
    },
    [selectedState],
  )

  const toggleExpanded = useCallback(
    (value: string) => {
      setExpandedState((current) => {
        const nextState = { ...current, [value]: !current[value] }
        nextState[value] ? onNodeExpand?.(value) : onNodeCollapse?.(value)
        return nextState
      })
    },
    [onNodeCollapse, onNodeExpand],
  )

  const collapse = useCallback(
    (value: string) => {
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
    (value: string) => {
      setExpandedState((current) => {
        if (current[value] !== true) {
          onNodeExpand?.(value)
        }
        return { ...current, [value]: true }
      })
    },
    [onNodeExpand],
  )

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

  const select = useCallback((value: string) => {
    setSelectedState(value)
  }, [])

  const deselect = useCallback(() => {
    setSelectedState('')
  }, [])

  const checkNode = useCallback(
    (value: string) => {
      const checkedNodes = getChildrenNodesValues(value, data)
      setCheckedState((current) => {
        const newCheckedState = Array.from(new Set([...current, ...checkedNodes]))
        if (includeParentInCheckedState) {
          newCheckedState.push(value) // 부모 노드도 checkedState에 포함
        }
        return newCheckedState
      })
    },
    [data, includeParentInCheckedState],
  )

  const uncheckNode = useCallback(
    (value: string) => {
      const checkedNodes = getChildrenNodesValues(value, data)
      setCheckedState((current) => current.filter((item) => !checkedNodes.includes(item)))
    },
    [data],
  )

  const checkAllNodes = useCallback(() => {
    if (includeParentInCheckedState) {
      setCheckedState(() => getAllChildrenNodes(data))
    } else {
      setCheckedState(() => getAllLeafNodes(data))
    }
  }, [data, includeParentInCheckedState])

  const uncheckAllNodes = useCallback(() => {
    setCheckedState([])
  }, [])

  const getCheckedNodes = useCallback(() => getAllCheckedNodes(data, checkedState).result, [data, checkedState])

  const _isNodeChecked = useCallback((value: string) => isNodeChecked(value, data, checkedState), [data, checkedState])

  const _isNodeIndeterminate = useCallback((value: string) => isNodeIndeterminate(value, data, checkedState), [data, checkedState])

  return {
    expandedState,
    selectedState,
    checkedState,
    initialize,

    toggleExpanded,
    collapse,
    expand,
    expandAllNodes,
    collapseAllNodes,
    setExpandedState,

    select,
    deselect,
    setSelectedState,

    checkNode,
    uncheckNode,
    checkAllNodes,
    uncheckAllNodes,
    setCheckedState,

    getCheckedNodes,
    isNodeChecked: _isNodeChecked,
    isNodeIndeterminate: _isNodeIndeterminate,
  }
}

export type TreeController = ReturnType<typeof useTree>
