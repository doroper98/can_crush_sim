import type * as THREE from 'three'

interface Spring {
  i: number  // index of particle A
  j: number  // index of particle B
  restLength: number
}

/**
 * Mass-Spring system with Verlet integration.
 * Converts a Three.js BufferGeometry into mass points + springs.
 */
export class MassSpringSystem {
  // Flat arrays: [x0,y0,z0, x1,y1,z1, ...]
  positions: Float32Array
  prevPositions: Float32Array
  velocities: Float32Array
  fixed: Uint8Array  // 1 = pinned
  springs: Spring[]
  nodeCount: number
  mass: number       // per particle (kg)

  // Material parameters
  stiffness: number  // spring constant (N/m)
  damping: number    // velocity damping factor

  // Simulation
  dt: number = 0.001       // time step (s)
  gravity: number = -9810  // mm/s² (9.81 m/s² → 9810 mm/s²)
  floorY: number = 0       // floor plane Y
  subSteps: number = 4

  constructor(geometry: THREE.BufferGeometry, options?: {
    density?: number      // kg/m³
    wallThickness?: number // mm
    youngsModulus?: number // MPa
  }) {
    const posAttr = geometry.getAttribute('position')
    this.nodeCount = posAttr.count

    // Initialize position arrays
    this.positions = new Float32Array(this.nodeCount * 3)
    this.prevPositions = new Float32Array(this.nodeCount * 3)
    this.velocities = new Float32Array(this.nodeCount * 3)
    this.fixed = new Uint8Array(this.nodeCount)

    for (let i = 0; i < this.nodeCount; i++) {
      const x = posAttr.getX(i)
      const y = posAttr.getY(i)
      const z = posAttr.getZ(i)
      this.positions[i * 3] = x
      this.positions[i * 3 + 1] = y
      this.positions[i * 3 + 2] = z
      this.prevPositions[i * 3] = x
      this.prevPositions[i * 3 + 1] = y
      this.prevPositions[i * 3 + 2] = z
    }

    // Build springs from edges (unique edges from index buffer)
    this.springs = []
    const edgeSet = new Set<string>()
    const index = geometry.getIndex()

    if (index) {
      const indices = index.array
      for (let f = 0; f < indices.length; f += 3) {
        const a = indices[f], b = indices[f + 1], c = indices[f + 2]
        this.addEdge(a, b, edgeSet)
        this.addEdge(b, c, edgeSet)
        this.addEdge(a, c, edgeSet)
      }
    }

    // Compute physical parameters
    const density = options?.density ?? 2700          // kg/m³
    const thickness = options?.wallThickness ?? 0.3   // mm
    const E = options?.youngsModulus ?? 69000          // MPa

    // Estimate average edge length to compute spring stiffness
    let totalLen = 0
    for (const s of this.springs) {
      totalLen += s.restLength
    }
    const avgLen = this.springs.length > 0 ? totalLen / this.springs.length : 1

    // Mass per particle: approximate surface area / nodeCount * thickness * density
    // For a cylinder: A ≈ 2πr·h + 2πr² ≈ 2π·33·120 + 2π·33² ≈ 31665 mm²
    // Total volume ≈ A·t = 31665·0.3 = 9500 mm³ = 9.5e-6 m³
    // Total mass ≈ 9.5e-6·2700 ≈ 0.0257 kg
    const surfArea = 31665  // mm² (approximate for default can)
    const totalVolume = surfArea * thickness * 1e-9  // m³
    const totalMass = totalVolume * density
    this.mass = totalMass / this.nodeCount

    // Spring stiffness: k = E·A/L where A = cross-section ≈ avgLen·t
    // E in MPa = N/mm², A in mm², L in mm → k in N/mm
    // Convert to N/mm for mm-based simulation
    const crossSection = avgLen * thickness
    this.stiffness = E * crossSection / avgLen * 0.01  // scale factor for stability
    this.damping = 0.995

    // Fix bottom nodes (y close to 0)
    this.fixBottomNodes(2.0) // tolerance in mm
  }

