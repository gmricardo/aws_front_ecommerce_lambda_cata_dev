import React, { useEffect, useState } from 'react';
import { api, Role } from '../services/api2';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash, Plus, X, Save, Users, Package, Shield, Mail } from 'lucide-react';

export const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  // --- Product State ---
  const [products, setProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});

  // --- User State ---
  const [users, setUsers] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  // Protección de ruta
  useEffect(() => {
    if (user?.role !== Role.ADMIN) {
      navigate('/');
    }
  }, [user, navigate]);

  // Carga inicial de datos
  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchProducts = async () => {
    const data = await api.products.getAll();
    setProducts(data);
  };

  const fetchUsers = async () => {
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  // --- Product Handlers ---
  const handleSaveProduct = async () => {
    if (!currentProduct.name || !currentProduct.price) return;

    try {
      if (currentProduct.id) {
        await api.products.update(currentProduct.id, currentProduct);
      } else {
        await api.products.create({
            name: currentProduct.name,
            description: currentProduct.description || '',
            price: Number(currentProduct.price),
            stock: Number(currentProduct.stock) || 0,
            imageUrl: currentProduct.imageUrl || 'https://picsum.photos/400/300',
            category: currentProduct.category || 'General'
        });
      }
      setIsProductModalOpen(false);
      setCurrentProduct({});
      fetchProducts();
    } catch (error) {
      console.error("Error saving product", error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      await api.products.delete(id);
      fetchProducts();
    }
  };

  const openProductModal = (product) => {
    setCurrentProduct(product || { stock: 0, price: 0, category: 'General' });
    setIsProductModalOpen(true);
  };

  // --- User Handlers ---
  const handleSaveUser = async () => {
    if (!currentUser.id || !currentUser.name || !currentUser.email) return;
    
    try {
       await api.users.update(currentUser.id, {
         name: currentUser.name,
         email: currentUser.email,
         role: currentUser.role
       });
       setIsUserModalOpen(false);
       setCurrentUser({});
       fetchUsers();
    } catch (error) {
      console.error("Error saving user", error);
      alert("Error al guardar usuario");
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await api.users.delete(id);
        fetchUsers();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const openUserModal = (targetUser) => {
    setCurrentUser({ ...targetUser });
    setIsUserModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 px-4 font-medium text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'products' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventario</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 font-medium text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'users' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios</span>
        </button>
      </div>

      {/* --- PRODUCTS TAB --- */}
      {activeTab === 'products' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <button 
              onClick={() => openProductModal()}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${product.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button onClick={() => openProductModal(product)} className="text-indigo-600 hover:text-indigo-900"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900"><Trash className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                            <span className="font-bold">{u.name.charAt(0).toUpperCase()}</span>
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full flex items-center w-fit gap-1
                           ${u.role === Role.ADMIN ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                           <Shield className="w-3 h-3" />
                           {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button onClick={() => openUserModal(u)} className="text-indigo-600 hover:text-indigo-900" title="Editar"><Pencil className="w-4 h-4" /></button>
                        {/* Evitar borrar al usuario actual o al admin principal */}
                        {u.id !== user?.id && (
                           <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-900" title="Eliminar"><Trash className="w-4 h-4" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Producto */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{currentProduct.id ? 'Editar' : 'Crear'} Producto</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Nombre del producto"
                value={currentProduct.name || ''}
                onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
              />
              <textarea 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Descripción"
                rows={3}
                value={currentProduct.description || ''}
                onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Precio"
                  value={currentProduct.price || ''}
                  onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})}
                />
                <input 
                  type="number"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Stock"
                  value={currentProduct.stock !== undefined ? currentProduct.stock : ''}
                  onChange={e => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})}
                />
              </div>
              <input 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Categoría"
                value={currentProduct.category || ''}
                onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
              />
               <input 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="URL de Imagen"
                value={currentProduct.imageUrl || ''}
                onChange={e => setCurrentProduct({...currentProduct, imageUrl: e.target.value})}
              />
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
               <button onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancelar</button>
               <button onClick={handleSaveProduct} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 transition shadow-md">
                 <Save className="w-4 h-4" />
                 Guardar
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Usuario */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Editar Usuario</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={currentUser.name || ''}
                  onChange={e => setCurrentUser({...currentUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={currentUser.email || ''}
                  onChange={e => setCurrentUser({...currentUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={currentUser.role}
                  onChange={e => setCurrentUser({...currentUser, role: e.target.value})}
                >
                  <option value={Role.CUSTOMER}>Cliente</option>
                  <option value={Role.ADMIN}>Administrador</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
               <button onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancelar</button>
               <button onClick={handleSaveUser} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 transition shadow-md">
                 <Save className="w-4 h-4" />
                 Guardar Cambios
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};