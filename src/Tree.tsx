'use client'

import { FlatNode, TNode, TreeProps } from './types'
import TreeNode from './TreeNode'
import NodeModel from './NodeModel'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { memoizedFlattenNodes } from './utils/flattenNodes.ts'

/**
 *
 * 트리 컴포넌트
 *
 * @param nodes 트리를 구성하는 노드 객체 배열. 필수값
 * @param checked 체크된 노드의 id 배열. 기본값은 []
 * @param checkModel checked 에 포함될 수 있는 노드를 지정하는 값. 'leaf', 'all' 이 올 수 있다. 기본값은 'leaf'
 * @param customCheckModel checked 에 포함될 수 있는 노드를 지정하는 값. checkModel 의 설정을 무시한다. customCheckModel 과 node.type 이 걑은 노드만 checked 에 포함될 수 있다.
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
 * @param noHoverStyle 호버 스타일을 제거할지 여부. 기본값은 false
 * @param selctable 선택이 가능한 노드인지 여부. boolean 또는 (node) => boolean 함수.  기본값은 true
 * @param customSelectStyle 선택 노드에 적용할 스타일.
 * @param boldLabelModel bold label 스타일을 지정할 노드를 선택하는 값. 'parent', 'all', 양의 정수가 올 수 있다. parent 인 경우 leaf 노드를 제외한 노드에 적용된다. 숫자인 경우 depth 가 해당 숫자 이하인 노드에 적용된다. 기본값은 2
 * @param className 최상단 클래스 추가.
 * @param hideEmptyRootNode 루트 노드의 children 이 없을 경우 해당 루트 노드를 표시 할지 여부. 기본값은 false
 * @param hideCheckboxEmptyNode 노드의 children 이 없을 경우 해당 노드에 체크박스를 표시할지 여부. 기본값은 false
 * @param useKeyboardNavigation 키보드 방향키 입력으로 트리 확장, 축소, 선택 동작할 지 여부. 기본값은 false
 * @param outerRef 트리를 감싸는 container ref
 * @param itemHeight 노드의 높이. 기본값은 26
 * @param disableCheckboxesOfNoLeaf createNodes로 tree를 생성한 경우, children이 하나도 없는 트리의 체크 박스 활성화 여부, 기본값은 false
 * @returns 트리 컴포넌트
 */

