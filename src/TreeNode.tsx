import React from 'react'
import { TreeNodeProps } from './types.ts'

const TreeNode = (props: TreeNodeProps) => {
  const {
    checked,
    isExpanded,
    expandOnClick,
    checkOnClick,
    isLeaf,
    isParent,
    label,
    nodeId,
    onCheck,
    onExpand,
    onClick,
    children,
    showCheckbox = true,
    expandIcon,
    collapseIcon,
    // noHoverStyle,
    depth = 1,
    selected,
    // isBoldLabel,
    selectable,
    customSelectStyle,
    showChildrenCount,
    getChildrenCount,
    itemHeight,
    isCurrentCursor,
    disableCheckboxesOfNoLeaf,
  } = props

  const isNodeChecked = typeof checked === 'number' && checked > 0
  const ariaSelected = selectable && selected ? 'true' : undefined
  const ariaCurrentCursor = isCurrentCursor ? 'true' : undefined

  const handleCheck = () => {
    onCheck?.({ id: nodeId, checked: !isNodeChecked })
  }

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    if (expandOnClick && isParent) {
      onExpand?.(nodeId)
    }
    if (checkOnClick) {
      handleCheck()
    }
    if (selectable) {
      onClick?.(nodeId)
    }
  }

  const handleExpand = () => {
    onExpand?.(nodeId)
  }

  const renderChildrenCountLabel = () => {
    if (isLeaf || !showChildrenCount || !getChildrenCount) {
      return null
    }

    return <span>({getChildrenCount(nodeId)})</span>
  }

  const renderCollapseButton = () => {
    if (isLeaf) {
      return null
    }
    return (
      <button data-testid={'collapse-button'} onClick={expandOnClick ? undefined : handleExpand} type="button">
        {renderCollapseIcon()}
      </button>
    )
  }

  const renderCollapseIcon = () => {
    if (!isExpanded) {
      return collapseIcon
    }
    return expandIcon
  }

  const renderBareLabel = (children: React.ReactNode) => {
    return (
      <span onClick={handleClick}>
        {children} {renderChildrenCountLabel()}
      </span>
    )
  }

  const renderCheckboxLabel = (children: React.ReactNode) => {
    return (
      <>
        <input type="checkbox" disabled={disableCheckboxesOfNoLeaf} checked={isNodeChecked} onChange={handleCheck} />
        <span onClick={handleClick}>{children}</span>
        {renderChildrenCountLabel()}
      </>
    )
  }

  const renderLabel = () => {
    if (!showCheckbox) {
      return renderBareLabel(label)
    }

    return renderCheckboxLabel(label)
  }

  const renderChildren = () => {
    if (!isExpanded) {
      return null
    }
    return children
  }

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
      <span aria-selected={ariaSelected} aria-current={ariaCurrentCursor} onClick={expandOnClick ? handleExpand : undefined} style={style}>
        {renderCollapseButton()}
        {renderLabel()}
      </span>
      {renderChildren()}
    </li>
  )
}

export default TreeNode
