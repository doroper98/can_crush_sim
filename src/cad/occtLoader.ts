import * as THREE from 'three'

// opencascade.js dynamic import (WASM)
let ocInstance: any = null

export async function initOCCT(): Promise<any> {
  if (ocInstance) return ocInstance
  try {
    const ocModule = await import('opencascade.js')
    const oc = await (ocModule.default as any)()
    ocInstance = oc
    console.log('OpenCASCADE.js initialized successfully')
    return oc
  } catch (e) {
    console.error('Failed to initialize OpenCASCADE.js:', e)
    throw e
  }
}

export async function loadSTEP(
  fileBuffer: ArrayBuffer
): Promise<THREE.BufferGeometry[]> {
  const oc = await initOCCT()

  // Write file to WASM filesystem
  const fileName = '/input.step'
  const fileData = new Uint8Array(fileBuffer)
  oc.FS.writeFile(fileName, fileData)

  // Read STEP file
  const reader = new oc.STEPControl_Reader_1()
  const readResult = reader.ReadFile(fileName)
  if (readResult !== oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
    throw new Error('Failed to read STEP file')
  }

  reader.TransferRoots(new oc.Message_ProgressRange_1())
  const shape = reader.OneShape()

  // Mesh the shape
  new oc.BRepMesh_IncrementalMesh_2(
    shape,
    0.1,  // linear deflection
    false,
    0.5,  // angular deflection
    false
  )

  // Extract triangulation
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

      // Extract vertices
      for (let i = 1; i <= nbNodes; i++) {
        const node = triangulation.get().Node(i)
        const transformed = node.Transformed(location.Transformation())
        vertices[(i - 1) * 3] = transformed.X()
        vertices[(i - 1) * 3 + 1] = transformed.Y()
        vertices[(i - 1) * 3 + 2] = transformed.Z()
      }

      // Extract triangles
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

  // Cleanup
  oc.FS.unlink(fileName)

  return geometries
}
