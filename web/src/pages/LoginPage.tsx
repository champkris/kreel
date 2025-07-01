import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../api/index';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        // Store token and user data
        login(response.data.token, response.data.user);
        
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.data?.error?.message) {
        toast.error(error.response.data.error.message);
      } else {
        toast.error('Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
          <h2 className="text-2xl font-bold text-center mb-6 text-primary-500">
            Login to Kreels
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="Enter your password"
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="text-center mt-4 text-gray-400 text-sm">
            Don't have an account? {' '}
            <button 
              onClick={() => navigate('/register')}
              className="text-primary-500 hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
