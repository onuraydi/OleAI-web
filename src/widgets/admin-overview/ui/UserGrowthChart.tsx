import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { mockChartData } from "@/shared/api/mock/adminDashboardMock";
import { ArrowRight } from "lucide-react";

export const UserGrowthChart = () => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 flex-1 flex flex-col min-w-0">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Kullanıcı Büyümesi</h2>
          <p className="text-sm text-muted-foreground">Son 30 gündeki yeni kullanıcı kayıtları</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
          Raporu Görüntüle <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="users" 
              stroke="#14b8a6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUsers)" 
              activeDot={{ r: 6, fill: "#fff", stroke: "#14b8a6", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
