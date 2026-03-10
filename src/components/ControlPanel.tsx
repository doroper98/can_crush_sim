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
}

function Section({ title, children, defaultOpen = true }: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
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
          background: '#f0f4f8',
          color: '#0f172a',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'box-shadow 0.15s, transform 0.15s',
          boxShadow: open
            ? 'inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)'
            : '4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.8)',
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

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 2 }}>
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
              background: '#f0f4f8',
              boxShadow: 'inset 1px 1px 3px rgba(163,177,198,0.3), inset -1px -1px 3px rgba(255,255,255,0.7)',
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
}: ControlPanelProps) {
  return (
    <div
      style={{
        width: 280,
        height: '100%',
        background: '#f0f4f8',
        borderLeft: 'none',
        padding: '12px',
        overflowY: 'auto',
        boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.9)',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#0f172a' }}>Control Panel</h3>

      <Section title="Can Parameters">
        <Slider
          label="Diameter (D)"
          value={canDiameter}
          min={20}
          max={100}
          step={1}
          unit="mm"
          onChange={onCanDiameterChange}
        />
        <Slider
          label="Height (H)"
          value={canHeight}
          min={50}
          max={200}
          step={1}
          unit="mm"
          onChange={onCanHeightChange}
        />
        <Slider
          label="Wall Thickness (t)"
          value={wallThickness}
          min={0.1}
          max={2.0}
          step={0.05}
          unit="mm"
          onChange={onWallThicknessChange}
        />
      </Section>

      <Section title="Load Conditions">
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Control Mode</div>
          <select
            value={controlMode}
            onChange={e => onControlModeChange(e.target.value as ControlMode)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: 'none',
              borderRadius: 8,
              background: '#e8ecf1',
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.3), inset -2px -2px 4px rgba(255,255,255,0.7)',
            }}
          >
            <option value="displacement">Displacement Control</option>
            <option value="force">Force Control</option>
          </select>
        </div>
        <Slider
          label="Max Force"
          value={force}
          min={0}
          max={10000}
          step={50}
          unit="N"
          onChange={onForceChange}
        />
        <Slider
          label="Compression Speed"
          value={speed}
          min={1}
          max={100}
          step={1}
          unit="mm/s"
          onChange={onSpeedChange}
        />
        <Slider
          label="Time Scale"
          value={timeScale}
          min={0.1}
          max={5.0}
          step={0.1}
          unit="×"
          onChange={onTimeScaleChange}
        />
      </Section>

      <Section title="Rigid Body">
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Shape</div>
          <select
            value={rigidShape}
            onChange={e => onRigidShapeChange(e.target.value as RigidBodyShape)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: 'none',
              borderRadius: 8,
              background: '#e8ecf1',
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.3), inset -2px -2px 4px rgba(255,255,255,0.7)',
            }}
          >
            <option value="cylinder">Cylinder</option>
            <option value="box">Box</option>
            <option value="sphere">Sphere</option>
            <option value="cone">Cone</option>
          </select>
        </div>
        <Slider
          label="Radius"
          value={rigidRadius}
          min={10}
          max={100}
          step={1}
          unit="mm"
          onChange={onRigidRadiusChange}
        />
        {rigidShape !== 'sphere' && (
          <Slider
            label="Height"
            value={rigidHeight}
            min={5}
            max={100}
            step={1}
            unit="mm"
            onChange={onRigidHeightChange}
          />
        )}
      </Section>

      <Section title="Rigid Position" defaultOpen={false}>
        <Slider
          label="X"
          value={rigidPosX}
          min={-200}
          max={200}
          step={1}
          unit="mm"
          onChange={onRigidPosXChange}
        />
        <Slider
          label="Y"
          value={rigidPosY}
          min={0}
          max={400}
          step={1}
          unit="mm"
          onChange={onRigidPosYChange}
        />
        <Slider
          label="Z"
          value={rigidPosZ}
          min={-200}
          max={200}
          step={1}
          unit="mm"
          onChange={onRigidPosZChange}
        />
      </Section>

      <Section title="Rigid Rotation" defaultOpen={false}>
        <Slider
          label="Rx"
          value={rigidRotX}
          min={-180}
          max={180}
          step={1}
          unit="°"
          onChange={onRigidRotXChange}
        />
        <Slider
          label="Ry"
          value={rigidRotY}
          min={-180}
          max={180}
          step={1}
          unit="°"
          onChange={onRigidRotYChange}
        />
        <Slider
          label="Rz"
          value={rigidRotZ}
          min={-180}
          max={180}
          step={1}
          unit="°"
          onChange={onRigidRotZChange}
        />
      </Section>

      <Section title="Visualization">
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Display</div>
          <select
            value={displayMode}
            onChange={e => onDisplayModeChange(e.target.value as DisplayMode)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: 'none',
              borderRadius: 8,
              background: '#e8ecf1',
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.3), inset -2px -2px 4px rgba(255,255,255,0.7)',
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
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Colormap</div>
            <select
              value={colormapType}
              onChange={e => onColormapTypeChange(e.target.value as ColormapName)}
              style={{
                width: '100%',
                padding: '4px 8px',
                border: 'none',
                borderRadius: 8,
                background: '#e8ecf1',
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.3), inset -2px -2px 4px rgba(255,255,255,0.7)',
              }}
            >
              <option value="jet">Jet</option>
              <option value="rainbow">Rainbow</option>
              <option value="thermal">Thermal</option>
            </select>
          </div>
        )}
      </Section>

      <Section title="Load-Displacement Chart">
        <LoadDisplacementChart data={chartData} width={256} height={160} />
      </Section>

      <Section title="Material" defaultOpen={false}>
        {onMaterialKeyChange && (
          <select
            value={materialKey}
            onChange={e => onMaterialKeyChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: 8,
              border: 'none',
              background: '#e8ecf1',
              color: '#0f172a',
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 8,
              boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.4), inset -2px -2px 4px rgba(255,255,255,0.9)',
            }}
          >
            {MATERIAL_KEYS.map(k => (
              <option key={k} value={k}>{MATERIALS[k].name}</option>
            ))}
          </select>
        )}
        <Slider label="E (Young's)" value={matYoungsModulus} min={10000} max={300000} step={1000} unit="MPa" onChange={onMatYoungsModulusChange} />
        <Slider label="σ_y (Yield)" value={matYieldStress} min={10} max={1500} step={1} unit="MPa" onChange={onMatYieldStressChange} />
        <Slider label="σ_u (UTS)" value={matUTS} min={20} max={2000} step={1} unit="MPa" onChange={onMatUTSChange} />
        <Slider label="n (Hardening)" value={matHardeningN} min={0.01} max={1.0} step={0.01} unit="" onChange={onMatHardeningNChange} />
        {(() => {
          const mat = MATERIALS[materialKey] ?? MATERIALS['aluminum_6061']
          return (
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
              ν = {mat.poissonRatio} · ρ = {mat.density.toLocaleString()} kg/m³
            </div>
          )
        })()}
      </Section>
    </div>
  )
}
