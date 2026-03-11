import * as THREE from 'three'

// opencascade.js CDN-based dynamic loading (avoids Vite WASM bundling issues)
let ocInstance: any = null

const OCCT_CDN = 'https://cdn.jsdelivr.net/npm/opencascade.js@2.0.0-beta.b5ff984/dist/opencascade.full.js'

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = url
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`))
    document.head.appendChild(script)
  })
}

export async function initOCCT(): Promise<any> {
  if (ocInstance) return ocInstance
  try {
    // Try npm import first (works in dev mode), fall back to CDN
    // Use variable to prevent Vite from statically analyzing the import
    try {
      const modName = 'opencascade' + '.js'
      const ocModule = await (Function('m', 'return import(m)')(modName))
      const oc = await (ocModule.default as any)()
      ocInstance = oc
      console.log('OpenCASCADE.js initialized (npm)')
      return oc
    } catch {
      // npm import failed (production build) — use CDN
      await loadScript(OCCT_CDN)
      const ocFactory = (window as any).opencascade
      if (!ocFactory) throw new Error('opencascade.js CDN load failed')
      const oc = await ocFactory()
      ocInstance = oc
      console.log('OpenCASCADE.js initialized (CDN)')
      return oc
    }
  } catch (e) {
    console.error('Failed to initialize OpenCASCADE.js:', e)
    throw e
  }
}

/** Extract triangulated geometry from an OCCT TopoDS_Shape */
function extractGeometries(oc: any, shape: any): THREE.BufferGeometry[] {
  // Mesh the shape
  new oc.BRepMesh_IncrementalMesh_2(
    shape,
    0.1,  // linear deflection
    false,
    0.5,  // angular deflection
    false
  )

  const geometries: THREE.BufferGeometry[] = []
  const explorer = new oc.TopExp_Explorer_2(
    shape,
    oc.TopAbs_ShapeEnum.TopAbs_FACE,
    oc.TopAbs_ShapeEnum.TopAbs_SHAPE
  )

  while (explorer.More()) {
    const face = oc.TopoDS.Face_1(explorer.Current())
    const location = new oc.TopLoc_Location_1()
    const triangulation = oc.BRep_Tool.Triangulation(face, location)

    if (!triangulation.IsNull()) {
      const nbTriangles = triangulation.get().NbTriangles()
      const nbNodes = triangulation.get().NbNodes()

      const vertices = new Float32Array(nbNodes * 3)
      const indices: number[] = []

      for (let i = 1; i <= nbNodes; i++) {
        const node = triangulation.get().Node(i)
        const transformed = node.Transformed(location.Transformation())
        vertices[(i - 1) * 3] = transformed.X()
        vertices[(i - 1) * 3 + 1] = transformed.Y()
        vertices[(i - 1) * 3 + 2] = transformed.Z()
      }

      for (let i = 1; i <= nbTriangles; i++) {
        const triangle = triangulation.get().Triangle(i)
        indices.push(triangle.Value(1) - 1)
        indices.push(triangle.Value(2) - 1)
        indices.push(triangle.Value(3) - 1)
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      geometry.setIndex(indices)
      geometry.computeVertexNormals()
      geometries.push(geometry)
    }

    explorer.Next()
  }

  return geometries
}

export async function loadSTEP(
  fileBuffer: ArrayBuffer
): Promise<THREE.BufferGeometry[]> {
  const oc = await initOCCT()

  const fileName = '/input.step'
  oc.FS.writeFile(fileName, new Uint8Array(fileBuffer))

  const reader = new oc.STEPControl_Reader_1()
  const readResult = reader.ReadFile(fileName)
  if (readResult !== oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
    oc.FS.unlink(fileName)
    throw new Error('Failed to read STEP file')
  }

  reader.TransferRoots(new oc.Message_ProgressRange_1())
  const shape = reader.OneShape()
  const geometries = extractGeometries(oc, shape)

  oc.FS.unlink(fileName)
  return geometries
}

export async function loadIGES(
  fileBuffer: ArrayBuffer
): Promise<THREE.BufferGeometry[]> {
  const oc = await initOCCT()

  const fileName = '/input.iges'
  oc.FS.writeFile(fileName, new Uint8Array(fileBuffer))

  const reader = new oc.IGESControl_Reader_1()
  const readResult = reader.ReadFile(fileName)
  if (readResult !== oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
    oc.FS.unlink(fileName)
    throw new Error('Failed to read IGES file')
  }

  reader.TransferRoots(new oc.Message_ProgressRange_1())
  const shape = reader.OneShape()
  const geometries = extractGeometries(oc, shape)

  oc.FS.unlink(fileName)
  return geometries
}
