"use client";

import { useState } from "react";
import { supabase } from "~/lib/supabase";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log("🔐 Login: Versuche Anmeldung für:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Login: Anmeldung fehlgeschlagen:", error.message);
        setError(error.message);
      } else {
        console.log("✅ Login: Anmeldung erfolgreich für:", data.user?.email);
        setMessage("Anmeldung erfolgreich!");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("❌ Login: Unerwarteter Fehler:", err);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
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
      console.log("📝 SignUp: Versuche Registrierung für:", email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error(
          "❌ SignUp: Registrierung fehlgeschlagen:",
          error.message,
        );
        setError(error.message);
      } else {
        console.log(
          "✅ SignUp: Registrierung erfolgreich für:",
          data.user?.email,
        );
        setMessage("Registrierung erfolgreich! Bitte bestätige deine E-Mail.");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("❌ SignUp: Unerwarteter Fehler:", err);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Logout: Abmeldung fehlgeschlagen:", error.message);
        setError(error.message);
      } else {
        console.log("✅ Logout: Abmeldung erfolgreich");
        setMessage("Abmeldung erfolgreich!");
      }
    } catch (err) {
      console.error("❌ Logout: Unerwarteter Fehler:", err);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">🔐 Supabase Login</h3>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          ❌ {error}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded border border-green-400 bg-green-100 p-3 text-green-700">
          ✅ {message}
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">E-Mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="focus:outline-hidden w-full rounded border border-border px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="deine@email.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Passwort:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="focus:outline-hidden w-full rounded border border-border px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Dein Passwort"
          />
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "⏳ Anmelden..." : "🔐 Anmelden"}
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "⏳ Registrieren..." : "📝 Registrieren"}
          </button>
        </div>
      </form>

      <div className="mt-4 border-t pt-4">
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
        >
          🚪 Abmelden
        </button>
      </div>

      <div className="mt-4 rounded bg-blue-50 p-3 text-sm">
        <h4 className="mb-2 font-semibold">💡 Verfügbare Accounts:</h4>
        <div className="space-y-1 text-xs">
          <div>
            <strong>Admin:</strong> admin@fahndung.local / admin123
          </div>
          <div>
            <strong>Editor:</strong> editor@fahndung.local / editor123
          </div>
          <div>
            <strong>User:</strong> user@fahndung.local / user123
          </div>
          <div>
            <strong>PTLS Web:</strong> ptlsweb@gmail.com / Heute-2025!sp
          </div>
        </div>
      </div>
    </div>
  );
};
