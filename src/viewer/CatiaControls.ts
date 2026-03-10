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

    domElement.addEventListener('mousedown', this.onMouseDown)
    domElement.addEventListener('mousemove', this.onMouseMove)
    domElement.addEventListener('mouseup', this.onMouseUp)
    domElement.addEventListener('mouseleave', this.onMouseUp)
    domElement.addEventListener('wheel', this.onWheel, { passive: false })
    domElement.addEventListener('contextmenu', this.onContextMenu)
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
  }
}
