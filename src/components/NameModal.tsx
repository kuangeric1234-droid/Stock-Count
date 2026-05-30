import { useState } from 'react'

interface Props {
  initial: string
  onSave: (name: string) => void
}

export function NameModal({ initial, onSave }: Props) {
  const [name, setName] = useState(initial)
  const save = () => name.trim() && onSave(name.trim())

  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div style={{ fontSize: 36, marginBottom: 10 }}>👋</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Who's counting?</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
          Your name is added to each count so the team can see who did what.
        </div>
        <input
          className="field-input"
          style={{ marginBottom: 14 }}
          placeholder="Your name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
        <button className="btn-submit" onClick={save}>
          Start counting
        </button>
      </div>
    </div>
  )
}
