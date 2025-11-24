import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api2';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, CreditCard, MapPin } from 'lucide-react';

export const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: ''
  });

  // Redireccionar si no hay items o usuario
  React.useEffect(() => {
    if (items.length === 0 && step !== 'success') navigate('/');
    if (!user) navigate('/login');
  }, [items, user, navigate, step]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep('processing');
    
    try {
      await api.orders.create(items, total);
      clearCart();
      setStep('success');
    } catch (error) {
      alert('Error al procesar el pedido');
      setStep('form');
    }
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-green-100">
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Compra Exitosa!</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Gracias por tu compra. Hemos enviado la confirmación a <strong>{user?.email}</strong>.
        </p>
        <Link to="/" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
          Seguir Comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="md:col-span-2">
           {step === 'processing' ? (
             <div className="bg-white p-12 rounded-xl shadow-sm text-center flex flex-col items-center justify-center h-full">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
               <p className="text-gray-600 font-medium">Procesando pago...</p>
             </div>
           ) : (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
              {/* Address Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4 text-indigo-600">
                  <MapPin className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Dirección de Envío</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    required
                    name="address"
                    placeholder="Dirección completa"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    onChange={handleInputChange}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      required
                      name="city"
                      placeholder="Ciudad"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      onChange={handleInputChange}
                    />
                    <input
                      required
                      name="zip"
                      placeholder="Código Postal"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center space-x-2 mb-4 text-indigo-600">
                   <CreditCard className="w-5 h-5" />
                   <h3 className="font-bold text-lg">Método de Pago</h3>
                </div>
                
                <div className="space-y-4">
                  <input
                    required
                    name="cardName"
                    placeholder="Nombre en la tarjeta"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    onChange={handleInputChange}
                  />
                  <input
                    required
                    name="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    onChange={handleInputChange}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      required
                      name="expDate"
                      placeholder="MM/YY"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      onChange={handleInputChange}
                    />
                    <input
                      required
                      name="cvv"
                      placeholder="CVV"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg transition mt-6 shadow-lg"
              >
                Pagar ${total.toFixed(2)}
              </button>
            </form>
           )}
        </div>

        {/* Summary */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Resumen</h3>
            <ul className="space-y-3 mb-6 text-sm">
              {items.map(item => (
                <li key={item.id} className="flex justify-between">
                  <span className="text-gray-600 truncate w-32">{item.name} (x{item.quantity})</span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};