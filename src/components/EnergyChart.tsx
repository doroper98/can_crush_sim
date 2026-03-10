import { useRef, useEffect } from 'react'

interface EnergyChartProps {
  data: { displacement: number; load: number }[]
  width?: number
  height?: number
  darkMode?: boolean
}

export default function EnergyChart({
  data,
  width = 260,
  height = 120,
  darkMode = false,
}: EnergyChartProps) {
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

    const bgColor = darkMode ? '#1e293b' : '#f0f4f8'
    const borderColor = darkMode ? '#475569' : '#d0d5dd'
    const gridColor = darkMode ? '#334155' : '#e2e8f0'
    const axisColor = darkMode ? '#64748b' : '#94a3b8'
    const labelColor = darkMode ? '#94a3b8' : '#64748b'

    const pad = { top: 10, right: 10, bottom: 30, left: 45 }
    const plotW = width - pad.left - pad.right
    const plotH = height - pad.top - pad.bottom

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1)

    // Compute cumulative energy via trapezoidal integration
    const energyData: { displacement: number; energy: number }[] = []
    let cumEnergy = 0
    for (let i = 0; i < data.length; i++) {
      if (i > 0) {
        cumEnergy += 0.5 * (data[i - 1].load + data[i].load) * (data[i].displacement - data[i - 1].displacement) * 0.001
      }
      energyData.push({ displacement: data[i].displacement, energy: cumEnergy })
    }

    let maxDisp = 1, maxEnergy = 0.1
    for (const p of energyData) {
      if (p.displacement > maxDisp) maxDisp = p.displacement
      if (p.energy > maxEnergy) maxEnergy = p.energy
    }
    maxDisp = Math.ceil(maxDisp / 10) * 10 || 10
    maxEnergy = Math.ceil(maxEnergy * 10) / 10 || 0.1

    // Grid
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = axisColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad.left, pad.top)
    ctx.lineTo(pad.left, pad.top + plotH)
    ctx.lineTo(pad.left + plotW, pad.top + plotH)
    ctx.stroke()

    // Labels
    ctx.fillStyle = labelColor
    ctx.font = '9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Displacement (mm)', pad.left + plotW / 2, height - 4)

    ctx.save()
    ctx.translate(10, pad.top + plotH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Energy (J)', 0, 0)
    ctx.restore()

    // Tick labels
    ctx.font = '8px sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i <= 4; i++) {
      const x = pad.left + (plotW / 4) * i
      ctx.fillText(((maxDisp / 4) * i).toFixed(0), x, pad.top + plotH + 12)
    }
    ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + plotH - (plotH / 4) * i
      ctx.fillText(((maxEnergy / 4) * i).toFixed(2), pad.left - 4, y + 3)
    }

    // Plot
    if (energyData.length > 1) {
      // Area fill
      ctx.fillStyle = darkMode ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)'
      ctx.beginPath()
      ctx.moveTo(pad.left + (energyData[0].displacement / maxDisp) * plotW, pad.top + plotH)
      for (const p of energyData) {
        ctx.lineTo(pad.left + (p.displacement / maxDisp) * plotW, pad.top + plotH - (p.energy / maxEnergy) * plotH)
      }
      ctx.lineTo(pad.left + (energyData[energyData.length - 1].displacement / maxDisp) * plotW, pad.top + plotH)
      ctx.closePath()
      ctx.fill()

      // Line
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let i = 0; i < energyData.length; i++) {
        const x = pad.left + (energyData[i].displacement / maxDisp) * plotW
        const y = pad.top + plotH - (energyData[i].energy / maxEnergy) * plotH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Current point
      const last = energyData[energyData.length - 1]
      const lx = pad.left + (last.displacement / maxDisp) * plotW
      const ly = pad.top + plotH - (last.energy / maxEnergy) * plotH
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.arc(lx, ly, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [data, width, height, darkMode])

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
