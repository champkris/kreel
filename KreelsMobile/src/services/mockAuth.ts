// Mock authentication for development/testing
export const mockAuthAPI = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple mock validation
    if (email === 'demo@kreels.com' && password === 'demo123') {
      return {
        user: {
          id: 'mock-user-1',
          email: 'demo@kreels.com',
          username: 'demouser',
          displayName: 'Demo User',
          verified: true,
          followersCount: 1250,
          followingCount: 389,
          videosCount: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock-jwt-token-' + Date.now()
      };
    } else {
      throw new Error('Invalid credentials. Try demo@kreels.com / demo123');
    }
  },

  register: async (userData: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple validation
    if (!userData.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (userData.email === 'test@existing.com') {
      throw new Error('User already exists');
    }

    return {
      user: {
        id: 'mock-user-' + Date.now(),
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
        verified: false,
        followersCount: 0,
        followingCount: 0,
        videosCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token-' + Date.now()
    };
  },

  getCurrentUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: 'mock-user-1',
      email: 'demo@kreels.com',
      username: 'demouser',
      displayName: 'Demo User',
      verified: true,
      followersCount: 1250,
      followingCount: 389,
      videosCount: 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
};