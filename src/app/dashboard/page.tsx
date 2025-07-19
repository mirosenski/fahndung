"use client";
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Settings,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Upload,
  BarChart3,
  FileText,
  Users,
  Image as ImageIcon,
  Globe,
  Shield,
  UserCheck,
  UserX,
  Crown,
  Activity,
  Clock,
} from "lucide-react";
import { api } from "~/trpc/react";
import { supabase } from "~/lib/supabase";
import {
  isAdmin,
  isEditor,
  getAllUsers,
  getUserActivity,
  blockUser,
  unblockUser,
  changeUserRole,
  deleteUser,
  getAdminActions,
  logUserActivity,
} from "~/lib/auth";
import type { UserProfile, UserActivity, AdminAction } from "~/lib/auth";
import Header from "~/components/layout/Header";
import { useAuth } from "~/hooks/useAuth";

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
  const { session, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Admin state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);

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

  // tRPC Queries
  const { data: investigationsData } = api.post.getInvestigations.useQuery({
    limit: 100,
    offset: 0,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
    }
  }, [session, loading, router]);

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

  // Statistics
  const stats = {
    total: investigations.length,
    published: investigations.filter((i) => i.status === "published").length,
    draft: investigations.filter((i) => i.status === "draft").length,
    urgent: investigations.filter((i) => i.priority === "urgent").length,
    thisMonth: investigations.filter((i) => {
      const date = new Date(i.created_at);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleCreateInvestigation = () => {
    router.push("/wizard");
  };

  // Admin functions
  const loadAdminData = useCallback(async () => {
    if (!session?.profile || !isAdmin(session.profile)) return;

    try {
      const [usersData, actionsData, registrationsData] = await Promise.all([
        getAllUsers(),
        getAdminActions(),
        supabase
          ?.from("pending_registrations")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
      ]);

      setUsers(usersData);
      setAdminActions(actionsData);
      setPendingRegistrations(registrationsData?.data ?? []);
    } catch (error) {
      console.error("Fehler beim Laden der Admin-Daten:", error);
    }
  }, [session?.profile]);

  const handleUserAction = async (
    action: string,
    userId: string,
    reason?: string,
  ) => {
    try {
      let success = false;

      switch (action) {
        case "block":
          success = await blockUser(userId, reason);
          break;
        case "unblock":
          success = await unblockUser(userId, reason);
          break;
        case "delete":
          if (
            confirm(
              "Benutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
            )
          ) {
            success = await deleteUser(userId, reason);
          }
          break;
      }

      if (success) {
        await loadAdminData();
        await logUserActivity(
          "admin_action",
          `${action} für Benutzer ${userId}`,
        );
      }
    } catch (error) {
      console.error("Fehler bei Benutzeraktion:", error);
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "editor" | "user",
  ) => {
    try {
      const success = await changeUserRole(
        userId,
        newRole,
        `Rolle geändert zu ${newRole}`,
      );
      if (success) {
        await loadAdminData();
        await logUserActivity(
          "admin_action",
          `Rolle für Benutzer ${userId} zu ${newRole} geändert`,
        );
      }
    } catch (error) {
      console.error("Fehler beim Ändern der Rolle:", error);
    }
  };

  const loadUserDetails = async (user: UserProfile) => {
    setSelectedUser(user);
    try {
      const activity = await getUserActivity(user.user_id);
      setUserActivity(activity);
    } catch (error) {
      console.error("Fehler beim Laden der Benutzerdetails:", error);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Hier würde die tatsächliche Benutzererstellung stattfinden
      // Für jetzt simulieren wir es
      alert("Benutzererstellung wird implementiert...");

      // Reset form
      setNewUserData({
        email: "",
        name: "",
        role: "user",
        department: "",
        password: "",
      });

      setAdminActiveTab("users");
      await loadAdminData();
    } catch (error) {
      console.error("Fehler beim Erstellen des Benutzers:", error);
    }
  };

  const handleApproveRegistration = async (
    registrationId: string,
    notes?: string,
  ) => {
    try {
      if (!supabase) return;

      const { error } = await supabase.rpc("approve_registration", {
        registration_id: registrationId,
        admin_notes: notes,
      });

      if (error) {
        console.error("Fehler beim Genehmigen:", error);
        alert("Fehler beim Genehmigen der Registrierung");
      } else {
        alert("Registrierung erfolgreich genehmigt!");
        await loadAdminData();
      }
    } catch (error) {
      console.error("Fehler beim Genehmigen der Registrierung:", error);
    }
  };

  const handleRejectRegistration = async (
    registrationId: string,
    notes?: string,
  ) => {
    try {
      if (!supabase) return;

      const { error } = await supabase.rpc("reject_registration", {
        registration_id: registrationId,
        admin_notes: notes,
      });

      if (error) {
        console.error("Fehler beim Ablehnen:", error);
        alert("Fehler beim Ablehnen der Registrierung");
      } else {
        alert("Registrierung erfolgreich abgelehnt!");
        await loadAdminData();
      }
    } catch (error) {
      console.error("Fehler beim Ablehnen der Registrierung:", error);
    }
  };

  // Load admin data when session is available and user is admin
  useEffect(() => {
    if (session?.profile && isAdmin(session.profile)) {
      void loadAdminData();
    }
  }, [session, loadAdminData]);

  const filteredUsers = users.filter((user) => {
    const emailMatch =
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ?? false;
    const nameMatch =
      user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ?? false;
    const matchesSearch = [emailMatch, nameMatch].some(Boolean);
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "blocked" && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const userStats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    blocked: users.filter((u) => !u.is_active).length,
    admins: users.filter((u) => u.role === "admin").length,
    editors: users.filter((u) => u.role === "editor").length,
    users: users.filter((u) => u.role === "user").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
          <p className="text-white">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
          <div className="border-b border-white/10">
            <nav className="flex space-x-8">
              {[
                { id: "overview", label: "Übersicht", icon: BarChart3 },
                { id: "investigations", label: "Fahndungen", icon: FileText },
                { id: "media", label: "Medien", icon: ImageIcon },
                { id: "users", label: "Benutzer", icon: Users },
                { id: "settings", label: "Einstellungen", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex cursor-pointer items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
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
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-400">Gesamt Fahndungen</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <div className="flex items-center space-x-3">
                  <Globe className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-400">Veröffentlicht</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.published}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-400">Entwürfe</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.draft}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-400">Dringend</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.urgent}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Investigations */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Neueste Fahndungen
              </h2>
              <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <div className="p-6">
                  {filteredInvestigations.slice(0, 5).map((investigation) => (
                    <div
                      key={investigation.id}
                      className="flex items-center justify-between border-b border-white/10 py-3 last:border-b-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-white">
                          {investigation.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {investigation.case_number}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            investigation.priority === "urgent"
                              ? "bg-red-500/20 text-red-400"
                              : investigation.priority === "high"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {investigation.priority}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            investigation.status === "published"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {investigation.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "investigations" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Suche
                  </label>
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Fahndungen durchsuchen..."
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Kategorie
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">Alle Kategorien</option>
                    <option value="vermisst">Vermisst</option>
                    <option value="gesucht">Gesucht</option>
                    <option value="warnung">Warnung</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">Alle Status</option>
                    <option value="published">Veröffentlicht</option>
                    <option value="draft">Entwurf</option>
                    <option value="archived">Archiviert</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Priorität
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">Alle Prioritäten</option>
                    <option value="urgent">Dringend</option>
                    <option value="high">Hoch</option>
                    <option value="medium">Mittel</option>
                    <option value="low">Niedrig</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Investigations List */}
            <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    Fahndungen ({filteredInvestigations.length})
                  </h2>
                  {isEditor(session.profile) && (
                    <button
                      onClick={handleCreateInvestigation}
                      className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Neue Fahndung</span>
                    </button>
                  )}
                </div>

                {filteredInvestigations.length > 0 ? (
                  <div className="space-y-4">
                    {filteredInvestigations.map((investigation) => (
                      <div
                        key={investigation.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-white">
                            {investigation.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {investigation.case_number}
                          </p>
                          <p className="text-sm text-gray-400">
                            {investigation.location}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              investigation.priority === "urgent"
                                ? "bg-red-500/20 text-red-400"
                                : investigation.priority === "high"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {investigation.priority}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              investigation.status === "published"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {investigation.status}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button className="p-1 text-gray-400 transition-colors hover:text-white">
                              <Eye className="h-4 w-4" />
                            </button>
                            {isEditor(session.profile) && (
                              <>
                                <button className="p-1 text-gray-400 transition-colors hover:text-white">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="p-1 text-red-400 transition-colors hover:text-red-300">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-400">
                      Keine Fahndungen gefunden
                    </h3>
                    <p className="text-gray-500">
                      Erstellen Sie Ihre erste Fahndung, um zu beginnen.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Medienverwaltung
                </h2>
                <button className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </button>
              </div>
              <p className="text-gray-400">
                Medienverwaltung wird implementiert...
              </p>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            {isAdmin(session?.profile) ? (
              <>
                {/* Admin Statistics */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-400">Gesamt Benutzer</p>
                        <p className="text-2xl font-bold text-white">
                          {userStats.total}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-400">Aktiv</p>
                        <p className="text-2xl font-bold text-white">
                          {userStats.active}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center space-x-3">
                      <UserX className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-400">Gesperrt</p>
                        <p className="text-2xl font-bold text-white">
                          {userStats.blocked}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center space-x-3">
                      <Crown className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-400">Admins</p>
                        <p className="text-2xl font-bold text-white">
                          {userStats.admins}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center space-x-3">
                      <Edit className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-400">Editoren</p>
                        <p className="text-2xl font-bold text-white">
                          {userStats.editors}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-400">Benutzer</p>
                        <p className="text-2xl font-bold text-white">
                          {userStats.users}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Tabs */}
                <div className="rounded-lg border border-white/10 bg-white/5">
                  <div className="border-b border-white/10">
                    <nav className="flex space-x-8 px-6">
                      {[
                        { id: "users", label: "Benutzer", icon: Users },
                        {
                          id: "pending-registrations",
                          label: "Ausstehende Registrierungen",
                          icon: Clock,
                        },
                        {
                          id: "activity",
                          label: "Aktivitäten",
                          icon: Activity,
                        },
                        {
                          id: "admin-actions",
                          label: "Admin Aktionen",
                          icon: Shield,
                        },
                        {
                          id: "create-user",
                          label: "Neuer Benutzer",
                          icon: Plus,
                        },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setAdminActiveTab(tab.id)}
                            className={`flex cursor-pointer items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                              adminActiveTab === tab.id
                                ? "border-blue-500 text-blue-400"
                                : "border-transparent text-gray-400 hover:text-gray-300"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="p-6">
                    {adminActiveTab === "users" && (
                      <div className="space-y-6">
                        {/* User Filters */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                              Suche
                            </label>
                            <div className="relative">
                              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                value={userSearchTerm}
                                onChange={(e) =>
                                  setUserSearchTerm(e.target.value)
                                }
                                placeholder="Benutzer durchsuchen..."
                                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                              Rolle
                            </label>
                            <select
                              value={filterRole}
                              onChange={(e) => setFilterRole(e.target.value)}
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            >
                              <option value="all">Alle Rollen</option>
                              <option value="admin">Admin</option>
                              <option value="editor">Editor</option>
                              <option value="user">Benutzer</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                              Status
                            </label>
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            >
                              <option value="all">Alle Status</option>
                              <option value="active">Aktiv</option>
                              <option value="blocked">Gesperrt</option>
                            </select>
                          </div>

                          <div className="flex items-end space-x-2">
                            <button
                              onClick={() => void loadAdminData()}
                              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                            >
                              Aktualisieren
                            </button>
                            <button
                              onClick={() => setAdminActiveTab("create-user")}
                              className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                            >
                              <Plus className="mr-1 inline h-4 w-4" />
                              Neuer Benutzer
                            </button>
                          </div>
                        </div>

                        {/* Users List */}
                        <div className="space-y-4">
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <div>
                                      <h3 className="font-medium text-white">
                                        {user.email}
                                      </h3>
                                      <p className="text-sm text-gray-400">
                                        {user.name ?? "Kein Name"}
                                      </p>
                                    </div>
                                    <span
                                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                                        user.role === "admin"
                                          ? "bg-red-500/20 text-red-400"
                                          : user.role === "editor"
                                            ? "bg-blue-500/20 text-blue-400"
                                            : "bg-green-500/20 text-green-400"
                                      }`}
                                    >
                                      {user.role}
                                    </span>
                                    <span
                                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                                        user.is_active
                                          ? "bg-green-500/20 text-green-400"
                                          : "bg-red-500/20 text-red-400"
                                      }`}
                                    >
                                      {user.is_active ? "Aktiv" : "Gesperrt"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => void loadUserDetails(user)}
                                    className="p-2 text-gray-400 transition-colors hover:text-white"
                                    title="Details anzeigen"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>

                                  <select
                                    value={user.role}
                                    onChange={(e) =>
                                      void handleRoleChange(
                                        user.user_id,
                                        e.target.value as
                                          | "admin"
                                          | "editor"
                                          | "user",
                                      )
                                    }
                                    className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                                  >
                                    <option value="user">Benutzer</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                  </select>

                                  {user.is_active ? (
                                    <button
                                      onClick={() =>
                                        void handleUserAction(
                                          "block",
                                          user.user_id,
                                          "Manuell gesperrt",
                                        )
                                      }
                                      className="p-2 text-red-400 transition-colors hover:text-red-300"
                                      title="Benutzer sperren"
                                    >
                                      <UserX className="h-4 w-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        void handleUserAction(
                                          "unblock",
                                          user.user_id,
                                          "Manuell entsperrt",
                                        )
                                      }
                                      className="p-2 text-green-400 transition-colors hover:text-green-300"
                                      title="Benutzer entsperren"
                                    >
                                      <UserCheck className="h-4 w-4" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      void handleUserAction(
                                        "delete",
                                        user.user_id,
                                        "Manuell gelöscht",
                                      )
                                    }
                                    className="p-2 text-red-400 transition-colors hover:text-red-300"
                                    title="Benutzer löschen"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center">
                              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                              <h3 className="mb-2 text-lg font-medium text-gray-400">
                                Keine Benutzer gefunden
                              </h3>
                              <p className="text-gray-500">
                                Es wurden keine Benutzer mit den aktuellen
                                Filtern gefunden.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {adminActiveTab === "pending-registrations" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">
                            Ausstehende Registrierungen (
                            {pendingRegistrations.length})
                          </h3>
                          <button
                            onClick={() => void loadAdminData()}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                          >
                            Aktualisieren
                          </button>
                        </div>

                        <div className="space-y-4">
                          {pendingRegistrations.length > 0 ? (
                            pendingRegistrations.map((registration) => (
                              <div
                                key={registration.id}
                                className="rounded-lg border border-white/10 bg-white/5 p-4"
                              >
                                <div className="mb-4 flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-white">
                                      {registration.name}
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      {registration.email}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Abteilung:{" "}
                                      {registration.department ??
                                        "Nicht angegeben"}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Telefon:{" "}
                                      {registration.phone ?? "Nicht angegeben"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Registriert:{" "}
                                      {new Date(
                                        registration.created_at,
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        const notes = prompt(
                                          "Notizen zur Genehmigung (optional):",
                                        );
                                        void handleApproveRegistration(
                                          registration.id,
                                          notes ?? undefined,
                                        );
                                      }}
                                      className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
                                    >
                                      Genehmigen
                                    </button>
                                    <button
                                      onClick={() => {
                                        const notes = prompt(
                                          "Grund für Ablehnung (optional):",
                                        );
                                        void handleRejectRegistration(
                                          registration.id,
                                          notes ?? undefined,
                                        );
                                      }}
                                      className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
                                    >
                                      Ablehnen
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center">
                              <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                              <h3 className="mb-2 text-lg font-medium text-gray-400">
                                Keine ausstehenden Registrierungen
                              </h3>
                              <p className="text-gray-500">
                                Alle Registrierungen wurden bearbeitet.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {adminActiveTab === "activity" && selectedUser && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">
                            Aktivitäten für {selectedUser.email}
                          </h3>
                          <button
                            onClick={() => setSelectedUser(null)}
                            className="text-gray-400 transition-colors hover:text-white"
                          >
                            Schließen
                          </button>
                        </div>

                        <div className="space-y-4">
                          {userActivity.map((activity) => (
                            <div
                              key={activity.id}
                              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                            >
                              <div>
                                <p className="text-white">
                                  {activity.activity_type}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {activity.description ?? "Keine Beschreibung"}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {new Date(
                                    activity.created_at,
                                  ).toLocaleString()}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {activity.ip_address}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {adminActiveTab === "admin-actions" && (
                      <div className="space-y-4">
                        {adminActions.map((action) => (
                          <div
                            key={action.id}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                          >
                            <div>
                              <p className="text-white">{action.action_type}</p>
                              <p className="text-sm text-gray-400">
                                {action.description ?? "Keine Beschreibung"}
                              </p>
                              <p className="text-sm text-gray-400">
                                {new Date(action.created_at).toLocaleString()}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              Admin ID: {action.admin_id}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {adminActiveTab === "create-user" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">
                            Neuen Benutzer erstellen
                          </h3>
                          <button
                            onClick={() => setAdminActiveTab("users")}
                            className="text-gray-400 transition-colors hover:text-white"
                          >
                            Zurück zu Benutzern
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                              E-Mail *
                            </label>
                            <input
                              type="email"
                              value={newUserData.email}
                              onChange={(e) =>
                                setNewUserData({
                                  ...newUserData,
                                  email: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                              placeholder="benutzer@example.com"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                              Name
                            </label>
                            <input
                              type="text"
                              value={newUserData.name}
                              onChange={(e) =>
                                setNewUserData({
                                  ...newUserData,
                                  name: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                              placeholder="Vollständiger Name"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                              Rolle *
                            </label>
                            <select
                              value={newUserData.role}
                              onChange={(e) =>
                                setNewUserData({
                                  ...newUserData,
                                  role: e.target.value as
                                    | "admin"
                                    | "editor"
                                    | "user",
                                })
                              }
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            >
                              <option value="user">Benutzer</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                              Abteilung
                            </label>
                            <input
                              type="text"
                              value={newUserData.department}
                              onChange={(e) =>
                                setNewUserData({
                                  ...newUserData,
                                  department: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                              placeholder="z.B. Kriminalpolizei"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                              Passwort *
                            </label>
                            <input
                              type="password"
                              value={newUserData.password}
                              onChange={(e) =>
                                setNewUserData({
                                  ...newUserData,
                                  password: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                              placeholder="Sicheres Passwort"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => setAdminActiveTab("users")}
                            className="rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700"
                          >
                            Abbrechen
                          </button>
                          <button
                            onClick={() => void handleCreateUser()}
                            className="rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700"
                          >
                            Benutzer erstellen
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <div className="text-center">
                  <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-400">
                    Admin-Zugriff erforderlich
                  </h3>
                  <p className="text-gray-500">
                    Nur Administratoren können die Benutzerverwaltung einsehen.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Einstellungen
              </h2>
              <p className="text-gray-400">
                Einstellungen werden implementiert...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
