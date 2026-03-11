import { useState } from 'react'
import LoadDisplacementChart from './LoadDisplacementChart'
import EnergyChart from './EnergyChart'
import StressStrainChart from './StressStrainChart'
import { MATERIALS, MATERIAL_KEYS } from '../engine/MaterialModel'
import { getCategory } from './MaterialTable'

export type RigidBodyShape = 'cylinder' | 'box' | 'sphere' | 'cone'
export type ControlMode = 'displacement' | 'force'
export type DisplayMode = 'none' | 'stress' | 'displacement' | 'plastic'
export type ColormapName = 'jet' | 'rainbow' | 'thermal'

interface ControlPanelProps {
  canDiameter: number
  canHeight: number
  wallThickness: number
  force: number
  controlMode: ControlMode
  speed: number
  rigidShape: RigidBodyShape
  rigidRadius: number
  rigidHeight: number
  rigidPosX: number
  rigidPosY: number
  rigidPosZ: number
  rigidRotX: number
  rigidRotY: number
  rigidRotZ: number
  onCanDiameterChange: (v: number) => void
  onCanHeightChange: (v: number) => void
  onWallThicknessChange: (v: number) => void
  onForceChange: (v: number) => void
  onControlModeChange: (v: ControlMode) => void
  onSpeedChange: (v: number) => void
  onRigidShapeChange: (v: RigidBodyShape) => void
  onRigidRadiusChange: (v: number) => void
  onRigidHeightChange: (v: number) => void
  onRigidPosXChange: (v: number) => void
  onRigidPosYChange: (v: number) => void
  onRigidPosZChange: (v: number) => void
  onRigidRotXChange: (v: number) => void
  onRigidRotYChange: (v: number) => void
  onRigidRotZChange: (v: number) => void
  displayMode: DisplayMode
  colormapType: ColormapName
  onDisplayModeChange: (v: DisplayMode) => void
  onColormapTypeChange: (v: ColormapName) => void
  chartData: { displacement: number; load: number }[]
  prevChartData?: { displacement: number; load: number }[]
  timeScale: number
  onTimeScaleChange: (v: number) => void
  materialKey?: string
  onMaterialKeyChange?: (v: string) => void
  matYoungsModulus: number
  matYieldStress: number
  matUTS: number
  matHardeningN: number
  onMatYoungsModulusChange: (v: number) => void
  onMatYieldStressChange: (v: number) => void
  onMatUTSChange: (v: number) => void
  onMatHardeningNChange: (v: number) => void
  deformScale: number
  onDeformScaleChange: (v: number) => void
  clipEnabled: boolean
  clipY: number
  onClipEnabledChange: (v: boolean) => void
  onClipYChange: (v: number) => void
  resultSummary?: { maxStress: number; maxDisp: number; maxPlastic: number; energyAbsorbed: number; sea: number; cfe: number; canMass: number; peakForce: number; meanForce: number } | null
  prevResultSummary?: { maxStress: number; maxDisp: number; maxPlastic: number; energyAbsorbed: number; sea: number; cfe: number; canMass: number; peakForce: number; meanForce: number } | null
  presetName: string
  presetNames: string[]
  onSavePreset: (name: string) => void
  onLoadPreset: (name: string) => void
  onDeletePreset: (name: string) => void
  autoStopStress?: boolean
  onAutoStopStressChange?: (v: boolean) => void
  autoStopMultiplier?: number
  onAutoStopMultiplierChange?: (v: number) => void
  maxCompression?: number
  onMaxCompressionChange?: (v: number) => void
  darkMode?: boolean
}

interface Theme {
  bg: string; surface: string; text: string; textSec: string; border: string
  inset: string; raised: string; pressed: string; inputBg: string; inputShadow: string
  selectBg: string; selectShadow: string
}

