import { BarChart3, Eye, FileText, AlertTriangle } from "lucide-react";
import UniversalBadge from "@/components/ui/UniversalBadge";
import { CaseNumberDetailed } from "~/components/ui/CaseNumberDisplay";

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

interface OverviewTabProps {
  investigations: Investigation[];
  investigationsLoading: boolean;
}

export default function OverviewTab({
  investigations,
  investigationsLoading,
}: OverviewTabProps) {
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

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BarChart3}
          title="Gesamt Fahndungen"
          value={stats.total}
          loading={investigationsLoading}
          color="blue"
        />
        <StatCard
          icon={Eye}
          title="Veröffentlicht"
          value={stats.published}
          loading={investigationsLoading}
          color="green"
        />
        <StatCard
          icon={FileText}
          title="Entwürfe"
          value={stats.draft}
          loading={investigationsLoading}
          color="yellow"
        />
        <StatCard
          icon={AlertTriangle}
          title="Dringend"
          value={stats.urgent}
          loading={investigationsLoading}
          color="red"
        />
      </div>

      {/* Recent Investigations */}
      <RecentInvestigationsList investigations={investigations.slice(0, 5)} />
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  loading: boolean;
  color: "blue" | "green" | "yellow" | "red";
}

function StatCard({ icon: Icon, title, value, loading, color }: StatCardProps) {
  const colorClasses = {
    blue: "text-blue-500",
    green: "text-green-500",
    yellow: "text-yellow-500",
    red: "text-red-500",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center space-x-3">
        <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {loading ? "..." : value}
          </p>
        </div>
      </div>
    </div>
  );
}

interface RecentInvestigationsListProps {
  investigations: Investigation[];
}

function RecentInvestigationsList({
  investigations,
}: RecentInvestigationsListProps) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Neueste Fahndungen
      </h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6">
          {investigations.map((investigation) => (
            <div
              key={investigation.id}
              className="flex items-center justify-between border-b border-gray-200 py-3 last:border-b-0 dark:border-gray-700"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {investigation.title}
                </h3>
                                  <CaseNumberDetailed caseNumber={investigation.case_number} />
              </div>
              <div className="flex items-center space-x-2">
                <UniversalBadge
                  content={investigation.priority}
                  variant="priority"
                  className={`${
                    investigation.priority === "urgent"
                      ? "bg-red-500/20 text-red-600 dark:text-red-400"
                      : investigation.priority === "new"
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                  }`}
                />
                <UniversalBadge
                  content={investigation.status}
                  variant="status"
                  className={`${
                    investigation.status === "published"
                      ? "bg-green-500/20 text-green-600 dark:text-green-400"
                      : investigation.status === "active"
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : investigation.status === "draft"
                          ? "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                          : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
