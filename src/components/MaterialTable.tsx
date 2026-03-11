import { useState } from 'react'
import { MATERIALS } from '../engine/MaterialModel'

interface MaterialTableProps {
  visible: boolean
  onClose: () => void
  onSelect?: (key: string) => void
  darkMode?: boolean
  currentMaterial?: string
}

export function getCategory(key: string): { label: string; color: string } {
  if (key.startsWith('aluminum_')) return { label: 'Al', color: '#60a5fa' }
  if (key.startsWith('steel_')) return { label: 'Fe', color: '#a78bfa' }
  if (key.startsWith('copper_') || key === 'brass_c260') return { label: 'Cu', color: '#f97316' }
  if (key.startsWith('titanium_')) return { label: 'Ti', color: '#14b8a6' }
  if (key.startsWith('nickel_') || key.startsWith('monel_') || key.startsWith('inconel_') || key === 'hastelloy_x') return { label: 'Ni', color: '#e879f9' }
  if (key === 'polycarbonate' || key === 'peek' || key.startsWith('nylon_') || key === 'abs' || key === 'uhmwpe' || key === 'ptfe' || key === 'pom' || key === 'pp' || key === 'hdpe') return { label: 'Poly', color: '#facc15' }
  if (key === 'zinc_zamak3') return { label: 'Zn', color: '#94a3b8' }
  if (key.startsWith('magnesium_')) return { label: 'Mg', color: '#4ade80' }
  if (key === 'tin_sn') return { label: 'Sn', color: '#a3a3a3' }
  if (key === 'tungsten') return { label: 'W', color: '#78716c' }
  if (key === 'lead_pb') return { label: 'Pb', color: '#71717a' }
  if (key.startsWith('zirconium_')) return { label: 'Zr', color: '#2dd4bf' }
  if (key === 'silver_ag') return { label: 'Ag', color: '#cbd5e1' }
  if (key === 'gold_au') return { label: 'Au', color: '#fbbf24' }
  if (key.startsWith('cobalt_')) return { label: 'Co', color: '#818cf8' }
  if (key === 'platinum_pt') return { label: 'Pt', color: '#d4d4d8' }
  if (key === 'tantalum_ta') return { label: 'Ta', color: '#6366f1' }
  if (key === 'niobium_nb') return { label: 'Nb', color: '#7c3aed' }
  if (key === 'molybdenum_mo') return { label: 'Mo', color: '#a1a1aa' }
  if (key === 'vanadium_v') return { label: 'V', color: '#fb923c' }
  if (key === 'beryllium_be') return { label: 'Be', color: '#a3e635' }
  if (key === 'chromium_cr') return { label: 'Cr', color: '#dc2626' }
  if (key === 'manganese_mn') return { label: 'Mn', color: '#f472b6' }
  if (key === 'hafnium_hf') return { label: 'Hf', color: '#0ea5e9' }
  if (key === 'rhodium_rh') return { label: 'Rh', color: '#e11d48' }
  if (key === 'iridium_ir') return { label: 'Ir', color: '#475569' }
  if (key === 'osmium_os') return { label: 'Os', color: '#1e3a5f' }
  if (key === 'palladium_pd') return { label: 'Pd', color: '#d6d3d1' }
  if (key === 'ruthenium_ru') return { label: 'Ru', color: '#0891b2' }
  if (key === 'rhenium_re') return { label: 'Re', color: '#9f1239' }
  if (key === 'uranium_du') return { label: 'U', color: '#65a30d' }
  return { label: '?', color: '#94a3b8' }
}

const cols: { key: string; label: string; unit: string; fmt: (v: number) => string }[] = [
  { key: 'youngsModulus', label: 'E', unit: 'GPa', fmt: v => (v / 1000).toFixed(0) },
  { key: 'poissonRatio', label: 'ν', unit: '', fmt: v => v.toFixed(2) },
  { key: 'yieldStress', label: 'σy', unit: 'MPa', fmt: v => v.toFixed(0) },
  { key: 'uts', label: 'UTS', unit: 'MPa', fmt: v => v.toFixed(0) },
  { key: 'hardeningExponent', label: 'n', unit: '', fmt: v => v.toFixed(2) },
  { key: 'K', label: 'K', unit: 'MPa', fmt: v => v.toFixed(0) },
  { key: 'density', label: 'ρ', unit: 'kg/m³', fmt: v => v.toFixed(0) },
  { key: 'wallThickness', label: 't', unit: 'mm', fmt: v => v.toFixed(1) },
]

