import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState(false);

  const signIn = async (email: string, password: string) => {
    if (password.length < 6) {
      return { error: new Error('Invalid credentials') };
    }

    setUser({
      id: crypto.randomUUID(),
      email,
      full_name: email.split('@')[0],
    });

    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (password.length < 6) {
      return { error: new Error('Password must be at least 6 characters') };
    }

    setUser({
      id: crypto.randomUUID(),
      email,
      full_name: fullName,
    });

    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
