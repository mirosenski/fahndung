"use client";

import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export const DebugAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 DebugAuth: Prüfe Session...');
        
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ DebugAuth: Session-Fehler:', sessionError);
          setError(sessionError.message);
          return;
        }

        console.log('✅ DebugAuth: Session abgerufen:', {
          hasSession: !!data.session,
          hasToken: !!data.session?.access_token,
          userEmail: data.session?.user?.email
        });

        setSession(data.session);
      } catch (err) {
        console.error('❌ DebugAuth: Unerwarteter Fehler:', err);
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
    };

    // Verzögerung für Client-Side Rendering
    const timer = setTimeout(() => {
      void checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Listener für Auth-Änderungen
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 DebugAuth: Auth State Change:', event, {
          hasSession: !!session,
          userEmail: session?.user?.email
        });
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ DebugAuth: SignOut-Fehler:', error);
        setError(error.message);
      } else {
        console.log('✅ DebugAuth: Erfolgreich abgemeldet');
        setSession(null);
      }
    } catch (err) {
      console.error('❌ DebugAuth: SignOut-Fehler:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  };

  const handleRefreshSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ DebugAuth: Refresh-Fehler:', error);
        setError(error.message);
      } else {
        console.log('✅ DebugAuth: Session erfolgreich erneuert');
        setSession(data.session);
      }
    } catch (err) {
      console.error('❌ DebugAuth: Refresh-Fehler:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
      <h3 className="text-lg font-semibold mb-3">🔍 Auth Debug Status</h3>
      
      {loading && (
        <div className="text-blue-600 mb-2">⏳ Lade Auth-Status...</div>
      )}
      
      {error && (
        <div className="text-red-600 mb-2 p-2 bg-red-100 rounded">
          ❌ Fehler: {error}
        </div>
      )}
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">Session:</span>
          <span className={session ? 'text-green-600' : 'text-red-600'}>
            {session ? '✅ Vorhanden' : '❌ Fehlt'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">Token:</span>
          <span className={session?.access_token ? 'text-green-600' : 'text-red-600'}>
            {session?.access_token ? '✅ Vorhanden' : '❌ Fehlt'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">User:</span>
          <span className={session?.user ? 'text-green-600' : 'text-red-600'}>
            {session?.user?.email ?? 'Nicht eingeloggt'}
          </span>
        </div>
        
        {session?.access_token && (
          <div className="text-xs text-gray-600 mt-2">
            <div>Token Länge: {session.access_token.length}</div>
            <div>Token Start: {session.access_token.substring(0, 20)}...</div>
          </div>
        )}
      </div>
      
      <div className="mt-4 space-x-2">
        <button
          onClick={handleRefreshSession}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          🔄 Session erneuern
        </button>
        
        {session && (
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
          >
            🚪 Abmelden
          </button>
        )}
      </div>
    </div>
  );
}; 