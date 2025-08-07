import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  role: "admin" | "editor" | "user" | "super_admin";
  department?: string;
  phone?: string;
  last_login?: string;
  login_count?: number;
  status?: "pending" | "approved" | "rejected" | "blocked";
  is_active?: boolean; // Für Kompatibilität
  created_by?: string;
  notes?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type:
    | "login"
    | "logout"
    | "profile_update"
    | "investigation_create"
    | "investigation_edit"
    | "investigation_delete"
    | "media_upload"
    | "user_block"
    | "user_unblock"
    | "role_change"
    | "password_reset";
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  login_at: string;
  logout_at?: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type:
    | "user_block"
    | "user_unblock"
    | "role_change"
    | "user_delete"
    | "investigation_approve"
    | "investigation_reject"
    | "system_settings";
  target_user_id?: string;
  target_investigation_id?: string;
  description?: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface Session {
  user: {
    id: string;
    email: string;
  };
  profile: UserProfile | null;
}

// AuthPermissions Interface für Rollen-basierte Berechtigungen
export interface AuthPermissions {
  canRead: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canManageUsers: boolean;
}

// Rollen-basierte Berechtigungen
export const getRolePermissions = (role: string): AuthPermissions => {
  const permissions: Record<string, AuthPermissions> = {
    user: {
      canRead: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canPublish: false,
      canManageUsers: false,
    },
    editor: {
      canRead: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
      canPublish: true,
      canManageUsers: false,
    },
    admin: {
      canRead: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canPublish: true,
      canManageUsers: true,
    },
    super_admin: {
      canRead: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canPublish: true,
      canManageUsers: true,
    },
  };

  return permissions[role] ?? permissions["user"]!;
};

// Hilfsfunktionen für Rollenprüfungen
export const hasRole = (
  profile: UserProfile | null,
  requiredRoles: string[],
): boolean => {
  if (!profile?.role) return false;
  return requiredRoles.includes(profile.role);
};

export const canEdit = (profile: UserProfile | null): boolean => {
  return hasRole(profile, ["editor", "admin", "super_admin"]);
};

export const canCreate = (profile: UserProfile | null): boolean => {
  return hasRole(profile, ["editor", "admin", "super_admin"]);
};

export const canDelete = (profile: UserProfile | null): boolean => {
  return hasRole(profile, ["admin", "super_admin"]);
};

export const canManageUsers = (profile: UserProfile | null): boolean => {
  return hasRole(profile, ["admin", "super_admin"]);
};

export const canAccessWizard = (profile: UserProfile | null): boolean => {
  return hasRole(profile, ["admin", "super_admin"]);
};

// Hilfsfunktionen für Rollenprüfung
export const isAdmin = (profile: UserProfile | null): boolean => {
  return profile?.role === "admin" || profile?.role === "super_admin";
};

export const isEditor = (profile: UserProfile | null): boolean => {
  return (
    profile?.role === "editor" ||
    profile?.role === "admin" ||
    profile?.role === "super_admin"
  );
};

