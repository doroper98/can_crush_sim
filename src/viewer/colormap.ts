import * as THREE from 'three'

export type ColormapType = 'jet' | 'rainbow' | 'thermal'

/**
 * Maps a normalized value [0,1] to an RGB color using the specified colormap.
 */
export function colormapToRGB(t: number, type: ColormapType = 'jet'): THREE.Color {
  t = Math.max(0, Math.min(1, t))

  switch (type) {
    case 'jet':
      return jetColormap(t)
    case 'rainbow':
      return rainbowColormap(t)
    case 'thermal':
      return thermalColormap(t)
    default:
      return jetColormap(t)
  }
}

function jetColormap(t: number): THREE.Color {
  let r: number, g: number, b: number

  if (t < 0.125) {
    r = 0; g = 0; b = 0.5 + t * 4
  } else if (t < 0.375) {
    r = 0; g = (t - 0.125) * 4; b = 1
  } else if (t < 0.625) {
    r = (t - 0.375) * 4; g = 1; b = 1 - (t - 0.375) * 4
  } else if (t < 0.875) {
    r = 1; g = 1 - (t - 0.625) * 4; b = 0
  } else {
    r = 1 - (t - 0.875) * 4; g = 0; b = 0
  }

  return new THREE.Color(
    Math.max(0, Math.min(1, r)),
    Math.max(0, Math.min(1, g)),
    Math.max(0, Math.min(1, b))
  )
}

function rainbowColormap(t: number): THREE.Color {
  // HSL-based rainbow: H goes from 0 (red) to 0.8 (blue/violet)
  const h = (1 - t) * 0.8
  return new THREE.Color().setHSL(h, 1, 0.5)
}

function thermalColormap(t: number): THREE.Color {
  // Black → Red → Yellow → White
  let r: number, g: number, b: number

  if (t < 0.33) {
    const s = t / 0.33
    r = s; g = 0; b = 0
  } else if (t < 0.66) {
    const s = (t - 0.33) / 0.33
    r = 1; g = s; b = 0
  } else {
    const s = (t - 0.66) / 0.34
    r = 1; g = 1; b = s
  }

  return new THREE.Color(r, g, b)
}

/**
 * Apply per-vertex colors to a geometry from a scalar field.
 * @param geometry - Three.js BufferGeometry
 * @param values - scalar values per vertex
 * @param minVal - minimum value for normalization
 * @param maxVal - maximum value for normalization
 * @param cmType - colormap type
 */
export function applyVertexColors(
  geometry: THREE.BufferGeometry,
  values: Float32Array,
  minVal: number,
  maxVal: number,
  cmType: ColormapType = 'jet'
) {
  const count = geometry.getAttribute('position').count
  let colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute | null

  if (!colorAttr || colorAttr.count !== count) {
    colorAttr = new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3)
    geometry.setAttribute('color', colorAttr)
  }

  const range = maxVal - minVal
  const color = new THREE.Color()

  for (let i = 0; i < count; i++) {
    const t = range > 1e-10 ? (values[i] - minVal) / range : 0
    const c = colormapToRGB(t, cmType)
    colorAttr.setXYZ(i, c.r, c.g, c.b)
  }

  colorAttr.needsUpdate = true
}
