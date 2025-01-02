import { TNode } from './types'

/*
 * @description 트리 노드 검색 & 필터 함수
 * @params nodes 트리 노드 객체 배열
 * @params searchText 검색할 텍스트
 */
export const searchNodes = (nodes: TNode[], searchText: string) => {
  if (!searchText) {
    return nodes
  }

  return nodes.reduce((acc: TNode[], node) => {
    const nodeMatches = node.label.toLowerCase().includes(searchText.toLowerCase())
    const childrenMatches = node.children ? (nodeMatches ? node.children : searchNodes(node.children, searchText)) : []

    if (nodeMatches || childrenMatches.length > 0) {
      acc.push({
        ...node,
        children: childrenMatches,
      })
    }

    return acc
  }, [])
}
