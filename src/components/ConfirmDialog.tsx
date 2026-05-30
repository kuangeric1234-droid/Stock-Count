interface Props {
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ onCancel, onConfirm }: Props) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div style={{ fontSize: 36, marginBottom: 10 }}>🗑</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Delete Product</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>This cannot be undone.</div>
        <div className="confirm-btns">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-confirm-del" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
