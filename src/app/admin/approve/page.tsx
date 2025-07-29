"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "~/lib/supabase";
import { sendUserConfirmationEmail } from "~/lib/email-notifications";

interface UserProfile {
  name: string;
  email: string;
  department: string;
  phone?: string;
  created_at: string;
  status: string;
}

function AdminApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState<UserProfile | null>(null);

  const email = searchParams?.get("email");
  const action = searchParams?.get("action");

  useEffect(() => {
    const handleApproval = async () => {
      if (!email || !action) {
        setError("Ungültige URL-Parameter");
        setLoading(false);
        return;
      }

      try {
        console.log(`🔐 Admin-Genehmigung: ${action} für ${email}`);

        // Hole Benutzer-Daten
        const { data: userProfile, error: fetchError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("email", email ?? "")
          .single();

        if (fetchError) {
          console.error(
            "❌ Fehler beim Abrufen der Benutzer-Daten:",
            fetchError,
          );
          setError("Benutzer nicht gefunden");
          setLoading(false);
          return;
        }

        if (!userProfile) {
          setError("Benutzer nicht gefunden");
          setLoading(false);
          return;
        }

        // Type assertion with proper validation
        const typedUserProfile: UserProfile = {
          name: String(userProfile["name"]),
          email: String(userProfile["email"]),
          department: String(userProfile["department"]),
          phone:
            userProfile["phone"] && typeof userProfile["phone"] === "string"
              ? userProfile["phone"]
              : undefined,
          created_at: String(userProfile["created_at"]),
          status: String(userProfile["status"]),
        };

        setUserData(typedUserProfile);

        // Führe Genehmigung/Ablehnung durch
        const newStatus = action === "approve" ? "approved" : "rejected";

        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("email", email ?? "");

        if (updateError) {
          console.error(
            "❌ Fehler beim Aktualisieren des Status:",
            updateError,
          );
          setError("Fehler beim Aktualisieren des Benutzer-Status");
          setLoading(false);
          return;
        }

        // Sende Bestätigungs-E-Mail an Benutzer
        try {
          await sendUserConfirmationEmail(
            email,
            userProfile["name"] as string,
            action === "approve",
          );
          console.log("✅ Bestätigungs-E-Mail gesendet");
        } catch (emailError) {
          console.warn("⚠️ E-Mail-Versand fehlgeschlagen:", emailError);
        }

        // Erfolgsmeldung
        const successMessage =
          action === "approve"
            ? `✅ Benutzer ${userProfile["name"] as string} wurde erfolgreich genehmigt!`
            : `❌ Benutzer ${userProfile["name"] as string} wurde abgelehnt.`;

        setSuccess(successMessage);
        console.log("✅ Admin-Aktion erfolgreich:", action);

        // Nach 5 Sekunden zur Admin-Seite weiterleiten
        setTimeout(() => {
          router.push("/admin/users");
        }, 5000);
      } catch (error) {
        console.error(
          "❌ Unerwarteter Fehler bei der Admin-Genehmigung:",
          error,
        );
        setError("Ein unerwarteter Fehler ist aufgetreten");
        setLoading(false);
      }
    };

    void handleApproval();
  }, [email, action, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Verarbeite Anfrage...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          {error && (
            <div className="mb-6 flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="font-semibold text-red-400">Fehler</h3>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center space-x-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              {action === "approve" ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <XCircle className="h-6 w-6 text-red-400" />
              )}
              <div>
                <h3 className="font-semibold text-green-400">
                  {action === "approve" ? "Genehmigt" : "Abgelehnt"}
                </h3>
                <p className="text-sm text-green-400">{success}</p>
              </div>
            </div>
          )}

          {userData && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                Benutzer-Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Name:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {userData.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    E-Mail:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {userData.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Abteilung:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {userData.department}
                  </span>
                </div>
                {userData.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Telefon:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {userData.phone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Registriert:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(userData.created_at).toLocaleDateString("de-DE")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Admin-Genehmigung
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {action === "approve"
                ? "Benutzer wurde genehmigt und kann sich jetzt anmelden."
                : "Benutzer wurde abgelehnt und erhält eine Benachrichtigung."}
            </p>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => router.push("/admin/users")}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Zurück zum Admin-Panel
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Dashboard
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sie werden automatisch zum Admin-Panel weitergeleitet...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Lade...</p>
          </div>
        </div>
      }
    >
      <AdminApprovalContent />
    </Suspense>
  );
}
