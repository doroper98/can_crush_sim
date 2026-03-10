import type * as THREE from 'three'
import { type MaterialModel, MATERIALS, DEFAULT_MATERIAL } from './MaterialModel'

interface Spring {
  i: number  // index of particle A
  j: number  // index of particle B
  restLength: number
  plasticStrain: number  // accumulated plastic strain
  currentRestLength: number  // rest length after plastic deformation
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
  yieldStress: number = 276    // MPa
  uts: number = 310            // MPa
  hardeningExponent: number = 0.2  // Ludwik-Hollomon n
  hardeningK: number = 0      // computed from uts, yieldStress, n

  // Simulation
  dt: number = 0.001       // time step (s)
  gravity: number = -9810  // mm/s² (9.81 m/s² → 9810 mm/s²)
  floorY: number = 0       // floor plane Y
  subSteps: number = 4

  // Pre-allocated result buffers (avoid GC pressure)
  private _stressBuf: Float32Array | null = null
  private _stressCount: Uint16Array | null = null
  private _dispBuf: Float32Array | null = null
  private _strainBuf: Float32Array | null = null
  private _strainCount: Uint16Array | null = null

  materialModel: MaterialModel

  constructor(geometry: THREE.BufferGeometry, options?: {
    density?: number      // kg/m³
    wallThickness?: number // mm
    youngsModulus?: number // MPa
    yieldStress?: number  // MPa
    uts?: number          // MPa
    hardeningExponent?: number
    materialKey?: string  // key from MATERIALS registry
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

    // Resolve material model
    const matKey = options?.materialKey ?? DEFAULT_MATERIAL
    const mat = MATERIALS[matKey] ?? MATERIALS[DEFAULT_MATERIAL]
    this.materialModel = mat

    // Compute physical parameters from material model
    const density = options?.density ?? mat.density
    const thickness = options?.wallThickness ?? mat.wallThickness
    const E = options?.youngsModulus ?? mat.youngsModulus

    this.yieldStress = options?.yieldStress ?? mat.yieldStress
    this.uts = options?.uts ?? mat.uts
    this.hardeningExponent = options?.hardeningExponent ?? mat.hardeningExponent

    // Estimate average edge length to compute spring stiffness
    let totalLen = 0
    for (const s of this.springs) {
      totalLen += s.restLength
    }
    const avgLen = this.springs.length > 0 ? totalLen / this.springs.length : 1

    const surfArea = 31665  // mm² (approximate for default can)
    const totalVolume = surfArea * thickness * 1e-9  // m³
    const totalMass = totalVolume * density
    this.mass = totalMass / this.nodeCount

    const crossSection = avgLen * thickness
    this.stiffness = E * crossSection / avgLen * 0.01
    this.damping = 0.995

    // Recompute hardeningK from (possibly overridden) values
    this.hardeningK = (this.uts - this.yieldStress) / Math.pow(0.3, this.hardeningExponent)

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

    this.springs.push({ i: a, j: b, restLength: len, plasticStrain: 0, currentRestLength: len })
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

      // Spring constraints with elasto-plastic model
      for (const spring of this.springs) {
        const { i: a, j: b } = spring
        const ai = a * 3, bi = b * 3

        let dx = this.positions[bi] - this.positions[ai]
        let dy = this.positions[bi + 1] - this.positions[ai + 1]
        let dz = this.positions[bi + 2] - this.positions[ai + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < 1e-10) continue

        // Compute strain relative to current rest length (accounts for plastic deformation)
        const strain = (dist - spring.currentRestLength) / spring.restLength
        const absStrain = Math.abs(strain)

        // Compute yield strain: ε_y = σ_y / E (for spring-based approximation)
        const yieldStrain = this.yieldStress / 69000  // ~0.004

        // Elasto-plastic: if strain exceeds yield, accumulate plastic strain
        if (absStrain > yieldStrain) {
          const plasticIncrement = (absStrain - yieldStrain) * 0.1  // partial plasticity per step
          spring.plasticStrain += plasticIncrement

          // Update rest length: permanent deformation
          // Ludwik-Hollomon: current yield = σ_y + K·ε_p^n
          const currentYieldStrain = yieldStrain +
            (this.hardeningK / 69000) * Math.pow(spring.plasticStrain, this.hardeningExponent)

          // Only update rest length if strain exceeds hardened yield
          if (absStrain > currentYieldStrain) {
            const excessStrain = absStrain - currentYieldStrain
            spring.currentRestLength += Math.sign(strain) * excessStrain * spring.restLength * 0.05
          }
        }

        // Elastic correction (toward current rest length)
        const elasticDiff = (dist - spring.currentRestLength) / dist
        const stiffFactor = this.stiffness * subDt * subDt / this.mass * 0.5
        const correction = Math.min(Math.max(elasticDiff * stiffFactor, -0.1), 0.1)

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

  /** Apply positions back to geometry (optimized: direct array copy) */
  syncToGeometry(geometry: THREE.BufferGeometry) {
    const posAttr = geometry.getAttribute('position')
    const arr = posAttr.array as Float32Array
    // Direct typed array copy — faster than per-element setXYZ calls
    arr.set(this.positions.subarray(0, this.nodeCount * 3))
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

  /**
   * Apply self-contact: prevent non-connected nodes from overlapping.
   * Uses spatial grid for O(n) average-case performance.
   */
  applySelfContact(minDist: number = 2.0) {
    const cellSize = minDist * 2
    const invCell = 1 / cellSize
    const grid = new Map<string, number[]>()

    // Build spatial grid
    for (let i = 0; i < this.nodeCount; i++) {
      if (this.fixed[i]) continue
      const cx = Math.floor(this.positions[i * 3] * invCell)
      const cy = Math.floor(this.positions[i * 3 + 1] * invCell)
      const cz = Math.floor(this.positions[i * 3 + 2] * invCell)
      const key = `${cx},${cy},${cz}`
      let list = grid.get(key)
      if (!list) { list = []; grid.set(key, list) }
      list.push(i)
    }

    // Build adjacency set for fast lookup
    if (!this._adjSet) {
      this._adjSet = new Set<number>()
      for (const spring of this.springs) {
        const a = spring.i, b = spring.j
        const key = a < b ? a * this.nodeCount + b : b * this.nodeCount + a
        this._adjSet.add(key)
      }
    }

    // Check nearby cells for each node
    const minDist2 = minDist * minDist
    for (const [, nodes] of grid) {
      for (let ni = 0; ni < nodes.length; ni++) {
        const a = nodes[ni]
        const ai = a * 3
        for (let nj = ni + 1; nj < nodes.length; nj++) {
          const b = nodes[nj]
          // Skip if connected by spring
          const adjKey = a < b ? a * this.nodeCount + b : b * this.nodeCount + a
          if (this._adjSet.has(adjKey)) continue

          const bi = b * 3
          const dx = this.positions[bi] - this.positions[ai]
          const dy = this.positions[bi + 1] - this.positions[ai + 1]
          const dz = this.positions[bi + 2] - this.positions[ai + 2]
          const dist2 = dx * dx + dy * dy + dz * dz

          if (dist2 < minDist2 && dist2 > 1e-10) {
            const dist = Math.sqrt(dist2)
            const overlap = (minDist - dist) * 0.5
            const nx = dx / dist
            const ny = dy / dist
            const nz = dz / dist

            if (!this.fixed[a]) {
              this.positions[ai] -= nx * overlap
              this.positions[ai + 1] -= ny * overlap
              this.positions[ai + 2] -= nz * overlap
            }
            if (!this.fixed[b]) {
              this.positions[bi] += nx * overlap
              this.positions[bi + 1] += ny * overlap
              this.positions[bi + 2] += nz * overlap
            }
          }
        }
      }
    }
  }

  private _adjSet: Set<number> | null = null

  /** Check if system is stable (no NaN, no explosion) */
  isStable(): boolean {
    for (let i = 0; i < this.positions.length; i++) {
      if (!isFinite(this.positions[i])) return false
      if (Math.abs(this.positions[i]) > 10000) return false
    }
    return true
  }

  /**
   * Compute approximate stress per node (MPa).
   * For each spring, compute engineering stress = E * strain.
   * Each node's stress is the average of connected springs' |stress|.
   * This approximates Von Mises equivalent stress for this mass-spring model.
   */
  getStressPerNode(): Float32Array {
    // Reuse pre-allocated buffers
    if (!this._stressBuf || this._stressBuf.length !== this.nodeCount) {
      this._stressBuf = new Float32Array(this.nodeCount)
      this._stressCount = new Uint16Array(this.nodeCount)
    }
    const stress = this._stressBuf
    const count = this._stressCount!
    stress.fill(0)
    count.fill(0)
    const E = 69000 // MPa

    for (let si = 0, len = this.springs.length; si < len; si++) {
      const spring = this.springs[si]
      const a = spring.i, b = spring.j
      const ai = a * 3, bi = b * 3

      const dx = this.positions[bi] - this.positions[ai]
      const dy = this.positions[bi + 1] - this.positions[ai + 1]
      const dz = this.positions[bi + 2] - this.positions[ai + 2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      const strain = (dist - spring.restLength) / spring.restLength
      let springStress = E * Math.abs(strain)

      if (spring.plasticStrain > 0) {
        const yieldStress = this.yieldStress +
          this.hardeningK * Math.pow(spring.plasticStrain, this.hardeningExponent)
        springStress = Math.max(springStress, yieldStress)
      }

      stress[a] += springStress
      stress[b] += springStress
      count[a]++
      count[b]++
    }

    for (let i = 0; i < this.nodeCount; i++) {
      if (count[i] > 0) stress[i] /= count[i]
    }

    // Return a copy (caller may transfer ownership)
    return new Float32Array(stress)
  }

  /**
   * Compute displacement magnitude per node (mm).
   * Requires original positions to be stored.
   */
  getDisplacementPerNode(originalPositions: Float32Array): Float32Array {
    if (!this._dispBuf || this._dispBuf.length !== this.nodeCount) {
      this._dispBuf = new Float32Array(this.nodeCount)
    }
    const disp = this._dispBuf
    for (let i = 0; i < this.nodeCount; i++) {
      const idx = i * 3
      const dx = this.positions[idx] - originalPositions[idx]
      const dy = this.positions[idx + 1] - originalPositions[idx + 1]
      const dz = this.positions[idx + 2] - originalPositions[idx + 2]
      disp[i] = Math.sqrt(dx * dx + dy * dy + dz * dz)
    }
    return new Float32Array(disp)
  }

  /**
   * Get plastic strain per node (averaged from connected springs).
   */
  getPlasticStrainPerNode(): Float32Array {
    if (!this._strainBuf || this._strainBuf.length !== this.nodeCount) {
      this._strainBuf = new Float32Array(this.nodeCount)
      this._strainCount = new Uint16Array(this.nodeCount)
    }
    const strain = this._strainBuf
    const count = this._strainCount!
    strain.fill(0)
    count.fill(0)

    for (let si = 0, len = this.springs.length; si < len; si++) {
      const spring = this.springs[si]
      strain[spring.i] += spring.plasticStrain
      strain[spring.j] += spring.plasticStrain
      count[spring.i]++
      count[spring.j]++
    }

    for (let i = 0; i < this.nodeCount; i++) {
      if (count[i] > 0) strain[i] /= count[i]
    }

    return new Float32Array(strain)
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
    // Reset plastic deformation
    for (const spring of this.springs) {
      spring.plasticStrain = 0
      spring.currentRestLength = spring.restLength
    }
  }
}
