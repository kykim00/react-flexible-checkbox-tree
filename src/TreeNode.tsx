import React from 'react'
import { TreeNodeProps } from './types'
import checkboxClasses from './checkbox.module.css'

const TreeNode = (props: TreeNodeProps) => {
  const {
    expandOnClick,
    checkOnClick,
    flatNodes,
    nodeId,
    onCheck,
    onExpand,
    onClick,
    expandIcon,
    collapseIcon,
    depth = 1,
    controller,
    isBoldLabel,
    customSelectStyle,
    showChildrenCount,
    itemHeight,
    disableCheckboxesOfNoLeaf,
    isShowCheckbox,
  } = props

  const flatNode = flatNodes[nodeId]
  const isExpanded = controller.expandedState[nodeId]

  const isParent = flatNode.isParent
  const isLeaf = flatNode.isLeaf

  const isNodeChecked = controller.isNodeChecked(nodeId)
  const isNodeIndeterminate = controller.isNodeIndeterminate(nodeId)
  const ariaSelected = controller.selectedState === nodeId ? 'true' : undefined
  const showCheckbox = isShowCheckbox?.(flatNode)

  const nested = (flatNode?.children || []).map((child) => (
    <TreeNode
      key={child.id}
      flatNodes={flatNodes}
      nodeId={child.value || child.id}
      controller={controller}
      showChildrenCount={showChildrenCount}
      expandOnClick={expandOnClick}
      checkOnClick={checkOnClick}
      customSelectStyle={customSelectStyle}
      onCheck={onCheck}
      onClick={onClick}
      onExpand={onExpand}
      expandIcon={expandIcon}
      collapseIcon={collapseIcon}
      depth={depth + 1}
      isBoldLabel={isBoldLabel}
      isShowCheckbox={isShowCheckbox}
      itemHeight={itemHeight}
      disableCheckboxesOfNoLeaf={disableCheckboxesOfNoLeaf && !child.hasChildType}
      // isCurrentCursor={cursor === node.id}
    />
  ))

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    onClick?.(nodeId)
  }

  const collapseButton = isLeaf ? null : (
    <button
      type="button"
      data-testid={'collapse-button'}
      onClick={(e) => {
        e.stopPropagation()
        !expandOnClick && onExpand?.(nodeId)
      }}
    >
      {isExpanded ? expandIcon : collapseIcon}
    </button>
  )

  const label = showCheckbox ? (
    <>
      <input
        type="checkbox"
        checked={isNodeChecked}
        className={checkboxClasses.checkbox}
        data-indeterminate={isNodeIndeterminate ? 'true' : undefined}
        disabled={disableCheckboxesOfNoLeaf}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onCheck?.(nodeId)}
      />
      <span onClick={handleClick}>
        {flatNode.label}
        {showChildrenCount && isParent && <span>({flatNode.childrenCount})</span>}
      </span>
    </>
  ) : (
    <span>{flatNode.label}</span>
  )

  const calculatePaddingLeft = () => {
    const basePadding = 12
    let indent = 0

    if (!isParent) {
      indent += 20
    }

    return basePadding + 24 * (depth - 1) + indent
  }

  const style = {
    ...(ariaSelected === 'true' ? customSelectStyle : {}),
    ...(itemHeight ? { height: itemHeight } : {}),
    paddingLeft: calculatePaddingLeft(),
  }

  return (
    <li>
      <span aria-selected={ariaSelected} onClick={() => onClick?.(nodeId)} style={style}>
        {collapseButton}
        {label}
      </span>
      {controller.expandedState[nodeId] && nested.length > 0 && <ul>{nested}</ul>}
    </li>
  )
}

export default TreeNode
