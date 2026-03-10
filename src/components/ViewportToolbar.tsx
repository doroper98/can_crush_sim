interface ViewportToolbarProps {
  onViewChange: (view: 'top' | 'front' | 'right' | 'iso') => void
  onTogglePerspective: () => void
  onFitAll: () => void
  onToggleWireframe: () => void
  onScreenshot?: () => void
  onHelp?: () => void
  onToggleDarkMode?: () => void
  darkMode?: boolean
  measureMode?: boolean
  onToggleMeasure?: () => void
  isPerspective: boolean
  gizmoMode?: 'translate' | 'rotate'
  onGizmoModeChange?: (mode: 'translate' | 'rotate') => void
}

export default function ViewportToolbar({
  onViewChange,
  onTogglePerspective,
  onFitAll,
  onToggleWireframe,
  onScreenshot,
  onHelp,
  onToggleDarkMode,
  darkMode = false,
  measureMode = false,
  onToggleMeasure,
  isPerspective,
  gizmoMode = 'translate',
  onGizmoModeChange,
}: ViewportToolbarProps) {
  const btnStyle: React.CSSProperties = {
    padding: '5px 12px',
    margin: '0 2px',
    border: 'none',
    borderRadius: 12,
    background: '#f0f4f8',
    color: '#0f172a',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    boxShadow:
      '4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.8)',
    transition: 'box-shadow 0.15s, transform 0.15s',
  }

  const activeBtnStyle: React.CSSProperties = {
    ...btnStyle,
    boxShadow:
      'inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)',
    transform: 'scale(0.98)',
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
        background: 'rgba(240,244,248,0.95)',
        padding: '4px 8px',
        borderRadius: 16,
        boxShadow:
          '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.8)',
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
      {onScreenshot && (
        <button style={btnStyle} onClick={onScreenshot} title="Screenshot (S)">
          Snap
        </button>
      )}
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
      {onToggleMeasure && (
        <button
          style={measureMode ? activeBtnStyle : btnStyle}
          onClick={onToggleMeasure}
          title="Measure Tool (M)"
        >
          Meas
        </button>
      )}
      {onToggleDarkMode && (
        <button
          style={darkMode ? activeBtnStyle : btnStyle}
          onClick={onToggleDarkMode}
          title="Toggle Dark Mode (D)"
        >
          {darkMode ? 'Light' : 'Dark'}
        </button>
      )}
      {onHelp && (
        <>
          <span style={{ width: 1, background: '#ccc', margin: '0 4px' }} />
          <button style={btnStyle} onClick={onHelp} title="Keyboard Shortcuts (?)">
            ?
          </button>
        </>
      )}
    </div>
  )
}
