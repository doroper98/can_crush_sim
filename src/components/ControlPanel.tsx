import { useState } from 'react'

export type RigidBodyShape = 'cylinder' | 'box' | 'sphere' | 'cone'

interface ControlPanelProps {
  canDiameter: number
  canHeight: number
  wallThickness: number
  force: number
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
          padding: '8px 12px',
          border: 'none',
          borderRadius: 10,
          background: '#e8ecf1',
          color: '#0f172a',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          textAlign: 'left',
          boxShadow: open
            ? 'inset 2px 2px 4px rgba(163,177,198,0.4), inset -2px -2px 4px rgba(255,255,255,0.8)'
            : '2px 2px 4px rgba(163,177,198,0.5), -2px -2px 4px rgba(255,255,255,0.8)',
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
}: ControlPanelProps) {
  return (
    <div
      style={{
        width: 280,
        height: '100%',
        background: '#f0f4f8',
        borderLeft: '1px solid #d0d5dd',
        padding: '12px',
        overflowY: 'auto',
        boxShadow: '-4px 0 8px rgba(163,177,198,0.2)',
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

      <Section title="Material (Aluminum)" defaultOpen={false}>
        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
          E = 69,000 MPa<br />
          ν = 0.33<br />
          σ_y = 276 MPa<br />
          σ_u = 310 MPa<br />
          ρ = 2,700 kg/m³<br />
          n = 0.2
        </div>
      </Section>
    </div>
  )
}
