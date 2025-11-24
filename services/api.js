// --- CONSTANTS ---
export const Role = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER'
};

// --- MOCK DATA ---
let MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Auriculares Premium',
    description: 'Cancelación de ruido y alta fidelidad.',
    price: 199.99,
    stock: 15,
    imageUrl: 'https://picsum.photos/400/300?random=1',
    category: 'Electrónica'
  },
  {
    id: '2',
    name: 'Reloj Inteligente',
    description: 'Monitoreo de salud y notificaciones.',
    price: 149.50,
    stock: 5,
    imageUrl: 'https://picsum.photos/400/300?random=2',
    category: 'Accesorios'
  },
  {
    id: '3',
    name: 'Mochila de Viaje',
    description: 'Impermeable y con compartimento para laptop.',
    price: 59.99,
    stock: 30,
    imageUrl: 'https://picsum.photos/400/300?random=3',
    category: 'Moda'
  },
  {
    id: '4',
    name: 'Teclado Mecánico',
    description: 'Switches azules, retroiluminación RGB.',
    price: 89.00,
    stock: 0,
    imageUrl: 'https://picsum.photos/400/300?random=4',
    category: 'Computación'
  }
];

let MOCK_USERS = [
  { id: '1', name: 'Admin User', email: 'admin@test.com', role: Role.ADMIN },
  { id: '2', name: 'Cliente Demo', email: 'cliente@test.com', role: Role.CUSTOMER }
];

// --- API SERVICES ---

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  auth: {
    login: async (email, password) => {
      await delay(800);
      if (password !== '123456') throw new Error('Credenciales inválidas');
      
      const user = MOCK_USERS.find(u => u.email === email);
      if (!user) throw new Error('Usuario no encontrado');
      
      return { user, token: 'fake-jwt-token-' + Date.now() };
    },
    register: async (name, email, password) => {
      await delay(800);
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        role: Role.CUSTOMER
      };
      MOCK_USERS.push(newUser);
      return { user: newUser, token: 'fake-jwt-token-' + Date.now() };
    }
  },
  products: {
    getAll: async () => {
      await delay(500);
      return [...MOCK_PRODUCTS];
    },
    create: async (product) => {
      await delay(600);
      const newProduct = { ...product, id: Date.now().toString() };
      MOCK_PRODUCTS.push(newProduct);
      return newProduct;
    },
    update: async (id, updates) => {
      await delay(600);
      const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Producto no encontrado');
      MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...updates };
      return MOCK_PRODUCTS[index];
    },
    delete: async (id) => {
      await delay(600);
      MOCK_PRODUCTS = MOCK_PRODUCTS.filter(p => p.id !== id);
    }
  },
  users: {
    getAll: async () => {
      await delay(500);
      return [...MOCK_USERS];
    },
    update: async (id, updates) => {
      await delay(600);
      const index = MOCK_USERS.findIndex(u => u.id === id);
      if (index === -1) throw new Error('Usuario no encontrado');
      MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
      return MOCK_USERS[index];
    },
    delete: async (id) => {
      await delay(600);
      if (id === '1') throw new Error('No se puede eliminar al admin principal');
      MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
    }
  },
  orders: {
    create: async (cartItems, total) => {
      await delay(1500);
      return true;
    }
  }
};