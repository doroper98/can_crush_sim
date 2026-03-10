import * as THREE from 'three'

/**
 * Axis indicator rendered in bottom-left corner (80×80px).
 * RGB = XYZ, synchronized with main camera rotation.
 */
export class AxisHelper {
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private renderer: THREE.WebGLRenderer
  private container: HTMLDivElement

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div')
    this.container.style.cssText =
      'position:absolute;left:10px;bottom:10px;width:80px;height:80px;pointer-events:none;'
    parent.appendChild(this.container)

    this.scene = new THREE.Scene()

    const s = 1.5
    this.camera = new THREE.OrthographicCamera(-s, s, s, -s, 0.1, 100)
    this.camera.position.set(0, 0, 5)

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    this.renderer.setSize(80, 80)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(0x000000, 0)
    this.container.appendChild(this.renderer.domElement)

    // Create axes
    const axisLen = 1.0
    const colors = [0xff0000, 0x00ff00, 0x0000ff] // RGB = XYZ
    const dirs = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
    ]
    const labels = ['X', 'Y', 'Z']

    dirs.forEach((dir, i) => {
      // Arrow
      const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(), axisLen, colors[i], 0.2, 0.1)
      this.scene.add(arrow)

      // Label sprite
      const canvas = document.createElement('canvas')
      canvas.width = 32
      canvas.height = 32
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = `#${colors[i].toString(16).padStart(6, '0')}`
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(labels[i], 16, 16)

      const tex = new THREE.CanvasTexture(canvas)
      const spriteMat = new THREE.SpriteMaterial({ map: tex })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.scale.set(0.4, 0.4, 1)
      sprite.position.copy(dir.clone().multiplyScalar(axisLen + 0.25))
      this.scene.add(sprite)
    })
  }

  update(mainCamera: THREE.Camera) {
    // Sync rotation: copy main camera quaternion to axis camera position
    const q = mainCamera.quaternion.clone()
    const pos = new THREE.Vector3(0, 0, 5).applyQuaternion(q)
    this.camera.position.copy(pos)
    this.camera.quaternion.copy(q)

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.renderer.dispose()
    this.container.parentElement?.removeChild(this.container)
  }
}
