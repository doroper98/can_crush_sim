import { useState } from 'react'
import LoadDisplacementChart from './LoadDisplacementChart'
import { MATERIALS, MATERIAL_KEYS } from '../engine/MaterialModel'

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
  resultSummary?: { maxStress: number; maxDisp: number; maxPlastic: number; energyAbsorbed: number } | null
  presetName: string
  presetNames: string[]
  onSavePreset: (name: string) => void
  onLoadPreset: (name: string) => void
  onDeletePreset: (name: string) => void
  autoStopStress?: boolean
  onAutoStopStressChange?: (v: boolean) => void
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
  presetName,
  presetNames,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  autoStopStress,
  onAutoStopStressChange,
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
        {onAutoStopStressChange && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: theme.textSec, marginTop: 4, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoStopStress ?? true}
              onChange={e => onAutoStopStressChange(e.target.checked)}
              style={{ accentColor: '#3b82f6' }}
            />
            Auto-stop at 120% UTS
          </label>
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
        <LoadDisplacementChart data={chartData} width={256} height={160} />
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

      <Section title="Material" defaultOpen={false} theme={theme}>
        {onMaterialKeyChange && (
          <select
            value={materialKey}
            onChange={e => onMaterialKeyChange(e.target.value)}
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
            {MATERIAL_KEYS.map(k => (
              <option key={k} value={k}>{MATERIALS[k].name}</option>
            ))}
          </select>
        )}
        <Slider label="E (Young's)" value={matYoungsModulus} min={10000} max={300000} step={1000} unit="MPa" onChange={onMatYoungsModulusChange} theme={theme} />
        <Slider label="σ_y (Yield)" value={matYieldStress} min={10} max={1500} step={1} unit="MPa" onChange={onMatYieldStressChange} theme={theme} />
        <Slider label="σ_u (UTS)" value={matUTS} min={20} max={2000} step={1} unit="MPa" onChange={onMatUTSChange} theme={theme} />
        <Slider label="n (Hardening)" value={matHardeningN} min={0.01} max={1.0} step={0.01} unit="" onChange={onMatHardeningNChange} theme={theme} />
        {(() => {
          const mat = MATERIALS[materialKey] ?? MATERIALS['aluminum_6061']
          return (
            <div style={{ fontSize: 10, color: theme.textSec, marginTop: 4 }}>
              ν = {mat.poissonRatio} · ρ = {mat.density.toLocaleString()} kg/m³
            </div>
          )
        })()}
      </Section>

      {resultSummary && (
        <Section title="Results" defaultOpen={true} theme={theme}>
          <div style={{ fontSize: 11, lineHeight: 1.8, color: theme.textSec }}>
            <div><strong style={{ color: theme.text }}>Max σ:</strong> {resultSummary.maxStress.toFixed(1)} MPa</div>
            <div><strong style={{ color: theme.text }}>Max d:</strong> {resultSummary.maxDisp.toFixed(2)} mm</div>
            <div><strong style={{ color: theme.text }}>Max ε_p:</strong> {(resultSummary.maxPlastic * 100).toFixed(2)} %</div>
            <div><strong style={{ color: theme.text }}>Energy:</strong> {resultSummary.energyAbsorbed.toFixed(3)} J</div>
          </div>
        </Section>
      )}
    </div>
  )
}
