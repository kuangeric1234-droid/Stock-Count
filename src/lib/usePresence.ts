import { useEffect, useState } from 'react'
import { sb, CLOUD } from '../supabase'

/** Tracks who else is currently in the app (live presence). */
export function usePresence(myName: string): string[] {
  const [online, setOnline] = useState<string[]>([])

  useEffect(() => {
    if (!CLOUD || !sb || !myName) return
    const client = sb
    const channel = client.channel('counters', { config: { presence: { key: myName } } })
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<{ name: string }>()
      const names = Object.values(state)
        .flat()
        .map((p) => p.name)
        .filter(Boolean)
      setOnline(names)
    })
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') channel.track({ name: myName })
    })
    return () => {
      client.removeChannel(channel)
    }
  }, [myName])

  return online
}
