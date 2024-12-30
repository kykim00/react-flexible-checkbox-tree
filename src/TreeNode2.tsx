import React, { useRef } from 'react'
import type { TreeController } from './useTree'
import { TreeNodeData } from './types.ts'

interface TreeNodeProps {
  node: TreeNodeData
  controller: TreeController
  expandOnClick: boolean | undefined
  isSubtree?: boolean
  level?: number
  selectOnClick: boolean | undefined
}

export function TreeNode({ node, controller, expandOnClick, selectOnClick, isSubtree, level = 1 }: TreeNodeProps) {
  const ref = useRef<HTMLLIElement>(null)
  const nested = (node.children || []).map((child) => (
    <TreeNode
      key={child.value}
      node={child}
      level={level + 1}
      controller={controller}
      expandOnClick={expandOnClick}
      isSubtree
      selectOnClick={selectOnClick}
    />
  ))

  const handleNodeClick = (event: React.MouseEvent) => {
    event.stopPropagation()

    expandOnClick && controller.toggleExpanded(node.value)
    selectOnClick && controller.select(node.value)
    ref.current?.focus()
  }

  const handleExpand = () => {
    controller.toggleExpanded(node.value)
  }

  const expandButton = node.children?.length ? (
    <button data-testid={'collapse-button'} onClick={expandOnClick ? undefined : handleExpand} type="button">
      {controller.expandedState[node.value] ? '-' : '+'}
    </button>
  ) : null

  const selected = controller.selectedState === node.value
  const checked = controller.isNodeChecked(node.value)
  const indeterminate = controller.isNodeIndeterminate(node.value)

  return (
    <li onClick={handleNodeClick} aria-selected={selected} data-level={level} ref={ref}>
      <div>
        {expandButton}
        <input
          type="checkbox"
          checked={checked}
          onChange={() => (checked || indeterminate ? controller.uncheckNode(node.value) : controller.checkNode(node.value))}
        />
        {node.label}
      </div>

      {controller.expandedState[node.value] && nested.length > 0 && <ul data-level={level}>{nested}</ul>}
    </li>
  )
}

TreeNode.displayName = '@mantine/core/TreeNode'
