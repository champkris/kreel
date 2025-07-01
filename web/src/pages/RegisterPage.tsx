import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../api/index';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        displayName: formData.displayName || formData.username,
        userType: 'INDIVIDUAL'
      });

      if (response.success) {
        // Store token and user data
        login(response.data.token, response.data.user);
        
        toast.success('Account created successfully!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.error?.message) {
        toast.error(error.response.data.error.message);
      } else {
        toast.error('Failed to create account. Please try again.');
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
            Join Kreels
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
              <label className="block text-sm font-medium mb-2">Username</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input 
                type="text" 
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="Your display name (optional)"
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
                minLength={6}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="Confirm your password"
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <p className="text-center mt-4 text-gray-400 text-sm">
            Already have an account? {' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-primary-500 hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
