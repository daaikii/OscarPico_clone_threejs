import { useState, useEffect } from 'react'

import './App.css'
import Canvas from "./modules/canvas"

function App() {
  const [canvas, setCanvas] = useState<Canvas>()
  useEffect(() => {
    const c = Canvas.instance
    setCanvas(c)
    return () => { }
  }, [])
  return (
    <>
      <canvas id="canvas" style={{ width: "100%", height: "100vh" }}></canvas>
      <div className='main'>
        <h2 className='Annotation'>クローンサイトです</h2>
        <div className=''>

        </div>
        <div
          onMouseEnter={() => canvas && canvas.enter()!}
          onMouseLeave={() => canvas && canvas.leave()!}
          className='meshes'
        >
        </div>
      </div>
    </>
  )
}

export default App
