import { useTree } from './useTree.ts'
import { useEffect } from 'react'
import { TreeNode } from './TreeNode2.tsx'

export const Tree2 = ({
  onCheck,
  onClick,
  nodes,
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
  // useKeyboardNavigation,
  // outerRef,
  disableCheckboxesOfNoLeaf = false,
  tree,
  ref,
}: any) => {
  const defaultController = useTree()
  const controller = tree || defaultController

  useEffect(() => {
    controller.initialize(nodes)
  }, [nodes])

  const treeNodes = nodes.map((node) => (
    <TreeNode
      key={node.value}
      node={node}
      // getStyles={getStyles}
      expandOnClick={expandOnClick}
      checkOnClick={checkOnClick}
      controller={controller}
    />
  ))

  return (
    <ul ref={ref} className={className} style={{ minWidth: '100%', width: 'max-content' }}>
      {treeNodes}
    </ul>
  )
}
