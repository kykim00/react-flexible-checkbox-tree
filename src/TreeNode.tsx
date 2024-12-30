import React, { CSSProperties } from 'react'
import { TNode, TreeNodeProps } from './types.ts'

const renderNode = ({ node, expanded, hasChildren, onExpand, model }: any) => {
  // const checked = model.
  return (
    <li>
      {hasChildren && <span onClick={onExpand}>{expanded ? '-' : '+'}</span>}

      {node.label}
    </li>
  )
}

const TreeNode = (props: TreeNodeProps) => {
  const {
    checked,
    model,
    node,
    flatNodes,
    getStyles,
    parentId,
    // isExpanded,
    expandOnClick,
    checkOnClick,
    // isLeaf,
    // isParent,
    // label,
    // nodeId,
    // onCheck,
    onExpand,
    expanded,
    // onClick,
    // children,
    // showCheckbox = true,
    expandIcon,
    collapseIcon,
    // noHoverStyle,
    depth = 1,
    // selected,
    // isBoldLabel,
    selectable,
    // customSelectStyle,
    showChildrenCount,
    // getChildrenCount,
    // itemHeight,
    // isCurrentCursor,
    disableCheckboxesOfNoLeaf,
    ...rest
  } = props

  const children = (node.children || []).map((child) => {
    return (
      <TreeNode
        key={child.id}
        model={model}
        node={child}
        parentId={node.id}
        flatNodes={flatNodes}
        getStyles={getStyles}
        onExpand={onExpand}
        expanded={expanded}
      />
    )
  })

  const nodeId = `${node.id}_${parentId || ''}`
  const flatNode = flatNodes[nodeId]

  const showCheckbox = flatNode.showCheckbox
  // if (noCheckboxes) {
  //   showCheckbox = false
  // } else if (hideCheckboxEmptyNode) {
  //   showCheckbox = flatNode.treeDepth === 1 ? flatNode.children.length > 0 : flatNode.showCheckbox
  // } else if (onlyLeafCheckboxes) {
  //   showCheckbox = flatNode.isLeaf
  // }
  // model.
  const isNodeChecked = typeof checked === 'number' && checked > 0
  // const ariaSelected = selectable && selected ? 'true' : undefined
  const isExpanded = expanded.includes(node.id)

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

  // const renderChildrenCountLabel = () => {
  //   if (isLeaf || !showChildrenCount || !getChildrenCount) {
  //     return null
  //   }
  //
  //   return <span>({getChildrenCount(nodeId)})</span>
  // }

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
    return <span onClick={handleClick}>{children}</span>
  }

  // const renderCheckboxLabel = (children: React.ReactNode) => {
  //   return (
  //     <>
  //       <input type="checkbox" disabled={disableCheckboxesOfNoLeaf} checked={isNodeChecked} onChange={handleCheck} />
  //       <span onClick={handleClick}>{children}</span>
  //       {renderChildrenCountLabel()}
  //     </>
  //   )
  // }

  const renderLabel = () => {
    // if (!showCheckbox) {
    return renderBareLabel(node.label)
    // }

    // return renderCheckboxLabel(node.label)
  }

  const renderChildren = () => {
    if (!isExpanded) {
      return null
    }
    return children
  }
  const style = getStyles(node)

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
