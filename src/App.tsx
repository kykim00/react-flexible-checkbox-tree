import { generateRandomData } from './utils/generateRandomData.ts'
import { Tree } from './Tree.tsx'
import { createNodes } from './createNodes.ts'

const data = generateRandomData(10000)
const nodes = createNodes({
  parents: data,
  parentKey: 'parentId',
})

function App() {
  return <Tree nodes={nodes} />
}

export default App
