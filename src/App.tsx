import { generateRandomData } from './generateRandomData.ts'
import { createNodes } from './createNodes.ts'
import { useState } from 'react'
import { Tree } from './Tree.tsx'

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
      <Tree nodes={nodes} forceExpand={forceExpand} />
    </div>
  )
}

export default App
