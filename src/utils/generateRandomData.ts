function generateRandomData(count) {
  const data = []

  for (let i = 0; i < count; i++) {
    const id = i + 1 // ID는 1부터 시작하여 순차적으로 증가
    const label = `Item ${id}`

    const parentId = Math.random() < 0.5 && data.length > 0 ? data[Math.floor(Math.random() * data.length)].id : null

    data.push({ id, label, parentId })
  }

  return data
}
