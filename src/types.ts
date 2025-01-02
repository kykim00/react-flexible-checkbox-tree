import { CSSProperties, ReactNode, RefObject } from 'react'
import { TreeController } from './useTree'

export type CheckModel = 'leaf' | 'all'

export type NodeId = number | string

export type TNode = {
  id: NodeId
  label: string
  type?: string
  children?: Array<TNode>
  showCheckbox?: boolean
  // createNodes로 tree 생성하는 경우 자동 생성
  nodeType?: 'parent' | 'children'

  [key: string]: any
}

export type FlatNode = {
  parent: FlatNode
  isChild: boolean
  isParent: boolean
  isLeaf: boolean
  showCheckbox: boolean
  treeDepth: number
  index: number
  children: FlatNode[]
  checked: boolean
  checkState: 0 | 1 | 2
  value: NodeId

  [key: string]: any
} & TNode

export type NodeInfo = FlatNode

type PositiveInteger<T extends number> = `${T}` extends `-${any}` | `${any}.${any}` ? never : T

export type TreeProps<T extends number> = {
  nodes: TNode[]
  checked?: NodeId[]
  checkModel?: CheckModel
  onlyLeafCheckboxes?: boolean
  initialExpanded?: NodeId[]
  initialSelected?: NodeId
  forceExpand?: boolean | PositiveInteger<T>
  onCheck?: (checked: NodeId[], checkedNodeInfos: NodeInfo[]) => void
  onSelect?: (nodeId: NodeId, nodeInfo: TNode) => void
  onExpand?: (nodeId: NodeId, expandedNodeIds: NodeId[]) => void
  expandOnClick?: boolean
  checkOnClick?: boolean
  showChildrenCount?: boolean
  defaultCollapseIcon?: ReactNode
  defaultExpandIcon?: ReactNode
  noCheckboxes?: boolean
  selectable?: boolean | ((node: FlatNode) => boolean)
  customSelectStyle?: CSSProperties
  boldLabelModel?: 'parent' | 'all' | PositiveInteger<T> | ((nodeInfo: TNode) => boolean)
  hideEmptyRootNode?: boolean
  hideCheckboxEmptyNode?: boolean
  itemHeight?: number
  // useKeyboardNavigation?: boolean
  outerRef?: RefObject<HTMLDivElement>
  disableCheckboxesOfNoLeaf?: boolean
} & { className?: string }

export type TreeNodeProps = {
  nodeId: NodeId
  controller: TreeController
  flatNodes: { [key: string]: FlatNode }
  onCheck?: (nodeId: NodeId) => void
  onExpand?: (nodeId: NodeId) => void
  onClick?: (nodeId: NodeId) => void
  expandOnClick?: boolean
  checkOnClick?: boolean
  expandIcon?: ReactNode
  collapseIcon?: ReactNode
  depth?: number
  isBoldLabel?: (node: FlatNode) => boolean
  isSelectable?: (node: FlatNode) => boolean
  customSelectStyle?: CSSProperties
  showChildrenCount?: boolean
  itemHeight?: number
  isShowCheckbox?: (node: FlatNode) => boolean
  disableCheckboxesOfNoLeaf?: boolean
}
