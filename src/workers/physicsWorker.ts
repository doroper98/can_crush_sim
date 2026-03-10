/**
 * Physics Web Worker for MassSpringSystem.
 * Runs physics simulation off the main thread.
 * Communicates via postMessage with transferable ArrayBuffers.
 */

import { MassSpringSystem } from '../engine/MassSpringSystem'

let physics: MassSpringSystem | null = null
let originalPositions: Float32Array | null = null

interface InitMessage {
  type: 'init'
  positions: Float32Array
  indices: Uint32Array
  nodeCount: number
}

interface StepMessage {
  type: 'step'
  rigidCx: number
  rigidCy: number
  rigidCz: number
  rigidRadius: number
  rigidHalfHeight: number
}

interface ResetMessage {
  type: 'reset'
  positions: Float32Array
}

interface QueryMessage {
  type: 'getStress' | 'getDisplacement' | 'getPlasticStrain'
}

type WorkerMessage = InitMessage | StepMessage | ResetMessage | QueryMessage

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data

  switch (msg.type) {
    case 'init': {
      // Create a minimal BufferGeometry-like object for MassSpringSystem
      // We need to build a fake geometry with position attribute and index
      const fakeGeom = {
        getAttribute: (name: string) => {
          if (name === 'position') {
            return {
              count: msg.nodeCount,
              getX: (i: number) => msg.positions[i * 3],
              getY: (i: number) => msg.positions[i * 3 + 1],
              getZ: (i: number) => msg.positions[i * 3 + 2],
            }
          }
          return null
        },
        getIndex: () => ({
          array: msg.indices,
        }),
      }

      physics = new MassSpringSystem(fakeGeom as any)
      originalPositions = new Float32Array(msg.positions)

      self.postMessage({ type: 'ready', nodeCount: physics.nodeCount })
      break
    }

    case 'step': {
      if (!physics) return

      physics.step()
      physics.applyRigidCylinderContact(
        msg.rigidCx, msg.rigidCy, msg.rigidCz,
        msg.rigidRadius, msg.rigidHalfHeight
      )

      // Send back positions (copy, not transfer, to keep worker state)
      const posCopy = new Float32Array(physics.positions)
      self.postMessage({ type: 'positions', positions: posCopy }, [posCopy.buffer] as any)
      break
    }

    case 'reset': {
      if (!physics) return
      // Rebuild positions from provided data
      for (let i = 0; i < physics.nodeCount * 3; i++) {
        physics.positions[i] = msg.positions[i]
        physics.prevPositions[i] = msg.positions[i]
      }
      physics.velocities.fill(0)
      for (const spring of physics.springs) {
        spring.plasticStrain = 0
        spring.currentRestLength = spring.restLength
      }
      originalPositions = new Float32Array(msg.positions)
      self.postMessage({ type: 'resetDone' })
      break
    }

    case 'getStress': {
      if (!physics) return
      const stress = physics.getStressPerNode()
      self.postMessage({ type: 'stress', values: stress }, [stress.buffer] as any)
      break
    }

    case 'getDisplacement': {
      if (!physics || !originalPositions) return
      const disp = physics.getDisplacementPerNode(originalPositions)
      self.postMessage({ type: 'displacement', values: disp }, [disp.buffer] as any)
      break
    }

    case 'getPlasticStrain': {
      if (!physics) return
      const strain = physics.getPlasticStrainPerNode()
      self.postMessage({ type: 'plasticStrain', values: strain }, [strain.buffer] as any)
      break
    }
  }
}
