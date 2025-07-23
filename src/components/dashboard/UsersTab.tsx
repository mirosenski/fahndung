"use client";

import {
  Users,
  UserCheck,
  UserX,
  Crown,
  Edit,
  Plus,
  Search,
  Eye,
  Trash2,
  Clock,
  Activity,
  Shield,
} from "lucide-react";
import { useCallback } from "react";
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import type { UserProfile, UserActivity, AdminAction } from "~/lib/auth";
import {
  blockUser,
  unblockUser,
  changeUserRole,
  deleteUser,
  logUserActivity,
  getIsActiveFromStatus,
} from "~/lib/auth";

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

interface UsersTabProps {
  users: UserProfile[];
  selectedUser: UserProfile | null;
  setSelectedUser: (user: UserProfile | null) => void;
  userActivity: UserActivity[];
  adminActions: AdminAction[];
  pendingRegistrations: PendingRegistration[];
  userSearchTerm: string;
  setUserSearchTerm: (term: string) => void;
  filterRole: string;
  setFilterRole: (role: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  adminActiveTab: string;
  setAdminActiveTab: (tab: string) => void;
  newUserData: {
    email: string;
    name: string;
    role: "admin" | "editor" | "user";
    department: string;
    password: string;
  };
  setNewUserData: (data: {
    email: string;
    name: string;
    role: "admin" | "editor" | "user";
    department: string;
    password: string;
  }) => void;
  onLoadAdminData: () => Promise<void>;
  isAdmin: boolean;
}

export default function UsersTab({
  users,
  selectedUser,
  setSelectedUser,
  userActivity,
  adminActions,
  pendingRegistrations,
  userSearchTerm,
  setUserSearchTerm,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  adminActiveTab,
  setAdminActiveTab,
  newUserData,
  setNewUserData,
  onLoadAdminData,
  isAdmin,
}: UsersTabProps) {
  // Event Handler werden jetzt in der Komponente definiert
  const handleUserAction = useCallback(
    async (action: string, userId: string, reason?: string) => {
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
          await onLoadAdminData();
          await logUserActivity(
            "admin_action",
            `${action} für Benutzer ${userId}`,
          );
        }
      } catch (error) {
        console.error("Fehler bei Benutzeraktion:", error);
      }
    },
    [onLoadAdminData],
  );

  const handleRoleChange = useCallback(
    async (userId: string, newRole: "admin" | "editor" | "user") => {
      try {
        const success = await changeUserRole(
          userId,
          newRole,
          `Rolle geändert zu ${newRole}`,
        );
        if (success) {
          await onLoadAdminData();
          await logUserActivity(
            "admin_action",
            `Rolle für Benutzer ${userId} zu ${newRole} geändert`,
          );
        }
      } catch (error) {
        console.error("Fehler bei Rollenänderung:", error);
      }
    },
    [onLoadAdminData],
  );

  const handleLoadUserDetails = useCallback(async (user: UserProfile) => {
    try {
      // Hier könnte die Logik für das Laden von Benutzerdetails implementiert werden
      console.log("Lade Details für Benutzer:", user);
    } catch (error) {
      console.error("Fehler beim Laden der Benutzerdetails:", error);
    }
  }, []);

  const handleCreateUser = useCallback(async () => {
    try {
      // Hier könnte die Logik für das Erstellen eines neuen Benutzers implementiert werden
      console.log("Erstelle neuen Benutzer:", newUserData);
      await onLoadAdminData();
    } catch (error) {
      console.error("Fehler beim Erstellen des Benutzers:", error);
    }
  }, [newUserData, onLoadAdminData]);

  const handleApproveRegistration = useCallback(
    async (registrationId: string, notes?: string) => {
      try {
        // Hier könnte die Logik für das Genehmigen einer Registrierung implementiert werden
        console.log("Genehmige Registrierung:", registrationId, notes);
        await onLoadAdminData();
      } catch (error) {
        console.error("Fehler beim Genehmigen der Registrierung:", error);
      }
    },
    [onLoadAdminData],
  );

  const handleRejectRegistration = useCallback(
    async (registrationId: string, notes?: string) => {
      try {
        // Hier könnte die Logik für das Ablehnen einer Registrierung implementiert werden
        console.log("Lehne Registrierung ab:", registrationId, notes);
        await onLoadAdminData();
      } catch (error) {
        console.error("Fehler beim Ablehnen der Registrierung:", error);
      }
    },
    [onLoadAdminData],
  );

  const filteredUsers = users.filter((user) => {
    const emailMatch =
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ?? false;
    const nameMatch =
      user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ?? false;
    const matchesSearch = [emailMatch, nameMatch].some(Boolean);
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && getIsActiveFromStatus(user.status)) ||
      (filterStatus === "blocked" && !getIsActiveFromStatus(user.status));

    return matchesSearch && matchesRole && matchesStatus;
  });

  const userStats = {
    total: users.length,
    active: users.filter((u) => getIsActiveFromStatus(u.status)).length,
    blocked: users.filter((u) => !getIsActiveFromStatus(u.status)).length,
    admins: users.filter((u) => u.role === "admin").length,
    editors: users.filter((u) => u.role === "editor").length,
    users: users.filter((u) => u.role === "user").length,
  };

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
            Admin-Zugriff erforderlich
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Nur Administratoren können die Benutzerverwaltung einsehen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
        <StatCard
          icon={Users}
          title="Gesamt Benutzer"
          value={userStats.total}
          color="blue"
        />
        <StatCard
          icon={UserCheck}
          title="Aktiv"
          value={userStats.active}
          color="green"
        />
        <StatCard
          icon={UserX}
          title="Gesperrt"
          value={userStats.blocked}
          color="red"
        />
        <StatCard
          icon={Crown}
          title="Admins"
          value={userStats.admins}
          color="yellow"
        />
        <StatCard
          icon={Edit}
          title="Editoren"
          value={userStats.editors}
          color="blue"
        />
        <StatCard
          icon={Users}
          title="Benutzer"
          value={userStats.users}
          color="gray"
        />
      </div>

      {/* Admin Tabs */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-700">
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

        <div className="p-6">
          {adminActiveTab === "users" && (
            <AdminUserList
              filteredUsers={filteredUsers}
              userSearchTerm={userSearchTerm}
              setUserSearchTerm={setUserSearchTerm}
              filterRole={filterRole}
              setFilterRole={setFilterRole}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onLoadAdminData={onLoadAdminData}
              setAdminActiveTab={setAdminActiveTab}
              onUserAction={handleUserAction}
              onRoleChange={handleRoleChange}
              onLoadUserDetails={handleLoadUserDetails}
            />
          )}

          {adminActiveTab === "pending-registrations" && (
            <PendingRegistrations
              pendingRegistrations={pendingRegistrations}
              onLoadAdminData={onLoadAdminData}
              onApproveRegistration={handleApproveRegistration}
              onRejectRegistration={handleRejectRegistration}
            />
          )}

          {adminActiveTab === "activity" && selectedUser && (
            <UserActivityList
              selectedUser={selectedUser}
              userActivity={userActivity}
              setSelectedUser={(user) => setSelectedUser(user)}
            />
          )}

          {adminActiveTab === "admin-actions" && (
            <AdminActionsList adminActions={adminActions} />
          )}

          {adminActiveTab === "create-user" && (
            <CreateUserForm
              newUserData={newUserData}
              setNewUserData={setNewUserData}
              onCreateUser={handleCreateUser}
              setAdminActiveTab={setAdminActiveTab}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  color: "blue" | "green" | "yellow" | "red" | "gray";
}

function StatCard({ icon: Icon, title, value, color }: StatCardProps) {
  const colorClasses = {
    blue: "text-blue-500",
    green: "text-green-500",
    yellow: "text-yellow-500",
    red: "text-red-500",
    gray: "text-gray-500",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center space-x-3">
        <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

interface AdminUserListProps {
  filteredUsers: UserProfile[];
  userSearchTerm: string;
  setUserSearchTerm: (term: string) => void;
  filterRole: string;
  setFilterRole: (role: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  onLoadAdminData: () => Promise<void>;
  setAdminActiveTab: (tab: string) => void;
  onUserAction: (
    action: string,
    userId: string,
    reason?: string,
  ) => Promise<void>;
  onRoleChange: (
    userId: string,
    newRole: "admin" | "editor" | "user",
  ) => Promise<void>;
  onLoadUserDetails: (user: UserProfile) => Promise<void>;
}

function AdminUserList({
  filteredUsers,
  userSearchTerm,
  setUserSearchTerm,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  onLoadAdminData,
  setAdminActiveTab,
  onUserAction,
  onRoleChange,
  onLoadUserDetails,
}: AdminUserListProps) {
  return (
    <div className="space-y-6">
      {/* User Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Suche
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Benutzer durchsuchen..."
              className="input-dark-mode py-2 pl-10 pr-4"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Rolle
          </label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="select-dark-mode"
          >
            <option value="all">Alle Rollen</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="user">Benutzer</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select-dark-mode"
          >
            <option value="all">Alle Status</option>
            <option value="active">Aktiv</option>
            <option value="blocked">Gesperrt</option>
          </select>
        </div>

        <div className="flex items-end space-x-2">
          <button
            onClick={() => void onLoadAdminData()}
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
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.name ?? "Kein Name"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-red-500/20 text-red-600 dark:text-red-400"
                        : user.role === "editor"
                          ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                          : "bg-green-500/20 text-green-600 dark:text-green-400"
                    }`}
                  >
                    {user.role}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      getIsActiveFromStatus(user.status)
                        ? "bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-red-500/20 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {getIsActiveFromStatus(user.status) ? "Aktiv" : "Gesperrt"}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => void onLoadUserDetails(user)}
                  className="p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-white"
                  title="Details anzeigen"
                >
                  <Eye className="h-4 w-4" />
                </button>

                <select
                  value={user.role}
                  onChange={(e) =>
                    void onRoleChange(
                      user.user_id,
                      e.target.value as "admin" | "editor" | "user",
                    )
                  }
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="user">Benutzer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>

                {getIsActiveFromStatus(user.status) ? (
                  <button
                    onClick={() =>
                      void onUserAction(
                        "block",
                        user.user_id,
                        "Manuell gesperrt",
                      )
                    }
                    className="p-2 text-red-400 transition-colors hover:text-red-600 dark:hover:text-red-300"
                    title="Benutzer sperren"
                  >
                    <UserX className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      void onUserAction(
                        "unblock",
                        user.user_id,
                        "Manuell entsperrt",
                      )
                    }
                    className="p-2 text-green-400 transition-colors hover:text-green-600 dark:hover:text-green-300"
                    title="Benutzer entsperren"
                  >
                    <UserCheck className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() =>
                    void onUserAction(
                      "delete",
                      user.user_id,
                      "Manuell gelöscht",
                    )
                  }
                  className="p-2 text-red-400 transition-colors hover:text-red-600 dark:hover:text-red-300"
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
            <h3 className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
              Keine Benutzer gefunden
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Es wurden keine Benutzer mit den aktuellen Filtern gefunden.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface PendingRegistrationsProps {
  pendingRegistrations: PendingRegistration[];
  onLoadAdminData: () => Promise<void>;
  onApproveRegistration: (
    registrationId: string,
    notes?: string,
  ) => Promise<void>;
  onRejectRegistration: (
    registrationId: string,
    notes?: string,
  ) => Promise<void>;
}

function PendingRegistrations({
  pendingRegistrations,
  onLoadAdminData,
  onApproveRegistration,
  onRejectRegistration,
}: PendingRegistrationsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ausstehende Registrierungen ({pendingRegistrations.length})
        </h3>
        <button
          onClick={() => void onLoadAdminData()}
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
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {registration.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {registration.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Abteilung: {registration.department ?? "Nicht angegeben"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Telefon: {registration.phone ?? "Nicht angegeben"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Registriert:{" "}
                    {new Date(registration.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const notes = prompt(
                        "Notizen zur Genehmigung (optional):",
                      );
                      void onApproveRegistration(
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
                      const notes = prompt("Grund für Ablehnung (optional):");
                      void onRejectRegistration(
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
            <h3 className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
              Keine ausstehenden Registrierungen
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Alle Registrierungen wurden bearbeitet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface UserActivityListProps {
  selectedUser: UserProfile;
  userActivity: UserActivity[];
  setSelectedUser: (user: UserProfile | null) => void;
}

function UserActivityList({
  selectedUser,
  userActivity,
  setSelectedUser,
}: UserActivityListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Aktivitäten für {selectedUser.email}
        </h3>
        <button
          onClick={() => setSelectedUser(null)}
          className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-white"
        >
          Schließen
        </button>
      </div>

      <div className="space-y-4">
        {userActivity.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div>
              <p className="text-gray-900 dark:text-white">
                {activity.activity_type}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activity.description ?? "Keine Beschreibung"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(activity.created_at).toLocaleString()}
              </p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {activity.ip_address}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AdminActionsListProps {
  adminActions: AdminAction[];
}

function AdminActionsList({ adminActions }: AdminActionsListProps) {
  return (
    <div className="space-y-4">
      {adminActions.map((action) => (
        <div
          key={action.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div>
            <p className="text-gray-900 dark:text-white">
              {action.action_type}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {action.description ?? "Keine Beschreibung"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(action.created_at).toLocaleString()}
            </p>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            Admin ID: {action.admin_id}
          </span>
        </div>
      ))}
    </div>
  );
}

interface CreateUserFormProps {
  newUserData: {
    email: string;
    name: string;
    role: "admin" | "editor" | "user";
    department: string;
    password: string;
  };
  setNewUserData: (data: {
    email: string;
    name: string;
    role: "admin" | "editor" | "user";
    department: string;
    password: string;
  }) => void;
  onCreateUser: () => Promise<void>;
  setAdminActiveTab: (tab: string) => void;
}

function CreateUserForm({
  newUserData,
  setNewUserData,
  onCreateUser,
  setAdminActiveTab,
}: CreateUserFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Neuen Benutzer erstellen
        </h3>
        <button
          onClick={() => setAdminActiveTab("users")}
          className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-white"
        >
          Zurück zu Benutzern
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            className="input-dark-mode"
            placeholder="benutzer@example.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            className="input-dark-mode"
            placeholder="Vollständiger Name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Rolle *
          </label>
          <select
            value={newUserData.role}
            onChange={(e) =>
              setNewUserData({
                ...newUserData,
                role: e.target.value as "admin" | "editor" | "user",
              })
            }
            className="select-dark-mode"
          >
            <option value="user">Benutzer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            className="input-dark-mode"
            placeholder="z.B. Kriminalpolizei"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            className="input-dark-mode"
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
          onClick={() => void onCreateUser()}
          className="rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700"
        >
          Benutzer erstellen
        </button>
      </div>
    </div>
  );
}
