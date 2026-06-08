import { Users, Utensils, Smartphone, Server, TrendingUp, Minus } from "lucide-react";
import { mockStats } from "@/shared/api/mock/adminDashboardMock";
import { cn } from "@/shared/lib/utils";

export const StatCards = () => {
  const cards = [
    {
      title: "Toplam Kullanıcı",
      value: mockStats.totalUsers.value,
      trend: mockStats.totalUsers.trend,
      isPositive: mockStats.totalUsers.isPositive,
      icon: Users,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      trendColor: "text-emerald-500",
      trendBg: "bg-emerald-50",
      TrendIcon: TrendingUp,
    },
    {
      title: "Eklenen Tarif",
      value: mockStats.recipesAdded.value,
      trend: mockStats.recipesAdded.trend,
      isPositive: mockStats.recipesAdded.isPositive,
      icon: Utensils,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
      trendColor: "text-emerald-500",
      trendBg: "bg-emerald-50",
      TrendIcon: TrendingUp,
    },
    {
      title: "Aktif Oturum",
      value: mockStats.activeSessions.value,
      trend: mockStats.activeSessions.trend,
      isPositive: mockStats.activeSessions.isPositive,
      icon: Smartphone,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
      trendColor: "text-gray-500",
      trendBg: "bg-gray-100",
      TrendIcon: Minus,
    },
    {
      title: "Sunucu Yükü",
      value: mockStats.serverLoad.value,
      status: mockStats.serverLoad.status,
      icon: Server,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      statusColor: "text-emerald-600",
      statusBg: "bg-emerald-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-card rounded-2xl p-6 shadow-sm border border-secondary/20 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", card.bgColor)}>
              <card.icon className={cn("w-6 h-6", card.iconColor)} />
            </div>
            
            {card.trend && card.TrendIcon && (
              <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold", card.trendBg, card.trendColor)}>
                <card.TrendIcon className="w-3 h-3" />
                {card.trend}
              </div>
            )}
            
            {card.status && (
              <div className={cn("px-3 py-1 rounded-full text-xs font-bold", card.statusBg, card.statusColor)}>
                {card.status}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-muted-foreground font-medium text-sm mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
