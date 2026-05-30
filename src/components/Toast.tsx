import { useEffect, useState } from 'react'
import type { ToastType } from '../types'

export interface ToastMessage {
  text: string
  type: ToastType
  key: number
}

export function Toast({ message }: { message: ToastMessage | null }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!message) return
    setShow(true)
    const t = setTimeout(() => setShow(false), 2400)
    return () => clearTimeout(t)
  }, [message])

  if (!message) return null
  return <div className={`toast ${message.type} ${show ? 'show' : ''}`}>{message.text}</div>
}
