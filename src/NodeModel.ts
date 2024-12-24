import { FlatNode, TNode, NodeInfo, TreeProps } from './types'
import { memoizedFlattenNodes } from './flattenNodes.ts'

class NodeModel<T extends number> {
  private checkModel: string
  private props: TreeProps<T>
  private readonly flatNodes: Record<string, FlatNode>

  constructor(props: TreeProps<T>, nodes: Record<string, FlatNode> = {}) {
    this.props = props
    this.flatNodes = nodes
    this.checkModel = props.customCheckModel ?? props.checkModel ?? 'leaf'
  }

  clone(): NodeModel<T> {
    const clonedNodes: Record<string, FlatNode> = {}

    Object.keys(this.flatNodes).forEach((nodeId) => {
      const node = this.flatNodes[nodeId]
      clonedNodes[nodeId] = { ...node }
    })

    return new NodeModel(this.props, clonedNodes)
  }

  setProps(props: TreeProps<T>) {
    this.props = props
  }

  setCheckModel(props: TreeProps<T>) {
    this.checkModel = props.customCheckModel ?? props.checkModel ?? 'leaf'
  }

  getNode(id: string): FlatNode {
    return this.flatNodes[id]
  }

  getAllNodes() {
    return Object.values(this.flatNodes)
  }

  getChildrenCount(id: string) {
    const node = this.getNode(id)
    if (!node || !node.children) {
      return 0
    }

    let count = node.children.length

    for (const child of node.children) {
      count += this.getChildrenCount(`${child.id}_${node.id}`)
    }

    return count
  }

  getLeafChildrenCount(id: string): number {
    const node = this.getNode(id)

    if (node.isLeaf) {
      return 1
    }

    return node.children.reduce((sum, child) => sum + this.getLeafChildrenCount(`${child.id}_${node.id}`), 0)
  }

  getCustomCheckModelChildrenCount(id: string): number {
    const node = this.getNode(id)
    let count = 0

    if (node.type === this.checkModel) {
      count += 1
    }

    for (const child of node.children) {
      count += this.getCustomCheckModelChildrenCount(`${child.id}_${node.id}`)
    }

    return count
  }

  flattenNodes(nodes: TNode[], parent = {} as FlatNode, depth = 1): void {
    const flatNodes = memoizedFlattenNodes(nodes, parent, depth)
    Object.assign(this.flatNodes, flatNodes)
  }

  nodeHasChildren(node: TNode): boolean {
    return Array.isArray(node.children) && node.children.length > 0
  }

  setCheckedNodes(checked: number[]): void {
    const keys = Object.keys(this.flatNodes)
    keys.forEach((key) => {
      this.flatNodes[key]['checked'] = false
    })

    keys.forEach((key) => {
      if (checked.includes(this.parseId(key))) {
        this.flatNodes[key]['checked'] = true
      }
    })
  }

  getCheckedNodeInfos() {
    const ids: number[] = []
    const infos: NodeInfo[] = []

    Object.keys(this.flatNodes).forEach((nodeId) => {
      if (this.flatNodes[nodeId]['checked']) {
        const parsedId = this.parseId(nodeId)
        ids.push(parsedId)
        infos.push({ ...this.flatNodes[nodeId], id: parsedId })
      }
    })

    return { ids, infos }
  }

  parseId(nodeId: string) {
    return Number(nodeId.split('_')[0])
  }

  getNodeId(id: number): string | null {
    for (const nodeId of Object.keys(this.flatNodes)) {
      if (nodeId.split('_')[0] === id.toString()) {
        return nodeId
      }
    }

    return null
  }

  toggleChecked(nodeId: string, isChecked: boolean): NodeModel<T> {
    const flatNode = this.flatNodes[nodeId]
    const isCustomCheckModel = !!this.props.customCheckModel
    const checkModelHasParents = isCustomCheckModel || this.checkModel === 'all'

    const toggleCheckByCustomModel = (node: FlatNode, check: boolean) => {
      if (node.type === this.props.customCheckModel) {
        node.checked = check
      }
      if (node.children) {
        node.children.forEach((child) => {
          const childNode = this.flatNodes[`${child.id}_${node.id}`]
          toggleCheckByCustomModel(childNode, check)
        })
      }
    }

    if (isCustomCheckModel) {
      toggleCheckByCustomModel(flatNode, isChecked)
    } else {
      const isCheckTarget = this.checkModel === 'all' || flatNode.isLeaf
      if (isCheckTarget) {
        this.toggleNode(nodeId, isChecked)
      }
      if (flatNode.children) {
        flatNode.children.forEach((child) => {
          this.toggleChecked(`${child.id}_${flatNode.id}`, isChecked)
        })
      }
    }

    if (flatNode.isChild && checkModelHasParents) {
      this.toggleParentStatus(flatNode.parent)
    }

    return this
  }

  toggleParentStatus(node: FlatNode): void {
    const nodeId = `${node.id}_${node?.parent?.id ?? ''}`

    if (this.props.customCheckModel) {
      if (node.type === this.props.customCheckModel) {
        this.toggleNode(nodeId, this.isEveryCustomCheckModelChildChecked(node))
      }
    } else {
      this.toggleNode(nodeId, this.isEveryChildChecked(node))
    }
    if (node.isChild) {
      this.toggleParentStatus(node.parent)
    }
  }

  isEveryChildChecked(node: FlatNode): boolean {
    return node.children.every((child) => {
      return this.getNode(`${child.id}_${node.id}`).checked
    })
  }

  isEveryCustomCheckModelChildChecked(node: FlatNode): boolean {
    const flattenChildren = this.getFlattenChildrenNodes(node)
    const customCheckModelChildren = flattenChildren.filter((node) => node.type === this.props.customCheckModel)

    if (customCheckModelChildren.length > 0) {
      return customCheckModelChildren.every((node) => node.checked)
    }

    return false
  }

  getFlattenChildrenNodes(node: FlatNode, flatNodeList: FlatNode[] = []) {
    if (this.nodeHasChildren(node)) {
      node.children.forEach((child) => {
        const childNode = this.getNode(`${child.id}_${node.id}`)
        flatNodeList.push(childNode)
        this.getFlattenChildrenNodes(this.getNode(`${child.id}_${node.id}`), flatNodeList)
      })
    }

    return flatNodeList
  }

  toggleNode(nodeId: string, toggleValue: boolean): NodeModel<T> {
    this.flatNodes[nodeId]['checked'] = toggleValue
    return this
  }
}

export default NodeModel
