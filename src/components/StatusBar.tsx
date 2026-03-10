interface StatusBarProps {
  simState: 'idle' | 'running' | 'paused'
  fps: number
  nodeCount: number
  cursorWorld?: { x: number; y: number; z: number } | null
  simTime?: number
  displacement?: number
  displayInfo?: { mode: string; min: number; max: number } | null
  darkMode?: boolean
}

export default function StatusBar({ simState, fps, nodeCount, cursorWorld, simTime = 0, displacement = 0, displayInfo, darkMode = false }: StatusBarProps) {
  const stateLabel = simState === 'idle' ? 'Ready' : simState === 'running' ? 'Simulating' : 'Paused'
  const stateColor = simState === 'idle' ? '#64748b' : simState === 'running' ? '#10b981' : '#f59e0b'

  return (
    <div
      style={{
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 24,
        background: darkMode ? '#0f172a' : '#e8ecf1',
        borderTop: `1px solid ${darkMode ? '#334155' : '#d0d5dd'}`,
        fontSize: 11,
        fontFamily: 'monospace',
        color: darkMode ? '#94a3b8' : '#475569',
        boxShadow: darkMode
          ? 'inset 0 1px 3px rgba(0,0,0,0.3)'
          : 'inset 0 1px 3px rgba(163,177,198,0.3)',
        flexShrink: 0,
      }}
    >
      {/* Sim State */}
      <span>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: stateColor, marginRight: 6, verticalAlign: 'middle' }} />
        {stateLabel}
      </span>

      {/* Cursor Position */}
      <span style={{ minWidth: 200 }}>
        {cursorWorld
          ? `X: ${cursorWorld.x.toFixed(1)}  Y: ${cursorWorld.y.toFixed(1)}  Z: ${cursorWorld.z.toFixed(1)}`
          : 'X: —  Y: —  Z: —'}
      </span>

      {/* Sim Info */}
      {simState !== 'idle' && (
        <span>t: {simTime.toFixed(3)}s  d: {displacement.toFixed(1)}mm</span>
      )}

      {/* Display Mode Info */}
      {displayInfo && (
        <span style={{ color: '#3b82f6' }}>
          {displayInfo.mode}: {displayInfo.min.toFixed(1)}~{displayInfo.max.toFixed(1)}
        </span>
      )}

      {/* Node Count */}
      <span>Nodes: {nodeCount}</span>

      {/* FPS */}
      <span style={{ marginLeft: 'auto', color: fps >= 30 ? '#10b981' : '#ef4444' }}>
        {fps} FPS
      </span>
    </div>
  )
}
