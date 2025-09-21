import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check for stored auth state on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth-state');
    if (storedAuth) {
      const { user: storedUser } = JSON.parse(storedAuth);
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string) => {
    // Simulate authentication with mock user
    const mockUser: User = {
      id: '1',
      name: email.split('@')[0],
      email: email,
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    
    // Store auth state
    localStorage.setItem('auth-state', JSON.stringify({ user: mockUser }));
  };

  const signOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth-state');
  };

  return (
    <AuthContext.Provider value={{
      isLoading,
      isAuthenticated,
      user,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}