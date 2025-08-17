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
  // First, handle a fatal initialization error. If Supabase isn't configured,
  // the app cannot run. We display a helpful error message instead of a blank screen.
  if (supabaseInitializationError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-lg">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Application Initialization Error</h1>
          <p className="text-gray-300">Could not connect to the required backend service.</p>
          <p className="text-gray-400 mt-2 text-sm bg-gray-900 p-2 rounded">
            <strong>Details:</strong> {supabaseInitializationError}
          </p>
        </div>
      </div>
    );
  }

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can assert supabase is not null here due to the check above.
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array is correct for a one-time subscription setup.

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

  // While waiting for the initial session to be determined, show a loading spinner.
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-900"><LoadingSpinner /></div>;
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
