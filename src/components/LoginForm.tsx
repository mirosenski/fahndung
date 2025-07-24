"use client";

import { useState } from 'react';
import { supabase } from '~/lib/supabase';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log('🔐 Login: Versuche Anmeldung für:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login: Anmeldung fehlgeschlagen:', error.message);
        setError(error.message);
      } else {
        console.log('✅ Login: Anmeldung erfolgreich für:', data.user?.email);
        setMessage('Anmeldung erfolgreich!');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      console.error('❌ Login: Unerwarteter Fehler:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log('📝 SignUp: Versuche Registrierung für:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ SignUp: Registrierung fehlgeschlagen:', error.message);
        setError(error.message);
      } else {
        console.log('✅ SignUp: Registrierung erfolgreich für:', data.user?.email);
        setMessage('Registrierung erfolgreich! Bitte bestätige deine E-Mail.');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      console.error('❌ SignUp: Unerwarteter Fehler:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Logout: Abmeldung fehlgeschlagen:', error.message);
        setError(error.message);
      } else {
        console.log('✅ Logout: Abmeldung erfolgreich');
        setMessage('Abmeldung erfolgreich!');
      }
    } catch (err) {
      console.error('❌ Logout: Unerwarteter Fehler:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">🔐 Supabase Login</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {error}
        </div>
      )}
      
      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ {message}
        </div>
      )}
      
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            E-Mail:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="deine@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Passwort:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dein Passwort"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '⏳ Anmelden...' : '🔐 Anmelden'}
          </button>
          
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '⏳ Registrieren...' : '📝 Registrieren'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 pt-4 border-t">
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          🚪 Abmelden
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
        <h4 className="font-semibold mb-2">💡 Verfügbare Accounts:</h4>
        <div className="space-y-1 text-xs">
          <div><strong>Admin:</strong> admin@fahndung.local / admin123</div>
          <div><strong>Editor:</strong> editor@fahndung.local / editor123</div>
          <div><strong>User:</strong> user@fahndung.local / user123</div>
          <div><strong>PTLS Web:</strong> ptlsweb@gmail.com / Heute-2025!sp</div>
        </div>
      </div>
    </div>
  );
}; 