import { useRef, useEffect } from 'react'

interface DataPoint {
  displacement: number // mm
  load: number         // N
}

interface LoadDisplacementChartProps {
  data: DataPoint[]
  width?: number
  height?: number
}

export default function LoadDisplacementChart({
  data,
  width = 260,
  height = 160,
}: LoadDisplacementChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Padding
    const pad = { top: 10, right: 10, bottom: 30, left: 45 }
    const plotW = width - pad.left - pad.right
    const plotH = height - pad.top - pad.bottom

    // Clear
    ctx.clearRect(0, 0, width, height)

    // Background
    ctx.fillStyle = '#f0f4f8'
    ctx.fillRect(0, 0, width, height)

    // Border
    ctx.strokeStyle = '#d0d5dd'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1)

    // Compute ranges
    let maxDisp = 1, maxLoad = 1
    for (const p of data) {
      if (p.displacement > maxDisp) maxDisp = p.displacement
      if (p.load > maxLoad) maxLoad = p.load
    }
    // Round up for nice axes
    maxDisp = Math.ceil(maxDisp / 10) * 10 || 10
    maxLoad = Math.ceil(maxLoad / 100) * 100 || 100

    // Grid lines
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i
      ctx.beginPath()
      ctx.moveTo(pad.left, y)
      ctx.lineTo(pad.left + plotW, y)
      ctx.stroke()
    }
    for (let i = 0; i <= 4; i++) {
      const x = pad.left + (plotW / 4) * i
      ctx.beginPath()
      ctx.moveTo(x, pad.top)
      ctx.lineTo(x, pad.top + plotH)
      ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad.left, pad.top)
    ctx.lineTo(pad.left, pad.top + plotH)
    ctx.lineTo(pad.left + plotW, pad.top + plotH)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = '#64748b'
    ctx.font = '9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Displacement (mm)', pad.left + plotW / 2, height - 4)

    ctx.save()
    ctx.translate(10, pad.top + plotH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Load (N)', 0, 0)
    ctx.restore()

    // Tick labels
    ctx.font = '8px sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i <= 4; i++) {
      const x = pad.left + (plotW / 4) * i
      const val = (maxDisp / 4) * i
      ctx.fillText(val.toFixed(0), x, pad.top + plotH + 12)
    }
    ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + plotH - (plotH / 4) * i
      const val = (maxLoad / 4) * i
      ctx.fillText(val.toFixed(0), pad.left - 4, y + 3)
    }

    // Plot data
    if (data.length > 1) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let i = 0; i < data.length; i++) {
        const x = pad.left + (data[i].displacement / maxDisp) * plotW
        const y = pad.top + plotH - (data[i].load / maxLoad) * plotH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Current point
      const last = data[data.length - 1]
      const lx = pad.left + (last.displacement / maxDisp) * plotW
      const ly = pad.top + plotH - (last.load / maxLoad) * plotH
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(lx, ly, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [data, width, height])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        borderRadius: 8,
        boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.3), inset -2px -2px 4px rgba(255,255,255,0.7)',
      }}
    />
  )
}