// Aktuelle Session abrufen mit optimierten Timeouts
export const getCurrentSession = async (): Promise<Session | null> => {
  if (!supabase) {
    console.error("❌ Supabase ist nicht konfiguriert");
    return null;
  }

  try {
    // Reduzierte Logs - nur bei Fehlern
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<{
      data: { session: null };
      error: { message: string };
    }>((resolve) =>
      setTimeout(
        () =>
          resolve({ data: { session: null }, error: { message: "Timeout" } }),
        2000, // Reduziert auf 2000ms für schnellere Antwort
      ),
    );

    const result = await Promise.race([sessionPromise, timeoutPromise]);
    const { data: sessionData, error: sessionError } = result;

    if (sessionError) {
      console.error("❌ Session-Fehler:", sessionError);

      // 🔥 VERBESSERTE FEHLERBEHANDLUNG FÜR LEERE FEHLERMELDUNGEN
      const errorMessage = sessionError.message ?? "";
      const isEmptyError =
        !errorMessage || errorMessage === "{}" || errorMessage.trim() === "";

      // Spezielle Behandlung für Refresh Token Fehler und leere Fehlermeldungen
      if (
        errorMessage.includes("Invalid Refresh Token") ||
        errorMessage.includes("Refresh Token Not Found") ||
        errorMessage.includes("JWT expired") ||
        errorMessage.includes("Token has expired") ||
        errorMessage.includes("Auth session missing") ||
        errorMessage.includes("Forbidden") ||
        errorMessage.includes("403") ||
        isEmptyError // Leere oder ungültige Fehlermeldung
      ) {
        await clearAuthSession();
        return null;
      }

      // Versuche Session-Refresh nur bei spezifischen Fehlern
      if (!isEmptyError && !errorMessage.includes("Timeout")) {
        try {
          const { data: refreshData, error: refreshError } =
            await supabase.auth.refreshSession();

          if (!refreshError && refreshData.session) {
            return {
              user: {
                id: refreshData.session.user.id,
                email: refreshData.session.user.email ?? "",
              },
              profile: null, // Profile wird später geladen
            };
          } else {
            await clearAuthSession();
            return null;
          }
        } catch (refreshError) {
          console.error("❌ Session-Refresh Exception:", refreshError);
          await clearAuthSession();
          return null;
        }
      } else {
        // Bei leeren Fehlermeldungen oder Timeout direkt Session bereinigen
        await clearAuthSession();
        return null;
      }
    }

    if (!sessionData.session) {
      return null;
    }

    // Prüfe Token-Ablauf
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = sessionData.session.expires_at;

    if (expiresAt && now >= expiresAt) {
      await clearAuthSession();
      return null;
    }

    const user = sessionData.session.user;

    // Benutzer-Profil abrufen mit einfacher Fehlerbehandlung
    try {
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Fehler beim Laden des Profils:", profileError);
        // Fallback: Session ohne Profil zurückgeben
        return {
          user: {
            id: user.id,
            email: user.email ?? "",
          },
          profile: null,
        };
      }

      if (!profile) {
        return {
          user: {
            id: user.id,
            email: user.email ?? "",
          },
          profile: null,
        };
      }

      return {
        user: {
          id: user.id,
          email: user.email ?? "",
        },
        profile: profile ? (profile as unknown as UserProfile) : null,
      };
    } catch (error) {
      console.error("❌ Unerwarteter Fehler in getCurrentSession:", error);
      await clearAuthSession();
      return null;
    }
  } catch (error) {
    console.error("❌ Unerwarteter Fehler in getCurrentSession:", error);
    await clearAuthSession();
    return null;
  }
};

// Benutzer-Profil erstellen oder aktualisieren
export const createOrUpdateProfile = async (
  userId: string,
  email: string,
  profileData: Partial<UserProfile>,
): Promise<UserProfile | null> => {
  if (!supabase) {
    console.error("❌ Supabase ist nicht konfiguriert");
    return null;
  }

  try {
    console.log("🔄 Erstelle/Aktualisiere Benutzer-Profil...", {
      userId,
      email,
    });

    const upsertData = {
      user_id: userId,
      email,
      status: "approved", // Automatisch genehmigt für bestehende User
      ...profileData,
    };

    const upsertPromise = supabase
      .from("user_profiles")
      .upsert(upsertData)
      .select()
      .single();

    const upsertTimeout = new Promise<never>(
      (_, reject) =>
        setTimeout(() => reject(new Error("Profile-Upsert Timeout")), 5000), // 5 Sekunden
    );

    const upsertResult = await Promise.race([upsertPromise, upsertTimeout]);
    const { data, error } = upsertResult as {
      data: UserProfile | null;
      error: { message: string } | null;
    };

    if (error) {
      console.error("❌ Fehler beim Erstellen/Aktualisieren des Profils:", {
        message: error.message,
      });
      return null;
    }

    console.log("✅ Profil erfolgreich erstellt/aktualisiert:", data);
    return data;
  } catch (error) {
    console.error("❌ Fehler beim Erstellen/Aktualisieren des Profils:", error);
    return null;
  }
};

