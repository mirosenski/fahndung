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
const MediaTab = dynamic(
  () => import("~/components/dashboard/MediaTabSimple"),
  {
    loading: () => <LoadingSpinner message="Lade Medien..." />,
    ssr: false,
  },
);
const SettingsTab = dynamic(
  () => import("~/components/dashboard/SettingsTab"),
  {
    loading: () => <LoadingSpinner message="Lade Einstellungen..." />,
    ssr: false,
  },
);

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

  // Admin state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userActivity] = useState<UserActivity[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
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
  const { data: investigationsData, isLoading: investigationsLoading } =
    api.post.getInvestigations.useQuery(
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

  const loadAdminData = useCallback(async () => {
    if (!isAdmin(session?.profile ?? null)) return;

    try {
      const [usersData, actionsData] = await Promise.all([
        getAllUsers(),
        getAdminActions(),
      ]);

      setUsers(usersData);
      setAdminActions(actionsData);
    } catch (error) {
      console.error("Fehler beim Laden der Admin-Daten:", error);
    }
  }, [session?.profile]);

  // useEffect Hooks
  useEffect(() => {
    if (isAdmin(session?.profile ?? null)) {
      void loadAdminData();
    }
  }, [session?.profile, loadAdminData]);

  useEffect(() => {
    if (error) {
      console.error("Auth error:", error);
    }
  }, [error]);

  useEffect(() => {
    if (timeoutReached) {
      console.log("Auth timeout reached");
    }
  }, [timeoutReached]);

  // Auth check with useEffect to avoid router updates during render
  useEffect(() => {
    if (initialized && !loading && !session?.user) {
      console.log("🔐 Dashboard: Keine Session, weiterleitung zu Login...");
      router.push("/login");
    }
  }, [initialized, loading, session?.user, router]);

  // Zusätzlicher Effect für Error-Handling
  useEffect(() => {
    if (error) {
      console.error("Dashboard Auth error:", error);

      // Bei Auth-Fehlern zur Login-Seite weiterleiten
      if (
        error.includes("403") ||
        error.includes("Forbidden") ||
        error.includes("Unauthorized")
      ) {
        console.log(
          "🔐 Dashboard: Auth-Fehler erkannt, weiterleitung zu Login...",
        );
        router.push("/login");
      }
    }
  }, [error, router]);

  // Loading state mit verbesserter UX
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <LoadingSpinner message="Lade Dashboard..." />
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {!initialized ? "Initialisiere..." : "Prüfe Authentifizierung..."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth check - return null instead of router.push to avoid render cycle issues
  if (!session?.user) {
    console.log("🔐 Dashboard: Keine Session gefunden, rendere nichts...");
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-4xl">🔐</div>
            <div className="text-xl font-semibold">Nicht authentifiziert</div>
            <div className="mt-2 text-gray-400">Weiterleitung zu Login...</div>
          </div>
        </div>
      </div>
    );
  }

  // Investigations data with proper typing
  const investigations = (investigationsData as Investigation[]) ?? [];

  // Filter investigations with proper typing
  const filteredInvestigations = investigations.filter(
    (investigation: Investigation) => {
      const matchesSearch = searchTerm
        ? investigation.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          investigation.case_number
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          investigation.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;

      const matchesCategory =
        selectedCategory === "all" ||
        investigation.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" || investigation.status === selectedStatus;
      const matchesPriority =
        selectedPriority === "all" ||
        investigation.priority === selectedPriority;

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesPriority
      );
    },
  );

  // Tab configuration
  const tabs = [
    {
      id: "overview",
      label: "Übersicht",
      icon: BarChart3,
    },
    {
      id: "investigations",
      label: "Fahndungen",
      icon: FileText,
    },
    {
      id: "users",
      label: "Benutzer",
      icon: Users,
    },
    {
      id: "media",
      label: "Medien",
      icon: ImageIcon,
    },
    // {
    //   id: "upload-test",
    //   label: "Upload Test",
    //   icon: Upload,
    // },
    {
      id: "settings",
      label: "Einstellungen",
      icon: Settings,
    },
  ];

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
            pendingRegistrations={[]} // Removed as per new_code
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
