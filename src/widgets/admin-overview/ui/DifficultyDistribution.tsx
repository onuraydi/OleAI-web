import type { AdminDashboardStats } from "@/entities/admin-dashboard";

interface DifficultyDistributionProps {
  stats: AdminDashboardStats | undefined;
  isLoading: boolean;
}

interface DifficultySlice {
  name: string;
  value: number;
  color: string;
}

const fmt = new Intl.NumberFormat("tr-TR");

function buildData(stats: AdminDashboardStats): DifficultySlice[] {
  return [
    { name: "Kolay", value: stats.easyRecipes ?? 0, color: "#22c55e" },
    { name: "Orta", value: stats.mediumRecipes ?? 0, color: "#f59e0b" },
    { name: "Zor", value: stats.hardRecipes ?? 0, color: "#ef4444" },
  ];
}

function Skeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 h-full flex flex-col">
      <div className="space-y-2 mb-6">
        <div className="h-5 w-44 bg-muted rounded animate-pulse" />
        <div className="h-4 w-56 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex-1 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            <div className="flex-1 h-8 bg-muted/40 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export const DifficultyDistribution = ({
  stats,
  isLoading,
}: DifficultyDistributionProps) => {
  if (isLoading || !stats) {
    return <Skeleton />;
  }

  const data = buildData(stats);
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-1">
          Zorluk Dağılımı
        </h2>
        <p className="text-sm text-muted-foreground">
          Tariflerin zorluk seviyesine göre dağılımı
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-5">
        {data.map((item) => {
          const percentage = (item.value / maxVal) * 100;
          return (
            <div key={item.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {item.name}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {fmt.format(item.value)}
                </span>
              </div>
              <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
