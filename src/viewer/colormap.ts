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
  const h = (1 - t) * 0.8
  return new THREE.Color().setHSL(h, 1, 0.5)
}

function thermalColormap(t: number): THREE.Color {
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

// Inline RGB computation (no object allocation) for hot-path usage
function jetRGBInline(t: number, out: Float32Array, offset: number) {
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
  out[offset] = r < 0 ? 0 : r > 1 ? 1 : r
  out[offset + 1] = g < 0 ? 0 : g > 1 ? 1 : g
  out[offset + 2] = b < 0 ? 0 : b > 1 ? 1 : b
}

function thermalRGBInline(t: number, out: Float32Array, offset: number) {
  if (t < 0.33) {
    const s = t / 0.33
    out[offset] = s; out[offset + 1] = 0; out[offset + 2] = 0
  } else if (t < 0.66) {
    const s = (t - 0.33) / 0.33
    out[offset] = 1; out[offset + 1] = s; out[offset + 2] = 0
  } else {
    const s = (t - 0.66) / 0.34
    out[offset] = 1; out[offset + 1] = 1; out[offset + 2] = s
  }
}

function rainbowRGBInline(t: number, out: Float32Array, offset: number) {
  // HSL to RGB inline (S=1, L=0.5 → C=1, m=0)
  const h = (1 - t) * 0.8 * 6 // hue in [0,6)
  const x = 1 - Math.abs(h % 2 - 1)
  let r: number, g: number, b: number
  if (h < 1) { r = 1; g = x; b = 0 }
  else if (h < 2) { r = x; g = 1; b = 0 }
  else if (h < 3) { r = 0; g = 1; b = x }
  else if (h < 4) { r = 0; g = x; b = 1 }
  else if (h < 5) { r = x; g = 0; b = 1 }
  else { r = 1; g = 0; b = x }
  out[offset] = r; out[offset + 1] = g; out[offset + 2] = b
}

/**
 * Apply per-vertex colors to a geometry from a scalar field.
 * Optimized: uses direct array writes, no object allocation per vertex.
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

  const arr = colorAttr.array as Float32Array
  const range = maxVal - minVal
  const invRange = range > 1e-10 ? 1 / range : 0

  // Select inline function based on colormap type
  const fillFn = cmType === 'jet' ? jetRGBInline
    : cmType === 'thermal' ? thermalRGBInline
    : rainbowRGBInline

  for (let i = 0; i < count; i++) {
    const t = invRange > 0 ? (values[i] - minVal) * invRange : 0
    const tc = t < 0 ? 0 : t > 1 ? 1 : t
    fillFn(tc, arr, i * 3)
  }

  colorAttr.needsUpdate = true
}