export default function MaterialTable({ visible, onClose, onSelect, darkMode = false, currentMaterial }: MaterialTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [filter, setFilter] = useState('')

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

  const allEntries = Object.entries(MATERIALS)
  const maxDensity = Math.max(...allEntries.map(([, m]) => m.density))
  const entries = filter
    ? allEntries.filter(([key, mat]) => {
        const q = filter.toLowerCase()
        return mat.name.toLowerCase().includes(q) || key.toLowerCase().includes(q) || getCategory(key).label.toLowerCase().includes(q)
      })
    : allEntries

  // Sort entries
  const sorted = sortKey
    ? [...entries].sort((a, b) => {
        let va: number, vb: number
        if (sortKey === 'uts_ratio') {
          va = a[1].uts / a[1].yieldStress
          vb = b[1].uts / b[1].yieldStress
        } else if (sortKey === 'K') {
          va = a[1].hardeningK()
          vb = b[1].hardeningK()
        } else if (sortKey === 'specific_strength') {
          va = a[1].yieldStress / a[1].density * 1000
          vb = b[1].yieldStress / b[1].density * 1000
        } else if (sortKey === 'specific_stiffness') {
          va = a[1].youngsModulus / a[1].density
          vb = b[1].youngsModulus / b[1].density
        } else if (sortKey === 'name') {
          return sortAsc
            ? a[1].name.localeCompare(b[1].name)
            : b[1].name.localeCompare(a[1].name)
        } else {
          va = (a[1] as unknown as Record<string, number>)[sortKey]
          vb = (b[1] as unknown as Record<string, number>)[sortKey]
        }
        return sortAsc ? va - vb : vb - va
      })
    : entries

  const handleSort = (key: string) => {
    if (sortKey === key) setSortAsc(p => !p)
    else { setSortKey(key); setSortAsc(true) }
  }

  const sortIndicator = (key: string) =>
    sortKey === key ? (sortAsc ? ' ▲' : ' ▼') : ''

  const thStyle = (align: 'left' | 'right' = 'right'): React.CSSProperties => ({
    padding: align === 'left' ? '4px 8px' : '4px 6px',
    textAlign: align,
    color: textSec,
    borderBottom: `1px solid ${borderColor}`,
    fontWeight: 600,
    cursor: 'pointer',
    userSelect: 'none',
  })

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px' }}>
          <h3 style={{ margin: 0, fontSize: 15, color: text }}>
            Material Library ({entries.length}{filter ? `/${allEntries.length}` : ''} materials)
          </h3>
          <input
            type="text"
            placeholder="Filter…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              width: 140,
              padding: '4px 8px',
              fontSize: 11,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: darkMode ? '#0f172a' : '#fff',
              color: text,
              outline: 'none',
            }}
          />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={thStyle('left')}>Material{sortIndicator('name')}</th>
              {cols.map(c => (
                <th key={c.key} onClick={() => handleSort(c.key)} style={thStyle()}>
                  {c.label}{c.unit ? ` (${c.unit})` : ''}{sortIndicator(c.key)}
                </th>
              ))}
              <th onClick={() => handleSort('uts_ratio')} style={thStyle()}>UTS/σy{sortIndicator('uts_ratio')}</th>
              <th onClick={() => handleSort('specific_strength')} style={thStyle()}>σy/ρ{sortIndicator('specific_strength')}</th>
              <th onClick={() => handleSort('specific_stiffness')} style={thStyle()}>E/ρ{sortIndicator('specific_stiffness')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(([key, mat]) => {
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
                    {isCurrent ? '▸ ' : ''}<span style={{ display: 'inline-block', fontSize: 8, fontWeight: 700, color: '#fff', background: getCategory(key).color, borderRadius: 3, padding: '0 3px', marginRight: 4, lineHeight: '14px', verticalAlign: 'middle' }}>{getCategory(key).label}</span>{mat.name}
                  </td>
                  {cols.map(c => {
                    const val = c.key === 'K'
                      ? mat.hardeningK()
                      : (mat as unknown as Record<string, number>)[c.key]
                    let cellColor = textSec
                    let cellWeight = 400
                    if (c.key === 'density') {
                      if (val < 3000) { cellColor = '#10b981'; cellWeight = 600 }
                      else if (val > 8000) { cellColor = '#f59e0b' }
                    } else if (c.key === 'yieldStress') {
                      if (val >= 800) { cellColor = '#ef4444'; cellWeight = 600 }
                    }
                    return (
                      <td key={c.key} style={{ padding: '4px 6px', textAlign: 'right', color: cellColor, borderBottom: `1px solid ${borderColor}`, fontFamily: 'monospace', fontWeight: cellWeight, position: c.key === 'density' ? 'relative' as const : undefined }}>
                        {c.key === 'density' && <span style={{ position: 'absolute', left: 0, bottom: 0, height: 2, width: `${(val / maxDensity) * 100}%`, background: cellColor, opacity: 0.3, borderRadius: 1 }} />}
                        {c.fmt(val)}
                      </td>
                    )
                  })}
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: (mat.uts / mat.yieldStress) >= 2 ? '#10b981' : textSec, borderBottom: `1px solid ${borderColor}`, fontFamily: 'monospace', fontWeight: (mat.uts / mat.yieldStress) >= 2 ? 600 : 400 }}>
                    {(mat.uts / mat.yieldStress).toFixed(2)}
                  </td>
                  {(() => {
                    const ss = mat.yieldStress / mat.density * 1000 // kNm/kg
                    return (
                      <td style={{ padding: '4px 6px', textAlign: 'right', color: ss >= 150 ? '#10b981' : textSec, borderBottom: `1px solid ${borderColor}`, fontFamily: 'monospace', fontWeight: ss >= 150 ? 600 : 400 }}>
                        {ss.toFixed(0)}
                      </td>
                    )
                  })()}
                  {(() => {
                    const se = mat.youngsModulus / mat.density // (MPa)/(kg/m³) = kNm/kg
                    return (
                      <td style={{ padding: '4px 6px', textAlign: 'right', color: se >= 25 ? '#3b82f6' : textSec, borderBottom: `1px solid ${borderColor}`, fontFamily: 'monospace', fontWeight: se >= 25 ? 600 : 400 }}>
                        {se.toFixed(1)}
                      </td>
                    )
                  })()}
                </tr>
              )
            })}
          </tbody>
        </table>
        {currentMaterial && MATERIALS[currentMaterial] && (() => {
          const m = MATERIALS[currentMaterial]
          const cat = getCategory(currentMaterial)
          const ss = m.yieldStress / m.density * 1000
          return (
            <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 10, background: darkMode ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)', fontSize: 10, color: textSec, lineHeight: 1.7 }}>
              <span style={{ fontWeight: 600, color: text }}>{m.name}</span> <span style={{ fontSize: 8, color: cat.color, fontWeight: 700 }}>[{cat.label}]</span>
              <span style={{ marginLeft: 8 }}>K={m.hardeningK().toFixed(0)} MPa · σy/ρ={ss.toFixed(0)} kNm/kg · E/ρ={(m.youngsModulus / m.density).toFixed(1)} · UTS/σy={(m.uts / m.yieldStress).toFixed(2)}</span>
            </div>
          )
        })()}
        {(() => {
          const cats: Record<string, { label: string; color: string; count: number }> = {}
          for (const [key] of allEntries) {
            const c = getCategory(key)
            if (!cats[c.label]) cats[c.label] = { ...c, count: 0 }
            cats[c.label].count++
          }
          return (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {Object.values(cats).map(c => (
                <span key={c.label} onClick={() => setFilter(c.label)} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '1px 5px', borderRadius: 4, background: c.color + '18', fontSize: 9, color: c.color, fontWeight: 600, cursor: 'pointer' }}>
                  {c.label} {c.count}
                </span>
              ))}
            </div>
          )
        })()}
        <div style={{ marginTop: 6, textAlign: 'center', fontSize: 11, color: darkMode ? '#64748b' : '#94a3b8' }}>
          Click header to sort · Click row to select · Click badge to filter · Press I or click outside to close
        </div>
      </div>
    </div>
  )
}
