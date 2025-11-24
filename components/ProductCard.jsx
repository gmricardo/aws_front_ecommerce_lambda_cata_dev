import React from 'react';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
              Agotado
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
           <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">
             {product.category}
           </span>
           <span className="text-lg font-bold text-gray-900">
             ${product.price.toFixed(2)}
           </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
        
        <div className="mt-auto pt-4 border-t border-gray-100">
          {isOutOfStock ? (
            <button 
              disabled
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-400 py-2 px-4 rounded-lg cursor-not-allowed font-medium"
            >
              <AlertCircle className="w-5 h-5" />
              <span>No disponible</span>
            </button>
          ) : (
            <button 
              onClick={() => addToCart(product)}
              className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Agregar al Carrito</span>
            </button>
          )}
           <p className="text-xs text-gray-400 mt-2 text-center">
            {product.stock} unidades disponibles
          </p>
        </div>
      </div>
    </div>
  );
};