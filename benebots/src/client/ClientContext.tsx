import { createContext, useContext, useState, type ReactNode } from 'react'
import { CLIENTS, type Client } from '../data/demoProfile'

interface ClientCtx {
  client: Client
  clients: Client[]
  setClientId: (id: string) => void
}

const Ctx = createContext<ClientCtx | null>(null)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<string>(CLIENTS[0].id)
  const client = CLIENTS.find(c => c.id === id) ?? CLIENTS[0]
  return (
    <Ctx.Provider value={{ client, clients: CLIENTS, setClientId: setId }}>
      {children}
    </Ctx.Provider>
  )
}

/** Active client profile. Falls back to the default client if no provider is present. */
export function useClient(): Client {
  const ctx = useContext(Ctx)
  return ctx ? ctx.client : CLIENTS[0]
}

/** Full controls for the client switcher. Must be used within ClientProvider. */
export function useClientControls(): ClientCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useClientControls must be used within a ClientProvider')
  return ctx
}
