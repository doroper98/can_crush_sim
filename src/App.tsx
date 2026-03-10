import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { CatiaControls } from './viewer/CatiaControls'

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

    // Grid helper
    const grid = new THREE.GridHelper(500, 50, 0xcccccc, 0xe0e0e0)
    scene.add(grid)

    // Parametric can mesh
    const canRadius = 33  // mm (D=66mm)
    const canHeight = 120 // mm
    const radialSegments = 32
    const heightSegments = 20
    const canGeometry = new THREE.CylinderGeometry(
      canRadius, canRadius, canHeight,
      radialSegments, heightSegments, false
    )
    const canMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    })
    const canMesh = new THREE.Mesh(canGeometry, canMaterial)
    canMesh.position.y = canHeight / 2 // sit on grid
    scene.add(canMesh)

    // CATIA V5 compatible controls
    const controls = new CatiaControls(camera, renderer.domElement)
    controls.setTarget(0, canHeight / 2, 0)

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
      controls.dispose()
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
