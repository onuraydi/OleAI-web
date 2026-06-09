import { MoreHorizontal } from "lucide-react";
import { mockRecentActivity } from "@/shared/api/mock/adminDashboardMock";
import { cn } from "@/shared/lib/utils";

export const RecentActivityTimeline = () => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 w-full lg:w-96 flex flex-col shrink-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Son Aktiviteler</h2>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-secondary/30" />
        
        <div className="space-y-6 relative z-10">
          {mockRecentActivity.map((activity) => (
            <div key={activity.id} className="flex gap-4">
              <div className="relative mt-1.5 shrink-0">
                <div className={cn("w-4 h-4 rounded-full border-4 border-white shadow-sm ring-1 ring-secondary/20", activity.color)} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground leading-snug">
                  {activity.content}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-secondary/20 text-center">
        <button className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
          Tüm Aktiviteleri Gör
        </button>
      </div>
    </div>
  );
};
