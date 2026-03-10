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
import { MATERIALS, DEFAULT_MATERIAL } from './engine/MaterialModel'
import { CanvasRecorder } from './viewer/recorder'
import StatusBar from './components/StatusBar'
import KeyboardHelp from './components/KeyboardHelp'

/** LOD: compute radial/height segments based on camera distance */
function getLODSegments(cameraDistance: number): { radial: number; height: number } {
  if (cameraDistance > 800) return { radial: 16, height: 10 }
  if (cameraDistance > 400) return { radial: 24, height: 14 }
  return { radial: 32, height: 20 } // full detail
}

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
  const lodLevelRef = useRef<{ radial: number; height: number }>({ radial: 32, height: 20 })
  const screenshotRef = useRef<() => void>(() => {})
  // Refs for animation loop to access current parameter values
  const canRadiusRef = useRef(33)
  const canHeightRef = useRef(120)
  const compressionSpeedRef = useRef(10)
  const rigidRadiusRef = useRef(40)
  const rigidHeightRef = useRef(20)
  const controlModeRef = useRef<'displacement' | 'force'>('displacement')
  const maxForceRef = useRef(500)
  const matUTSRef = useRef(310)
  const materialKeyRef = useRef('aluminum_6061')
  const wallThicknessRef = useRef(0.3)
  const matYieldStressRef = useRef(276)
  const matHardeningNRef = useRef(0.2)

  const [isPerspective, setIsPerspective] = useState(true)
  const [isWireframe, setIsWireframe] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [simState, setSimState] = useState<'idle' | 'running' | 'paused'>('idle')
  const [canDiameter, setCanDiameter] = useState(66)
  const [canHeightParam, setCanHeightParam] = useState(120)
  const [wallThickness, setWallThickness] = useState(0.3)
  const [maxForce, setMaxForce] = useState(500)
  const [controlMode, setControlMode] = useState<'displacement' | 'force'>('displacement')
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
  const [timeScale, setTimeScale] = useState(1.0)
  const timeScaleRef = useRef(1.0)
  const stepOnceRef = useRef(false)
  const [materialKey, setMaterialKey] = useState('aluminum_6061')
  const [matYoungsModulus, setMatYoungsModulus] = useState(69000)
  const [matYieldStress, setMatYieldStress] = useState(276)
  const [matUTS, setMatUTS] = useState(310)
  const [matHardeningN, setMatHardeningN] = useState(0.2)
  const recorderRef = useRef(new CanvasRecorder())
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [fps, setFps] = useState(60)
  const [nodeCount, setNodeCount] = useState(693)
  const fpsFrames = useRef(0)
  const fpsLastTime = useRef(performance.now())
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number; z: number } | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showAbout, setShowAbout] = useState(() => !localStorage.getItem('cancrush_visited'))
  const [deformScale, setDeformScale] = useState(1.0)
  const deformScaleRef = useRef(1.0)
  const [simTime, setSimTime] = useState(0)
  const [simDisplacement, setSimDisplacement] = useState(0)
  const [pickedNode, setPickedNode] = useState<{
    x: number; y: number; stress: number; disp: number; plastic: number; nodeIdx: number
  } | null>(null)
  const [clipEnabled, setClipEnabled] = useState(false)
  const [clipY, setClipY] = useState(60) // clipping plane Y position (mm)
  const clipPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, -1, 0), 60))
  const maxStressMarkerRef = useRef<THREE.Sprite | null>(null)
  const [resultSummary, setResultSummary] = useState<{
    maxStress: number; maxDisp: number; maxPlastic: number; energyAbsorbed: number
  } | null>(null)
  const [measureMode, setMeasureMode] = useState(false)
  const measureModeRef = useRef(false)
  const measurePt1Ref = useRef<THREE.Vector3 | null>(null)
  const measureLineRef = useRef<THREE.Line | null>(null)
  const measureLabelRef = useRef<THREE.Sprite | null>(null)
  const [measureDist, setMeasureDist] = useState<number | null>(null)

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
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.localClippingEnabled = true
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

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
      clippingPlanes: [clipPlaneRef.current],
      clipShadows: true,
    })
    const canMesh = new THREE.Mesh(canGeometry, canMaterial)
    scene.add(canMesh)
    canMeshRef.current = canMesh

    // Physics engine
    const physics = new MassSpringSystem(canGeometry)
    physicsRef.current = physics

    // Store original positions for displacement calculation
    originalPositionsRef.current = new Float32Array(physics.positions)

    // Boundary condition markers: show fixed bottom nodes as small triangles
    const bcPositions: number[] = []
    for (let i = 0; i < physics.nodeCount; i++) {
      if (physics.fixed[i]) {
        bcPositions.push(
          physics.positions[i * 3],
          physics.positions[i * 3 + 1],
          physics.positions[i * 3 + 2]
        )
      }
    }
    const bcGeom = new THREE.BufferGeometry()
    bcGeom.setAttribute('position', new THREE.Float32BufferAttribute(bcPositions, 3))
    const bcPoints = new THREE.Points(
      bcGeom,
      new THREE.PointsMaterial({ color: 0xef4444, size: 4, sizeAttenuation: false })
    )
    bcPoints.name = 'bcMarkers'
    scene.add(bcPoints)

    // Max stress probe marker (SpriteMaterial with canvas texture)
    const markerCanvas = document.createElement('canvas')
    markerCanvas.width = 128
    markerCanvas.height = 48
    const markerCtx = markerCanvas.getContext('2d')!
    const markerTexture = new THREE.CanvasTexture(markerCanvas)
    const markerSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: markerTexture, transparent: true, depthTest: false })
    )
    markerSprite.scale.set(40, 15, 1)
    markerSprite.visible = false
    markerSprite.name = 'maxStressMarker'
    scene.add(markerSprite)
    maxStressMarkerRef.current = markerSprite

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

    // Animation loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)

      const doStep = simRunningRef.current || stepOnceRef.current
      if (stepOnceRef.current) stepOnceRef.current = false

      // Read current params from refs (not closured constants)
      const curCanHeight = canHeightRef.current
      const curCanRadius = canRadiusRef.current
      const curSpeed = compressionSpeedRef.current
      const curRigidRadius = rigidRadiusRef.current
      const curRigidHeight = rigidHeightRef.current
      const curControlMode = controlModeRef.current
      const curMaxForce = maxForceRef.current
      const maxDisplacement = curCanHeight * 0.67 // compress up to ~67% of can height
      const physics = physicsRef.current!
      const geom = canGeometryRef.current!

      if (doStep) {
        // Move rigid body down
        const displacement = simTimeRef.current * curSpeed
        if (displacement < maxDisplacement) {
          const rigidY = curCanHeight + curRigidHeight / 2 + 5 - displacement
          rigidMesh.position.y = rigidY

          // Physics step
          physics.step()

          // Apply rigid body contact
          physics.applyRigidCylinderContact(
            0, rigidY, 0,  // rigid body center
            curRigidRadius,
            curRigidHeight / 2
          )

          // Apply self-contact (prevent wall overlap)
          physics.applySelfContact(2.0)

          // Sync physics → geometry
          physics.syncToGeometry(geom)

          // Apply deformation magnification
          const curDeformScale = deformScaleRef.current
          if (curDeformScale !== 1.0 && originalPositionsRef.current) {
            const pos = geom.attributes.position.array as Float32Array
            const orig = originalPositionsRef.current
            const len = pos.length
            for (let i = 0; i < len; i++) {
              pos[i] = orig[i] + (pos[i] - orig[i]) * curDeformScale
            }
            geom.attributes.position.needsUpdate = true
          }

          // Estimate current load force
          const stresses = physics.getStressPerNode()
          let avgTopStress = 0
          let topCount = 0
          const threshold = curCanHeight - displacement - 5
          for (let ni = 0; ni < physics.nodeCount; ni++) {
            if (physics.positions[ni * 3 + 1] > threshold) {
              avgTopStress += stresses[ni]
              topCount++
            }
          }
          if (topCount > 0) avgTopStress /= topCount
          const crossArea = Math.PI * curCanRadius * 0.3
          const estimatedForce = avgTopStress * crossArea * 0.001

          // Force control: pause if force exceeds limit
          if (curControlMode === 'force' && estimatedForce > curMaxForce) {
            simRunningRef.current = false
            setSimState('paused')
          }

          // Record load-displacement data (every 10 frames)
          if (colorBarUpdateCounter.current % 10 === 0) {
            chartDataRef.current.push({ displacement, load: estimatedForce })
            setChartData(chartDataRef.current.slice())
            setSimTime(simTimeRef.current)
            setSimDisplacement(displacement)

            // Result summary: compute max stress, max disp, max plastic, energy
            let maxS = 0, maxD = 0, maxP = 0
            for (let ni = 0; ni < stresses.length; ni++) {
              if (stresses[ni] > maxS) maxS = stresses[ni]
            }
            if (originalPositionsRef.current) {
              const disps = physics.getDisplacementPerNode(originalPositionsRef.current)
              for (let ni = 0; ni < disps.length; ni++) {
                if (disps[ni] > maxD) maxD = disps[ni]
              }
            }
            const plastics = physics.getPlasticStrainPerNode()
            for (let ni = 0; ni < plastics.length; ni++) {
              if (plastics[ni] > maxP) maxP = plastics[ni]
            }
            // Energy absorbed: trapezoidal integration of load-displacement curve
            let energy = 0
            const cd = chartDataRef.current
            for (let ci = 1; ci < cd.length; ci++) {
              energy += 0.5 * (cd[ci - 1].load + cd[ci].load) * (cd[ci].displacement - cd[ci - 1].displacement) * 0.001
            }
            setResultSummary({ maxStress: maxS, maxDisp: maxD, maxPlastic: maxP, energyAbsorbed: energy })
          }

          // Apply colormap if display mode is active
          const dm = displayModeRef.current
          if (dm !== 'none') {
            let values: Float32Array
            let maxRange: number

            if (dm === 'stress') {
              values = physics.getStressPerNode()
              maxRange = matUTSRef.current // UTS as max reference
            } else if (dm === 'displacement' && originalPositionsRef.current) {
              values = physics.getDisplacementPerNode(originalPositionsRef.current)
              maxRange = maxDisplacement
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

            applyVertexColors(geom, values, minV, maxV, colormapTypeRef.current)

            // Update colorbar labels (throttled)
            if (colorBarUpdateCounter.current % 10 === 0) {
              setColorBarMin(minV)
              setColorBarMax(maxV)
            }

            // Update max stress marker (throttled)
            if (dm === 'stress' && colorBarUpdateCounter.current % 10 === 0) {
              let maxIdx = 0
              let maxVal = -1
              for (let vi = 0; vi < values.length; vi++) {
                if (values[vi] > maxVal) { maxVal = values[vi]; maxIdx = vi }
              }
              const marker = maxStressMarkerRef.current
              if (marker) {
                const px = physics.positions[maxIdx * 3]
                const py = physics.positions[maxIdx * 3 + 1]
                const pz = physics.positions[maxIdx * 3 + 2]
                marker.position.set(px, py + 8, pz)
                marker.visible = true
                // Update label text
                markerCtx.clearRect(0, 0, 128, 48)
                markerCtx.fillStyle = 'rgba(220,38,38,0.85)'
                markerCtx.roundRect(0, 0, 128, 48, 8)
                markerCtx.fill()
                markerCtx.fillStyle = '#fff'
                markerCtx.font = 'bold 18px sans-serif'
                markerCtx.textAlign = 'center'
                markerCtx.fillText(`${maxVal.toFixed(0)} MPa`, 64, 32)
                markerTexture.needsUpdate = true
              }
            }
          } else {
            // Hide marker when display mode is none or not stress
            if (maxStressMarkerRef.current) maxStressMarkerRef.current.visible = false
          }

          // Check stability
          if (!physics.isStable()) {
            simRunningRef.current = false
            setSimState('paused')
            console.warn('Physics instability detected, pausing simulation')
          }

          simTimeRef.current += (1 / 60) * timeScaleRef.current // assume 60fps × timeScale
        } else {
          simRunningRef.current = false
          setSimState('idle')
        }
      }

      // Update load arrow position to follow rigid body
      if (loadArrow.visible) {
        loadArrow.position.set(
          rigidMesh.position.x,
          rigidMesh.position.y + curRigidHeight / 2 + 5,
          rigidMesh.position.z
        )
      }

      // LOD: check camera distance every 30 frames (only when not simulating)
      if (!simRunningRef.current && colorBarUpdateCounter.current % 30 === 0) {
        const camDist = camera.position.length()
        const newLOD = getLODSegments(camDist)
        const curLOD = lodLevelRef.current
        if (newLOD.radial !== curLOD.radial || newLOD.height !== curLOD.height) {
          lodLevelRef.current = newLOD
          // Rebuild can geometry with new segment counts
          const r = canRadiusRef.current
          const h = canHeightRef.current
          const newGeom = new THREE.CylinderGeometry(
            r, r, h, newLOD.radial, newLOD.height, false
          )
          newGeom.translate(0, h / 2, 0)
          canMesh.geometry.dispose()
          canMesh.geometry = newGeom
          canGeometryRef.current = newGeom
          // Rebuild physics for new geometry
          const newPhysics = new MassSpringSystem(newGeom, {
            materialKey: materialKeyRef.current,
            wallThickness: wallThicknessRef.current,
            youngsModulus: undefined, // use material default
            yieldStress: matYieldStressRef.current,
            uts: matUTSRef.current,
            hardeningExponent: matHardeningNRef.current,
          })
          physicsRef.current = newPhysics
          originalPositionsRef.current = new Float32Array(newPhysics.positions)
        }
      }
      colorBarUpdateCounter.current++

      // FPS counter
      fpsFrames.current++
      const now = performance.now()
      if (now - fpsLastTime.current >= 1000) {
        setFps(fpsFrames.current)
        fpsFrames.current = 0
        fpsLastTime.current = now
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
          controls.fitAll(scene)
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
        case 's': case 'S':
          if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement)) {
            screenshotRef.current()
          }
          break
        case 'b': case 'B':
          bcPoints.visible = !bcPoints.visible
          break
        case '?':
          setShowHelp(prev => !prev)
          break
        case 'd': case 'D':
          if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement)) {
            setDarkMode(prev => !prev)
          }
          break
        case 'm': case 'M':
          if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement)) {
            setMeasureMode(prev => !prev)
            measurePt1Ref.current = null
          }
          break
      }
      if (e.code === 'Numpad7') controls.setView('top')
      if (e.code === 'Numpad3') controls.setView('right')
      if (e.code === 'Numpad1') controls.setView('front')
      if (e.code === 'Numpad0') controls.setView('iso')
    }
    window.addEventListener('keydown', onKeyDown)

    // Mouse → world coordinate (raycast to Y=0 ground plane, throttled 100ms)
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersectPt = new THREE.Vector3()
    let lastCursorUpdate = 0
    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now()
      if (now - lastCursorUpdate < 100) return // throttle 100ms
      lastCursorUpdate = now
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      if (raycaster.ray.intersectPlane(groundPlane, intersectPt)) {
        setCursorWorld({ x: intersectPt.x, y: intersectPt.y, z: intersectPt.z })
      }
      // Node picking: raycast against canMesh for per-node info tooltip
      const hits = raycaster.intersectObject(canMesh, false)
      if (hits.length > 0 && physicsRef.current && simRunningRef.current === false) {
        const hit = hits[0]
        const face = hit.face
        if (face) {
          const pos = canGeometryRef.current?.attributes.position
          if (pos) {
            // Find nearest vertex index from the hit face
            const va = new THREE.Vector3().fromBufferAttribute(pos, face.a)
            const vb = new THREE.Vector3().fromBufferAttribute(pos, face.b)
            const vc = new THREE.Vector3().fromBufferAttribute(pos, face.c)
            const hp = hit.point
            const da = va.distanceToSquared(hp)
            const db = vb.distanceToSquared(hp)
            const dc = vc.distanceToSquared(hp)
            const nearestIdx = da <= db && da <= dc ? face.a : db <= dc ? face.b : face.c
            const phys = physicsRef.current
            const stresses = phys.getStressPerNode()
            const disps = originalPositionsRef.current ? phys.getDisplacementPerNode(originalPositionsRef.current) : null
            const plastics = phys.getPlasticStrainPerNode()
            setPickedNode({
              x: e.clientX, y: e.clientY,
              stress: stresses[nearestIdx],
              disp: disps ? disps[nearestIdx] : 0,
              plastic: plastics[nearestIdx],
              nodeIdx: nearestIdx,
            })
          }
        }
      } else {
        setPickedNode(null)
      }
    }
    container.addEventListener('mousemove', onMouseMove)

    // Left-click: object selection or measurement
    const selectables = [canMesh, rigidMesh]
    const onClickSelect = (e: MouseEvent) => {
      if (e.button !== 0) return
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)

      // Measure mode: click two points on any mesh
      if (measureModeRef.current) {
        const meshHits = raycaster.intersectObjects([canMesh, rigidMesh], false)
        let pt: THREE.Vector3 | null = null
        if (meshHits.length > 0) {
          pt = meshHits[0].point.clone()
        } else if (raycaster.ray.intersectPlane(groundPlane, intersectPt)) {
          pt = intersectPt.clone()
        }
        if (pt) {
          if (!measurePt1Ref.current) {
            // First point
            measurePt1Ref.current = pt
            setMeasureDist(null)
            // Remove previous measurement visuals
            if (measureLineRef.current) { scene.remove(measureLineRef.current); measureLineRef.current.geometry.dispose(); measureLineRef.current = null }
            if (measureLabelRef.current) { scene.remove(measureLabelRef.current); measureLabelRef.current = null }
          } else {
            // Second point: draw line + label
            const p1 = measurePt1Ref.current
            const p2 = pt
            const dist = p1.distanceTo(p2)
            setMeasureDist(dist)

            // Remove old
            if (measureLineRef.current) { scene.remove(measureLineRef.current); measureLineRef.current.geometry.dispose() }
            if (measureLabelRef.current) { scene.remove(measureLabelRef.current) }

            // Line
            const lineGeom = new THREE.BufferGeometry().setFromPoints([p1, p2])
            const line = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 2 }))
            scene.add(line)
            measureLineRef.current = line

            // Label at midpoint
            const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
            const labelCanvas = document.createElement('canvas')
            labelCanvas.width = 128; labelCanvas.height = 32
            const ctx = labelCanvas.getContext('2d')!
            ctx.fillStyle = 'rgba(34,197,94,0.9)'
            ctx.roundRect(0, 0, 128, 32, 6)
            ctx.fill()
            ctx.fillStyle = '#fff'
            ctx.font = 'bold 16px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(`${dist.toFixed(1)} mm`, 64, 22)
            const labelTex = new THREE.CanvasTexture(labelCanvas)
            const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthTest: false }))
            label.position.copy(mid).add(new THREE.Vector3(0, 5, 0))
            label.scale.set(30, 7.5, 1)
            scene.add(label)
            measureLabelRef.current = label

            measurePt1Ref.current = null // ready for next measurement
          }
        }
        return
      }

      const hits = raycaster.intersectObjects(selectables, false)
      // Clear previous selection highlight
      for (const obj of selectables) {
        const mat = obj.material as THREE.MeshStandardMaterial
        mat.emissive.set(0x000000)
      }
      if (hits.length > 0) {
        const selected = hits[0].object as THREE.Mesh
        const mat = selected.material as THREE.MeshStandardMaterial
        mat.emissive.set(0x222244)
        // Attach gizmo to rigid body if selected
        if (selected === rigidMesh) {
          transformControls.attach(rigidMesh)
        }
      } else {
        // Deselect: detach gizmo is optional — keep attached to rigid body
      }
    }
    container.addEventListener('click', onClickSelect)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('click', onClickSelect)
      transformControls.detach()
      transformControls.dispose()
      controls.dispose()
      axisHelper.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  // Sync dark mode
  useEffect(() => {
    const scene = sceneRef.current
    if (scene) {
      scene.background = new THREE.Color(darkMode ? 0x1e293b : 0xf0f4f8)
    }
    const grid = gridRef.current
    if (grid) {
      ;(grid.material as THREE.LineBasicMaterial).color.set(darkMode ? 0x334155 : 0xcccccc)
    }
  }, [darkMode])

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

  // Sync material properties when material key changes
  useEffect(() => {
    const mat = MATERIALS[materialKey] ?? MATERIALS[DEFAULT_MATERIAL]
    setMatYoungsModulus(mat.youngsModulus)
    setMatYieldStress(mat.yieldStress)
    setMatUTS(mat.uts)
    setMatHardeningN(mat.hardeningExponent)
  }, [materialKey])

  // Keep refs in sync
  useEffect(() => { displayModeRef.current = displayMode }, [displayMode])
  useEffect(() => { colormapTypeRef.current = colormapType }, [colormapType])
  useEffect(() => { timeScaleRef.current = timeScale }, [timeScale])
  useEffect(() => { canRadiusRef.current = canDiameter / 2 }, [canDiameter])
  useEffect(() => { canHeightRef.current = canHeightParam }, [canHeightParam])
  useEffect(() => { compressionSpeedRef.current = compressionSpeedParam }, [compressionSpeedParam])
  useEffect(() => { rigidRadiusRef.current = rigidRadius }, [rigidRadius])
  useEffect(() => { rigidHeightRef.current = rigidHeight }, [rigidHeight])
  useEffect(() => { controlModeRef.current = controlMode }, [controlMode])
  useEffect(() => { maxForceRef.current = maxForce }, [maxForce])
  useEffect(() => { matUTSRef.current = matUTS }, [matUTS])
  useEffect(() => { materialKeyRef.current = materialKey }, [materialKey])
  useEffect(() => { wallThicknessRef.current = wallThickness }, [wallThickness])
  useEffect(() => { matYieldStressRef.current = matYieldStress }, [matYieldStress])
  useEffect(() => { matHardeningNRef.current = matHardeningN }, [matHardeningN])
  useEffect(() => { deformScaleRef.current = deformScale }, [deformScale])

  useEffect(() => { measureModeRef.current = measureMode }, [measureMode])

  // Sync clipping plane
  useEffect(() => {
    clipPlaneRef.current.constant = clipY
  }, [clipY])

  useEffect(() => {
    const mesh = canMeshRef.current
    if (!mesh) return
    const mat = mesh.material as THREE.MeshStandardMaterial
    if (clipEnabled) {
      mat.clippingPlanes = [clipPlaneRef.current]
    } else {
      mat.clippingPlanes = []
    }
    mat.needsUpdate = true
  }, [clipEnabled])

  // Rebuild can when parameters change (idle only, debounced 200ms)
  const rebuildTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (simState !== 'idle') return
    if (rebuildTimerRef.current) clearTimeout(rebuildTimerRef.current)
    rebuildTimerRef.current = setTimeout(() => {
      const mesh = canMeshRef.current
      if (!mesh) return
      const r = canDiameter / 2
      const h = canHeightParam
      const newGeom = new THREE.CylinderGeometry(r, r, h, 32, 20, false)
      newGeom.translate(0, h / 2, 0)
      mesh.geometry.dispose()
      mesh.geometry = newGeom
      canGeometryRef.current = newGeom
      const physics = new MassSpringSystem(newGeom, {
        materialKey, wallThickness,
        yieldStress: matYieldStress, uts: matUTS, hardeningExponent: matHardeningN,
        youngsModulus: matYoungsModulus,
      })
      physicsRef.current = physics
      originalPositionsRef.current = new Float32Array(physics.positions)
      setNodeCount(physics.nodeCount)
      if (rigidBodyRef.current) {
        rigidBodyRef.current.position.y = h + rigidHeight / 2 + 5
        setRigidPosY(Math.round(h + rigidHeight / 2 + 5))
      }
    }, 200)
    return () => { if (rebuildTimerRef.current) clearTimeout(rebuildTimerRef.current) }
  }, [canDiameter, canHeightParam, wallThickness, materialKey, matYoungsModulus, matYieldStress, matUTS, matHardeningN])

  // Sync display mode → material vertexColors + mesh edge overlay
  const edgeLinesRef = useRef<THREE.LineSegments | null>(null)
  useEffect(() => {
    const mesh = canMeshRef.current
    if (!mesh) return
    const mat = mesh.material as THREE.MeshStandardMaterial
    if (displayMode !== 'none') {
      mat.vertexColors = true
      mat.color.set(0xffffff) // neutral base for vertex colors
      // Add edge overlay
      if (!edgeLinesRef.current) {
        const geom = canGeometryRef.current
        if (geom) {
          const edges = new THREE.EdgesGeometry(geom, 30)
          const lines = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.15, transparent: true })
          )
          mesh.add(lines)
          edgeLinesRef.current = lines
        }
      }
    } else {
      mat.vertexColors = false
      mat.color.set(0xc0c0c0)
      // Remove color attribute
      const geom = canGeometryRef.current
      if (geom && geom.getAttribute('color')) {
        geom.deleteAttribute('color')
      }
      // Remove edge overlay
      if (edgeLinesRef.current) {
        edgeLinesRef.current.geometry.dispose()
        mesh.remove(edgeLinesRef.current)
        edgeLinesRef.current = null
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

  // Rebuild rigid body geometry when shape/size changes
  useEffect(() => {
    const rb = rigidBodyRef.current
    if (!rb || simState !== 'idle') return
    let newGeom: THREE.BufferGeometry
    switch (rigidShape) {
      case 'box':
        newGeom = new THREE.BoxGeometry(rigidRadius * 2, rigidHeight, rigidRadius * 2, 4, 4, 4)
        break
      case 'sphere':
        newGeom = new THREE.SphereGeometry(rigidRadius, 32, 16)
        break
      case 'cone':
        newGeom = new THREE.ConeGeometry(rigidRadius, rigidHeight, 32)
        break
      default: // cylinder
        newGeom = new THREE.CylinderGeometry(rigidRadius, rigidRadius, rigidHeight, 32, 1)
        break
    }
    // Dispose old geometry and wireframe overlay
    rb.geometry.dispose()
    rb.geometry = newGeom
    // Replace wireframe child
    if (rb.children.length > 0) {
      const oldWire = rb.children[0]
      if (oldWire instanceof THREE.LineSegments) {
        oldWire.geometry.dispose()
        rb.remove(oldWire)
      }
    }
    const wireGeom = new THREE.WireframeGeometry(newGeom)
    const wireLine = new THREE.LineSegments(
      wireGeom,
      new THREE.LineBasicMaterial({ color: 0x2563eb, opacity: 0.8, transparent: true })
    )
    rb.add(wireLine)
  }, [rigidShape, rigidRadius, rigidHeight, simState])

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
    const scene = sceneRef.current
    if (controlsRef.current && scene) {
      controlsRef.current.fitAll(scene)
    }
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

  const handleStep = useCallback(() => {
    stepOnceRef.current = true
    setSimState('paused')
  }, [])

  const handleToggleRecord = useCallback(() => {
    const recorder = recorderRef.current
    const renderer = rendererRef.current
    if (!renderer) return

    if (recorder.isRecording) {
      recorder.stop()
      setIsRecording(false)
    } else {
      recorder.start(renderer.domElement, 30)
      setIsRecording(true)
    }
  }, [])

  const handleScreenshot = useCallback(() => {
    const renderer = rendererRef.current
    if (!renderer) return
    // Force a render to ensure current frame is captured
    const dataURL = renderer.domElement.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `cancrush_${Date.now()}.png`
    link.href = dataURL
    link.click()
  }, [])
  screenshotRef.current = handleScreenshot

  const handleReset = useCallback(() => {
    simRunningRef.current = false
    simTimeRef.current = 0
    setSimState('idle')
    chartDataRef.current = []
    setChartData([])
    setResultSummary(null)
    // Rebuild geometry with current parameters
    const mesh = canMeshRef.current
    if (mesh) {
      const r = canDiameter / 2
      const h = canHeightParam
      const newGeom = new THREE.CylinderGeometry(r, r, h, 32, 20, false)
      newGeom.translate(0, h / 2, 0)
      mesh.geometry.dispose()
      mesh.geometry = newGeom
      canGeometryRef.current = newGeom
      const physics = new MassSpringSystem(newGeom, {
        materialKey, wallThickness,
        yieldStress: matYieldStress, uts: matUTS, hardeningExponent: matHardeningN,
        youngsModulus: matYoungsModulus,
      })
      physicsRef.current = physics
      originalPositionsRef.current = new Float32Array(physics.positions)
      setNodeCount(physics.nodeCount)
    }
    // Reset rigid body position
    if (rigidBodyRef.current) {
      const h = canHeightParam
      rigidBodyRef.current.position.set(0, h + rigidHeight / 2 + 5, 0)
      setRigidPosY(Math.round(h + rigidHeight / 2 + 5))
    }
  }, [canDiameter, canHeightParam, wallThickness, materialKey, rigidHeight, matYoungsModulus, matYieldStress, matUTS, matHardeningN])

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

  const handleSavePreset = useCallback((name: string) => {
    const preset = {
      canDiameter, canHeight: canHeightParam, wallThickness, maxForce, compressionSpeed: compressionSpeedParam,
      rigidShape, rigidRadius, rigidHeight, materialKey,
      matYoungsModulus, matYieldStress, matUTS, matHardeningN,
    }
    const presets = JSON.parse(localStorage.getItem('cancrush_presets') || '{}')
    presets[name] = preset
    localStorage.setItem('cancrush_presets', JSON.stringify(presets))
    setPresetName(name)
  }, [canDiameter, canHeightParam, wallThickness, maxForce, compressionSpeedParam, rigidShape, rigidRadius, rigidHeight, materialKey, matYoungsModulus, matYieldStress, matUTS, matHardeningN])

  const handleLoadPreset = useCallback((name: string) => {
    const presets = JSON.parse(localStorage.getItem('cancrush_presets') || '{}')
    const p = presets[name]
    if (!p) return
    setCanDiameter(p.canDiameter)
    setCanHeightParam(p.canHeight)
    setWallThickness(p.wallThickness)
    setMaxForce(p.maxForce)
    setCompressionSpeedParam(p.compressionSpeed)
    setRigidShape(p.rigidShape)
    setRigidRadius(p.rigidRadius)
    setRigidHeight(p.rigidHeight)
    setMaterialKey(p.materialKey)
    setMatYoungsModulus(p.matYoungsModulus)
    setMatYieldStress(p.matYieldStress)
    setMatUTS(p.matUTS)
    setMatHardeningN(p.matHardeningN)
    setPresetName(name)
  }, [])

  const handleDeletePreset = useCallback((name: string) => {
    const presets = JSON.parse(localStorage.getItem('cancrush_presets') || '{}')
    delete presets[name]
    localStorage.setItem('cancrush_presets', JSON.stringify(presets))
    if (presetName === name) setPresetName('')
  }, [presetName])

  const getPresetNames = useCallback((): string[] => {
    const presets = JSON.parse(localStorage.getItem('cancrush_presets') || '{}')
    return Object.keys(presets)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
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
          onScreenshot={handleScreenshot}
          onHelp={() => setShowHelp(prev => !prev)}
          onToggleDarkMode={() => setDarkMode(prev => !prev)}
          darkMode={darkMode}
          measureMode={measureMode}
          onToggleMeasure={() => { setMeasureMode(prev => !prev); measurePt1Ref.current = null }}
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
          background: 'rgba(240,244,248,0.95)',
          padding: '8px 16px',
          borderRadius: 16,
          boxShadow: '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.8)',
        }}>
          <button
            onClick={simState === 'running' ? handlePause : handlePlay}
            style={{
              padding: '7px 18px',
              border: 'none',
              borderRadius: 12,
              background: simState === 'running' ? '#f59e0b' : '#10b981',
              color: 'white',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '3px 3px 6px rgba(163,177,198,0.5), -3px -3px 6px rgba(255,255,255,0.7)',
              transition: 'box-shadow 0.15s, transform 0.15s',
            }}
          >
            {simState === 'running' ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleStep}
            disabled={simState === 'running'}
            style={{
              padding: '7px 14px',
              border: 'none',
              borderRadius: 12,
              background: simState === 'running' ? '#94a3b8' : '#6366f1',
              color: 'white',
              fontWeight: 600,
              fontSize: 13,
              cursor: simState === 'running' ? 'not-allowed' : 'pointer',
              boxShadow: '3px 3px 6px rgba(163,177,198,0.5), -3px -3px 6px rgba(255,255,255,0.7)',
              transition: 'box-shadow 0.15s, transform 0.15s',
            }}
          >
            Step
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '7px 18px',
              border: 'none',
              borderRadius: 12,
              background: '#ef4444',
              color: 'white',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '3px 3px 6px rgba(163,177,198,0.5), -3px -3px 6px rgba(255,255,255,0.7)',
              transition: 'box-shadow 0.15s, transform 0.15s',
            }}
          >
            Reset
          </button>
          <button
            onClick={handleToggleRecord}
            style={{
              padding: '7px 14px',
              border: 'none',
              borderRadius: 12,
              background: isRecording ? '#dc2626' : '#374151',
              color: 'white',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '3px 3px 6px rgba(163,177,198,0.5), -3px -3px 6px rgba(255,255,255,0.7)',
              transition: 'box-shadow 0.15s, transform 0.15s',
            }}
          >
            {isRecording ? 'Stop Rec' : 'Record'}
          </button>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            color: '#64748b',
            fontSize: 12,
          }}>
            {measureMode ? (measurePt1Ref.current ? 'Click 2nd point' : 'Click 1st point') : isRecording ? 'Recording...' : simState === 'idle' ? 'Ready' : simState === 'running' ? 'Simulating...' : 'Paused'}
            {measureDist !== null && !measureMode && ` | d=${measureDist.toFixed(1)}mm`}
          </span>
        </div>
        {/* Node info tooltip */}
        {pickedNode && (
          <div style={{
            position: 'fixed',
            left: pickedNode.x + 12,
            top: pickedNode.y - 10,
            background: 'rgba(15,23,42,0.9)',
            color: '#e2e8f0',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 11,
            lineHeight: 1.5,
            pointerEvents: 'none',
            zIndex: 100,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontWeight: 600, color: '#93c5fd', marginBottom: 2 }}>Node #{pickedNode.nodeIdx}</div>
            <div>σ: {pickedNode.stress.toFixed(1)} MPa</div>
            <div>d: {pickedNode.disp.toFixed(3)} mm</div>
            <div>ε_p: {(pickedNode.plastic * 100).toFixed(2)} %</div>
          </div>
        )}
      </div>
      </FileDropZone>
      {/* Control Panel (30%) */}
      <ControlPanel
        canDiameter={canDiameter}
        canHeight={canHeightParam}
        wallThickness={wallThickness}
        force={maxForce}
        controlMode={controlMode}
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
        onControlModeChange={setControlMode}
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
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        materialKey={materialKey}
        onMaterialKeyChange={setMaterialKey}
        matYoungsModulus={matYoungsModulus}
        matYieldStress={matYieldStress}
        matUTS={matUTS}
        matHardeningN={matHardeningN}
        onMatYoungsModulusChange={setMatYoungsModulus}
        onMatYieldStressChange={setMatYieldStress}
        onMatUTSChange={setMatUTS}
        onMatHardeningNChange={setMatHardeningN}
        deformScale={deformScale}
        onDeformScaleChange={setDeformScale}
        clipEnabled={clipEnabled}
        clipY={clipY}
        onClipEnabledChange={setClipEnabled}
        onClipYChange={setClipY}
        resultSummary={resultSummary}
        presetName={presetName}
        presetNames={getPresetNames()}
        onSavePreset={handleSavePreset}
        onLoadPreset={handleLoadPreset}
        onDeletePreset={handleDeletePreset}
      />
    </div>
    <StatusBar
      simState={simState}
      fps={fps}
      nodeCount={nodeCount}
      cursorWorld={cursorWorld}
      simTime={simTime}
      displacement={simDisplacement}
      displayInfo={displayMode !== 'none' ? {
        mode: displayMode === 'stress' ? 'σ (MPa)' : displayMode === 'displacement' ? 'd (mm)' : 'ε_p',
        min: colorBarMin,
        max: colorBarMax,
      } : null}
    />
    <KeyboardHelp visible={showHelp} onClose={() => setShowHelp(false)} />
    {showAbout && (
      <div
        onClick={() => { setShowAbout(false); localStorage.setItem('cancrush_visited', '1') }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#f0f4f8', borderRadius: 20, padding: '28px 36px', maxWidth: 480,
            boxShadow: '12px 12px 24px rgba(163,177,198,0.6), -12px -12px 24px rgba(255,255,255,0.8)',
          }}
        >
          <h2 style={{ margin: '0 0 12px', fontSize: 18, color: '#0f172a' }}>Can Crush Simulator</h2>
          <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, margin: '0 0 12px' }}>
            Real-time elasto-plastic aluminum can crushing simulation with Mass-Spring FEM,
            Ludwik-Hollomon hardening, and Von Mises stress analysis.
          </p>
          <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.8 }}>
            <div><strong>Play/Pause/Reset</strong> — Start or stop the simulation</div>
            <div><strong>W</strong> — Wireframe toggle</div>
            <div><strong>M</strong> — Measurement tool</div>
            <div><strong>D</strong> — Dark mode</div>
            <div><strong>?</strong> — All keyboard shortcuts</div>
          </div>
          <button
            onClick={() => { setShowAbout(false); localStorage.setItem('cancrush_visited', '1') }}
            style={{
              marginTop: 16, width: '100%', padding: '10px 0', border: 'none', borderRadius: 12,
              background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              boxShadow: '4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.8)',
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    )}
    </div>
  )
}