// Demo-Benutzer erstellen
export const createDemoUsers = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  if (!supabase) {
    return { success: false, message: "Supabase ist nicht konfiguriert" };
  }

  try {
    console.log("�� Erstelle Demo-User...");

    // Demo-User Daten
    const demoUsers = [
      {
        email: "admin@fahndung.local",
        password: "admin123",
        role: "admin",
        name: "Administrator",
        department: "IT",
      },
      {
        email: "editor@fahndung.local",
        password: "editor123",
        role: "editor",
        name: "Editor",
        department: "Redaktion",
      },
      {
        email: "user@fahndung.local",
        password: "user123",
        role: "user",
        name: "Benutzer",
        department: "Allgemein",
      },
    ];

    const createdUsers = [];

    // Erstelle Auth-Benutzer
    for (const userData of demoUsers) {
      try {
        console.log(`📝 Erstelle Auth-Benutzer: ${userData.email}...`);

        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: userData.email,
            password: userData.password,
          },
        );

        if (authError) {
          console.error(
            `❌ Fehler beim Erstellen des Auth-Benutzers ${userData.email}:`,
            authError,
          );

          // Wenn der Benutzer bereits existiert, versuche ihn zu finden
          if (authError.message.includes("User already registered")) {
            console.log(
              `ℹ️ Benutzer ${userData.email} existiert bereits, versuche Anmeldung...`,
            );

            const { data: signInData, error: signInError } =
              await supabase.auth.signInWithPassword({
                email: userData.email,
                password: userData.password,
              });

            if (signInError) {
              console.error(
                `❌ Fehler beim Anmelden mit ${userData.email}:`,
                signInError,
              );
              continue;
            }

            if (signInData.user) {
              createdUsers.push({
                ...userData,
                user_id: signInData.user.id,
              });
              console.log(`✅ Benutzer ${userData.email} erfolgreich gefunden`);
            }
          } else {
            continue;
          }
        } else if (authData.user) {
          createdUsers.push({
            ...userData,
            user_id: authData.user.id,
          });
          console.log(
            `✅ Auth-Benutzer ${userData.email} erfolgreich erstellt`,
          );
        }
      } catch (error) {
        console.error(
          `❌ Unerwarteter Fehler beim Erstellen von ${userData.email}:`,
          error,
        );
      }
    }

    if (createdUsers.length === 0) {
      return {
        success: false,
        message:
          "❌ Keine Demo-Benutzer konnten erstellt werden. Bitte überprüfen Sie die Supabase-Konfiguration.",
      };
    }

    // Erstelle Profile für die erstellten Benutzer
    try {
      console.log("📝 Erstelle Demo-Profile...");

      const profiles = createdUsers.map((user) => ({
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        name: user.name,
        department: user.department,
      }));

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .upsert(profiles, {
          onConflict: "user_id",
          ignoreDuplicates: false,
        })
        .select();

      if (profileError) {
        console.error("❌ Fehler beim Erstellen der Demo-Profile:", {
          code: profileError.code,
          message: profileError.message,
          details: profileError,
        });

        if (profileError.code === "42P17") {
          return {
            success: false,
            message: `❌ RLS-Policy Endlosschleife erkannt!\n\nBitte führe das SQL-Script 'disable-rls-temp.sql' in Supabase aus, um RLS temporär zu deaktivieren.`,
          };
        }

        return {
          success: false,
          message: `❌ Fehler beim Erstellen der Demo-Profile: ${profileError.message}\n\nBitte führe das SQL-Script 'disable-rls-temp.sql' in Supabase aus.`,
        };
      }

      console.log("✅ Demo-Profile erfolgreich erstellt:", profileData);

      // Melde alle Benutzer ab
      await supabase.auth.signOut();

      return {
        success: true,
        message: `✅ ${createdUsers.length} Demo-Benutzer erfolgreich erstellt!\n\nDu kannst jetzt mit den Demo-Buttons einloggen:\n• Admin: admin@fahndung.local / admin123\n• Editor: editor@fahndung.local / editor123\n• User: user@fahndung.local / user123`,
      };
    } catch (error) {
      console.error("❌ Fehler beim Erstellen der Demo-Profile:", error);

      if (
        error instanceof Error &&
        error.message.includes("infinite recursion")
      ) {
        return {
          success: false,
          message: `❌ RLS-Policy Endlosschleife erkannt!\n\nBitte führe das SQL-Script 'disable-rls-temp.sql' in Supabase aus, um RLS temporär zu deaktivieren.`,
        };
      }

      return {
        success: false,
        message: `❌ Fehler beim Erstellen der Demo-Profile: ${error instanceof Error ? error.message : "Unbekannter Fehler"}\n\nBitte führe das SQL-Script 'disable-rls-temp.sql' in Supabase aus.`,
      };
    }
  } catch (error) {
    console.error("❌ Allgemeiner Fehler beim Erstellen der Demo-User:", error);
    return {
      success: false,
      message: `❌ Fehler beim Erstellen der Demo-User: ${error instanceof Error ? error.message : "Unbekannter Fehler"}\n\nBitte führe das SQL-Script 'disable-rls-temp.sql' in Supabase aus.`,
    };
  }
};

