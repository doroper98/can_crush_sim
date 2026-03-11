import * as THREE from 'three'

// opencascade.js CDN-based dynamic loading
let ocInstance: any = null

const OCCT_CDN_JS = 'https://cdn.jsdelivr.net/npm/opencascade.js@2.0.0-beta.b5ff984/dist/opencascade.full.js'
const OCCT_CDN_WASM = 'https://cdn.jsdelivr.net/npm/opencascade.js@2.0.0-beta.b5ff984/dist/opencascade.full.wasm'

export async function initOCCT(): Promise<any> {
  if (ocInstance) return ocInstance
  try {
    const ocModule = await import(/* @vite-ignore */ OCCT_CDN_JS)
    const ocFactory = ocModule.default
    const oc = await new ocFactory({
      locateFile(path: string) {
        if (path.endsWith('.wasm')) return OCCT_CDN_WASM
        return path
      }
    })
    ocInstance = oc
    console.log('OpenCASCADE.js initialized (CDN, ~48MB WASM loaded)')
    return oc
  } catch (e) {
    console.error('Failed to initialize OpenCASCADE.js:', e)
    throw e
  }
}

/** Extract a single merged BufferGeometry from an OCCT TopoDS_Shape */
function extractGeometries(oc: any, shape: any): THREE.BufferGeometry[] {
  // Tessellate the shape
  new oc.BRepMesh_IncrementalMesh_2(shape, 0.1, false, 0.5, false)

  const allPositions: number[] = []
  const allIndices: number[] = []
  let vertexOffset = 0

  const explorer = new oc.TopExp_Explorer_2(
    shape,
    oc.TopAbs_ShapeEnum.TopAbs_FACE,
    oc.TopAbs_ShapeEnum.TopAbs_SHAPE
  )

  while (explorer.More()) {
    const face = oc.TopoDS.Face_1(explorer.Current())
    const location = new oc.TopLoc_Location_1()
    const handleTri = oc.BRep_Tool.Triangulation(face, location, 0)

    if (!handleTri.IsNull()) {
      const tri = handleTri.get()
      const nbNodes = tri.NbNodes()
      const nbTriangles = tri.NbTriangles()
      const transform = location.Transformation()

      // Check if face is reversed (for correct winding order)
      const isReversed = face.Orientation_1() === oc.TopAbs_Orientation.TopAbs_REVERSED

      // Extract vertices with location transform
      for (let i = 1; i <= nbNodes; i++) {
        const pt = tri.Node(i).Transformed(transform)
        allPositions.push(pt.X(), pt.Y(), pt.Z())
      }

      // Extract triangle indices (OCCT is 1-based → convert to 0-based + offset)
      for (let i = 1; i <= nbTriangles; i++) {
        const triangle = tri.Triangle(i)
        const n1 = triangle.Value(1) - 1 + vertexOffset
        const n2 = triangle.Value(2) - 1 + vertexOffset
        const n3 = triangle.Value(3) - 1 + vertexOffset

        if (isReversed) {
          allIndices.push(n1, n3, n2) // flip winding
        } else {
          allIndices.push(n1, n2, n3)
        }
      }

      vertexOffset += nbNodes
    }

    explorer.Next()
  }

  if (allPositions.length === 0) return []

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(allPositions, 3))
  geometry.setIndex(allIndices)
  geometry.computeVertexNormals()

  console.log(`[OCCT] Merged mesh: ${allPositions.length / 3} verts, ${allIndices.length / 3} tris`)

  return [geometry]
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
