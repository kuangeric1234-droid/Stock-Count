import { CLOUD } from '../supabase'

interface Props {
  myName: string
  online: string[]
  tab: 'list' | 'stats'
  onTab: (t: 'list' | 'stats') => void
  onScan: () => void
  onAdd: () => void
  onChangeName: () => void
}

function presenceText(myName: string, online: string[]): string {
  if (!CLOUD) return '⚪ Offline demo mode — add Supabase keys for live multi-user counting'
  const others = online.filter((n) => n !== myName)
  if (others.length === 1) return `🟢 ${others[0]} is also counting now`
  if (others.length > 1)
    return `🟢 ${others.slice(0, 2).join(', ')}${others.length > 2 ? ` +${others.length - 2}` : ''} are also counting now`
  return "🟢 Live · you're the only one counting right now"
}

export function Header({ myName, online, tab, onTab, onScan, onAdd, onChangeName }: Props) {
  return (
    <div className="header">
      <div className="header-top">
        <div>
          <button className="header-label" onClick={onChangeName}>
            Counting as · <span className="whoami">{myName || 'set name'}</span> ✎
          </button>
          <div className="header-title">Stock Count</div>
        </div>
        <div className="header-btns">
          <button className="btn-scan" onClick={onScan}>
            <span style={{ fontSize: 18 }}>📷</span> Scan
          </button>
          <button className="btn-add" onClick={onAdd}>
            <span style={{ fontSize: 18 }}>+</span> Add
          </button>
        </div>
      </div>
      <div className="presence" style={{ color: CLOUD ? 'var(--green)' : 'var(--text3)' }}>
        {presenceText(myName, online)}
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => onTab('list')}>
          Product List
        </button>
        <button className={`tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => onTab('stats')}>
          Analytics &amp; Export
        </button>
      </div>
    </div>
  )
}