// Hilfsfunktion um Status in is_active zu konvertieren
export const getIsActiveFromStatus = (status?: string): boolean => {
  if (!status) return false;
  return status === "approved";
};

// Hilfsfunktion um is_active in Status zu konvertieren
export const getStatusFromIsActive = (isActive?: boolean): string => {
  return isActive ? "approved" : "blocked";
};

// Automatisches Setup aller Benutzer beim Start
export const setupAllUsers = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  if (!supabase) {
    return { success: false, message: "Supabase ist nicht konfiguriert" };
  }

  try {
    console.log("🔧 Prüfe Benutzer-Setup...");

    // Alle Benutzer-Daten
    const allUsers = [
      {
        email: "admin@fahndung.local",
        password: "admin123",
        role: "admin",
        name: "Administrator",
        department: "IT",
      },
      {
        email: "editor@fahndung.local",
        password: "editor123",
        role: "editor",
        name: "Editor",
        department: "Redaktion",
      },
      {
        email: "user@fahndung.local",
        password: "user123",
        role: "user",
        name: "Benutzer",
        department: "Allgemein",
      },
      {
        email: "ptlsweb@gmail.com",
        password: "Heute-2025!sp",
        role: "admin",
        name: "PTLS Web",
        department: "IT",
      },
    ];

    const createdUsers = [];
    const existingUsers = [];

    // Prüfe zuerst, welche Benutzer bereits existieren
    for (const userData of allUsers) {
      try {
        console.log(`🔍 Prüfe Benutzer: ${userData.email}...`);

        // Versuche Anmeldung, um zu prüfen, ob der Benutzer existiert
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: userData.email,
            password: userData.password,
          });

        if (signInError) {
          // Benutzer existiert nicht, erstelle ihn
          console.log(`📝 Erstelle neuen Benutzer: ${userData.email}...`);

          const { data: authData, error: authError } =
            await supabase.auth.signUp({
              email: userData.email,
              password: userData.password,
            });

          if (authError) {
            console.error(
              `❌ Fehler beim Erstellen von ${userData.email}:`,
              authError,
            );
            continue;
          }

          if (authData.user) {
            createdUsers.push({
              ...userData,
              user_id: authData.user.id,
            });
            console.log(`✅ Benutzer ${userData.email} erfolgreich erstellt`);
          }
        } else if (signInData.user) {
          // Benutzer existiert bereits
          existingUsers.push({
            ...userData,
            user_id: signInData.user.id,
          });
          console.log(`✅ Benutzer ${userData.email} existiert bereits`);
        }

        // Melde den Benutzer ab, um für den nächsten Test bereit zu sein
        await supabase.auth.signOut();
      } catch (error) {
        console.error(`❌ Unerwarteter Fehler bei ${userData.email}:`, error);
      }
    }

    const allProcessedUsers = [...createdUsers, ...existingUsers];

    if (allProcessedUsers.length === 0) {
      return {
        success: false,
        message:
          "❌ Keine Benutzer konnten verarbeitet werden. Bitte überprüfen Sie die Supabase-Konfiguration.",
      };
    }

    // Erstelle Profile für die erstellten Benutzer (nur für neue Benutzer)
    if (createdUsers.length > 0) {
      try {
        console.log("📝 Erstelle Benutzer-Profile...");

        const profiles = createdUsers.map((user) => ({
          user_id: user.user_id,
          email: user.email,
          role: user.role,
          name: user.name,
          department: user.department,
        }));

        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .upsert(profiles, {
            onConflict: "user_id",
            ignoreDuplicates: false,
          })
          .select();

        if (profileError) {
          console.error("❌ Fehler beim Erstellen der Benutzer-Profile:", {
            code: profileError.code,
            message: profileError.message,
            details: profileError,
          });

          return {
            success: false,
            message: `❌ Fehler beim Erstellen der Benutzer-Profile: ${profileError.message}`,
          };
        }

        console.log("✅ Benutzer-Profile erfolgreich erstellt:", profileData);
      } catch (error) {
        console.error("❌ Fehler beim Erstellen der Benutzer-Profile:", error);

        return {
          success: false,
          message: `❌ Fehler beim Erstellen der Benutzer-Profile: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        };
      }
    }

    // Melde alle Benutzer ab
    await supabase.auth.signOut();

    const message =
      createdUsers.length > 0
        ? `✅ ${createdUsers.length} neue Benutzer erstellt, ${existingUsers.length} bereits vorhanden!\n\nVerfügbare Benutzer:\n• Admin: admin@fahndung.local / admin123\n• Editor: editor@fahndung.local / editor123\n• User: user@fahndung.local / user123\n• PTLS Web: ptlsweb@gmail.com / Heute-2025!sp`
        : `✅ Alle ${existingUsers.length} Benutzer sind bereits verfügbar!\n\nVerfügbare Benutzer:\n• Admin: admin@fahndung.local / admin123\n• Editor: editor@fahndung.local / editor123\n• User: user@fahndung.local / user123\n• PTLS Web: ptlsweb@gmail.com / Heute-2025!sp`;

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error("❌ Allgemeiner Fehler beim Setup der Benutzer:", error);
    return {
      success: false,
      message: `❌ Fehler beim Setup der Benutzer: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
    };
  }
};

