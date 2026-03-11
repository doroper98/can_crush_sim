import { useRef, useEffect } from 'react'
import type { MaterialModel } from '../engine/MaterialModel'

interface StressStrainChartProps {
  material: MaterialModel
  currentPlasticStrain?: number
  width?: number
  height?: number
  darkMode?: boolean
}

export default function StressStrainChart({
  material,
  currentPlasticStrain = 0,
  width = 260,
  height = 120,
  darkMode = false,
}: StressStrainChartProps) {
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

    // Generate curve points: strain 0 to 0.5 (50%)
    const maxStrain = 0.5
    const points: { strain: number; stress: number }[] = []
    const N = 100
    let maxStress = material.yieldStress
    for (let i = 0; i <= N; i++) {
      const strain = (i / N) * maxStrain
      const stress = material.flowStress(strain)
      if (stress > maxStress) maxStress = stress
      points.push({ strain, stress })
    }
    maxStress = Math.ceil(maxStress / 100) * 100 || 100

    // Grid (horizontal + vertical)
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke()
      const x = pad.left + (plotW / 4) * i
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke()
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
    ctx.fillText('Plastic Strain', pad.left + plotW / 2, height - 4)

    ctx.save()
    ctx.translate(10, pad.top + plotH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('σ_f (MPa)', 0, 0)
    ctx.restore()

    // Tick labels
    ctx.font = '8px sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i <= 4; i++) {
      const x = pad.left + (plotW / 4) * i
      ctx.fillText(((maxStrain / 4) * i * 100).toFixed(0) + '%', x, pad.top + plotH + 12)
    }
    ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + plotH - (plotH / 4) * i
      ctx.fillText(((maxStress / 4) * i).toFixed(0), pad.left - 4, y + 3)
    }

    // Yield stress horizontal dashed line
    const yieldY = pad.top + plotH - (material.yieldStress / maxStress) * plotH
    ctx.setLineDash([3, 3])
    ctx.strokeStyle = darkMode ? 'rgba(248,113,113,0.4)' : 'rgba(239,68,68,0.3)'
    ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.moveTo(pad.left, yieldY); ctx.lineTo(pad.left + plotW, yieldY); ctx.stroke()
    ctx.setLineDash([])

    // UTS horizontal dashed line
    if (material.uts <= maxStress) {
      const utsY = pad.top + plotH - (material.uts / maxStress) * plotH
      ctx.setLineDash([2, 2])
      ctx.strokeStyle = darkMode ? 'rgba(96,165,250,0.4)' : 'rgba(59,130,246,0.3)'
      ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(pad.left, utsY); ctx.lineTo(pad.left + plotW, utsY); ctx.stroke()
      ctx.setLineDash([])
    }

    // Legend (top-right)
    const lgX = pad.left + plotW - 50, lgY = pad.top + 3
    ctx.font = '7px sans-serif'
    ctx.textAlign = 'left'
    ctx.setLineDash([3, 2])
    ctx.strokeStyle = darkMode ? 'rgba(248,113,113,0.6)' : 'rgba(239,68,68,0.5)'
    ctx.beginPath(); ctx.moveTo(lgX, lgY + 3); ctx.lineTo(lgX + 8, lgY + 3); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = labelColor
    ctx.fillText(`σy ${material.yieldStress.toFixed(0)}`, lgX + 10, lgY + 5)
    ctx.setLineDash([2, 2])
    ctx.strokeStyle = darkMode ? 'rgba(96,165,250,0.6)' : 'rgba(59,130,246,0.5)'
    ctx.beginPath(); ctx.moveTo(lgX, lgY + 12); ctx.lineTo(lgX + 8, lgY + 12); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillText(`UTS ${material.uts.toFixed(0)}`, lgX + 10, lgY + 14)
    ctx.fillStyle = darkMode ? '#a855f7' : '#9333ea'
    ctx.fillText(`n=${material.hardeningExponent.toFixed(2)}`, lgX + 10, lgY + 23)

    // Area fill
    ctx.fillStyle = darkMode ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.08)'
    ctx.beginPath()
    ctx.moveTo(pad.left, pad.top + plotH)
    for (const p of points) {
      ctx.lineTo(pad.left + (p.strain / maxStrain) * plotW, pad.top + plotH - (p.stress / maxStress) * plotH)
    }
    ctx.lineTo(pad.left + plotW, pad.top + plotH)
    ctx.closePath()
    ctx.fill()

    // Curve line
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i < points.length; i++) {
      const x = pad.left + (points[i].strain / maxStrain) * plotW
      const y = pad.top + plotH - (points[i].stress / maxStress) * plotH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Current operating point
    if (currentPlasticStrain > 0) {
      const cpStrain = Math.min(currentPlasticStrain, maxStrain)
      const cpStress = material.flowStress(cpStrain)
      const cx = pad.left + (cpStrain / maxStrain) * plotW
      const cy = pad.top + plotH - (cpStress / maxStress) * plotH
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fill()
      // Label
      ctx.font = '7px sans-serif'
      ctx.fillStyle = '#f59e0b'
      const label = `${cpStress.toFixed(0)} MPa`
      const lx = cx + 5 > pad.left + plotW - 30 ? cx - ctx.measureText(label).width - 5 : cx + 5
      ctx.textAlign = 'left'
      ctx.fillText(label, lx, cy - 4)
    }
  }, [material, currentPlasticStrain, width, height, darkMode])

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
