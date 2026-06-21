import { UserPlus, ChefHat, Activity, MoreHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { AdminDashboardStats, RecentActivityDto } from "@/entities/admin-dashboard";
import type { LucideIcon } from "lucide-react";

interface RecentActivityTimelineProps {
  stats: AdminDashboardStats | undefined;
  isLoading: boolean;
}

interface ActivityStyle {
  icon: LucideIcon;
  color: string;
  bgLight: string;
  bgDark: string;
}

const ACTIVITY_STYLES: Record<string, ActivityStyle> = {
  new_user: {
    icon: UserPlus,
    color: "text-blue-500",
    bgLight: "bg-blue-100",
    bgDark: "dark:bg-blue-900/50",
  },
  new_recipe: {
    icon: ChefHat,
    color: "text-orange-500",
    bgLight: "bg-orange-100",
    bgDark: "dark:bg-orange-900/50",
  },
};

const DEFAULT_STYLE: ActivityStyle = {
  icon: Activity,
  color: "text-gray-500",
  bgLight: "bg-gray-100",
  bgDark: "dark:bg-gray-800",
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return "Az önce";

  const seconds = Math.floor(diffMs / 1_000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  return `${Math.floor(days / 30)} ay önce`;
}

function ActivityItem({ activity }: { activity: RecentActivityDto }) {
  const style = ACTIVITY_STYLES[activity.type] ?? DEFAULT_STYLE;
  const Icon = style.icon;

  return (
    <div className="flex gap-3 items-start">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          style.bgLight,
          style.bgDark,
        )}
      >
        <Icon className={cn("w-4 h-4", style.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug line-clamp-2">
          {activity.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 h-full flex flex-col">
      <div className="h-5 w-36 bg-muted rounded animate-pulse mb-6" />
      <div className="space-y-5 flex-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const RecentActivityTimeline = ({
  stats,
  isLoading,
}: RecentActivityTimelineProps) => {
  if (isLoading || !stats) {
    return <TimelineSkeleton />;
  }

  const activities = stats.recentActivities;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-foreground">Son Aktiviteler</h2>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-1">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Henüz aktivite bulunamadı.
          </p>
        ) : (
          activities.map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
};
