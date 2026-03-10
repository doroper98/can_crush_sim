import { useRef, useEffect } from 'react'
import { colormapToRGB, type ColormapType } from '../viewer/colormap'

interface ColorBarProps {
  minVal: number
  maxVal: number
  colormapType: ColormapType
  label: string
  unit: string
  visible: boolean
  darkMode?: boolean
}

export default function ColorBar({
  minVal,
  maxVal,
  colormapType,
  label,
  unit,
  visible,
  darkMode = false,
}: ColorBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !visible) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)

    // Draw gradient bar (bottom = min, top = max)
    for (let y = 0; y < h; y++) {
      const t = 1 - y / h  // top=1, bottom=0
      const color = colormapToRGB(t, colormapType)
      ctx.fillStyle = `rgb(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)})`
      ctx.fillRect(0, y, w, 1)
    }
  }, [minVal, maxVal, colormapType, visible])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        right: 16,
        bottom: 60,
        display: 'flex',
        gap: 4,
        zIndex: 10,
        background: darkMode ? 'rgba(30,41,59,0.9)' : 'rgba(240,244,248,0.85)',
        padding: '8px 10px',
        borderRadius: 10,
        boxShadow: darkMode
          ? '4px 4px 8px rgba(0,0,0,0.4), -4px -4px 8px rgba(51,65,85,0.4)'
          : '4px 4px 8px rgba(163,177,198,0.4), -4px -4px 8px rgba(255,255,255,0.7)',
      }}
    >
      <canvas
        ref={canvasRef}
        width={20}
        height={150}
        style={{ borderRadius: 4, border: `1px solid ${darkMode ? '#475569' : '#d0d5dd'}` }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontSize: 10,
          color: darkMode ? '#94a3b8' : '#334155',
          minWidth: 50,
        }}
      >
        <span>{maxVal.toFixed(1)} {unit}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: darkMode ? '#e2e8f0' : '#0f172a' }}>
          {label}
        </span>
        <span>{minVal.toFixed(1)} {unit}</span>
      </div>
    </div>
  )
}
