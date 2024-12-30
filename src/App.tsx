import { generateRandomData } from './utils/generateRandomData.ts'
import { createNodes } from './createNodes.ts'
import { Tree2 } from './Tree2.tsx'
import { useState } from 'react'

const data = generateRandomData(10000)

const nodes = createNodes({
  parents: data,
  parentKey: 'parentId',
})

function App() {
  const [forceExpand, setForceExpand] = useState(1)

  return (
    <div>
      <button onClick={() => setForceExpand(2)}>2 depth 까지 expand</button>
      <Tree2 nodes={nodes} forceExpand={forceExpand} />
    </div>
  )
}

export default App
