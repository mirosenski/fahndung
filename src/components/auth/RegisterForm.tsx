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
  CheckCircle,
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
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        setError("Supabase ist nicht konfiguriert");
        setLoading(false);
        return;
      }

      console.log("🔐 Starte Supabase Auth Registrierung...");

      // Prüfe zuerst, ob der Benutzer bereits existiert
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (existingUser.user) {
        // Benutzer existiert bereits und Passwort ist korrekt
        setError(
          "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.",
        );
        setLoading(false);
        return;
      }

      // Verwende Supabase Auth signUp
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            department: formData.department ?? "Allgemein",
            phone: formData.phone,
          },
        },
      });

      if (authError) {
        console.error("❌ Supabase Auth Fehler:", authError);

        if (authError.message.includes("User already registered")) {
          setError(
            "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an oder verwenden Sie eine andere E-Mail-Adresse.",
          );
        } else if (authError.message.includes("Invalid email")) {
          setError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
        } else if (authError.message.includes("Password")) {
          setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
        } else {
          setError(`Registrierungs-Fehler: ${authError.message}`);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log(
          "✅ Supabase Auth Registrierung erfolgreich:",
          data.user.email,
        );

        // Erstelle Benutzer-Profil in der Datenbank
        try {
          const { error: profileError } = await supabase
            .from("user_profiles")
            .insert({
              user_id: data.user.id,
              name: formData.name,
              email: formData.email,
              department: formData.department ?? "Allgemein",
              phone: formData.phone,
              role: "user", // Standard-Rolle
              status: "pending", // Wartet auf Admin-Genehmigung
            });

          if (profileError) {
            console.warn("⚠️ Profil-Erstellung fehlgeschlagen:", profileError);
            // Das ist nicht kritisch, da der Auth-Benutzer bereits erstellt wurde
          } else {
            console.log("✅ Benutzer-Profil erstellt");
          }
        } catch (profileError) {
          console.warn("⚠️ Fehler beim Erstellen des Profils:", profileError);
        }

        // E-Mail-Benachrichtigung an Super-Admin senden
        try {
          await sendRegistrationNotification({
            userEmail: formData.email,
            userName: formData.name,
            department: formData.department ?? "Allgemein",
            phone: formData.phone,
            registrationDate: new Date().toLocaleString("de-DE"),
          });
          console.log("✅ E-Mail-Benachrichtigung an Super-Admin gesendet");
        } catch (emailError) {
          console.warn(
            "⚠️ E-Mail-Benachrichtigung fehlgeschlagen:",
            emailError,
          );
        }

        setSuccess(
          "✅ Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail-Adresse und bestätigen Sie Ihr Konto. Ein Administrator wird Ihr Konto genehmigen.",
        );

        // Formular zurücksetzen
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          department: "",
          phone: "",
        });

        // Nach 5 Sekunden zur Login-Seite weiterleiten
        setTimeout(() => {
          router.push("/login");
        }, 5000);
      } else {
        setError(
          "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        );
      }
    } catch (error) {
      console.error("❌ Unerwarteter Registrierungs-Fehler:", error);
      setError(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
      );
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

            {success && (
              <div className="flex items-center space-x-2 rounded-lg border border-green-500/30 bg-green-500/20 p-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm text-green-400">{success}</span>
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
                  className="input-dark-mode py-3 pl-10 pr-10"
                  placeholder="Mindestens 6 Zeichen"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
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
                  className="input-dark-mode py-3 pl-10 pr-10"
                  placeholder="Passwort wiederholen"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
