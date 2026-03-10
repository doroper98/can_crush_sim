import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

const stlLoader = new STLLoader()

export function loadSTL(buffer: ArrayBuffer): THREE.BufferGeometry {
  return stlLoader.parse(buffer)
}
