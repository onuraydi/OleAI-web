import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import type { AdminDashboardStats } from "@/entities/admin-dashboard";

interface UserGrowthChartProps {
  stats: AdminDashboardStats | undefined;
  isLoading: boolean;
}

interface MergedPoint {
  date: string;
  label: string;
  users: number;
  recipes: number;
}

function mergeGrowthData(stats: AdminDashboardStats): MergedPoint[] {
  const map = new Map<string, MergedPoint>();

  for (const point of stats.userGrowth) {
    const d = new Date(point.date);
    const label = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    map.set(point.date, { date: point.date, label, users: point.count, recipes: 0 });
  }

  for (const point of stats.recipeGrowth) {
    const existing = map.get(point.date);
    if (existing) {
      existing.recipes = point.count;
    } else {
      const d = new Date(point.date);
      const label = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
      map.set(point.date, { date: point.date, label, users: 0, recipes: point.count });
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 h-full flex flex-col">
      <div className="space-y-2 mb-6">
        <div className="h-5 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex-1 min-h-[300px] bg-muted/30 rounded-xl animate-pulse" />
    </div>
  );
}

export const UserGrowthChart = ({ stats, isLoading }: UserGrowthChartProps) => {
  if (isLoading || !stats) {
    return <ChartSkeleton />;
  }

  const data = mergeGrowthData(stats);

  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // useLayoutEffect to measure synchronously before browser paints
  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width: newWidth } = containerRef.current.getBoundingClientRect();
        if (newWidth > 0) {
          setWidth(newWidth);
        }
      }
    };
    
    // Initial measurement
    updateSize();
    
    // Fallback: measure again after a tiny delay in case layout was deferred by framer-motion
    const timeoutId = setTimeout(updateSize, 100);

    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-1">
          Büyüme Grafiği
        </h2>
        <p className="text-sm text-muted-foreground">
          Kullanıcı ve tarif büyümesi karşılaştırması
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px] text-muted-foreground text-sm">
          Son 30 güne ait büyüme verisi bulunamadı.
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-[300px] mt-2 overflow-hidden flex justify-center">
          {width > 0 && (
            <AreaChart width={width} height={300} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRecipes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-border/40"
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              dx={-10}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--card))",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              itemStyle={{ fontWeight: 500 }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 16, fontSize: 13 }}
            />

            <Area
              type="monotone"
              dataKey="users"
              name="Kullanıcı"
              stroke="#14b8a6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#gradUsers)"
              activeDot={{ r: 5, fill: "#fff", stroke: "#14b8a6", strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="recipes"
              name="Tarif"
              stroke="#f97316"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#gradRecipes)"
              activeDot={{ r: 5, fill: "#fff", stroke: "#f97316", strokeWidth: 2 }}
            />
          </AreaChart>
          )}
        </div>
      )}
    </div>
  );
};
