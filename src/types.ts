import { CSSProperties, ReactNode, RefObject } from 'react'
import NodeModel from './NodeModel.ts'

export type CheckModel = 'leaf' | 'all'

export type TNode = {
  id: number | string
  label: string
  type?: string
  value: string
  children?: Array<TNode>
  showCheckbox?: boolean
  [key: string]: any
}

export type TreeNodeData = TNode

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
  [key: string]: any
} & TNode

export type NodeInfo = FlatNode

type PositiveInteger<T extends number> = `${T}` extends `-${any}` | `${any}.${any}` ? never : T

export type TreeProps<T extends number> = {
  nodes: TNode[]
  checked?: number[]
  checkModel?: CheckModel
  customCheckModel?: string
  onlyLeafCheckboxes?: boolean
  initialExpanded?: number[]
  initialSelected?: number
  forceExpand?: boolean | PositiveInteger<T>
  onCheck?: (checked: number[], checkedNodeInfos: NodeInfo[]) => void
  onClick?: (nodeId: number, nodeInfo: TNode) => void
  onExpand?: (nodeId: number, expandedNodeIds: number[]) => void
  expandOnClick?: boolean
  checkOnClick?: boolean
  showChildrenCount?: boolean
  defaultCollapseIcon?: ReactNode
  defaultExpandIcon?: ReactNode
  noCheckboxes?: boolean
  noHoverStyle?: boolean
  selectable?: boolean | ((node: FlatNode) => boolean)
  customSelectStyle?: CSSProperties
  boldLabelModel?: 'parent' | 'all' | PositiveInteger<T> | ((nodeInfo: TNode) => boolean)
  hideEmptyRootNode?: boolean
  hideCheckboxEmptyNode?: boolean
  itemHeight?: number
  useKeyboardNavigation?: boolean
  outerRef?: RefObject<HTMLDivElement>
  disableCheckboxesOfNoLeaf?: boolean
} & { className?: string }

export type TreeNodeProps = {
  model: NodeModel<number>
  node: TNode
  flatNodes: { [key: string]: FlatNode }
  getStyles: (node: FlatNode) => CSSProperties
  parentId: number | null
  nodeId: string
  label: ReactNode
  checked?: number
  isExpanded?: boolean
  isLeaf?: boolean
  isParent?: boolean
  onCheck?: (nodeInfo: { id: string; checked: boolean }) => void
  onExpand?: (nodeId: string) => void
  onClick?: (nodeId: string) => void
  children?: ReactNode
  selected?: boolean
  expandOnClick?: boolean
  checkOnClick?: boolean
  showCheckbox?: boolean
  expandIcon?: ReactNode
  collapseIcon?: ReactNode
  noHoverStyle?: boolean
  depth?: number
  isBoldLabel?: boolean
  selectable?: boolean
  customSelectStyle?: CSSProperties
  showChildrenCount?: boolean
  getChildrenCount?: (nodeId: string) => number
  itemHeight?: number
  isCurrentCursor?: boolean
  disableCheckboxesOfNoLeaf?: boolean
}