function getTheme(dark: boolean): Theme {
  return dark
    ? { bg: '#1e293b', surface: '#334155', text: '#e2e8f0', textSec: '#94a3b8', border: '#475569',
        inset: 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -4px -4px 8px rgba(51,65,85,0.6)',
        raised: '4px 4px 8px rgba(0,0,0,0.4), -4px -4px 8px rgba(51,65,85,0.5)',
        pressed: 'inset 2px 2px 5px rgba(0,0,0,0.4), inset -2px -2px 5px rgba(51,65,85,0.5)',
        inputBg: '#1e293b', inputShadow: 'inset 1px 1px 3px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(51,65,85,0.5)',
        selectBg: '#334155', selectShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(51,65,85,0.5)',
      }
    : { bg: '#f0f4f8', surface: '#ffffff', text: '#0f172a', textSec: '#64748b', border: '#d0d5dd',
        inset: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.9)',
        raised: '4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.8)',
        pressed: 'inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)',
        inputBg: '#f0f4f8', inputShadow: 'inset 1px 1px 3px rgba(163,177,198,0.3), inset -1px -1px 3px rgba(255,255,255,0.7)',
        selectBg: '#e8ecf1', selectShadow: 'inset 2px 2px 4px rgba(163,177,198,0.3), inset -2px -2px 4px rgba(255,255,255,0.7)',
      }
}

