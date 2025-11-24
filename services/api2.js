// --- CONSTANTS ---
// --- CONSTANTS ---
export const Role = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER'
};

const PRODUCTS_BASE = 'http://localhost:8001'
const AUTH_BASE = 'http://localhost:8002'
const ORDERS_BASE = 'http://localhost:8003'

// Local in-memory fallback stores for admin actions (create/update/delete) and users
let LOCAL_PRODUCTS = []
let PRODUCTS_INITIALIZED = false

let LOCAL_USERS = [
  { id: '1', name: 'Admin User', email: 'admin@test.com', role: Role.ADMIN },
  { id: '2', name: 'Cliente Demo', email: 'cliente@test.com', role: Role.CUSTOMER }
]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchProductsFromBackend() {
  const res = await fetch(`${PRODUCTS_BASE}/products`)
  if (!res.ok) throw new Error('Error fetching products from backend')
  const data = await res.json()
  // normalize ids to strings to match frontend expectations
  LOCAL_PRODUCTS = data.map(p => ({ ...p, id: String(p.id) }))
  PRODUCTS_INITIALIZED = true
  return LOCAL_PRODUCTS
}

async function fetchProductFromBackend(id) {
  const res = await fetch(`${PRODUCTS_BASE}/products/${id}`)
  if (!res.ok) throw new Error('Product not found')
  const p = await res.json()
  return { ...p, id: String(p.id) }
}

async function backendRegister(name, email, password) {
  const res = await fetch(`${AUTH_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.error || body.detail || 'could not register')
  }
  // Backend returns created user { id, name, email } (no token).
  // Normalize to { user, token } to match frontend expectations.
  const user = { id: String(body.id), name: body.name, email: body.email }
  const token = body.token || `user-${body.id}-token`;
  return { user, token };
}

async function backendLogin(email, password) {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.error || body.detail || 'invalid credentials')
  }
  // Backend returns { id, name, email, role, token }
  // Normalize to { user, token } shape used by the frontend mock
  const user = { id: String(body.id), name: body.name, email: body.email, role: body.role }
  const token = body.token
  return { user, token }
}

async function backendCreateOrder(order) {
  const res = await fetch(`${ORDERS_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  })
  return res.json()
}

export const api = {
  auth: {
    login: backendLogin,
    register: backendRegister
  },
  products: {
    getAll: async () => {
      if (!PRODUCTS_INITIALIZED) {
        try {
          await fetchProductsFromBackend()
        } catch (e) {
          PRODUCTS_INITIALIZED = true
          LOCAL_PRODUCTS = LOCAL_PRODUCTS || []
        }
      }
      await delay(200)
      return [...LOCAL_PRODUCTS]
    },
    getById: async (id) => {
      if (!PRODUCTS_INITIALIZED) await fetchProductsFromBackend()
      return LOCAL_PRODUCTS.find(p => String(p.id) === String(id))
    },
    create: async (product) => {
      // call backend to persist
      const res = await fetch(`${PRODUCTS_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:'unknown'}))
        throw new Error(err.error || err.detail || 'could not create')
      }
      const p = await res.json()
      // refresh local cache
      PRODUCTS_INITIALIZED = false
      await fetchProductsFromBackend()
      return p
    },
    update: async (id, updates) => {
      const res = await fetch(`${PRODUCTS_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:'unknown'}))
        throw new Error(err.error || err.detail || 'could not update')
      }
      const p = await res.json()
      PRODUCTS_INITIALIZED = false
      await fetchProductsFromBackend()
      return p
    },
    delete: async (id) => {
      const res = await fetch(`${PRODUCTS_BASE}/products/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(()=>({error:'unknown'}))
        throw new Error(err.error || err.detail || 'could not delete')
      }
      PRODUCTS_INITIALIZED = false
      await fetchProductsFromBackend()
    }
  },
  users: {
    getAll: async () => {
      const res = await fetch(`${AUTH_BASE}/users`)
      if (!res.ok) throw new Error('could not fetch users')
      const data = await res.json()
      return data
    },
    update: async (id, updates) => {
      const res = await fetch(`${AUTH_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:'unknown'}))
        throw new Error(err.error || err.detail || 'could not update user')
      }
      return res.json()
    },
    delete: async (id) => {
      const res = await fetch(`${AUTH_BASE}/users/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(()=>({error:'unknown'}))
        throw new Error(err.error || err.detail || 'could not delete user')
      }
    }
  },
  orders: {
    create: async (order) => {
      return backendCreateOrder(order)
    },
    getById: async (id) => {
      const res = await fetch(`${ORDERS_BASE}/orders/${id}`)
      return res.json()
    }
  }
}

export default api
