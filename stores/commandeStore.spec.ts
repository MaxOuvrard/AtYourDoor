// @vitest-environment happy-dom
/// <reference types="vitest" />
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCommandeStore } from '../stores/commandeStore'

vi.stubGlobal('$fetch', vi.fn())

describe('commandeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    } as any
  })

  it('initializes with empty commandes if none in localStorage', () => {
    ;(global.localStorage.getItem as any).mockReturnValueOnce(null)
    const store = useCommandeStore()
    expect(store.commandes).toEqual([])
    expect(store.count).toBe(0)
  })

  it('ajouterCommande adds a commande and persists', () => {
    const store = useCommandeStore()
    const cmd = { id: null, plats: [], total: 0 } as any
    store.ajouterCommande(cmd)
    expect(store.commandes.length).toBe(1)
    expect(global.localStorage.setItem).toHaveBeenCalledWith('commandes', JSON.stringify(store.commandes))
  })

  it('retirerCommande removes by id and persists', () => {
    const store = useCommandeStore()
    const cmd = { id: 123, plats: [], total: 10 }
    store.commandes = [cmd as any]
    store.retirerCommande(123)
    expect(store.commandes.find(c => (c as any).id === 123)).toBeUndefined()
    expect(global.localStorage.setItem).toHaveBeenCalledWith('commandes', JSON.stringify(store.commandes))
  })

  it('viderCommandes clears and removes localStorage', () => {
    const store = useCommandeStore()
    store.commandes = [{ id: 1, plats: [], total: 0 } as any]
    store.viderCommandes()
    expect(store.commandes).toEqual([])
    expect(global.localStorage.removeItem).toHaveBeenCalledWith('commandes')
  })

  it('createCommande uses server response when available', async () => {
    const serverCmd = { id: 555, plats: [], total: 20 }
    ;(global.$fetch as any).mockResolvedValueOnce(serverCmd)
    const store = useCommandeStore()
    await store.createCommande({ id: null, plats: [], total: 20 } as any)
    expect(store.commandes.find((c: any) => c.id === 555)).toBeDefined()
    expect(global.localStorage.setItem).toHaveBeenCalled()
  })

  it('createCommande falls back to local when server not available', async () => {
    ;(global.$fetch as any).mockResolvedValueOnce(null)
    const store = useCommandeStore()
    await store.createCommande({ id: null, plats: [], total: 30 } as any)
    expect(store.commandes.length).toBeGreaterThan(0)
    expect(global.localStorage.setItem).toHaveBeenCalled()
  })

  it('updateCommande applies local merge when server fails', async () => {
    const store = useCommandeStore()
    store.commandes = [{ id: 'a1', plats: [], total: 5 } as any]
    ;(global.$fetch as any).mockResolvedValueOnce(null)
    await store.updateCommande('a1', { total: 9 })
    const updated = store.commandes.find(c => String(c.id) === 'a1') as any
    expect(updated.total).toBe(9)
    expect(updated.updatedAt).toBeDefined()
    expect(global.localStorage.setItem).toHaveBeenCalled()
  })
})
