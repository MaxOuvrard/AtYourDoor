import { Page, APIResponse } from '@playwright/test'

type Creds = { email: string; password: string }

const credentials: Record<string, Creds> = {
  USER: { email: 'maxenceouvrard.pro@gmail.com', password: 'test123' },
  ADMIN: { email: 'admin@example.com', password: 'root' },
  OWNER: { email: 'freti@gmail.com', password: 'oui' }
}

export async function loginAs(page: Page, role: 'USER' | 'ADMIN' | 'OWNER') {
  const creds = credentials[role]
  // Call the app API to get token + user
  const res: APIResponse = await page.request.post('/api/login/login', { data: { username: creds.email, password: creds.password } })
  const body = await res.json()
  if (!body || !body.token) throw new Error('Login failed for ' + role)

  // Navigate to base origin so localStorage is available for the app origin
  await page.goto('/')

  // Set localStorage entries used by the app
  await page.evaluate(([user, token]) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
  }, [body.user, body.token])

  // Reload to ensure app reads storage
  await page.reload()
  return body
}