// Benutzer abmelden
export const signOut = async (): Promise<void> => {
  if (!supabase) return;

  try {
    console.log("🔐 Starte Abmeldung...");

    // Zuerst lokale Storage bereinigen
    await clearLocalSession();

    // Dann prüfen, ob eine Session existiert
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.log("⚠️ Session-Fehler beim Logout:", sessionError);
      // Session bereits fehlerhaft - nur lokale Bereinigung
      return;
    }

    if (!session) {
      console.log("ℹ️ Keine aktive Session gefunden - nur lokale Bereinigung");
      return;
    }

    // Verbesserte Supabase-Abmeldung mit 403-Behandlung
    try {
      const { error } = await supabase.auth.signOut({
        scope: "local", // Verwende lokalen Scope statt global
      });

      if (error) {
        console.error("❌ Supabase Logout-Fehler:", error);

        // Bei 403-Fehlern oder Auth-Problemen ist das normal
        if (
          error?.message?.includes("Auth session missing") ||
          error?.message?.includes("No session") ||
          error?.message?.includes("Forbidden") ||
          error?.message?.includes("403")
        ) {
          console.log("ℹ️ Session bereits abgemeldet oder 403-Fehler - normal");
        } else {
          console.error("❌ Unerwarteter Supabase Logout-Fehler:", error);
        }
      } else {
        console.log("✅ Abmeldung erfolgreich");
      }
    } catch (signOutError) {
      console.log("ℹ️ Supabase Logout-Ausnahme (normal):", signOutError);

      // Bei 403-Fehlern ist das normal - Session ist bereits abgemeldet
      if (
        signOutError instanceof Error &&
        (signOutError.message.includes("403") ||
          signOutError.message.includes("Forbidden"))
      ) {
        console.log("ℹ️ 403-Fehler beim Logout - Session bereits abgemeldet");
      }
    }
  } catch (error) {
    console.error("❌ Unerwarteter Fehler beim Abmelden:", error);

    // Auch bei unerwarteten Fehlern lokale Session bereinigen
    await clearLocalSession();
  }
};

// Lokale Session bereinigen (ohne Supabase-Aufruf)
const clearLocalSession = async (): Promise<void> => {
  if (typeof window === "undefined") return;

  try {
    // Alle Supabase-bezogenen Daten bereinigen
    localStorage.removeItem("supabase.auth.token");
    sessionStorage.removeItem("supabase.auth.token");

    // Zusätzliche Supabase-Storage-Keys bereinigen
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes("supabase")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    console.log("✅ Lokale Session-Daten vollständig bereinigt");
  } catch (error) {
    console.error("⚠️ Fehler beim Bereinigen der lokalen Session:", error);
  }
};

