import type { AdminDashboardStats } from "@/entities/admin-dashboard";

interface RecipeStatusChartProps {
  stats: AdminDashboardStats | undefined;
  isLoading: boolean;
}

interface StatusSlice {
  name: string;
  value: number;
  color: string;
}

const fmt = new Intl.NumberFormat("tr-TR");

function buildSlices(stats: AdminDashboardStats): StatusSlice[] {
  return [
    { name: "Yayında", value: stats.recipesPublished, color: "#22c55e" },
    { name: "Admin Onayı", value: stats.recipesPendingAdmin, color: "#3b82f6" },
    { name: "LLM İşlemi", value: stats.recipesPendingLlm, color: "#f59e0b" },
    { name: "Reddedilen", value: stats.recipesRejected, color: "#ef4444" },
  ];
}

function ChartSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 h-full flex flex-col">
      <div className="space-y-2 mb-6">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        <div className="h-4 w-52 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-48 h-48 rounded-full bg-muted/40 animate-pulse" />
      </div>
    </div>
  );
}

export const RecipeStatusChart = ({ stats, isLoading }: RecipeStatusChartProps) => {
  if (isLoading || !stats) {
    return <ChartSkeleton />;
  }

  let slices = buildSlices(stats).filter((s) => s.value > 0);
  const total = buildSlices(stats).reduce((sum, s) => sum + s.value, 0);

  if (slices.length === 0) {
    slices = [{ name: "Veri Yok", value: 1, color: "hsl(var(--muted))" }];
  }

  // Native SVG Donut variables
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  let currentOffset = 0;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground mb-1">
          Tarif Durumları
        </h2>
        <p className="text-sm text-muted-foreground">
          Tariflerin onay sürecindeki dağılımı
        </p>
      </div>

      <div className="relative h-[220px] mt-2 w-full flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {slices.map((slice) => {
            const slicePercentage = slice.value / Math.max(total, 1); // fallback to 1 if total is 0 to avoid NaN
            const strokeLength = slicePercentage * circumference;
            const strokeDasharray = `${strokeLength} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            
            // eslint-disable-next-line react-hooks/immutability
            currentOffset += strokeLength;

            return (
              <circle
                key={slice.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap={slices.length === 1 ? "round" : "butt"}
                className="transition-all duration-1000 ease-out"
              />
            );
          })}
        </svg>

        {/* Centered total label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{fmt.format(total)}</p>
            <p className="text-xs text-muted-foreground font-medium">Toplam</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
        {slices.map((slice) => (
          <div key={slice.name} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-muted-foreground truncate">{slice.name}</span>
            <span className="ml-auto font-semibold text-foreground">
              {slice.name === "Veri Yok" ? "0" : fmt.format(slice.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
