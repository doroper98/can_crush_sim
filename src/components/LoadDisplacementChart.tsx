import { useRef, useEffect } from 'react'

interface DataPoint {
  displacement: number // mm
  load: number         // N
}

interface LoadDisplacementChartProps {
  data: DataPoint[]
  prevData?: DataPoint[]
  width?: number
  height?: number
  darkMode?: boolean
}

export default function LoadDisplacementChart({
  data,
  prevData,
  width = 260,
  height = 160,
  darkMode = false,
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

    // Theme colors
    const bgColor = darkMode ? '#1e293b' : '#f0f4f8'
    const borderColor = darkMode ? '#475569' : '#d0d5dd'
    const gridColor = darkMode ? '#334155' : '#e2e8f0'
    const axisColor = darkMode ? '#64748b' : '#94a3b8'
    const labelColor = darkMode ? '#94a3b8' : '#64748b'

    // Padding
    const pad = { top: 10, right: 10, bottom: 30, left: 45 }
    const plotW = width - pad.left - pad.right
    const plotH = height - pad.top - pad.bottom

    // Clear
    ctx.clearRect(0, 0, width, height)

    // Background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    // Border
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1)

    // Compute ranges (include prevData for consistent axes)
    let maxDisp = 1, maxLoad = 1
    for (const p of data) {
      if (p.displacement > maxDisp) maxDisp = p.displacement
      if (p.load > maxLoad) maxLoad = p.load
    }
    if (prevData) {
      for (const p of prevData) {
        if (p.displacement > maxDisp) maxDisp = p.displacement
        if (p.load > maxLoad) maxLoad = p.load
      }
    }
    // Round up for nice axes
    maxDisp = Math.ceil(maxDisp / 10) * 10 || 10
    maxLoad = Math.ceil(maxLoad / 100) * 100 || 100

    // Grid lines
    ctx.strokeStyle = gridColor
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
    ctx.strokeStyle = axisColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad.left, pad.top)
    ctx.lineTo(pad.left, pad.top + plotH)
    ctx.lineTo(pad.left + plotW, pad.top + plotH)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = labelColor
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

    // Previous data ghost curve
    if (prevData && prevData.length > 1) {
      ctx.strokeStyle = darkMode ? 'rgba(148,163,184,0.4)' : 'rgba(100,116,139,0.3)'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      for (let i = 0; i < prevData.length; i++) {
        const x = pad.left + (prevData[i].displacement / maxDisp) * plotW
        const y = pad.top + plotH - (prevData[i].load / maxLoad) * plotH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Plot data
    if (data.length > 1) {
      // Energy area fill (under the curve)
      ctx.fillStyle = darkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)'
      ctx.beginPath()
      ctx.moveTo(pad.left + (data[0].displacement / maxDisp) * plotW, pad.top + plotH)
      for (let i = 0; i < data.length; i++) {
        const x = pad.left + (data[i].displacement / maxDisp) * plotW
        const y = pad.top + plotH - (data[i].load / maxLoad) * plotH
        ctx.lineTo(x, y)
      }
      ctx.lineTo(pad.left + (data[data.length - 1].displacement / maxDisp) * plotW, pad.top + plotH)
      ctx.closePath()
      ctx.fill()

      // Curve line
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

      // Peak force marker (diamond)
      let peakIdx = 0
      for (let i = 1; i < data.length; i++) {
        if (data[i].load > data[peakIdx].load) peakIdx = i
      }
      const peakX = pad.left + (data[peakIdx].displacement / maxDisp) * plotW
      const peakY = pad.top + plotH - (data[peakIdx].load / maxLoad) * plotH
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.moveTo(peakX, peakY - 4)
      ctx.lineTo(peakX + 3, peakY)
      ctx.lineTo(peakX, peakY + 4)
      ctx.lineTo(peakX - 3, peakY)
      ctx.closePath()
      ctx.fill()

      // Mean force line (dashed)
      let sumLoad = 0
      for (let i = 0; i < data.length; i++) sumLoad += data[i].load
      const meanLoad = sumLoad / data.length
      const meanY = pad.top + plotH - (meanLoad / maxLoad) * plotH
      ctx.setLineDash([4, 3])
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(pad.left, meanY)
      ctx.lineTo(pad.left + plotW, meanY)
      ctx.stroke()
      ctx.setLineDash([])

      // Current point
      const last = data[data.length - 1]
      const lx = pad.left + (last.displacement / maxDisp) * plotW
      const ly = pad.top + plotH - (last.load / maxLoad) * plotH
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(lx, ly, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [data, prevData, width, height, darkMode])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        borderRadius: 8,
        boxShadow: darkMode
          ? 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(51,65,85,0.5)'
          : 'inset 2px 2px 4px rgba(163,177,198,0.3), inset -2px -2px 4px rgba(255,255,255,0.7)',
      }}
    />
  )
}
