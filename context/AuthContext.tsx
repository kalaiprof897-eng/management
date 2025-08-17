import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseInitializationError } from '../services/supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(supabaseInitializationError);

  useEffect(() => {
    // If there was an initialization error or the client is null, stop and don't set up listeners.
    if (error || !supabase) {
      setLoading(false);
      return;
    }

    // Set initial session state
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // Also set loading to false on state change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [error]);

  const signOut = async () => {
    // Ensure supabase client exists before calling signOut
    if (supabase) {
      await supabase.auth.signOut();
    }
  };
  
  const value = {
    session,
    user,
    signOut
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-900"><LoadingSpinner /></div>;
  }

  // If there was an error during initialization, show a helpful message
  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-lg">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Application Initialization Error</h1>
          <p className="text-gray-300">Could not connect to the required backend service.</p>
          <p className="text-gray-400 mt-2 text-sm bg-gray-900 p-2 rounded">
            <strong>Details:</strong> {error}
          </p>
        </div>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
