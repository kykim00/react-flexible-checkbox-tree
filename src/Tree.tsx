'use client'

import { FlatNode, NodeId, TreeProps } from './types'
import TreeNode from './TreeNode'
import { forwardRef, useEffect, useMemo } from 'react'
import { useTree } from './useTree'
import { memoizedFlattenNodes } from './flattenNodes'

/**
 *
 * 트리 컴포넌트
 *
 * @param nodes 트리를 구성하는 노드 객체 배열. 필수값
 * @param checked 체크된 노드의 id 배열. 기본값은 []
 * @param checkModel checked 에 포함될 수 있는 노드를 지정하는 값. 'leaf', 'all' 이 올 수 있다. 기본값은 'leaf'
 * @param onlyLeafCheckboxes leaf 노드만 체크박스를 표시할지 여부. 기본값은 false
 * @param initialExpanded 초기에 확장될 노드의 id 배열. 기본값은 []
 * @param forceExpanded 노드를 강제로 확장시키기 위한 값. boolean 또는 양의 정수가 올 수 있다. true 인 경우 모든 노드 확장. 숫자인 경우 depth 가 해당 숫자 이하인 노드 확장. 기본값은 false
 * @param onCheck 체크 상태가 변경될 때 호출되는 함수.
 * @param onClick 노드 label 클릭 시 호출되는 함수.
 * @param expandOnClick 노드 클릭 시 확장할지 여부.
 * @param checkOnClick 노드 클릭 시 체크할지 여부.
 * @param showChildrenCount 각 노드의 children 수 표시 여부. 기본값은 false
 * @param defaultCollapseIcon 노드 접기 아이콘.
 * @param defaultExpandIcon 노드 확장 아이콘.
 * @param noCheckboxes 체크박스를 전혀 표시하지 않을지 여부. 기본값은 false
 * @param selctable 선택이 가능한 노드인지 여부. boolean 또는 (node) => boolean 함수.  기본값은 true
 * @param customSelectStyle 선택 노드에 적용할 스타일.
 * @param boldLabelModel bold label 스타일을 지정할 노드를 선택하는 값. 'parent', 'all', 양의 정수가 올 수 있다. parent 인 경우 leaf 노드를 제외한 노드에 적용된다. 숫자인 경우 depth 가 해당 숫자 이하인 노드에 적용된다. 기본값은 2
 * @param className 최상단 클래스 추가.
 * @param hideEmptyRootNode 루트 노드의 children 이 없을 경우 해당 루트 노드를 표시 할지 여부. 기본값은 false
 * @param hideCheckboxEmptyNode 노드의 children 이 없을 경우 해당 노드에 체크박스를 표시할지 여부. 기본값은 false
 * @param useKeyboardNavigation 키보드 방향키 입력으로 트리 확장, 축소, 선택 동작할 지 여부. 기본값은 false
 * @param itemHeight 노드의 높이. 기본값은 26
 * @param disableCheckboxesOfNoLeaf createNodes로 tree를 생성한 경우, children이 하나도 없는 트리의 체크 박스 활성화 여부, 기본값은 false
 * @returns 트리 컴포넌트
 */

export const Tree = forwardRef<HTMLUListElement, TreeProps<number>>((props, ref) => {
  const {
    onCheck,
    onSelect,
    expandOnClick = false,
    checkOnClick = false,
    showChildrenCount = false,
    defaultCollapseIcon = '+',
    defaultExpandIcon = '-',
    noCheckboxes = false,
    selectable = true,
    checkModel = 'leaf',
    customSelectStyle,
    boldLabelModel = 2,
    className,
    onlyLeafCheckboxes = false,
    forceExpand = false,
    onExpand,
    initialExpanded = [],
    hideEmptyRootNode = false,
    hideCheckboxEmptyNode = false,
    itemHeight,
    initialSelected = null,
    // useKeyboardNavigation,
    nodes,
    checked,
    disableCheckboxesOfNoLeaf = false,
  } = props

  const defaultController = useTree({
    initialCheckedState: checked,
    initialExpandedState: initialExpanded,
    initialSelectedState: initialSelected,
    checkModel,
  })

  const controller = defaultController

  useEffect(() => {
    controller.initialize(nodes, forceExpand)
  }, [nodes, forceExpand])

  const flatNodes = useMemo(() => memoizedFlattenNodes({ nodes }), [nodes])

  const onClickHandler = (nodeId: NodeId) => {
    expandOnClick && onExpandHandler(nodeId)
    checkOnClick && onCheckHandler(nodeId)
    if (isSelectable(flatNodes[nodeId])) {
      isSelectable(flatNodes[nodeId]) && controller.select(nodeId)
      onSelect?.(parseOriginalId(nodeId), flatNodes[nodeId])
    }
  }

  const parseOriginalId = (value: NodeId) => {
    return typeof value === 'number' ? value : Number(value.split('_')[0])
  }

  const onCheckHandler = (nodeId: NodeId) => {
    const checked = controller.isNodeChecked(nodeId)
    const checkedState = checked ? controller.uncheckNode(nodeId) : controller.checkNode(nodeId)

    const checkedNodeInfos = Object.values(flatNodes).filter((flatNode) => checkedState.includes(flatNode.value))
    const checkedNodeIds = checkedNodeInfos.map((node) => node.id)

    onCheck?.(checkedNodeIds, checkedNodeInfos)
  }

  const onExpandHandler = (nodeId: NodeId) => {
    controller.toggleExpanded(nodeId)
    onExpand?.(
      flatNodes[nodeId].id,
      Object.entries(controller.expandedState)
        .filter(([_, expanded]) => expanded)
        .map(([id]) => id)
        .map(parseOriginalId),
    )
  }

  const isSelectable = (node: FlatNode) => {
    return typeof selectable === 'function' ? selectable(node) : selectable
  }

  const isBoldLabel = (node: FlatNode) => {
    if (!node) return false

    if (typeof boldLabelModel === 'number') return node.treeDepth <= boldLabelModel

    if (typeof boldLabelModel === 'function') return boldLabelModel(node)

    if (boldLabelModel === 'parent') return node.isParent

    return true
  }

  const isShowCheckbox = (node: FlatNode) => {
    if (noCheckboxes) return false

    if (onlyLeafCheckboxes && !node.isLeaf) return false

    if (hideCheckboxEmptyNode && node.treeDepth === 1 && !node.children.length) return false

    return true
  }

  const treeNodes = nodes.map((node) => {
    if (hideEmptyRootNode && !node.children?.length) return null

    return (
      <TreeNode
        key={node.id}
        flatNodes={flatNodes}
        nodeId={node.value || node.id}
        controller={controller}
        showChildrenCount={showChildrenCount}
        expandOnClick={expandOnClick}
        checkOnClick={checkOnClick}
        customSelectStyle={customSelectStyle}
        onCheck={onCheckHandler}
        onClick={onClickHandler}
        onExpand={onExpandHandler}
        expandIcon={defaultExpandIcon}
        collapseIcon={defaultCollapseIcon}
        depth={1}
        isBoldLabel={isBoldLabel}
        isShowCheckbox={isShowCheckbox}
        itemHeight={itemHeight}
        disableCheckboxesOfNoLeaf={disableCheckboxesOfNoLeaf && !node.hasChildType}
        // isCurrentCursor={cursor === node.id}
      />
    )
  })
  return (
    <ul className={className} ref={ref}>
      {treeNodes}
    </ul>
  )
})

Tree.displayName = 'Tree'
