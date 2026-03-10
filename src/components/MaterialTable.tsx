import { MATERIALS } from '../engine/MaterialModel'

interface MaterialTableProps {
  visible: boolean
  onClose: () => void
  onSelect?: (key: string) => void
  darkMode?: boolean
  currentMaterial?: string
}

const cols: { key: string; label: string; unit: string; fmt: (v: number) => string }[] = [
  { key: 'youngsModulus', label: 'E', unit: 'GPa', fmt: v => (v / 1000).toFixed(0) },
  { key: 'poissonRatio', label: 'ν', unit: '', fmt: v => v.toFixed(2) },
  { key: 'yieldStress', label: 'σy', unit: 'MPa', fmt: v => v.toFixed(0) },
  { key: 'uts', label: 'UTS', unit: 'MPa', fmt: v => v.toFixed(0) },
  { key: 'hardeningExponent', label: 'n', unit: '', fmt: v => v.toFixed(2) },
  { key: 'density', label: 'ρ', unit: 'kg/m³', fmt: v => v.toFixed(0) },
  { key: 'wallThickness', label: 't', unit: 'mm', fmt: v => v.toFixed(1) },
]

export default function MaterialTable({ visible, onClose, onSelect, darkMode = false, currentMaterial }: MaterialTableProps) {
  if (!visible) return null

  const bg = darkMode ? '#1e293b' : '#f0f4f8'
  const text = darkMode ? '#e2e8f0' : '#0f172a'
  const textSec = darkMode ? '#94a3b8' : '#475569'
  const borderColor = darkMode ? '#334155' : '#d0d5dd'
  const highlightBg = darkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)'
  const hoverBg = darkMode ? 'rgba(148,163,184,0.08)' : 'rgba(59,130,246,0.04)'
  const shadow = darkMode
    ? '12px 12px 24px rgba(0,0,0,0.5), -12px -12px 24px rgba(51,65,85,0.4)'
    : '12px 12px 24px rgba(163,177,198,0.6), -12px -12px 24px rgba(255,255,255,0.8)'

  const entries = Object.entries(MATERIALS)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: bg,
          borderRadius: 20,
          padding: '24px 28px',
          maxWidth: 900,
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: shadow,
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: 15, color: text }}>
          Material Library ({entries.length} materials)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ padding: '4px 8px', textAlign: 'left', color: textSec, borderBottom: `1px solid ${borderColor}`, fontWeight: 600 }}>Material</th>
              {cols.map(c => (
                <th key={c.key} style={{ padding: '4px 6px', textAlign: 'right', color: textSec, borderBottom: `1px solid ${borderColor}`, fontWeight: 600 }}>
                  {c.label}{c.unit ? ` (${c.unit})` : ''}
                </th>
              ))}
              <th style={{ padding: '4px 6px', textAlign: 'right', color: textSec, borderBottom: `1px solid ${borderColor}`, fontWeight: 600 }}>UTS/σy</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, mat]) => {
              const isCurrent = key === currentMaterial
              return (
                <tr
                  key={key}
                  onClick={() => { if (onSelect) { onSelect(key); onClose() } }}
                  onMouseEnter={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = hoverBg }}
                  onMouseLeave={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  style={{ background: isCurrent ? highlightBg : 'transparent', cursor: onSelect ? 'pointer' : 'default' }}
                >
                  <td style={{ padding: '4px 8px', color: isCurrent ? '#3b82f6' : text, fontWeight: isCurrent ? 600 : 400, borderBottom: `1px solid ${borderColor}`, whiteSpace: 'nowrap' }}>
                    {isCurrent ? '▸ ' : ''}{mat.name}
                  </td>
                  {cols.map(c => (
                    <td key={c.key} style={{ padding: '4px 6px', textAlign: 'right', color: textSec, borderBottom: `1px solid ${borderColor}`, fontFamily: 'monospace' }}>
                      {c.fmt((mat as unknown as Record<string, number>)[c.key])}
                    </td>
                  ))}
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: (mat.uts / mat.yieldStress) >= 2 ? '#10b981' : textSec, borderBottom: `1px solid ${borderColor}`, fontFamily: 'monospace', fontWeight: (mat.uts / mat.yieldStress) >= 2 ? 600 : 400 }}>
                    {(mat.uts / mat.yieldStress).toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 11, color: darkMode ? '#64748b' : '#94a3b8' }}>
          Click row to select · Press I or click outside to close
        </div>
      </div>
    </div>
  )
}
