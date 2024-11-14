import { useState, useEffect } from 'react'

import './App.css'
import Canvas from "./modules/canvas"

function App() {
  const [canvas, setCanvas] = useState<Canvas>()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  useEffect(() => {
    const c = Canvas.instance
    setCanvas(c)
    return () => { }
  }, [])
  return (
    <>
      <canvas id="canvas" style={{ width: "100%", height: "100vh" }}></canvas>
      <div className='main'>
        <div className='fixed'>
          <h2 className='section-title'>クローンサイトです</h2>
          <div className="top-source">
            <p>こちらを参考に作成しました</p>
            <a className='top-source-link' href='https://www.oscarpico.es/' >https://www.oscarpico.es/</a>
          </div>
        </div>
        <div
          id='meshes'
          className='meshes'
          onMouseEnter={() => {
            if (window.innerWidth > 1000) {
              canvas && canvas.enter()
            }
          }}
          onMouseLeave={() => {
            if (window.innerWidth > 1000) {
              canvas && canvas.leave()
            }
          }}
        >
          <div className={`meshes_toggle meshes_toggle_${isOpen && "open"}`}
            onClick={
              () => {
                isOpen
                  ? canvas && canvas.leave()
                  : canvas && canvas.enter()
                setIsOpen(state => !state)
              }
            }
          >
            <span></span>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