// Session bereinigen (für Refresh Token Probleme)
export const clearAuthSession = async (): Promise<void> => {
  if (!supabase) return;

  try {
    console.log("🧹 Bereinige Auth-Session...");

    // Zuerst lokale Storage bereinigen
    await clearLocalSession();

    // Dann Supabase-Abmeldung mit verbesserter Fehlerbehandlung
    try {
      // Zuerst prüfen, ob eine Session existiert
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.log(
          "ℹ️ Session-Fehler bei Bereinigung (normal):",
          sessionError.message,
        );
      } else if (!session) {
        console.log("ℹ️ Keine Session für Bereinigung gefunden - normal");
      } else {
        // Nur abmelden, wenn eine Session existiert
        const { error } = await supabase.auth.signOut({
          scope: "local", // Verwende lokalen Scope für bessere Kompatibilität
        });
        if (error) {
          console.log(
            "ℹ️ Supabase Session-Bereinigung Fehler (normal):",
            error.message,
          );
        } else {
          console.log("✅ Supabase Session erfolgreich bereinigt");
        }
      }
    } catch (signOutError) {
      console.log("ℹ️ Supabase Logout-Ausnahme (normal):", signOutError);
    }

    console.log("✅ Auth-Session vollständig bereinigt");
  } catch (error) {
    console.error("❌ Fehler beim Bereinigen der Auth-Session:", error);

    // Auch bei Fehler lokale Session bereinigen
    await clearLocalSession();
  }
};

// Vollständige Session-Bereinigung
export const forceClearSession = async (): Promise<void> => {
  if (!supabase) return;

  try {
    console.log("🧹 Starte vollständige Session-Bereinigung...");

    // 1. Lokale Storage bereinigen
    if (typeof window !== "undefined") {
      try {
        // Alle Supabase-bezogenen Daten bereinigen
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes("supabase")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // Auch sessionStorage bereinigen
        sessionStorage.clear();

        console.log("✅ Lokale Storage bereinigt");
      } catch (storageError) {
        console.error(
          "⚠️ Fehler beim Bereinigen des lokalen Storage:",
          storageError,
        );
      }
    }

    // 2. Supabase Session bereinigen
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log("ℹ️ Supabase Logout-Fehler (normal):", error.message);
      } else {
        console.log("✅ Supabase Session bereinigt");
      }
    } catch (signOutError) {
      console.log("ℹ️ Supabase Logout-Ausnahme (normal):", signOutError);
    }

    // 3. Zusätzliche Bereinigung
    try {
      // Alle Auth-Daten zurücksetzen
      await supabase.auth.refreshSession();
    } catch (refreshError) {
      console.log(
        "ℹ️ Refresh-Fehler (normal bei leerer Session):",
        refreshError,
      );
    }

    console.log("✅ Vollständige Session-Bereinigung abgeschlossen");
  } catch (error) {
    console.error("❌ Fehler bei vollständiger Session-Bereinigung:", error);
  }
};

// Middleware für geschützte Routen
export const requireAuth = async (): Promise<Session> => {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("Nicht authentifiziert");
  }

  return session;
};

// Middleware für Admin-Routen
export const requireAdmin = async (): Promise<Session> => {
  const session = await requireAuth();

  if (!isAdmin(session.profile)) {
    throw new Error("Admin-Rechte erforderlich");
  }

  return session;
};

// Middleware für Editor-Routen
export const requireEditor = async (): Promise<Session> => {
  const session = await requireAuth();

  if (!isEditor(session.profile)) {
    throw new Error("Editor-Rechte erforderlich");
  }

  return session;
};

