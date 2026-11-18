import { useEffect, useState } from 'react'
import { Frame1 } from '../figma-handoff/Frame1'

export function FigmaShaderPage() {
  const [hasGpu, setHasGpu] = useState(true)

  useEffect(() => {
    setHasGpu('gpu' in navigator)
  }, [])

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#111',
      }}
    >
      {hasGpu ? <Frame1 /> : <p style={{ color: '#f4f1ea' }}>This browser has no WebGPU, so the Figma shader cannot draw.</p>}
    </main>
  )
}
