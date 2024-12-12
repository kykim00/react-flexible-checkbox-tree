export type TNode = {
  id: number
  label: string
  type?: string
  children?: Array<TNode>
  showCheckbox?: boolean
  nodeType?: 'parent' | 'children'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}
