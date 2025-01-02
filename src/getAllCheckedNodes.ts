import { TNode, NodeId } from './types'

export interface CheckedNodeStatus {
  checked: boolean
  indeterminate: boolean
  hasChildren: boolean
  value: string
}

export function getAllCheckedNodes(data: TNode[], checkedState: NodeId[], acc: CheckedNodeStatus[] = []) {
  const currentTreeChecked: CheckedNodeStatus[] = []

  for (const node of data) {
    const value = node.value || node.id

    if (Array.isArray(node.children) && node.children.length > 0) {
      const innerChecked = getAllCheckedNodes(node.children, checkedState, acc)
      if (innerChecked.currentTreeChecked.length === node.children.length) {
        const isChecked = innerChecked.currentTreeChecked.every((item) => item.checked)
        const item = {
          checked: isChecked,
          indeterminate: !isChecked,
          value,
          hasChildren: true,
        }
        currentTreeChecked.push(item)
        acc.push(item)
      } else if (innerChecked.currentTreeChecked.length > 0) {
        const item = { checked: false, indeterminate: true, value, hasChildren: true }
        currentTreeChecked.push(item)
        acc.push(item)
      }
    } else if (checkedState.includes(value)) {
      const item: CheckedNodeStatus = {
        checked: true,
        indeterminate: false,
        value,
        hasChildren: false,
      }
      currentTreeChecked.push(item)
      acc.push(item)
    }
  }

  return { result: acc, currentTreeChecked }
}
