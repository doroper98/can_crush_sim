interface StatusBarProps {
  simState: 'idle' | 'running' | 'paused'
  fps: number
  nodeCount: number
  cursorWorld?: { x: number; y: number; z: number } | null
  simTime?: number
  displacement?: number
  simSteps?: number
  maxDisplacement?: number
  wallElapsed?: number
  displayInfo?: { mode: string; min: number; max: number } | null
  darkMode?: boolean
}

export default function StatusBar({ simState, fps, nodeCount, cursorWorld, simTime = 0, displacement = 0, simSteps = 0, maxDisplacement = 0, wallElapsed = 0, displayInfo, darkMode = false }: StatusBarProps) {
  const stateLabel = simState === 'idle' ? 'Ready' : simState === 'running' ? 'Simulating' : 'Paused'
  const stateColor = simState === 'idle' ? '#64748b' : simState === 'running' ? '#10b981' : '#f59e0b'
  const stateIcon = simState === 'idle' ? '○' : simState === 'running' ? '▶' : '⏸'

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
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: stateColor, fontSize: 10 }}>{stateIcon}</span>
        <span style={{ color: stateColor, fontWeight: 600 }}>{stateLabel}</span>
      </span>

      {/* Cursor Position */}
      <span style={{ minWidth: 200 }}>
        {cursorWorld
          ? `X: ${cursorWorld.x.toFixed(1)}  Y: ${cursorWorld.y.toFixed(1)}  Z: ${cursorWorld.z.toFixed(1)}`
          : 'X: —  Y: —  Z: —'}
      </span>

      {/* Sim Info */}
      {simState !== 'idle' && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>t: {simTime.toFixed(3)}s  d: {displacement.toFixed(1)}mm  steps: {simSteps}{wallElapsed > 0 ? `  wall: ${wallElapsed.toFixed(1)}s` : ''}</span>
          {maxDisplacement > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 60, height: 6, borderRadius: 3, background: darkMode ? '#334155' : '#d0d5dd', overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${Math.min((displacement / maxDisplacement) * 100, 100)}%`, height: '100%', borderRadius: 3, background: '#3b82f6', transition: 'width 0.1s' }} />
              </span>
              <span style={{ fontSize: 10 }}>{Math.min((displacement / maxDisplacement) * 100, 100).toFixed(0)}%</span>
            </span>
          )}
        </span>
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