export const Tree = forwardRef<HTMLUListElement, TreeProps<number>>((props, ref) => {
  const [prevNodes, setPrevNodes] = useState<TNode[] | null>(null)
  const nodes = prevNodes ?? props.nodes

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const flatNodes = useMemo(() => memoizedFlattenNodes(nodes, {}, 1), [nodes])

  const [model, setModel] = useState(getNewModel())

  function getNewModel() {
    const newModel = new NodeModel(props)
    newModel.flattenNodes(props.nodes)
    newModel.setCheckedNodes(props.checked ?? [])
    return newModel
  }

  if (JSON.stringify(prevNodes) !== JSON.stringify(props.nodes)) {
    setModel(getNewModel())
    setPrevNodes(props.nodes)
  }

  const {
    onCheck,
    onClick,
    expandOnClick = false,
    checkOnClick = false,
    showChildrenCount = false,
    defaultCollapseIcon = '+',
    defaultExpandIcon = '-',
    noCheckboxes = false,
    noHoverStyle = false,
    selectable = true,
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
    useKeyboardNavigation,
    outerRef,
    disableCheckboxesOfNoLeaf = false,
  } = props

  const initialSelectedNodeId = initialSelected ? model.getNodeId(initialSelected) : null

  const [cursor, setCursor] = useState<number | null>(null)
  const [prevInitialExpanded, setPrevInitialExpanded] = useState(initialExpanded)
  const [expanded, setExpanded] = useState(prevInitialExpanded)

  // if (!isEqual(prevInitialExpanded, initialExpanded)) {
  //   setPrevInitialExpanded(initialExpanded)
  //   setExpanded(initialExpanded)
  // }

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialSelectedNodeId)

  useEffect(() => {
    const newModel = model.clone()
    newModel.setProps(props)
    newModel.setCheckModel(props)
    setModel(newModel)
  }, [props.checkModel, props.customCheckModel])

  const [internalChecked, setInternalChecked] = useState(props.checked ?? [])

  useEffect(() => {
    if (!props.checked) return

    // if (!isEqual(props.checked, internalChecked)) {
    const newModel = model.clone()
    newModel.setCheckedNodes(props.checked)
    setModel(newModel)
    setInternalChecked(props.checked)
    // }
  }, [props.checked])

  useEffect(() => {
    if (forceExpand) {
      const cpyModel = model.clone()
      const nodes = cpyModel.getAllNodes()

      if (typeof forceExpand === 'number') {
        setExpanded(nodes.filter((node) => node.treeDepth <= forceExpand).map((node) => node.id))
      } else {
        setExpanded(nodes.map((node) => node.id))
      }
    } else {
      setExpanded(initialExpanded)
    }
  }, [forceExpand])

  const onClickHandler = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    onClick?.(model.parseId(nodeId), model.getNode(nodeId))
  }

  const onCheckHandler = (nodeInfo: { id: string; checked: boolean }) => {
    const newModel = model.clone()
    newModel.toggleChecked(nodeInfo.id, nodeInfo.checked)
    setModel(newModel)
    const { ids, infos } = newModel.getCheckedNodeInfos()
    onCheck?.(ids, infos)
    setInternalChecked(ids)
  }

  const onExpandHandler = (nodeId: string) => {
    const id = model.parseId(nodeId)
    const nextExpanded = expanded.includes(id) ? expanded.filter((prev) => prev !== id) : [...expanded, id]

    setExpanded(nextExpanded)
    onExpand?.(id, nextExpanded)
  }

  const determineShallowCheckState = (node: TNode, nodeId: string) => {
    const flatNode = model.getNode(nodeId)

    if (disableCheckboxesOfNoLeaf && !node.hasChildType) {
      return 0
    }
    if (flatNode.isLeaf || (node.children && node.children.length === 0)) {
      return flatNode.checked ? 1 : 0
    }

    if (isEveryChildChecked(node)) {
      return 1
    }

    if (isSomeChildChecked(node)) {
      return 2
    }

    return flatNode.checked ? 1 : 0
  }

  const isEveryChildChecked = (node: TNode) => {
    return node.children?.every((child) => model.getNode(`${child.id}_${node.id}`).checkState === 1)
  }

  const isSomeChildChecked = (node: TNode) => {
    return node.children?.some((child) => model.getNode(`${child.id}_${node.id}`).checkState > 0)
  }

  const isSelectable = (node: FlatNode) => {
    return typeof selectable === 'function' ? selectable(node) : selectable
  }

  const getChildrenCount = (id: string) => {
    if (props.customCheckModel) {
      return model.getCustomCheckModelChildrenCount(id)
    }
    if (props.checkModel === 'leaf') {
      return model.getLeafChildrenCount(id)
    }
    return model.getChildrenCount(id)
  }

  const calculatePaddingLeft = (node: FlatNode) => {
    const basePadding = 12
    let indent = 0

    if (!node.isParent) {
      indent += 20
    }

    return basePadding + 24 * (node.treeDepth - 1) + indent
  }

  const getStyles = (node: FlatNode) => {
    const selectable = isSelectable(node)
    const nodeId = `${node.id}_${node.parent?.id || ''}`
    const ariaSelected = (selectable && selectedNodeId === nodeId) || initialSelected === node.id ? 'true' : undefined

    return {
      ...(ariaSelected === 'true' ? customSelectStyle : {}),
      ...(itemHeight ? { height: itemHeight } : {}),
      paddingLeft: calculatePaddingLeft(node),
    }
  }

  const treeNodes = nodes.map((node) => {
    return (
      <TreeNode
        key={node.id}
        model={model}
        node={node}
        parentId={null}
        flatNodes={flatNodes}
        getStyles={getStyles}
        onExpand={onExpandHandler}
        expanded={expanded}
      />
    )
  })
  //
  // const renderTreeNodes = (nodes: TNode[], parent = {} as { id: number }) => {
  //   const treeNodes = nodes.map((node) => {
  //     const nodeId = `${node.id}_${parent?.id ?? ''}`
  //     const key = nodeId
  //     const flatNode = model.getNode(nodeId)
  //     const children = flatNode.isParent ? renderTreeNodes(node.children!, node) : null
  //
  //     flatNode.checkState = determineShallowCheckState(node, nodeId)
  //
  //     let showCheckbox = flatNode.showCheckbox
  //
  //     if (noCheckboxes) {
  //       showCheckbox = false
  //     } else if (hideCheckboxEmptyNode) {
  //       showCheckbox = flatNode.treeDepth === 1 ? flatNode.children.length > 0 : flatNode.showCheckbox
  //     } else if (onlyLeafCheckboxes) {
  //       showCheckbox = flatNode.isLeaf
  //     }
  //
  //     const parentExpanded = parent.id ? expanded.includes(parent.id) : true
  //
  //     const isBoldLabel =
  //       typeof boldLabelModel === 'number'
  //         ? flatNode.treeDepth <= boldLabelModel
  //         : typeof boldLabelModel === 'function'
  //           ? boldLabelModel(flatNode)
  //           : boldLabelModel === 'parent'
  //             ? flatNode.isParent
  //             : true
  //
  //     const isExpanded = expanded.includes(node.id)
  //
  //     const isEmptyRootNode = flatNode.treeDepth === 1 && flatNode.children && flatNode.children.length > 0
  //
  //     if (!parentExpanded) {
  //       return null
  //     }
  //
  //     if (isEmptyRootNode && hideEmptyRootNode) {
  //       return null
  //     }
  //
  //     return (
  //       <TreeNode
  //         key={key}
  //         checked={flatNode.checkState}
  //         expandOnClick={expandOnClick}
  //         checkOnClick={checkOnClick}
  //         isExpanded={isExpanded}
  //         isLeaf={flatNode.isLeaf || flatNode?.children.length === 0}
  //         isParent={flatNode.isParent}
  //         label={node.label}
  //         showCheckbox={showCheckbox}
  //         nodeId={nodeId}
  //         onCheck={onCheckHandler}
  //         onClick={onClickHandler}
  //         onExpand={onExpandHandler}
  //         expandIcon={defaultExpandIcon}
  //         collapseIcon={defaultCollapseIcon}
  //         noHoverStyle={noHoverStyle}
  //         depth={flatNode.treeDepth}
  //         selected={selectedNodeId === nodeId || initialSelected === node.id}
  //         isBoldLabel={isBoldLabel}
  //         selectable={isSelectable(flatNode)}
  //         customSelectStyle={customSelectStyle}
  //         showChildrenCount={showChildrenCount}
  //         getChildrenCount={getChildrenCount}
  //         itemHeight={itemHeight}
  //         isCurrentCursor={cursor === node.id}
  //         disableCheckboxesOfNoLeaf={disableCheckboxesOfNoLeaf && !node.hasChildType}
  //       >
  //         {children}
  //       </TreeNode>
  //     )
  //   })
  //
  //   return (
  //   )
  // }

  return (
    <ul ref={ref} className={className} style={{ minWidth: '100%', width: 'max-content' }}>
      {treeNodes}
    </ul>
  )
})

Tree.displayName = 'Tree'
