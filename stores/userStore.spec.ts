// @vitest-environment happy-dom
/// <reference types="vitest" />
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUserStore } from '../stores/userStore'

// Mock $fetch globally
vi.stubGlobal('$fetch', vi.fn())

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Clear localStorage mocks
    vi.resetAllMocks()
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    } as any
  })

  it('initializes with null user and empty token if no localStorage', () => {
    (global.localStorage.getItem as any).mockReturnValueOnce(null)
    const store = useUserStore()
    expect(store.user).toBe(null)
    expect(store.token).toBe('')
  })

  it('isAuthenticated returns true if token exists', () => {
    const store = useUserStore()
    store.token = 'abc123'
    expect(store.isAuthenticated).toBe(true)
  })

  it('restaurantId returns correct value', () => {
    const store = useUserStore()
    store.user = { id_restaurant: 42 }
    expect(store.restaurantId).toBe(42)
    store.user = null
    expect(store.restaurantId).toBe(null)
  })

  it('logout clears user and token', () => {
    const store = useUserStore()
    store.user = { id: 1 }
    store.token = 'token'
    store.logout()
    expect(store.user).toBe(null)
    expect(store.token).toBe('')
    expect(global.localStorage.removeItem).toHaveBeenCalledWith('user')
    expect(global.localStorage.removeItem).toHaveBeenCalledWith('token')
  })
})
