import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_CREDENTIALS = {
  username: 'vaishnavi',
  password: 'UDM123'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem('leadms_user');
  });

  const login = (username: string, password: string): boolean => {
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      setUser(username);
      localStorage.setItem('leadms_user', username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('leadms_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
