"use client";

import { useState } from "react";
// Use actions from our custom authentication hook instead of directly
// calling supabase in this component. The hook handles logging and
// loading/error states.
import { useSupabaseAuthActions } from "~/hooks/useSupabaseAuthActions";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Use the Supabase auth actions hook to perform sign in, sign up and sign out.
  const { signIn, signUp, signOut, pending, errorMsg, successMsg } =
    useSupabaseAuthActions();

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">🔐 Supabase Login</h3>

      {errorMsg && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          ❌ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 rounded border border-green-400 bg-green-100 p-3 text-green-700">
          ✅ {successMsg}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Invoke the signIn action with current credentials.  The hook
          // handles pending state and error handling.
          signIn(email, password);
        }}
        className="space-y-4"
      >
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
            disabled={pending}
            className="flex-1 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {pending ? "⏳ Anmelden..." : "🔐 Anmelden"}
          </button>

          <button
            type="button"
            onClick={() => signUp(email, password)}
            disabled={pending}
            className="flex-1 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
          >
            {pending ? "⏳ Registrieren..." : "📝 Registrieren"}
          </button>
        </div>
      </form>

      <div className="mt-4 border-t pt-4">
        <button
          onClick={() => signOut()}
          disabled={pending}
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