// Verbesserte Session-Prüfung
export const checkAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
  error: string | null;
}> => {
  if (!supabase) {
    return {
      isAuthenticated: false,
      user: null,
      error: "Supabase nicht konfiguriert",
    };
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth-Fehler:", error);

      // Bei Auth-Fehlern automatisch Session bereinigen
      if (
        error.message.includes("Invalid Refresh Token") ||
        error.message.includes("JWT expired") ||
        error.message.includes("Forbidden")
      ) {
        console.log("🔄 Automatische Session-Bereinigung bei Auth-Fehler...");
        await clearAuthSession();
      }

      return { isAuthenticated: false, user: null, error: error.message };
    }

    if (!user) {
      return {
        isAuthenticated: false,
        user: null,
        error: "Kein Benutzer angemeldet",
      };
    }

    return {
      isAuthenticated: true,
      user: user ? { id: user.id, email: user.email ?? "" } : null,
      error: null,
    };
  } catch (error) {
    console.error("Session-Prüfung fehlgeschlagen:", error);

    // Bei unerwarteten Fehlern auch Session bereinigen
    await clearAuthSession();

    return {
      isAuthenticated: false,
      user: null,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
};

// Super-Admin Funktionen
export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Fehler beim Abrufen aller Benutzer:", error);
      return [];
    }

    return (data as unknown as UserProfile[]) ?? [];
  } catch (error) {
    console.error("❌ Fehler beim Abrufen aller Benutzer:", error);
    return [];
  }
};

export const getUserActivity = async (
  userId: string,
): Promise<UserActivity[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("❌ Fehler beim Abrufen der Benutzeraktivität:", error);
      return [];
    }

    return (data as unknown as UserActivity[]) ?? [];
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Benutzeraktivität:", error);
    return [];
  }
};

export const getUserSessions = async (
  userId: string,
): Promise<UserSession[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("login_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("❌ Fehler beim Abrufen der Benutzersessions:", error);
      return [];
    }

    return (data as unknown as UserSession[]) ?? [];
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Benutzersessions:", error);
    return [];
  }
};

export const blockUser = async (
  userId: string,
  reason?: string,
): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({ status: "blocked" })
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Fehler beim Blockieren des Benutzers:", error);
      return false;
    }

    // Log admin action
    await logAdminAction("user_block", userId, reason);

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Blockieren des Benutzers:", error);
    return false;
  }
};

export const unblockUser = async (
  userId: string,
  reason?: string,
): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({ status: "approved" })
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Fehler beim Entsperren des Benutzers:", error);
      return false;
    }

    // Log admin action
    await logAdminAction("user_unblock", userId, reason);

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Entsperren des Benutzers:", error);
    return false;
  }
};

export const changeUserRole = async (
  userId: string,
  newRole: "admin" | "editor" | "user" | "super_admin",
  reason?: string,
): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Fehler beim Ändern der Benutzerrolle:", error);
      return false;
    }

    // Log admin action
    await logAdminAction("role_change", userId, reason, { newRole });

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Ändern der Benutzerrolle:", error);
    return false;
  }
};

export const deleteUser = async (
  userId: string,
  reason?: string,
): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Fehler beim Löschen des Benutzers:", error);
      return false;
    }

    // Log admin action
    await logAdminAction("user_delete", userId, reason);

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Löschen des Benutzers:", error);
    return false;
  }
};

export const getAdminActions = async (): Promise<AdminAction[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("❌ Fehler beim Abrufen der Admin-Aktionen:", error);
      return [];
    }

    return (data as unknown as AdminAction[]) ?? [];
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Admin-Aktionen:", error);
    return [];
  }
};

// Hilfsfunktionen
const logAdminAction = async (
  actionType: string,
  targetUserId?: string,
  reason?: string,
  metadata?: Record<string, unknown>,
) => {
  if (!supabase) return;

  try {
    const currentUser = await getCurrentSession();
    if (!currentUser) return;

    await supabase.from("admin_actions").insert({
      admin_id: currentUser.user.id,
      action_type: actionType,
      target_user_id: targetUserId,
      description: reason,
      metadata: metadata ?? {},
    });
  } catch (error) {
    console.error("❌ Fehler beim Loggen der Admin-Aktion:", error);
  }
};

export const logUserActivity = async (
  activityType: string,
  description?: string,
  metadata?: Record<string, unknown>,
) => {
  if (!supabase) return;

  try {
    const currentUser = await getCurrentSession();
    if (!currentUser) return;

    await supabase.from("user_activity").insert({
      user_id: currentUser.user.id,
      activity_type: activityType,
      description,
      metadata: metadata ?? {},
    });
  } catch (error) {
    console.error("❌ Fehler beim Loggen der Benutzeraktivität:", error);
  }
};