function Section({ title, children, defaultOpen = true, theme }: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  theme: Theme
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%',
          padding: '8px 14px',
          border: 'none',
          borderRadius: 12,
          background: theme.bg,
          color: theme.text,
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'box-shadow 0.15s, transform 0.15s',
          boxShadow: open ? theme.pressed : theme.raised,
          transform: open ? 'scale(0.98)' : 'scale(1)',
        }}
      >
        {open ? '▾' : '▸'} {title}
      </button>
      {open && (
        <div style={{ padding: '8px 4px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Slider({ label, value, min, max, step, unit, onChange, theme }: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
  theme: Theme
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: theme.textSec, marginBottom: 2 }}>
        <span>{label}</span>
        <span>
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={e => onChange(Number(e.target.value))}
            style={{
              width: 60,
              border: 'none',
              borderRadius: 6,
              padding: '2px 4px',
              textAlign: 'right',
              fontSize: 12,
              color: theme.text,
              background: theme.inputBg,
              boxShadow: theme.inputShadow,
            }}
          />
          <span style={{ marginLeft: 2 }}>{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', cursor: 'pointer' }}
      />
    </div>
  )
}

export default function ControlPanel({
  canDiameter,
  canHeight,
  wallThickness,
  force,
  controlMode,
  speed,
  rigidShape,
  rigidRadius,
  rigidHeight,
  rigidPosX,
  rigidPosY,
  rigidPosZ,
  rigidRotX,
  rigidRotY,
  rigidRotZ,
  onCanDiameterChange,
  onCanHeightChange,
  onWallThicknessChange,
  onForceChange,
  onControlModeChange,
  onSpeedChange,
  onRigidShapeChange,
  onRigidRadiusChange,
  onRigidHeightChange,
  onRigidPosXChange,
  onRigidPosYChange,
  onRigidPosZChange,
  onRigidRotXChange,
  onRigidRotYChange,
  onRigidRotZChange,
  displayMode,
  colormapType,
  onDisplayModeChange,
  onColormapTypeChange,
  chartData,
  prevChartData,
  timeScale,
  onTimeScaleChange,
  materialKey = 'aluminum_6061',
  onMaterialKeyChange,
  matYoungsModulus,
  matYieldStress,
  matUTS,
  matHardeningN,
  onMatYoungsModulusChange,
  onMatYieldStressChange,
  onMatUTSChange,
  onMatHardeningNChange,
  deformScale,
  onDeformScaleChange,
  clipEnabled,
  clipY,
  onClipEnabledChange,
  onClipYChange,
  resultSummary,
  prevResultSummary,
  presetName,
  presetNames,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  autoStopStress,
  onAutoStopStressChange,
  autoStopMultiplier,
  onAutoStopMultiplierChange,
  maxCompression,
  onMaxCompressionChange,
  darkMode = false,
}: ControlPanelProps) {
  const theme = getTheme(darkMode)
  return (
    <div
      style={{
        width: 280,
        height: '100%',
        background: theme.bg,
        borderLeft: 'none',
        padding: '12px',
        overflowY: 'auto',
        boxShadow: theme.inset,
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: 14, color: theme.text }}>Control Panel</h3>

      <Section title="Presets" defaultOpen={false} theme={theme}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <input
            type="text"
            placeholder="Preset name..."
            defaultValue={presetName}
            onBlur={e => e.target.dataset.val = e.target.value}
            style={{
              flex: 1,
              padding: '4px 8px',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              color: theme.text,
              background: theme.inputBg,
              boxShadow: theme.inputShadow,
            }}
            id="presetNameInput"
          />
          <button
            onClick={() => {
              const input = document.getElementById('presetNameInput') as HTMLInputElement
              const name = input?.value?.trim()
              if (name) onSavePreset(name)
            }}
            style={{
              padding: '4px 10px',
              border: 'none',
              borderRadius: 8,
              background: '#10b981',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
        {presetNames.length > 0 && (
          <div style={{ fontSize: 11 }}>
            {presetNames.map(name => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                <button
                  onClick={() => onLoadPreset(name)}
                  style={{
                    flex: 1,
                    padding: '3px 8px',
                    border: 'none',
                    borderRadius: 6,
                    background: name === presetName
                      ? (darkMode ? '#1e3a5f' : '#dbeafe')
                      : (darkMode ? '#475569' : '#e8ecf1'),
                    color: theme.text,
                    fontSize: 11,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: name === presetName ? 600 : 400,
                  }}
                >
                  {name}
                </button>
                <button
                  onClick={() => onDeletePreset(name)}
                  style={{
                    padding: '3px 6px',
                    border: 'none',
                    borderRadius: 6,
                    background: darkMode ? '#7f1d1d' : '#fecaca',
                    color: '#dc2626',
                    fontSize: 10,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Can Parameters" theme={theme}>
        <Slider label="Diameter (D)" value={canDiameter} min={20} max={100} step={1} unit="mm" onChange={onCanDiameterChange} theme={theme} />
        <Slider label="Height (H)" value={canHeight} min={50} max={200} step={1} unit="mm" onChange={onCanHeightChange} theme={theme} />
        <Slider label="Wall Thickness (t)" value={wallThickness} min={0.1} max={2.0} step={0.05} unit="mm" onChange={onWallThicknessChange} theme={theme} />
      </Section>

      <Section title="Load Conditions" theme={theme}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: theme.textSec, marginBottom: 4 }}>Control Mode</div>
          <select
            value={controlMode}
            onChange={e => onControlModeChange(e.target.value as ControlMode)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: 'none',
              borderRadius: 8,
              background: theme.selectBg,
              color: theme.text,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: theme.selectShadow,
            }}
          >
            <option value="displacement">Displacement Control</option>
            <option value="force">Force Control</option>
          </select>
        </div>
        <Slider label="Max Force" value={force} min={0} max={10000} step={50} unit="N" onChange={onForceChange} theme={theme} />
        <Slider label="Compression Speed" value={speed} min={1} max={100} step={1} unit="mm/s" onChange={onSpeedChange} theme={theme} />
        <Slider label="Time Scale" value={timeScale} min={0.1} max={5.0} step={0.1} unit="×" onChange={onTimeScaleChange} theme={theme} />
        {onMaxCompressionChange && (
          <Slider label="Max Compression" value={maxCompression ?? 67} min={10} max={90} step={1} unit="%" onChange={onMaxCompressionChange} theme={theme} />
        )}
        {onAutoStopStressChange && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: theme.textSec, marginTop: 4, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoStopStress ?? true}
              onChange={e => onAutoStopStressChange(e.target.checked)}
              style={{ accentColor: '#3b82f6' }}
            />
            Auto-stop at {((autoStopMultiplier ?? 1.2) * 100).toFixed(0)}% UTS
          </label>
        )}
        {onAutoStopMultiplierChange && autoStopStress && (
          <Slider label="UTS Threshold" value={(autoStopMultiplier ?? 1.2) * 100} min={100} max={200} step={5} unit="%" onChange={v => onAutoStopMultiplierChange(v / 100)} theme={theme} />
        )}
      </Section>

      <Section title="Rigid Body" theme={theme}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: theme.textSec, marginBottom: 4 }}>Shape</div>
          <select
            value={rigidShape}
            onChange={e => onRigidShapeChange(e.target.value as RigidBodyShape)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: 'none',
              borderRadius: 8,
              background: theme.selectBg,
              color: theme.text,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: theme.selectShadow,
            }}
          >
            <option value="cylinder">Cylinder</option>
            <option value="box">Box</option>
            <option value="sphere">Sphere</option>
            <option value="cone">Cone</option>
          </select>
        </div>
        <Slider label="Radius" value={rigidRadius} min={10} max={100} step={1} unit="mm" onChange={onRigidRadiusChange} theme={theme} />
        {rigidShape !== 'sphere' && (
          <Slider label="Height" value={rigidHeight} min={5} max={100} step={1} unit="mm" onChange={onRigidHeightChange} theme={theme} />
        )}
      </Section>

      <Section title="Rigid Position" defaultOpen={false} theme={theme}>
        <Slider label="X" value={rigidPosX} min={-200} max={200} step={1} unit="mm" onChange={onRigidPosXChange} theme={theme} />
        <Slider label="Y" value={rigidPosY} min={0} max={400} step={1} unit="mm" onChange={onRigidPosYChange} theme={theme} />
        <Slider label="Z" value={rigidPosZ} min={-200} max={200} step={1} unit="mm" onChange={onRigidPosZChange} theme={theme} />
      </Section>

      <Section title="Rigid Rotation" defaultOpen={false} theme={theme}>
        <Slider label="Rx" value={rigidRotX} min={-180} max={180} step={1} unit="°" onChange={onRigidRotXChange} theme={theme} />
        <Slider label="Ry" value={rigidRotY} min={-180} max={180} step={1} unit="°" onChange={onRigidRotYChange} theme={theme} />
        <Slider label="Rz" value={rigidRotZ} min={-180} max={180} step={1} unit="°" onChange={onRigidRotZChange} theme={theme} />
      </Section>

      <Section title="Visualization" theme={theme}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: theme.textSec, marginBottom: 4 }}>Display</div>
          <select
            value={displayMode}
            onChange={e => onDisplayModeChange(e.target.value as DisplayMode)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: 'none',
              borderRadius: 8,
              background: theme.selectBg,
              color: theme.text,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: theme.selectShadow,
            }}
          >
            <option value="none">None (Solid Color)</option>
            <option value="stress">Von Mises Stress</option>
            <option value="displacement">Displacement</option>
            <option value="plastic">Plastic Strain</option>
          </select>
        </div>
        {displayMode !== 'none' && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: theme.textSec, marginBottom: 4 }}>Colormap</div>
            <select
              value={colormapType}
              onChange={e => onColormapTypeChange(e.target.value as ColormapName)}
              style={{
                width: '100%',
                padding: '4px 8px',
                border: 'none',
                borderRadius: 8,
                background: theme.selectBg,
                color: theme.text,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: theme.selectShadow,
              }}
            >
              <option value="jet">Jet</option>
              <option value="rainbow">Rainbow</option>
              <option value="thermal">Thermal</option>
            </select>
          </div>
        )}
        <Slider label="Deform Scale" value={deformScale} min={0.1} max={10.0} step={0.1} unit="×" onChange={onDeformScaleChange} theme={theme} />
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.textSec, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={clipEnabled}
              onChange={e => onClipEnabledChange(e.target.checked)}
            />
            Section Clip (Y)
          </label>
        </div>
        {clipEnabled && (
          <Slider label="Clip Y" value={clipY} min={0} max={200} step={1} unit="mm" onChange={onClipYChange} theme={theme} />
        )}
      </Section>

      <Section title="Load-Displacement Chart" theme={theme}>
        <LoadDisplacementChart data={chartData} prevData={prevChartData} width={256} height={160} darkMode={darkMode} />
        {chartData.length > 0 && (
          <button
            onClick={() => {
              const header = 'displacement_mm,load_N\n'
              const rows = chartData.map(d => `${d.displacement.toFixed(4)},${d.load.toFixed(4)}`).join('\n')
              const blob = new Blob([header + rows], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `cancrush_load_disp_${Date.now()}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
            style={{
              width: '100%',
              marginTop: 6,
              padding: '6px 0',
              border: 'none',
              borderRadius: 10,
              background: theme.bg,
              color: '#3b82f6',
              fontWeight: 600,
              fontSize: 11,
              cursor: 'pointer',
              boxShadow: theme.raised,
            }}
          >
            Export CSV
          </button>
        )}
      </Section>

      <Section title="Energy-Displacement" defaultOpen={false} theme={theme}>
        <EnergyChart data={chartData} prevData={prevChartData} width={256} height={120} darkMode={darkMode} />
      </Section>

      <Section title="Stress-Strain Curve" defaultOpen={false} theme={theme}>
        <StressStrainChart material={MATERIALS[materialKey]} currentPlasticStrain={resultSummary?.maxPlastic ?? 0} width={256} height={120} darkMode={darkMode} />
      </Section>

      <Section title={`Material (${MATERIAL_KEYS.length})`} defaultOpen={false} theme={theme}>
        {onMaterialKeyChange && (() => {
          const [matFilter, setMatFilter] = useState('')
          const [catFilter, setCatFilter] = useState('')
          const lf = matFilter.toLowerCase()
          // Build category counts
          const catCounts: Record<string, number> = {}
          MATERIAL_KEYS.forEach(k => {
            const cat = getCategory(k).label
            catCounts[cat] = (catCounts[cat] || 0) + 1
          })
          const topCategories = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
          const filteredKeys = MATERIAL_KEYS.filter(k => {
            const m = MATERIALS[k]
            const cat = getCategory(k)
            if (catFilter && cat.label !== catFilter) return false
            if (lf && !m.name.toLowerCase().includes(lf) && !k.toLowerCase().includes(lf)) return false
            return true
          })
          return (
            <>
              {/* Category filter chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 4 }}>
                <button
                  onClick={() => setCatFilter('')}
                  style={{
                    padding: '2px 6px', borderRadius: 6, border: 'none', fontSize: 9, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: !catFilter ? '#3b82f6' : (theme.selectBg),
                    color: !catFilter ? '#fff' : theme.textSec,
                    boxShadow: !catFilter ? 'none' : theme.selectShadow,
                  }}
                >All</button>
                {topCategories.map(([cat, count]) => {
                  const catInfo = getCategory(MATERIAL_KEYS.find(k => getCategory(k).label === cat) || '')
                  return (
                    <button
                      key={cat}
                      onClick={() => setCatFilter(catFilter === cat ? '' : cat)}
                      style={{
                        padding: '2px 6px', borderRadius: 6, border: 'none', fontSize: 9, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s',
                        background: catFilter === cat ? catInfo.color : (theme.selectBg),
                        color: catFilter === cat ? '#000' : theme.textSec,
                        boxShadow: catFilter === cat ? 'none' : theme.selectShadow,
                      }}
                    >{cat}·{count}</button>
                  )
                })}
              </div>
              <input
                type="text"
                placeholder="Search materials… (e.g. steel, titanium)"
                value={matFilter}
                onChange={e => setMatFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  borderRadius: 8,
                  border: 'none',
                  background: theme.selectBg,
                  color: theme.text,
                  fontSize: 11,
                  marginBottom: 4,
                  boxShadow: theme.selectShadow,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {(matFilter || catFilter) && <div style={{ fontSize: 9, color: theme.textSec, marginBottom: 2 }}>{filteredKeys.length} / {MATERIAL_KEYS.length} materials{catFilter ? ` [${catFilter}]` : ''}</div>}
              <select
                value={materialKey}
                onChange={e => onMaterialKeyChange(e.target.value)}
                size={(matFilter || catFilter) ? Math.min(filteredKeys.length, 10) : 1}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: theme.selectBg,
                  color: theme.text,
                  fontSize: 12,
                  fontWeight: 500,
                  marginBottom: 8,
                  boxShadow: theme.selectShadow,
                }}
              >
                {filteredKeys.map(k => {
                  const m = MATERIALS[k]
                  const E = m.youngsModulus >= 1000 ? `${(m.youngsModulus / 1000).toFixed(0)}G` : `${m.youngsModulus}M`
                  return <option key={k} value={k} title={`E=${E}Pa σy=${m.yieldStress}MPa UTS=${m.uts}MPa ρ=${m.density}kg/m³ n=${m.hardeningExponent}`}>
                    {m.name} [{getCategory(k).label}]
                  </option>
                })}
              </select>
            </>
          )
        })()}
        <Slider label="E (Young's)" value={matYoungsModulus} min={100} max={600000} step={100} unit="MPa" onChange={onMatYoungsModulusChange} theme={theme} />
        <Slider label="σ_y (Yield)" value={matYieldStress} min={1} max={3000} step={1} unit="MPa" onChange={onMatYieldStressChange} theme={theme} />
        <Slider label="σ_u (UTS)" value={matUTS} min={5} max={3500} step={1} unit="MPa" onChange={onMatUTSChange} theme={theme} />
        <Slider label="n (Hardening)" value={matHardeningN} min={0.01} max={1.0} step={0.01} unit="" onChange={onMatHardeningNChange} theme={theme} />
        {(() => {
          const mat = MATERIALS[materialKey] ?? MATERIALS['aluminum_6061']
          return (
            <div style={{ fontSize: 10, color: theme.textSec, marginTop: 4, lineHeight: 1.6 }}>
              <div>ν = {mat.poissonRatio} · ρ = {mat.density.toLocaleString()} kg/m³ · t = {mat.wallThickness} mm</div>
              <div>K = {mat.hardeningK().toFixed(0)} MPa · σ_f: {mat.yieldStress.toFixed(0)}→{mat.flowStress(0.3).toFixed(0)} MPa</div>
            </div>
          )
        })()}
      </Section>

      {resultSummary && (() => {
        const p = prevResultSummary
        const delta = (cur: number, prev: number | undefined, suffix: string, invert = false) => {
          if (prev == null) return null
          const d = cur - prev
          if (Math.abs(d) < 0.001) return null
          const positive = invert ? d < 0 : d > 0
          return <span style={{ fontSize: 9, marginLeft: 4, color: positive ? '#10b981' : '#ef4444' }}>{d > 0 ? '+' : ''}{d.toFixed(suffix === '%' ? 1 : suffix === 'J' ? 3 : 1)}{suffix}</span>
        }
        return (
        <Section title="Results" defaultOpen={true} theme={theme}>
          <div style={{ fontSize: 11, lineHeight: 1.8, color: theme.textSec }}>
            <div><strong style={{ color: theme.text }}>Max σ:</strong> {resultSummary.maxStress.toFixed(1)} MPa{delta(resultSummary.maxStress, p?.maxStress, ' MPa', true)}</div>
            <div><strong style={{ color: theme.text }}>Max d:</strong> {resultSummary.maxDisp.toFixed(2)} mm{delta(resultSummary.maxDisp, p?.maxDisp, ' mm')}</div>
            <div><strong style={{ color: theme.text }}>Max ε_p:</strong> {(resultSummary.maxPlastic * 100).toFixed(2)} %{delta(resultSummary.maxPlastic * 100, p ? p.maxPlastic * 100 : undefined, '%', true)}</div>
            <div><strong style={{ color: theme.text }}>Energy:</strong> {resultSummary.energyAbsorbed.toFixed(3)} J{delta(resultSummary.energyAbsorbed, p?.energyAbsorbed, 'J')}</div>
            <div><strong style={{ color: theme.text }}>F_peak:</strong> {resultSummary.peakForce.toFixed(0)} N{delta(resultSummary.peakForce, p?.peakForce, ' N', true)}</div>
            <div><strong style={{ color: theme.text }}>F_mean:</strong> {resultSummary.meanForce.toFixed(0)} N{delta(resultSummary.meanForce, p?.meanForce, ' N')}</div>
            <div style={{ borderTop: `1px solid ${theme.border}`, marginTop: 4, paddingTop: 4 }}>
              <div><strong style={{ color: theme.text }}>SEA:</strong> {resultSummary.sea.toFixed(1)} J/kg{delta(resultSummary.sea, p?.sea, ' J/kg')}</div>
              <div><strong style={{ color: theme.text }}>CFE:</strong> <span style={{ color: resultSummary.cfe >= 0.7 ? '#10b981' : resultSummary.cfe >= 0.4 ? '#f59e0b' : '#ef4444' }}>{(resultSummary.cfe * 100).toFixed(1)}%</span>{delta(resultSummary.cfe * 100, p ? p.cfe * 100 : undefined, '%')}</div>
              <div><strong style={{ color: theme.text }}>Mass:</strong> {(resultSummary.canMass * 1000).toFixed(2)} g{delta(resultSummary.canMass * 1000, p ? p.canMass * 1000 : undefined, ' g', true)}</div>
            </div>
          </div>
        </Section>
        )
      })()}
    </div>
  )
}
