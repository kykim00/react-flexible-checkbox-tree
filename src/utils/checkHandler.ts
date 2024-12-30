import type { TreeNodeData } from '../types.ts'
import { memoize } from './memoize.ts'

export interface CheckedNodeStatus {
  checked: boolean
  indeterminate: boolean
  hasChildren: boolean
  value: string
}

export function getAllCheckedNodes(data: TreeNodeData[], checkedState: string[], acc: CheckedNodeStatus[] = []) {
  const currentTreeChecked: CheckedNodeStatus[] = []

  for (const node of data) {
    if (Array.isArray(node.children) && node.children.length > 0) {
      const innerChecked = getAllCheckedNodes(node.children, checkedState, acc)
      if (innerChecked.currentTreeChecked.length === node.children.length) {
        const isChecked = innerChecked.currentTreeChecked.every((item) => item.checked)
        const item = {
          checked: isChecked,
          indeterminate: !isChecked,
          value: node.value,
          hasChildren: true,
        }
        currentTreeChecked.push(item)
        acc.push(item)
      } else if (innerChecked.currentTreeChecked.length > 0) {
        const item = { checked: false, indeterminate: true, value: node.value, hasChildren: true }
        currentTreeChecked.push(item)
        acc.push(item)
      }
    } else if (checkedState.includes(node.value)) {
      const item: CheckedNodeStatus = {
        checked: true,
        indeterminate: false,
        value: node.value,
        hasChildren: false,
      }
      currentTreeChecked.push(item)
      acc.push(item)
    }
  }

  return { result: acc, currentTreeChecked }
}

function _isNodeChecked(value: string, data: TreeNodeData[], checkedState: string[]): boolean {
  if (checkedState.length === 0) {
    return false
  }

  if (checkedState.includes(value)) {
    return true
  }

  const checkedNodes = getAllCheckedNodes(data, checkedState).result
  return checkedNodes.some((node) => node.value === value && node.checked)
}

export const isNodeChecked = memoize(_isNodeChecked)

function _isNodeIndeterminate(value: string, data: TreeNodeData[], checkedState: string[]): boolean {
  if (checkedState.length === 0) {
    return false
  }

  const checkedNodes = getAllCheckedNodes(data, checkedState).result
  return checkedNodes.some((node) => node.value === value && node.indeterminate)
}

export const isNodeIndeterminate = memoize(_isNodeIndeterminate)
