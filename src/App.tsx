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
  const rigidBodyRef = useRef<THREE.Mesh | null>(null)
  const simRunningRef = useRef(false)
  const simTimeRef = useRef(0)
  const canGeometryRef = useRef<THREE.CylinderGeometry | null>(null)

  const [isPerspective, setIsPerspective] = useState(true)
  const [isWireframe, setIsWireframe] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [simState, setSimState] = useState<'idle' | 'running' | 'paused'>('idle')

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

    // Grid
    const grid = new THREE.GridHelper(500, 50, 0xcccccc, 0xe0e0e0)
    scene.add(grid)
    gridRef.current = grid

    // Parametric can mesh
    const canRadius = 33
    const canHeight = 120
    const canGeometry = new THREE.CylinderGeometry(
      canRadius, canRadius, canHeight, 32, 20, false
    )
    canGeometry.translate(0, canHeight / 2, 0)
    canGeometryRef.current = canGeometry
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

    // Rigid body (press cylinder) — sits above the can
    const rigidRadius = 40
    const rigidHeight = 20
    const rigidGeometry = new THREE.CylinderGeometry(
      rigidRadius, rigidRadius, rigidHeight, 32, 1
    )
    const rigidMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    })
    const rigidMesh = new THREE.Mesh(rigidGeometry, rigidMaterial)
    rigidMesh.position.set(0, canHeight + rigidHeight / 2 + 5, 0) // above can
    scene.add(rigidMesh)
    rigidBodyRef.current = rigidMesh

    // Wireframe overlay for rigid body
    const rigidWire = new THREE.WireframeGeometry(rigidGeometry)
    const rigidLine = new THREE.LineSegments(
      rigidWire,
      new THREE.LineBasicMaterial({ color: 0x2563eb, opacity: 0.8, transparent: true })
    )
    rigidMesh.add(rigidLine)

    // Controls
    const controls = new CatiaControls(camera, renderer.domElement)
    controls.setTarget(0, canHeight / 2, 0)
    controlsRef.current = controls

    // Axis helper
    const axisHelper = new AxisHelper(container)

    // Simulation parameters
    const compressionSpeed = 10 // mm/s
    const maxDisplacement = 80  // mm total travel

    // Animation loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)

      if (simRunningRef.current) {
        // Move rigid body down
        const displacement = simTimeRef.current * compressionSpeed
        if (displacement < maxDisplacement) {
          const rigidY = canHeight + rigidHeight / 2 + 5 - displacement
          rigidMesh.position.y = rigidY

          // Physics step
          physics.step()

          // Apply rigid body contact
          physics.applyRigidCylinderContact(
            0, rigidY, 0,  // rigid body center
            rigidRadius,
            rigidHeight / 2
          )

          // Sync physics → geometry
          physics.syncToGeometry(canGeometry)

          // Check stability
          if (!physics.isStable()) {
            simRunningRef.current = false
            setSimState('paused')
            console.warn('Physics instability detected, pausing simulation')
          }

          simTimeRef.current += 1 / 60 // assume 60fps
        } else {
          simRunningRef.current = false
          setSimState('idle')
        }
      }

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

  const handlePlay = useCallback(() => {
    simRunningRef.current = true
    setSimState('running')
  }, [])

  const handlePause = useCallback(() => {
    simRunningRef.current = false
    setSimState('paused')
  }, [])

  const handleReset = useCallback(() => {
    simRunningRef.current = false
    simTimeRef.current = 0
    setSimState('idle')
    // Reset rigid body position
    if (rigidBodyRef.current) {
      rigidBodyRef.current.position.set(0, 120 + 10 + 5, 0)
    }
    // Reset can geometry
    const geom = canGeometryRef.current
    const physics = physicsRef.current
    if (geom && physics) {
      // Recreate geometry and reset physics
      const posAttr = geom.getAttribute('position')
      // We need to store original positions — for now regenerate
      const newGeom = new THREE.CylinderGeometry(33, 33, 120, 32, 20, false)
      newGeom.translate(0, 60, 0)
      const newPosAttr = newGeom.getAttribute('position')
      for (let i = 0; i < posAttr.count; i++) {
        posAttr.setXYZ(i, newPosAttr.getX(i), newPosAttr.getY(i), newPosAttr.getZ(i))
      }
      posAttr.needsUpdate = true
      geom.computeVertexNormals()
      geom.computeBoundingSphere()
      physics.reset(geom)
      newGeom.dispose()
    }
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
      {/* Sim controls */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        zIndex: 10,
        background: 'rgba(240,244,248,0.9)',
        padding: '6px 12px',
        borderRadius: 12,
        boxShadow: '4px 4px 8px rgba(163,177,198,0.4), -4px -4px 8px rgba(255,255,255,0.7)',
      }}>
        <button
          onClick={simState === 'running' ? handlePause : handlePlay}
          style={{
            padding: '6px 16px',
            border: 'none',
            borderRadius: 8,
            background: simState === 'running' ? '#f59e0b' : '#10b981',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {simState === 'running' ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '6px 16px',
            border: 'none',
            borderRadius: 8,
            background: '#ef4444',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          color: '#64748b',
          fontSize: 12,
        }}>
          {simState === 'idle' ? 'Ready' : simState === 'running' ? 'Simulating...' : 'Paused'}
        </span>
      </div>
    </div>
  )
}
