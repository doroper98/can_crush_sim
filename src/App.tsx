import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f4f8)

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      10000
    )
    camera.position.set(200, 150, 200)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Ambient + directional light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(100, 200, 150)
    scene.add(dirLight)

    // Grid helper (XY plane → rotated to XZ for floor)
    const grid = new THREE.GridHelper(500, 50, 0xcccccc, 0xe0e0e0)
    scene.add(grid)

    // Animation loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    />
  )
}
