/**
 * Material Model Plugin Interface (NF-07)
 *
 * Any material model must implement this interface.
 * The MassSpringSystem uses it to compute yield stress and hardening.
 */
export interface MaterialModel {
  name: string
  youngsModulus: number     // MPa
  poissonRatio: number      // dimensionless
  yieldStress: number       // MPa
  uts: number               // MPa (Ultimate Tensile Strength)
  density: number           // kg/m³
  hardeningExponent: number // Ludwik-Hollomon n
  wallThickness: number     // mm (default shell thickness)

  /** Compute flow stress at given plastic strain (Ludwik-Hollomon) */
  flowStress(plasticStrain: number): number

  /** Compute hardening coefficient K from material properties */
  hardeningK(): number
}

/** Base implementation with Ludwik-Hollomon hardening */
function createMaterial(props: Omit<MaterialModel, 'flowStress' | 'hardeningK'>): MaterialModel {
  const K = (props.uts - props.yieldStress) / Math.pow(0.3, props.hardeningExponent)
  return {
    ...props,
    hardeningK: () => K,
    flowStress: (plasticStrain: number) => {
      return props.yieldStress + K * Math.pow(Math.max(plasticStrain, 1e-10), props.hardeningExponent)
    },
  }
}

/** Built-in materials library */
export const MATERIALS: Record<string, MaterialModel> = {
  aluminum_6061: createMaterial({
    name: 'Aluminum 6061-T6',
    youngsModulus: 69000,
    poissonRatio: 0.33,
    yieldStress: 276,
    uts: 310,
    density: 2700,
    hardeningExponent: 0.2,
    wallThickness: 0.3,
  }),
  aluminum_3003: createMaterial({
    name: 'Aluminum 3003-H14',
    youngsModulus: 69000,
    poissonRatio: 0.33,
    yieldStress: 145,
    uts: 150,
    density: 2730,
    hardeningExponent: 0.25,
    wallThickness: 0.1,
  }),
  aluminum_5052: createMaterial({
    name: 'Aluminum 5052-H32',
    youngsModulus: 70000,
    poissonRatio: 0.33,
    yieldStress: 193,
    uts: 228,
    density: 2680,
    hardeningExponent: 0.22,
    wallThickness: 0.3,
  }),
  aluminum_7075: createMaterial({
    name: 'Aluminum 7075-T6',
    youngsModulus: 72000,
    poissonRatio: 0.33,
    yieldStress: 503,
    uts: 572,
    density: 2810,
    hardeningExponent: 0.12,
    wallThickness: 0.3,
  }),
  steel_mild: createMaterial({
    name: 'Mild Steel (AISI 1018)',
    youngsModulus: 200000,
    poissonRatio: 0.3,
    yieldStress: 370,
    uts: 440,
    density: 7850,
    hardeningExponent: 0.15,
    wallThickness: 0.5,
  }),
  steel_ss304: createMaterial({
    name: 'Stainless Steel 304',
    youngsModulus: 193000,
    poissonRatio: 0.29,
    yieldStress: 215,
    uts: 505,
    density: 8000,
    hardeningExponent: 0.45,
    wallThickness: 0.5,
  }),
  copper_c110: createMaterial({
    name: 'Copper C110',
    youngsModulus: 117000,
    poissonRatio: 0.34,
    yieldStress: 69,
    uts: 220,
    density: 8960,
    hardeningExponent: 0.54,
    wallThickness: 0.3,
  }),
  titanium_ti6al4v: createMaterial({
    name: 'Titanium Ti-6Al-4V',
    youngsModulus: 114000,
    poissonRatio: 0.34,
    yieldStress: 880,
    uts: 950,
    density: 4430,
    hardeningExponent: 0.1,
    wallThickness: 0.3,
  }),
  brass_c260: createMaterial({
    name: 'Brass C260 (Cartridge)',
    youngsModulus: 110000,
    poissonRatio: 0.35,
    yieldStress: 200,
    uts: 365,
    density: 8530,
    hardeningExponent: 0.42,
    wallThickness: 0.3,
  }),
}

/** Get material keys for UI dropdown */
export const MATERIAL_KEYS = Object.keys(MATERIALS)

/** Get default material */
export const DEFAULT_MATERIAL = 'aluminum_6061'
