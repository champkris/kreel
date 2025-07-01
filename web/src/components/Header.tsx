import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-50 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary-500">
          Kreels
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/trending" className="text-gray-300 hover:text-white transition-colors">
            Trending
          </Link>
          <Link to="/live" className="text-gray-300 hover:text-white transition-colors">
            Live
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-300 text-sm">
                Welcome, {user?.displayName || user?.username}!
              </span>
              <Link 
                to="/profile" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
