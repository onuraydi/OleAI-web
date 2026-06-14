import { Heart, Bookmark, ThumbsDown, Inbox, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { AdminDashboardStats } from "@/entities/admin-dashboard";
import type { LucideIcon } from "lucide-react";

interface InteractionStatsProps {
  stats: AdminDashboardStats | undefined;
  isLoading: boolean;
}

interface MetricConfig {
  label: string;
  key: keyof Pick<AdminDashboardStats, "totalLikes" | "totalSaves" | "totalDislikes">;
  icon: LucideIcon;
  iconColor: string;
  bgLight: string;
  bgDark: string;
}

const metrics: MetricConfig[] = [
  {
    label: "Beğeni",
    key: "totalLikes",
    icon: Heart,
    iconColor: "text-rose-500",
    bgLight: "bg-rose-50",
    bgDark: "dark:bg-rose-950/40",
  },
  {
    label: "Kaydetme",
    key: "totalSaves",
    icon: Bookmark,
    iconColor: "text-blue-500",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/40",
  },
  {
    label: "Beğenmeme",
    key: "totalDislikes",
    icon: ThumbsDown,
    iconColor: "text-gray-500",
    bgLight: "bg-gray-100",
    bgDark: "dark:bg-gray-800",
  },
];

const fmt = new Intl.NumberFormat("tr-TR");

function Skeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 h-full">
      <div className="h-5 w-40 bg-muted rounded animate-pulse mb-6" />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
            <div className="h-6 w-12 bg-muted rounded animate-pulse" />
            <div className="h-3 w-14 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <div className="h-10 flex-1 bg-muted rounded-xl animate-pulse" />
        <div className="h-10 flex-1 bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export const InteractionStats = ({ stats, isLoading }: InteractionStatsProps) => {
  if (isLoading || !stats) {
    return <Skeleton />;
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 h-full flex flex-col">
      <h2 className="text-lg font-bold text-foreground mb-5">
        Etkileşim İstatistikleri
      </h2>

      {/* Top row: Likes / Saves / Dislikes */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.key} className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                m.bgLight,
                m.bgDark,
              )}
            >
              <m.icon className={cn("w-5 h-5", m.iconColor)} />
            </div>
            <span className="text-xl font-bold text-foreground">
              {fmt.format(stats[m.key])}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom row: Ingredient request badges */}
      <div className="flex gap-3 mt-auto">
        <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
          <Inbox className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-lg font-bold text-amber-700 dark:text-amber-300 leading-none">
              {fmt.format(stats.pendingIngredientRequests)}
            </p>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70 font-medium mt-0.5 truncate">
              Bekleyen Talep
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 leading-none">
              {fmt.format(stats.resolvedIngredientRequests)}
            </p>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70 font-medium mt-0.5 truncate">
              Çözülen Talep
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
