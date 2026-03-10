import { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { CatiaControls } from './viewer/CatiaControls'
import { AxisHelper } from './viewer/AxisHelper'
import ViewportToolbar from './components/ViewportToolbar'
import { MassSpringSystem } from './engine/MassSpringSystem'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<CatiaControls | null>(null)
  const canMeshRef = useRef<THREE.Mesh | null>(null)
  const gridRef = useRef<THREE.GridHelper | null>(null)
  const physicsRef = useRef<MassSpringSystem | null>(null)
  const [isPerspective, setIsPerspective] = useState(true)
  const [isWireframe, setIsWireframe] = useState(false)
  const [showGrid, setShowGrid] = useState(true)

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

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(100, 200, 150)
    scene.add(dirLight)

    // Grid (10mm spacing: 500/50)
    const grid = new THREE.GridHelper(500, 50, 0xcccccc, 0xe0e0e0)
    scene.add(grid)
    gridRef.current = grid

    // Parametric can mesh
    const canRadius = 33
    const canHeight = 120
    const canGeometry = new THREE.CylinderGeometry(
      canRadius, canRadius, canHeight, 32, 20, false
    )
    // Translate geometry so bottom sits at Y=0 (world coords for physics)
    canGeometry.translate(0, canHeight / 2, 0)
    const canMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    })
    const canMesh = new THREE.Mesh(canGeometry, canMaterial)
    scene.add(canMesh)
    canMeshRef.current = canMesh

    // Physics engine
    const physics = new MassSpringSystem(canGeometry)
    physicsRef.current = physics

    // Controls
    const controls = new CatiaControls(camera, renderer.domElement)
    controls.setTarget(0, canHeight / 2, 0)
    controlsRef.current = controls

    // Axis helper
    const axisHelper = new AxisHelper(container)

    // Animation loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
      axisHelper.update(camera)
    }
    animate()

    // Resize
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // Keyboard shortcuts
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'p': case 'P':
          setIsPerspective(prev => !prev)
          break
        case 'f': case 'F':
          controls.setTarget(0, canHeight / 2, 0)
          break
        case 'w': case 'W':
          setIsWireframe(prev => !prev)
          break
        case 'g': case 'G':
          setShowGrid(prev => !prev)
          break
      }
      // Numpad views
      if (e.code === 'Numpad7') controls.setView('top')
      if (e.code === 'Numpad3') controls.setView('right')
      if (e.code === 'Numpad1') controls.setView('front')
      if (e.code === 'Numpad0') controls.setView('iso')
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
      controls.dispose()
      axisHelper.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  // Sync wireframe state
  useEffect(() => {
    const mesh = canMeshRef.current
    if (mesh) {
      ;(mesh.material as THREE.MeshStandardMaterial).wireframe = isWireframe
    }
  }, [isWireframe])

  // Sync grid visibility
  useEffect(() => {
    if (gridRef.current) gridRef.current.visible = showGrid
  }, [showGrid])

  const handleViewChange = useCallback(
    (view: 'top' | 'front' | 'right' | 'iso') => {
      controlsRef.current?.setView(view)
    },
    []
  )

  const handleTogglePerspective = useCallback(() => {
    setIsPerspective(prev => !prev)
  }, [])

  const handleFitAll = useCallback(() => {
    controlsRef.current?.setTarget(0, 60, 0)
  }, [])

  const handleToggleWireframe = useCallback(() => {
    setIsWireframe(prev => !prev)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}
    >
      <ViewportToolbar
        onViewChange={handleViewChange}
        onTogglePerspective={handleTogglePerspective}
        onFitAll={handleFitAll}
        onToggleWireframe={handleToggleWireframe}
        isPerspective={isPerspective}
      />
    </div>
  )
}
