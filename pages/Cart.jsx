import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export const Cart = () => {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8">¡Agrega algunos productos geniales!</p>
        <Link to="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Tu Carrito ({items.length})</h2>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">
            Vaciar Carrito
          </button>
        </div>

        {items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
            
            <div className="flex-grow">
              <h3 className="font-bold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500 text-indigo-600 font-medium">${item.price.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold w-6 text-center">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                disabled={item.quantity >= item.stock}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => removeFromCart(item.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition"
              title="Eliminar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Resumen del Pedido</h3>
          
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span className="text-green-600 font-medium">Gratis</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-bold transition shadow-md hover:shadow-lg"
          >
            <span>Ir a Pagar</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <p className="text-xs text-gray-400 text-center mt-4">
            Compra protegida con SSL. Satisfacción garantizada.
          </p>
        </div>
      </div>
    </div>
  );
};