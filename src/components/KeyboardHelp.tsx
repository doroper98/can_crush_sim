interface KeyboardHelpProps {
  visible: boolean
  onClose: () => void
}

const shortcuts = [
  { key: 'P', desc: 'Perspective / Orthographic 전환' },
  { key: 'W', desc: '와이어프레임 토글' },
  { key: 'F', desc: 'Fit All (전체 표시)' },
  { key: 'G', desc: '그리드 ON/OFF' },
  { key: 'T', desc: 'Translate 기즈모' },
  { key: 'R', desc: 'Rotate 기즈모' },
  { key: 'L', desc: '하중 화살표 토글' },
  { key: 'B', desc: '경계조건 마커 토글' },
  { key: 'S', desc: '스크린샷 (PNG)' },
  { key: '?', desc: '단축키 도움말 토글' },
  { key: 'Num 7', desc: 'Top View (XY)' },
  { key: 'Num 3', desc: 'Right View (YZ)' },
  { key: 'Num 1', desc: 'Front View (XZ)' },
  { key: 'Num 0', desc: 'Isometric View' },
]

const mouseControls = [
  { input: 'MMB 드래그', desc: 'Orbit (카메라 회전)' },
  { input: 'Ctrl + MMB', desc: 'Pan (카메라 이동)' },
  { input: '스크롤 휠', desc: 'Zoom' },
  { input: '좌클릭', desc: '객체 선택' },
]

export default function KeyboardHelp({ visible, onClose }: KeyboardHelpProps) {
  if (!visible) return null

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
          background: '#f0f4f8',
          borderRadius: 20,
          padding: '24px 32px',
          maxWidth: 420,
          boxShadow: '12px 12px 24px rgba(163,177,198,0.6), -12px -12px 24px rgba(255,255,255,0.8)',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#0f172a' }}>Keyboard Shortcuts</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <tbody>
            {shortcuts.map(s => (
              <tr key={s.key}>
                <td style={{ padding: '3px 8px 3px 0', fontWeight: 600, color: '#3b82f6', whiteSpace: 'nowrap' }}>{s.key}</td>
                <td style={{ padding: '3px 0', color: '#475569' }}>{s.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4 style={{ margin: '14px 0 8px', fontSize: 13, color: '#0f172a' }}>Mouse Controls</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <tbody>
            {mouseControls.map(m => (
              <tr key={m.input}>
                <td style={{ padding: '3px 8px 3px 0', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>{m.input}</td>
                <td style={{ padding: '3px 0', color: '#475569' }}>{m.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
          Press ? or click outside to close
        </div>
      </div>
    </div>
  )
}
