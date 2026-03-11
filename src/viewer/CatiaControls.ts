import * as THREE from 'three'

/**
 * CATIA V5 compatible camera controls:
 * - Middle button drag: Orbit
 * - Middle button + Ctrl drag: Pan
 * - Scroll wheel: Zoom
 */
export class CatiaControls {
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
  private domElement: HTMLElement
  private target = new THREE.Vector3()

  private spherical = new THREE.Spherical()
  private rotateStart = new THREE.Vector2()
  private panStart = new THREE.Vector2()

  private isRotating = false
  private isPanning = false

  // Touch state
  private touchStartPos = new THREE.Vector2()
  private touchStartPos2 = new THREE.Vector2()
  private touchStartDist = 0

  private rotateSpeed = 1.0
  private panSpeed = 1.0
  private zoomSpeed = 1.0

  enabled = true

  constructor(
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    domElement: HTMLElement
  ) {
    this.camera = camera
    this.domElement = domElement

    // Compute initial spherical from camera position
    const offset = new THREE.Vector3().subVectors(camera.position, this.target)
    this.spherical.setFromVector3(offset)

    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onWheel = this.onWheel.bind(this)
    this.onContextMenu = this.onContextMenu.bind(this)
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)

    domElement.addEventListener('mousedown', this.onMouseDown)
    domElement.addEventListener('mousemove', this.onMouseMove)
    domElement.addEventListener('mouseup', this.onMouseUp)
    domElement.addEventListener('mouseleave', this.onMouseUp)
    domElement.addEventListener('wheel', this.onWheel, { passive: false })
    domElement.addEventListener('contextmenu', this.onContextMenu)
    domElement.addEventListener('touchstart', this.onTouchStart, { passive: false })
    domElement.addEventListener('touchmove', this.onTouchMove, { passive: false })
    domElement.addEventListener('touchend', this.onTouchEnd)
  }

  private onContextMenu(e: Event) {
    e.preventDefault()
  }

  private onMouseDown(e: MouseEvent) {
    if (!this.enabled) return
    // Middle button = 1
    if (e.button !== 1) return

    if (e.ctrlKey) {
      this.isPanning = true
      this.panStart.set(e.clientX, e.clientY)
    } else {
      this.isRotating = true
      this.rotateStart.set(e.clientX, e.clientY)
    }
    e.preventDefault()
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.enabled) return

    if (this.isRotating) {
      const dx = e.clientX - this.rotateStart.x
      const dy = e.clientY - this.rotateStart.y

      this.spherical.theta -= dx * this.rotateSpeed * 0.005
      this.spherical.phi -= dy * this.rotateSpeed * 0.005
      this.spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this.spherical.phi))

      this.rotateStart.set(e.clientX, e.clientY)
      this.updateCamera()
    }

    if (this.isPanning) {
      const dx = e.clientX - this.panStart.x
      const dy = e.clientY - this.panStart.y

      const panOffset = new THREE.Vector3()
      const distance = this.spherical.radius

      // Pan relative to camera orientation
      const camRight = new THREE.Vector3()
      const camUp = new THREE.Vector3()
      this.camera.matrix.extractBasis(camRight, camUp, new THREE.Vector3())

      panOffset.addScaledVector(camRight, -dx * this.panSpeed * distance * 0.001)
      panOffset.addScaledVector(camUp, dy * this.panSpeed * distance * 0.001)

      this.target.add(panOffset)
      this.panStart.set(e.clientX, e.clientY)
      this.updateCamera()
    }
  }

  private onMouseUp(_e: MouseEvent) {
    this.isRotating = false
    this.isPanning = false
  }

  private onWheel(e: WheelEvent) {
    if (!this.enabled) return
    e.preventDefault()

    const factor = e.deltaY > 0 ? 1.1 : 0.9
    this.spherical.radius *= factor
    this.spherical.radius = Math.max(1, Math.min(10000, this.spherical.radius))
    this.updateCamera()
  }

  // Touch handlers: 1-finger = orbit, 2-finger = pan + pinch-zoom
  private onTouchStart(e: TouchEvent) {
    if (!this.enabled) return
    e.preventDefault()
    if (e.touches.length === 1) {
      this.isRotating = true
      this.isPanning = false
      this.touchStartPos.set(e.touches[0].clientX, e.touches[0].clientY)
    } else if (e.touches.length === 2) {
      this.isRotating = false
      this.isPanning = true
      const t0 = e.touches[0], t1 = e.touches[1]
      this.touchStartPos.set((t0.clientX + t1.clientX) / 2, (t0.clientY + t1.clientY) / 2)
      this.touchStartDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.enabled) return
    e.preventDefault()
    if (e.touches.length === 1 && this.isRotating) {
      const dx = e.touches[0].clientX - this.touchStartPos.x
      const dy = e.touches[0].clientY - this.touchStartPos.y
      this.spherical.theta -= dx * this.rotateSpeed * 0.005
      this.spherical.phi -= dy * this.rotateSpeed * 0.005
      this.spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this.spherical.phi))
      this.touchStartPos.set(e.touches[0].clientX, e.touches[0].clientY)
      this.updateCamera()
    } else if (e.touches.length === 2) {
      const t0 = e.touches[0], t1 = e.touches[1]
      const midX = (t0.clientX + t1.clientX) / 2
      const midY = (t0.clientY + t1.clientY) / 2
      // Pan
      const dx = midX - this.touchStartPos.x
      const dy = midY - this.touchStartPos.y
      const panOffset = new THREE.Vector3()
      const distance = this.spherical.radius
      const camRight = new THREE.Vector3()
      const camUp = new THREE.Vector3()
      this.camera.matrix.extractBasis(camRight, camUp, new THREE.Vector3())
      panOffset.addScaledVector(camRight, -dx * this.panSpeed * distance * 0.001)
      panOffset.addScaledVector(camUp, dy * this.panSpeed * distance * 0.001)
      this.target.add(panOffset)
      this.touchStartPos.set(midX, midY)
      // Pinch zoom
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
      if (this.touchStartDist > 0) {
        const factor = this.touchStartDist / dist
        this.spherical.radius *= factor
        this.spherical.radius = Math.max(1, Math.min(10000, this.spherical.radius))
      }
      this.touchStartDist = dist
      this.updateCamera()
    }
  }

  private onTouchEnd(_e: TouchEvent) {
    this.isRotating = false
    this.isPanning = false
    this.touchStartDist = 0
  }

  private updateCamera() {
    const offset = new THREE.Vector3().setFromSpherical(this.spherical)
    this.camera.position.copy(this.target).add(offset)
    this.camera.lookAt(this.target)
    this.camera.updateMatrixWorld()
  }

  setTarget(x: number, y: number, z: number) {
    this.target.set(x, y, z)
    this.updateCamera()
  }

  /** Set camera to a named view */
  setView(view: 'top' | 'front' | 'right' | 'iso') {
    const r = this.spherical.radius
    switch (view) {
      case 'top':
        this.spherical.theta = 0
        this.spherical.phi = 0.01
        break
      case 'front':
        this.spherical.theta = 0
        this.spherical.phi = Math.PI / 2
        break
      case 'right':
        this.spherical.theta = Math.PI / 2
        this.spherical.phi = Math.PI / 2
        break
      case 'iso':
        this.spherical.theta = Math.PI / 4
        this.spherical.phi = Math.PI / 3
        break
    }
    this.spherical.radius = r
    this.updateCamera()
  }

  /** Fit camera to show all objects in the scene */
  fitAll(scene: THREE.Scene) {
    const box = new THREE.Box3()
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
        box.expandByObject(obj)
      }
    })
    if (box.isEmpty()) return

    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)

    // Calculate distance to fit the bounding sphere
    let distance: number
    if (this.camera instanceof THREE.PerspectiveCamera) {
      const fov = this.camera.fov * Math.PI / 180
      distance = (maxDim / 2) / Math.tan(fov / 2) * 1.2 // 1.2x margin
    } else {
      distance = maxDim * 1.5
    }

    this.target.copy(center)
    this.spherical.radius = distance
    this.updateCamera()
  }

  dispose() {
    this.domElement.removeEventListener('mousedown', this.onMouseDown)
    this.domElement.removeEventListener('mousemove', this.onMouseMove)
    this.domElement.removeEventListener('mouseup', this.onMouseUp)
    this.domElement.removeEventListener('mouseleave', this.onMouseUp)
    this.domElement.removeEventListener('wheel', this.onWheel)
    this.domElement.removeEventListener('contextmenu', this.onContextMenu)
    this.domElement.removeEventListener('touchstart', this.onTouchStart)
    this.domElement.removeEventListener('touchmove', this.onTouchMove)
    this.domElement.removeEventListener('touchend', this.onTouchEnd)
  }
}