  private addEdge(a: number, b: number, edgeSet: Set<string>) {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`
    if (edgeSet.has(key)) return
    edgeSet.add(key)

    const dx = this.positions[a * 3] - this.positions[b * 3]
    const dy = this.positions[a * 3 + 1] - this.positions[b * 3 + 1]
    const dz = this.positions[a * 3 + 2] - this.positions[b * 3 + 2]
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz)

    this.springs.push({ i: a, j: b, restLength: len })
  }

  private fixBottomNodes(tolerance: number) {
    // Find minimum Y
    let minY = Infinity
    for (let i = 0; i < this.nodeCount; i++) {
      const y = this.positions[i * 3 + 1]
      if (y < minY) minY = y
    }
    // Fix nodes near bottom
    for (let i = 0; i < this.nodeCount; i++) {
      if (this.positions[i * 3 + 1] <= minY + tolerance) {
        this.fixed[i] = 1
      }
    }
  }

  step() {
    const subDt = this.dt / this.subSteps

    for (let sub = 0; sub < this.subSteps; sub++) {
      // Verlet integration
      for (let i = 0; i < this.nodeCount; i++) {
        if (this.fixed[i]) continue

        const idx = i * 3
        for (let d = 0; d < 3; d++) {
          const cur = this.positions[idx + d]
          const prev = this.prevPositions[idx + d]
          const acc = d === 1 ? this.gravity * this.mass : 0 // gravity on Y

          const newPos = cur + (cur - prev) * this.damping + acc * subDt * subDt
          this.prevPositions[idx + d] = cur
          this.positions[idx + d] = newPos
        }
      }

      // Spring constraints
      for (const spring of this.springs) {
        const { i: a, j: b, restLength } = spring
        const ai = a * 3, bi = b * 3

        let dx = this.positions[bi] - this.positions[ai]
        let dy = this.positions[bi + 1] - this.positions[ai + 1]
        let dz = this.positions[bi + 2] - this.positions[ai + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < 1e-10) continue

        const diff = (dist - restLength) / dist
        const stiffFactor = this.stiffness * subDt * subDt / this.mass * 0.5

        // Clamp correction for stability
        const correction = Math.min(Math.max(diff * stiffFactor, -0.1), 0.1)

        dx *= correction
        dy *= correction
        dz *= correction

        const fixA = this.fixed[a]
        const fixB = this.fixed[b]

        if (!fixA && !fixB) {
          this.positions[ai] += dx
          this.positions[ai + 1] += dy
          this.positions[ai + 2] += dz
          this.positions[bi] -= dx
          this.positions[bi + 1] -= dy
          this.positions[bi + 2] -= dz
        } else if (!fixA) {
          this.positions[ai] += dx * 2
          this.positions[ai + 1] += dy * 2
          this.positions[ai + 2] += dz * 2
        } else if (!fixB) {
          this.positions[bi] -= dx * 2
          this.positions[bi + 1] -= dy * 2
          this.positions[bi + 2] -= dz * 2
        }
      }

      // Floor constraint
      for (let i = 0; i < this.nodeCount; i++) {
        if (this.positions[i * 3 + 1] < this.floorY) {
          this.positions[i * 3 + 1] = this.floorY
          this.prevPositions[i * 3 + 1] = this.floorY
        }
      }
    }
  }

  /** Apply positions back to geometry */
  syncToGeometry(geometry: THREE.BufferGeometry) {
    const posAttr = geometry.getAttribute('position')
    for (let i = 0; i < this.nodeCount; i++) {
      posAttr.setXYZ(
        i,
        this.positions[i * 3],
        this.positions[i * 3 + 1],
        this.positions[i * 3 + 2]
      )
    }
    posAttr.needsUpdate = true
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
  }

  /**
   * Apply rigid body cylinder contact (Penalty Method).
   * The rigid body pushes particles out of its volume.
   */
  applyRigidCylinderContact(
    cx: number, cy: number, cz: number,  // center of rigid cylinder
    radius: number,
    halfHeight: number,
    penaltyStiffness: number = 5000
  ) {
    for (let i = 0; i < this.nodeCount; i++) {
      if (this.fixed[i]) continue
      const idx = i * 3
      const px = this.positions[idx]
      const py = this.positions[idx + 1]
      const pz = this.positions[idx + 2]

      // Check if particle is inside the rigid cylinder
      // Cylinder axis is Y, centered at (cx, cy, cz)
      const dy = py - cy
      if (Math.abs(dy) > halfHeight) continue

      const dx = px - cx
      const dz = pz - cz
      const distXZ = Math.sqrt(dx * dx + dz * dz)

      if (distXZ >= radius) continue

      // Particle is inside cylinder — push it out
      // Find shortest escape: radial or axial
      const radialPen = radius - distXZ
      const axialPenTop = halfHeight - dy
      const axialPenBot = halfHeight + dy

      if (radialPen < axialPenTop && radialPen < axialPenBot) {
        // Push radially
        if (distXZ > 1e-6) {
          const nx = dx / distXZ
          const nz = dz / distXZ
          this.positions[idx] = cx + nx * radius
          this.positions[idx + 2] = cz + nz * radius
          this.prevPositions[idx] = this.positions[idx]
          this.prevPositions[idx + 2] = this.positions[idx + 2]
        }
      } else if (axialPenTop < axialPenBot) {
        // Push up (above cylinder)
        this.positions[idx + 1] = cy + halfHeight
        this.prevPositions[idx + 1] = this.positions[idx + 1]
      } else {
        // Push down (below cylinder)
        this.positions[idx + 1] = cy - halfHeight
        this.prevPositions[idx + 1] = this.positions[idx + 1]
      }
    }
  }

  /** Check if system is stable (no NaN, no explosion) */
  isStable(): boolean {
    for (let i = 0; i < this.positions.length; i++) {
      if (!isFinite(this.positions[i])) return false
      if (Math.abs(this.positions[i]) > 10000) return false
    }
    return true
  }

  /** Reset to rest positions */
  reset(geometry: THREE.BufferGeometry) {
    const posAttr = geometry.getAttribute('position')
    for (let i = 0; i < this.nodeCount; i++) {
      const x = posAttr.getX(i)
      const y = posAttr.getY(i)
      const z = posAttr.getZ(i)
      this.positions[i * 3] = x
      this.positions[i * 3 + 1] = y
      this.positions[i * 3 + 2] = z
      this.prevPositions[i * 3] = x
      this.prevPositions[i * 3 + 1] = y
      this.prevPositions[i * 3 + 2] = z
    }
    this.velocities.fill(0)
  }
}
