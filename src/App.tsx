import { generateRandomData } from './utils/generateRandomData.ts'
import { Tree } from './Tree.tsx'
import { createNodes } from './createNodes.ts'
import { Tree2 } from './Tree2.tsx'

const data = generateRandomData(100)

const nodes = createNodes({
  parents: data,
  parentKey: 'parentId',
})

function App() {
  return <Tree2 nodes={nodes} />
}

export default App
