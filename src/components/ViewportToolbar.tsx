interface ViewportToolbarProps {
  onViewChange: (view: 'top' | 'front' | 'right' | 'iso') => void
  onTogglePerspective: () => void
  onFitAll: () => void
  onToggleWireframe: () => void
  isPerspective: boolean
  gizmoMode?: 'translate' | 'rotate'
  onGizmoModeChange?: (mode: 'translate' | 'rotate') => void
}

export default function ViewportToolbar({
  onViewChange,
  onTogglePerspective,
  onFitAll,
  onToggleWireframe,
  isPerspective,
  gizmoMode = 'translate',
  onGizmoModeChange,
}: ViewportToolbarProps) {
  const btnStyle: React.CSSProperties = {
    padding: '4px 10px',
    margin: '0 2px',
    border: 'none',
    borderRadius: '6px',
    background: '#e8ecf1',
    color: '#0f172a',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    boxShadow:
      '2px 2px 4px rgba(163,177,198,0.5), -2px -2px 4px rgba(255,255,255,0.8)',
  }

  const activeBtnStyle: React.CSSProperties = {
    ...btnStyle,
    boxShadow:
      'inset 2px 2px 4px rgba(163,177,198,0.5), inset -2px -2px 4px rgba(255,255,255,0.8)',
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        left: 8,
        display: 'flex',
        gap: 2,
        zIndex: 10,
        background: 'rgba(240,244,248,0.9)',
        padding: '4px 6px',
        borderRadius: 10,
        boxShadow:
          '4px 4px 8px rgba(163,177,198,0.4), -4px -4px 8px rgba(255,255,255,0.7)',
      }}
    >
      <button style={btnStyle} onClick={() => onViewChange('top')} title="Top View (Num 7)">
        XY
      </button>
      <button style={btnStyle} onClick={() => onViewChange('right')} title="Right View (Num 3)">
        YZ
      </button>
      <button style={btnStyle} onClick={() => onViewChange('front')} title="Front View (Num 1)">
        XZ
      </button>
      <button style={btnStyle} onClick={() => onViewChange('iso')} title="Isometric (Num 0)">
        ISO
      </button>
      <span style={{ width: 1, background: '#ccc', margin: '0 4px' }} />
      <button
        style={isPerspective ? btnStyle : activeBtnStyle}
        onClick={onTogglePerspective}
        title="Toggle Perspective/Ortho (P)"
      >
        {isPerspective ? 'Persp' : 'Ortho'}
      </button>
      <button style={btnStyle} onClick={onFitAll} title="Fit All (F)">
        Fit
      </button>
      <button style={btnStyle} onClick={onToggleWireframe} title="Wireframe (W)">
        Wire
      </button>
      {onGizmoModeChange && (
        <>
          <span style={{ width: 1, background: '#ccc', margin: '0 4px' }} />
          <button
            style={gizmoMode === 'translate' ? activeBtnStyle : btnStyle}
            onClick={() => onGizmoModeChange('translate')}
            title="Translate Gizmo (T)"
          >
            Move
          </button>
          <button
            style={gizmoMode === 'rotate' ? activeBtnStyle : btnStyle}
            onClick={() => onGizmoModeChange('rotate')}
            title="Rotate Gizmo (R)"
          >
            Rot
          </button>
        </>
      )}
    </div>
  )
}
