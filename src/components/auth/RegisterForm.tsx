"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  User,
  Building,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "~/lib/supabase";
import { sendRegistrationNotification } from "~/lib/email-notifications";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Bitte geben Sie Ihren Namen ein.");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Bitte geben Sie Ihre E-Mail-Adresse ein.");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        setError("Supabase ist nicht konfiguriert");
        return;
      }

      // Speichere Registrierung in pending_registrations
      const result = await supabase
        .from("pending_registrations")
        .insert({
          email: formData.email,
          name: formData.name,
          department: formData.department || "Allgemein",
          phone: formData.phone,
          password_hash: formData.password, // In Produktion sollte das gehasht werden
          status: "pending",
        })
        .select()
        .single();

      const registrationData = result.data as { id: string } | null;
      const registrationError = result.error;

      if (registrationError) {
        console.error("Registrierungs-Fehler:", registrationError);
        if (registrationError.message.includes("duplicate key")) {
          setError(
            "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.",
          );
        } else {
          setError(`Registrierungs-Fehler: ${registrationError.message}`);
        }
        return;
      }

      if (registrationData) {
        console.log(
          "Registrierung gespeichert:",
          registrationData.id ?? "unknown",
        );

        // E-Mail-Benachrichtigung an Super-Admin senden
        try {
          await sendRegistrationNotification({
            userEmail: formData.email,
            userName: formData.name,
            department: formData.department || "Allgemein",
            phone: formData.phone,
            registrationDate: new Date().toLocaleString("de-DE"),
          });
          console.log("✅ E-Mail-Benachrichtigung an Super-Admin gesendet");
        } catch (emailError) {
          console.warn("E-Mail-Benachrichtigung fehlgeschlagen:", emailError);
        }

        setError(
          "✅ Registrierung erfolgreich eingereicht! Eine Bestätigungs-E-Mail wurde an ptlsweb@gmail.com gesendet. Bitte warten Sie auf die Genehmigung durch einen Administrator.",
        );

        // Nach 3 Sekunden zur Login-Seite weiterleiten
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Unerwarteter Registrierungs-Fehler:", error);
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              Registrierung
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Erstellen Sie Ihr Konto für Fahndung
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 rounded-lg border border-red-500/30 bg-red-500/20 p-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Vollständiger Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="input-dark-mode py-3 pl-10 pr-4"
                  placeholder="Max Mustermann"
                />
              </div>
            </div>

            {/* E-Mail */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                E-Mail-Adresse *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="input-dark-mode py-3 pl-10 pr-4"
                  placeholder="ihre@email.com"
                />
              </div>
            </div>

            {/* Passwort */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Passwort *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                  className="input-dark-mode py-3 pl-10 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Mindestens 6 Zeichen
              </p>
            </div>

            {/* Passwort bestätigen */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Passwort bestätigen *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  required
                  className="input-dark-mode py-3 pl-10 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Abteilung */}
            <div>
              <label
                htmlFor="department"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Abteilung
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className="select-dark-mode py-3 pl-10 pr-4"
                >
                  <option value="">Abteilung auswählen</option>
                  <option value="IT">IT</option>
                  <option value="Redaktion">Redaktion</option>
                  <option value="Polizei">Polizei</option>
                  <option value="Justiz">Justiz</option>
                  <option value="Allgemein">Allgemein</option>
                </select>
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Telefonnummer
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="input-dark-mode py-3 pl-10 pr-4"
                  placeholder="+49 123 456789"
                />
              </div>
            </div>

            {/* Registrieren Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-600/50"
            >
              {loading ? "Registrierung läuft..." : "Registrieren"}
            </button>
          </form>

          {/* Zurück zur Login-Seite */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/login")}
              className="mx-auto flex items-center justify-center space-x-2 text-gray-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zurück zur Anmeldung</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Durch die Registrierung stimmen Sie unseren{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Nutzungsbedingungen
              </a>{" "}
              zu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
