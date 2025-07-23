"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  BarChart3,
  FileText,
  Image as ImageIcon,
  Users,
  Settings,
} from "lucide-react";
import { api } from "~/trpc/react";
import { supabase } from "~/lib/supabase";
import { isAdmin, isEditor, getAllUsers, getAdminActions } from "~/lib/auth";
import type { UserProfile, UserActivity, AdminAction } from "~/lib/auth";
import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import { useAuth } from "~/hooks/useAuth";
import { LoadingSpinner } from "~/components/ui/LoadingSpinner";

// Lazy Loading für bessere HMR-Kompatibilität
const OverviewTab = dynamic(
  () => import("~/components/dashboard/OverviewTab"),
  {
    loading: () => <LoadingSpinner message="Lade Übersicht..." />,
    ssr: false,
  },
);
const InvestigationsTab = dynamic(
  () => import("~/components/dashboard/InvestigationsTab"),
  {
    loading: () => <LoadingSpinner message="Lade Fahndungen..." />,
    ssr: false,
  },
);
const UsersTab = dynamic(() => import("~/components/dashboard/UsersTab"), {
  loading: () => <LoadingSpinner message="Lade Benutzer..." />,
  ssr: false,
});
const MediaTab = dynamic(() => import("~/components/dashboard/MediaTab"), {
  loading: () => <LoadingSpinner message="Lade Medien..." />,
  ssr: false,
});
const SettingsTab = dynamic(
  () => import("~/components/dashboard/SettingsTab"),
  {
    loading: () => <LoadingSpinner message="Lade Einstellungen..." />,
    ssr: false,
  },
);

