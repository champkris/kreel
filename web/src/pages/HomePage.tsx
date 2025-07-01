import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          {isAuthenticated ? (
            <>
              <h1 className="text-4xl font-bold mb-4 text-primary-500">
                Welcome back, {user?.displayName || user?.username}!
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Ready to create and discover amazing content?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  to="/upload" 
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  📹 Upload Video
                </Link>
                <Link 
                  to="/discover" 
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  🔍 Discover
                </Link>
                <Link 
                  to="/live" 
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  🔴 Go Live
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-4 text-primary-500">
                Welcome to Kreels
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Discover amazing short-form videos and connect with creators worldwide
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  to="/register" 
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  🚀 Get Started
                </Link>
                <Link 
                  to="/login" 
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  👋 Sign In
                </Link>
              </div>
            </>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">📱 Vertical Videos</h3>
              <p className="text-gray-400">
                Optimized for mobile viewing with smooth vertical scrolling
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">🎥 Live Streaming</h3>
              <p className="text-gray-400">
                Watch live streams and interact with creators in real-time
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">💰 TVOD</h3>
              <p className="text-gray-400">
                Pay-per-view content with subscription options
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <p className="text-gray-500 text-sm">
              🚧 Platform in development - {isAuthenticated ? 'You\'re logged in!' : 'Register to get started!'} 🚧
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
