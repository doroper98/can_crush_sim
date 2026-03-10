import { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { CatiaControls } from './viewer/CatiaControls'
import { AxisHelper } from './viewer/AxisHelper'
import ViewportToolbar from './components/ViewportToolbar'
import ControlPanel, { type RigidBodyShape } from './components/ControlPanel'
import { MassSpringSystem } from './engine/MassSpringSystem'
import ColorBar from './components/ColorBar'
import FileDropZone from './components/FileDropZone'
import { loadSTL } from './cad/stlLoader'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { applyVertexColors, type ColormapType } from './viewer/colormap'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const controlsRef = useRef<CatiaControls | null>(null)
  const canMeshRef = useRef<THREE.Mesh | null>(null)
  const gridRef = useRef<THREE.GridHelper | null>(null)
  const physicsRef = useRef<MassSpringSystem | null>(null)
  const rigidBodyRef = useRef<THREE.Mesh | null>(null)
  const simRunningRef = useRef(false)
  const simTimeRef = useRef(0)
  const canGeometryRef = useRef<THREE.CylinderGeometry | null>(null)
  const transformControlsRef = useRef<TransformControls | null>(null)
  const loadArrowRef = useRef<THREE.ArrowHelper | null>(null)

  const [isPerspective, setIsPerspective] = useState(true)
  const [isWireframe, setIsWireframe] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [simState, setSimState] = useState<'idle' | 'running' | 'paused'>('idle')
  const [canDiameter, setCanDiameter] = useState(66)
  const [canHeightParam, setCanHeightParam] = useState(120)
  const [wallThickness, setWallThickness] = useState(0.3)
  const [maxForce, setMaxForce] = useState(500)
  const [compressionSpeedParam, setCompressionSpeedParam] = useState(10)
  const [rigidShape, setRigidShape] = useState<RigidBodyShape>('cylinder')
  const [rigidRadius, setRigidRadius] = useState(40)
  const [rigidHeight, setRigidHeight] = useState(20)
  const [rigidPosX, setRigidPosX] = useState(0)
  const [rigidPosY, setRigidPosY] = useState(145) // canHeight + rigidHeight/2 + 5
  const [rigidPosZ, setRigidPosZ] = useState(0)
  const [rigidRotX, setRigidRotX] = useState(0)
  const [rigidRotY, setRigidRotY] = useState(0)
  const [rigidRotZ, setRigidRotZ] = useState(0)
  const [gizmoMode, setGizmoMode] = useState<'translate' | 'rotate'>('translate')
  const [showLoadArrow, setShowLoadArrow] = useState(true)
  const [displayMode, setDisplayMode] = useState<'none' | 'stress' | 'displacement' | 'plastic'>('none')
  const [colormapType, setColormapType] = useState<ColormapType>('jet')
  const originalPositionsRef = useRef<Float32Array | null>(null)
  const displayModeRef = useRef(displayMode)
  const colormapTypeRef = useRef(colormapType)
  const [colorBarMin, setColorBarMin] = useState(0)
  const [colorBarMax, setColorBarMax] = useState(1)
  const colorBarUpdateCounter = useRef(0)
  const [chartData, setChartData] = useState<{ displacement: number; load: number }[]>([])
  const chartDataRef = useRef<{ displacement: number; load: number }[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f4f8)
    sceneRef.current = scene

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
      vertexColors: false,
    })
    const canMesh = new THREE.Mesh(canGeometry, canMaterial)
    scene.add(canMesh)
    canMeshRef.current = canMesh

    // Physics engine
    const physics = new MassSpringSystem(canGeometry)
    physicsRef.current = physics

    // Store original positions for displacement calculation
    originalPositionsRef.current = new Float32Array(physics.positions)

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

    // Transform Gizmo for rigid body
    const transformControls = new TransformControls(camera, renderer.domElement)
    transformControls.attach(rigidMesh)
    transformControls.setMode('translate')
    transformControls.setSize(0.8)
    scene.add(transformControls.getHelper())
    transformControlsRef.current = transformControls

    // Disable orbit while gizmo is dragging
    transformControls.addEventListener('dragging-changed', (event) => {
      controls.enabled = !(event.value as boolean)
    })

    // Sync gizmo → state
    transformControls.addEventListener('change', () => {
      if (transformControls.dragging) {
        const pos = rigidMesh.position
        const rot = rigidMesh.rotation
        setRigidPosX(Math.round(pos.x))
        setRigidPosY(Math.round(pos.y))
        setRigidPosZ(Math.round(pos.z))
        setRigidRotX(Math.round(rot.x * 180 / Math.PI))
        setRigidRotY(Math.round(rot.y * 180 / Math.PI))
        setRigidRotZ(Math.round(rot.z * 180 / Math.PI))
      }
    })
    controls.setTarget(0, canHeight / 2, 0)
    controlsRef.current = controls

    // Load direction arrow (points downward from rigid body)
    const arrowDir = new THREE.Vector3(0, -1, 0)
    const arrowOrigin = new THREE.Vector3(0, canHeight + rigidHeight + 10, 0)
    const arrowLength = 40
    const arrowColor = 0xef4444 // red
    const loadArrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, arrowLength, arrowColor, 10, 6)
    loadArrow.name = 'loadArrow'
    scene.add(loadArrow)
    loadArrowRef.current = loadArrow

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

          // Record load-displacement data (every 5 frames)
          if (colorBarUpdateCounter.current % 5 === 0) {
            // Estimate reaction force from stress at top nodes
            const stresses = physics.getStressPerNode()
            let avgTopStress = 0
            let topCount = 0
            for (let ni = 0; ni < physics.nodeCount; ni++) {
              if (physics.positions[ni * 3 + 1] > canHeight - displacement - 5) {
                avgTopStress += stresses[ni]
                topCount++
              }
            }
            if (topCount > 0) avgTopStress /= topCount
            // F ≈ σ_avg * A_cross (cross section area ≈ π*r*t)
            const crossArea = Math.PI * (canRadius) * 0.3 // mm²
            const estimatedForce = avgTopStress * crossArea * 0.001 // N (rough)
            chartDataRef.current = [...chartDataRef.current, { displacement, load: estimatedForce }]
            setChartData([...chartDataRef.current])
          }

          // Apply colormap if display mode is active
          const dm = displayModeRef.current
          if (dm !== 'none') {
            let values: Float32Array
            let maxRange: number

            if (dm === 'stress') {
              values = physics.getStressPerNode()
              maxRange = 310 // UTS as max reference
            } else if (dm === 'displacement' && originalPositionsRef.current) {
              values = physics.getDisplacementPerNode(originalPositionsRef.current)
              maxRange = 80 // max displacement reference
            } else {
              values = physics.getPlasticStrainPerNode()
              maxRange = 0.3 // 30% max plastic strain
            }

            // Auto-range: use actual min/max if available
            let minV = 0
            let maxV = maxRange
            for (let vi = 0; vi < values.length; vi++) {
              if (values[vi] > maxV) maxV = values[vi]
            }

            applyVertexColors(canGeometry, values, minV, maxV, colormapTypeRef.current)

            // Update colorbar labels (throttled)
            colorBarUpdateCounter.current++
            if (colorBarUpdateCounter.current % 10 === 0) {
              setColorBarMin(minV)
              setColorBarMax(maxV)
            }
          }

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

      // Update load arrow position to follow rigid body
      if (loadArrow.visible) {
        loadArrow.position.set(
          rigidMesh.position.x,
          rigidMesh.position.y + rigidHeight / 2 + 5,
          rigidMesh.position.z
        )
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
        case 't': case 'T':
          setGizmoMode('translate')
          break
        case 'r': case 'R':
          setGizmoMode('rotate')
          break
        case 'l': case 'L':
          setShowLoadArrow(prev => !prev)
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
      transformControls.detach()
      transformControls.dispose()
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

  // Keep displayMode/colormapType refs in sync
  useEffect(() => { displayModeRef.current = displayMode }, [displayMode])
  useEffect(() => { colormapTypeRef.current = colormapType }, [colormapType])

  // Sync display mode → material vertexColors
  useEffect(() => {
    const mesh = canMeshRef.current
    if (!mesh) return
    const mat = mesh.material as THREE.MeshStandardMaterial
    if (displayMode !== 'none') {
      mat.vertexColors = true
      mat.color.set(0xffffff) // neutral base for vertex colors
    } else {
      mat.vertexColors = false
      mat.color.set(0xc0c0c0)
      // Remove color attribute
      const geom = canGeometryRef.current
      if (geom && geom.getAttribute('color')) {
        geom.deleteAttribute('color')
      }
    }
    mat.needsUpdate = true
  }, [displayMode])

  // Sync load arrow visibility
  useEffect(() => {
    if (loadArrowRef.current) loadArrowRef.current.visible = showLoadArrow
  }, [showLoadArrow])

  // Sync gizmo mode
  useEffect(() => {
    if (transformControlsRef.current) {
      transformControlsRef.current.setMode(gizmoMode)
    }
  }, [gizmoMode])

  // Sync rigid body position/rotation from control panel
  useEffect(() => {
    const rb = rigidBodyRef.current
    if (rb && simState === 'idle') {
      rb.position.set(rigidPosX, rigidPosY, rigidPosZ)
      rb.rotation.set(
        rigidRotX * Math.PI / 180,
        rigidRotY * Math.PI / 180,
        rigidRotZ * Math.PI / 180
      )
    }
  }, [rigidPosX, rigidPosY, rigidPosZ, rigidRotX, rigidRotY, rigidRotZ, simState])

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
    // Clear chart data
    chartDataRef.current = []
    setChartData([])
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

  const handleFileLoaded = useCallback(async (buffer: ArrayBuffer, fileName: string, ext: string) => {
    const scene = sceneRef.current
    if (!scene) return

    try {
      let geometries: THREE.BufferGeometry[] = []

      if (ext === 'stl') {
        geometries = [loadSTL(buffer)]
      } else if (ext === 'stp' || ext === 'step') {
        console.warn('STEP file support requires OCCT.js WASM initialization (coming soon)')
        return
      } else {
        console.warn(`Unsupported file format: .${ext}`)
        return
      }

      const material = new THREE.MeshStandardMaterial({
        color: 0x88aacc,
        metalness: 0.4,
        roughness: 0.5,
        side: THREE.DoubleSide,
      })

      for (const geom of geometries) {
        const mesh = new THREE.Mesh(geom, material)
        mesh.name = `imported_${fileName}`
        scene.add(mesh)
      }

      console.log(`Loaded ${fileName}: ${geometries.length} geometries`)
    } catch (e) {
      console.error(`Failed to load ${fileName}:`, e)
    }
  }, [])

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 3D Viewport (70%) */}
      <FileDropZone onFileLoaded={handleFileLoaded}>
      <div
        ref={containerRef}
        style={{ flex: '1 1 70%', position: 'relative', minWidth: 0 }}
      >
        <ViewportToolbar
          onViewChange={handleViewChange}
          onTogglePerspective={handleTogglePerspective}
          onFitAll={handleFitAll}
          onToggleWireframe={handleToggleWireframe}
          isPerspective={isPerspective}
          gizmoMode={gizmoMode}
          onGizmoModeChange={setGizmoMode}
        />
        <ColorBar
          minVal={colorBarMin}
          maxVal={colorBarMax}
          colormapType={colormapType}
          label={displayMode === 'stress' ? 'Stress' : displayMode === 'displacement' ? 'Disp.' : displayMode === 'plastic' ? 'ε_p' : ''}
          unit={displayMode === 'stress' ? 'MPa' : displayMode === 'displacement' ? 'mm' : ''}
          visible={displayMode !== 'none'}
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
      </FileDropZone>
      {/* Control Panel (30%) */}
      <ControlPanel
        canDiameter={canDiameter}
        canHeight={canHeightParam}
        wallThickness={wallThickness}
        force={maxForce}
        speed={compressionSpeedParam}
        rigidShape={rigidShape}
        rigidRadius={rigidRadius}
        rigidHeight={rigidHeight}
        rigidPosX={rigidPosX}
        rigidPosY={rigidPosY}
        rigidPosZ={rigidPosZ}
        rigidRotX={rigidRotX}
        rigidRotY={rigidRotY}
        rigidRotZ={rigidRotZ}
        onCanDiameterChange={setCanDiameter}
        onCanHeightChange={setCanHeightParam}
        onWallThicknessChange={setWallThickness}
        onForceChange={setMaxForce}
        onSpeedChange={setCompressionSpeedParam}
        onRigidShapeChange={setRigidShape}
        onRigidRadiusChange={setRigidRadius}
        onRigidHeightChange={setRigidHeight}
        onRigidPosXChange={setRigidPosX}
        onRigidPosYChange={setRigidPosY}
        onRigidPosZChange={setRigidPosZ}
        onRigidRotXChange={setRigidRotX}
        onRigidRotYChange={setRigidRotY}
        onRigidRotZChange={setRigidRotZ}
        displayMode={displayMode}
        colormapType={colormapType}
        onDisplayModeChange={setDisplayMode}
        onColormapTypeChange={setColormapType}
        chartData={chartData}
      />
    </div>
  )
}