interface PendingRegistration {
  id: string;
  email: string;
  name: string;
  department?: string;
  phone?: string;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Investigation {
  id: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: string;
  priority: string;
  category: string;
  location: string;
  station: string;
  features: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

export default function Dashboard() {
  const router = useRouter();
  const { session, loading, logout, initialized, error, timeoutReached } =
    useAuth();

  // Alle useState Hooks am Anfang
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [connectionError, setConnectionError] = useState(false);

  // Admin state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userActivity] = useState<UserActivity[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<
    PendingRegistration[]
  >([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [adminActiveTab, setAdminActiveTab] = useState("users");
  const [newUserData, setNewUserData] = useState({
    email: "",
    name: "",
    role: "user" as "admin" | "editor" | "user",
    department: "",
    password: "",
  });

  // Optimierte tRPC Queries mit reduziertem Limit und besseren Optionen
  const {
    data: investigationsData,
    error: investigationsError,
    isLoading: investigationsLoading,
  } = api.post.getInvestigations.useQuery(
    {
      limit: 20, // Reduziert von 100 auf 20 für schnellere Initialladung
      offset: 0,
    },
    {
      staleTime: 5 * 60 * 1000, // 5 Minuten Cache
      refetchOnWindowFocus: false, // Verhindert unnötige Refetches
      refetchOnMount: false, // Verhindert Refetch beim Tab-Wechsel
    },
  );

  // Alle useCallback Hooks
  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleCreateInvestigation = useCallback(() => {
    router.push("/fahndungen/neu");
  }, [router]);

  const handleRetry = useCallback(() => {
    setConnectionError(false);
    // Seite neu laden
    window.location.reload();
  }, []);

  // Optimierte Admin-Daten-Ladung mit Memoization
  const loadAdminData = useCallback(async () => {
    if (!session?.profile || !isAdmin(session?.profile)) return;

    try {
      // Parallel laden für bessere Performance
      const [usersData, actionsData, registrationsData] = await Promise.all([
        getAllUsers(),
        getAdminActions(),
        supabase
          ?.from("pending_registrations")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(50), // Limit für bessere Performance
      ]);

      setUsers(usersData);
      setAdminActions(actionsData);
      setPendingRegistrations(
        (registrationsData?.data ?? []) as unknown as PendingRegistration[],
      );
    } catch (error) {
      console.error("Fehler beim Laden der Admin-Daten:", error);
      setConnectionError(true);
    }
  }, [session?.profile]);

  // Optimierte useEffect Hooks
  useEffect(() => {
    console.log("🔍 Dashboard: Prüfe Authentifizierung...", {
      loading,
      initialized,
      hasSession: !!session,
      error,
      timeoutReached,
    });

    // Vereinfachte Redirect-Logik
    if (initialized && !loading && !session) {
      console.log("❌ Dashboard: Keine Session - Weiterleitung zu Login");
      router.replace("/login");
    }
  }, [session, loading, initialized, router, error, timeoutReached]);

  // Load admin data when session is available and user is admin
  useEffect(() => {
    if (session?.profile && isAdmin(session?.profile)) {
      void loadAdminData();
    }
  }, [session?.profile, loadAdminData]);

  // Connection error handling
  useEffect(() => {
    if (investigationsError) {
      console.error("❌ Fahndungen-Loading-Fehler:", investigationsError);
      setConnectionError(true);
    }
  }, [investigationsError]);

  // Verbesserte Fehlerbehandlung für Session-Probleme
  useEffect(() => {
    if (error?.includes("Timeout")) {
      console.log("🔄 Timeout-Fehler erkannt - versuche erneut...");
      setConnectionError(true);
    }
  }, [error, timeoutReached]);

  // Loading state für Hydration mit verbesserter Fehlerbehandlung
  if (!initialized || loading) {
    return (
      <LoadingSpinner
        message={timeoutReached ? "Verbindungsfehler" : "Lade Dashboard..."}
        subMessage={
          !initialized
            ? "Initialisiere..."
            : timeoutReached
              ? "Server nicht erreichbar - versuche erneut"
              : "Prüfe Authentifizierung..."
        }
        type={timeoutReached ? "timeout" : "loading"}
        onRetry={timeoutReached ? handleRetry : undefined}
        showRetry={timeoutReached}
      />
    );
  }

  // Wenn keine Session nach Initialisierung
  if (!session) {
    return (
      <LoadingSpinner
        message="Nicht authentifiziert"
        subMessage="Weiterleitung zu Login..."
        type="error"
      />
    );
  }

  // Connection error state
  if (connectionError) {
    return (
      <LoadingSpinner
        message="Verbindungsfehler"
        subMessage="Die Verbindung zum Server konnte nicht hergestellt werden. Prüfen Sie Ihre Internetverbindung."
        type="error"
        onRetry={handleRetry}
        showRetry={true}
      />
    );
  }

  // Filtered investigations
  const investigations = (investigationsData as Investigation[]) ?? [];
  const filteredInvestigations = investigations.filter((investigation) => {
    const matchesSearch =
      investigation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investigation.case_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      investigation.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || investigation.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || investigation.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || investigation.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const tabs = [
    { id: "overview", label: "Übersicht", icon: BarChart3 },
    { id: "investigations", label: "Fahndungen", icon: FileText },
    { id: "media", label: "Medien", icon: ImageIcon },
    { id: "users", label: "Benutzer", icon: Users },
    { id: "settings", label: "Einstellungen", icon: Settings },
  ];

  // Render Tab Content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            investigations={investigations}
            investigationsLoading={investigationsLoading}
          />
        );
      case "investigations":
        return (
          <InvestigationsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedPriority={selectedPriority}
            setSelectedPriority={setSelectedPriority}
            filteredInvestigations={filteredInvestigations}
            isEditor={isEditor(session?.profile)}
            onCreate={handleCreateInvestigation}
          />
        );
      case "users":
        return (
          <UsersTab
            users={users}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            userActivity={userActivity}
            adminActions={adminActions}
            pendingRegistrations={pendingRegistrations}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            adminActiveTab={adminActiveTab}
            setAdminActiveTab={setAdminActiveTab}
            newUserData={newUserData}
            setNewUserData={setNewUserData}
            onLoadAdminData={loadAdminData}
            isAdmin={isAdmin(session?.profile)}
          />
        );
      case "media":
        return <MediaTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header
        variant="dashboard"
        session={session}
        onLogout={handleLogout}
        onCreateInvestigation={handleCreateInvestigation}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex cursor-pointer items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      <Footer variant="dashboard" session={session} />
    </div>
  );
}
