"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FileText, Image as ImageIcon, Users, User } from "lucide-react";
import { api } from "~/trpc/react";
import { isAdmin, isEditor, getAllUsers, getAdminActions } from "~/lib/auth";
import type { UserProfile, UserActivity, AdminAction } from "~/lib/auth";
import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import { useAuth } from "~/hooks/useAuth";
import { LoadingSpinner } from "~/components/ui/LoadingSpinner";

// Lazy Loading für bessere HMR-Kompatibilität
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
  const [activeTab, setActiveTab] = useState("investigations");
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
    role: "user" as "admin" | "editor" | "user" | "super_admin",
    department: "",
    password: "",
  });

  // Optimierte tRPC Queries mit reduziertem Limit und besseren Optionen
  const { data: investigationsData } = api.post.getInvestigations.useQuery(
    {
      limit: 50, // Erhöht für bessere Filterung
      offset: 0,
      status: selectedStatus === "all" ? undefined : selectedStatus,
      priority: selectedPriority === "all" ? undefined : selectedPriority,
      category: selectedCategory === "all" ? undefined : selectedCategory,
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
    }
  }, [timeoutReached]);

  // Auth check with useEffect to avoid router updates during render
  useEffect(() => {
    if (initialized && !loading && !session?.user) {
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

  // Filter investigations with proper typing (nur noch Suchfilter, da Server-seitige Filterung)
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

      return matchesSearch;
    },
  );

  // Tab configuration
  const tabs = [
    {
      id: "investigations",
      label: "Fahndungen",
      icon: FileText,
    },
    {
      id: "media",
      label: "Medien",
      icon: ImageIcon,
    },
    {
      id: "users",
      label: "Benutzer",
      icon: Users,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header variant="dashboard" session={session} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* User Info */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Willkommen im Dashboard
              </h2>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Angemeldet als: {session?.user?.email || "Unbekannt"}
              </p>
            </div>
          </div>
        </div>

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

      <Footer variant="dashboard" />
    </div>
  );
}
