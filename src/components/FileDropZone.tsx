import { useCallback, useState } from 'react'

interface FileDropZoneProps {
  onFileLoaded: (buffer: ArrayBuffer, fileName: string, ext: string) => void
  children: React.ReactNode
}

export default function FileDropZone({ onFileLoaded, children }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length === 0) return

    const file = files[0]
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        onFileLoaded(reader.result, file.name, ext)
      }
    }
    reader.readAsArrayBuffer(file)
  }, [onFileLoaded])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ flex: '1 1 70%', minWidth: 0, position: 'relative' }}
    >
      {children}
      {isDragging && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(59, 130, 246, 0.15)',
          border: '3px dashed #3b82f6',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#3b82f6',
            background: 'rgba(255,255,255,0.9)',
            padding: '12px 24px',
            borderRadius: 12,
          }}>
            Drop STL / STEP / IGES file here
          </span>
        </div>
      )}
    </div>
  )
}
