import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Role } from '../services/api2';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl hover:text-indigo-100 transition">
              <Package className="w-6 h-6" />
              <span>TiendaSimple</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="hover:text-indigo-200 transition">Productos</Link>
              
              {user?.role === Role.ADMIN && (
                <Link to="/admin" className="hover:text-indigo-200 transition">Administración</Link>
              )}

              <div className="flex items-center space-x-4 ml-4 border-l border-indigo-500 pl-4">
                <Link to="/cart" className="relative p-2 hover:bg-indigo-500 rounded-full transition group">
                  <ShoppingCart className="w-6 h-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-indigo-600">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-5 h-5" />
                      <span className="text-sm">{user.name}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-2 hover:bg-indigo-500 rounded-full transition text-indigo-100 hover:text-white"
                      title="Cerrar sesión"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login"
                    className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition shadow-sm"
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
               <Link to="/cart" className="relative p-2 mr-2 text-indigo-100">
                  <ShoppingCart className="w-6 h-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-indigo-100 hover:text-white">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-indigo-700 px-4 pt-2 pb-4 space-y-2 border-t border-indigo-600">
             <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600">Productos</Link>
             {user?.role === Role.ADMIN && (
                <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600">Administración</Link>
              )}
             {user ? (
               <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 flex items-center space-x-2">
                 <LogOut className="w-4 h-4" />
                 <span>Cerrar sesión ({user.name})</span>
               </button>
             ) : (
               <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium bg-white text-indigo-700 mt-4 text-center">Iniciar Sesión</Link>
             )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 TiendaSimple. Demo E-commerce para Evaluación Técnica.
          </p>
        </div>
      </footer>
    </div>
  );
};