// Automatische Auth-Fehler-Behandlung
export const handleAuthError = async (error: unknown): Promise<void> => {
  if (!error) return;

  console.error("🔐 Auth-Fehler erkannt:", error);

  // Bei 403-Fehlern oder anderen Auth-Problemen Session bereinigen
  const errorMessage =
    error instanceof Error ? error.message : JSON.stringify(error);

  if (
    errorMessage.includes("Forbidden") ||
    errorMessage.includes("403") ||
    errorMessage.includes("Invalid Refresh Token") ||
    errorMessage.includes("JWT expired") ||
    errorMessage.includes("Token has expired") ||
    errorMessage.includes("Refresh Token Not Found")
  ) {
    console.log("🔄 Bereinige Session aufgrund von Auth-Fehler...");
    await clearAuthSession();
  }
};

// Direkte JWT-Validierung für Server-seitige Authentifizierung
export const validateJWTDirect = async (
  token: string,
): Promise<{ id: string; email?: string } | null> => {
  if (!token) return null;

  try {
    console.log("🔍 Validiere JWT direkt...", {
      tokenLength: token.length,
      tokenStart: token.substring(0, 20) + "...",
    });

    // Direkte Validierung über Supabase Auth API
    const response = await fetch(
      `${process.env["NEXT_PUBLIC_SUPABASE_URL"]}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
        },
      },
    );

    if (!response.ok) {
      console.warn("❌ JWT-Validierung fehlgeschlagen:", response.status);
      return null;
    }

    const userData = (await response.json()) as { id: string; email?: string };
    console.log("✅ JWT erfolgreich validiert für:", userData.email);

    return userData;
  } catch (error) {
    console.error("❌ Fehler bei JWT-Validierung:", error);
    return null;
  }
};

// Verbesserte Token-Validierung mit direkter JWT-Prüfung
export const validateToken = async (): Promise<boolean> => {
  if (!supabase) return false;

  try {
    // Zuerst Session prüfen
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Session-Fehler bei Token-Validierung:", sessionError);
      await clearAuthSession();
      return false;
    }

    if (!sessionData.session) {
      console.log("ℹ️ Keine Session für Token-Validierung");
      return false;
    }

    // Dann User prüfen
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("❌ Token-Validierung fehlgeschlagen:", error);
      await clearAuthSession();
      return false;
    }

    if (!user) {
      console.log("ℹ️ Kein Benutzer gefunden");
      return false;
    }

    console.log("✅ Token ist gültig für Benutzer:", user.email);
    return true;
  } catch (error) {
    console.error("❌ Unerwarteter Fehler bei Token-Validierung:", error);
    await clearAuthSession();
    return false;
  }
};

// Verbesserte 403-Fehler-Behandlung
export const handle403Error = async (error: unknown): Promise<void> => {
  if (!error) return;

  console.error("🔐 403-Fehler erkannt:", error);

  const errorMessage =
    error instanceof Error ? error.message : JSON.stringify(error);

  // Bei 403-Fehlern Session bereinigen und zur Login-Seite weiterleiten
  if (
    errorMessage.includes("Forbidden") ||
    errorMessage.includes("403") ||
    errorMessage.includes("Unauthorized") ||
    errorMessage.includes("401") ||
    errorMessage.includes("auth/v1/logout") ||
    errorMessage.includes("message port closed")
  ) {
    console.log("🔄 Bereinige Session aufgrund von 403-Fehler...");

    try {
      await clearAuthSession();
    } catch (clearError) {
      console.log(
        "ℹ️ Session-Bereinigung fehlgeschlagen (normal):",
        clearError,
      );
    }

    // Zur Login-Seite weiterleiten, wenn im Browser und nicht bereits auf Login-Seite
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      console.log("🔄 Weiterleitung zur Login-Seite...");
      window.location.href = "/login";
    }
  }
};

// Verbesserte Session-Prüfung mit 403-Behandlung
export const checkSessionWith403Handling =
  async (): Promise<Session | null> => {
    try {
      return await getCurrentSession();
    } catch (error) {
      await handle403Error(error);
      return null;
    }
  };
