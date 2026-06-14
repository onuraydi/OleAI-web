import { Users, Utensils, MessageSquare, Package } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import type { AdminDashboardStats } from "@/entities/admin-dashboard";
import type { LucideIcon } from "lucide-react";

interface StatCardsProps {
  stats: AdminDashboardStats | undefined;
  isLoading: boolean;
}

interface CardConfig {
  title: string;
  key: keyof Pick<AdminDashboardStats, "totalUsers" | "totalRecipes" | "totalComments" | "totalIngredients">;
  icon: LucideIcon;
  iconColor: string;
  bgLight: string;
  bgDark: string;
}

const cards: CardConfig[] = [
  {
    title: "Toplam Kullanıcı",
    key: "totalUsers",
    icon: Users,
    iconColor: "text-blue-500",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/40",
  },
  {
    title: "Toplam Tarif",
    key: "totalRecipes",
    icon: Utensils,
    iconColor: "text-orange-500",
    bgLight: "bg-orange-50",
    bgDark: "dark:bg-orange-950/40",
  },
  {
    title: "Toplam Yorum",
    key: "totalComments",
    icon: MessageSquare,
    iconColor: "text-purple-500",
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-950/40",
  },
  {
    title: "Toplam Malzeme",
    key: "totalIngredients",
    icon: Package,
    iconColor: "text-green-600",
    bgLight: "bg-green-50",
    bgDark: "dark:bg-green-950/40",
  },
];

const fmt = new Intl.NumberFormat("tr-TR");

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export const StatCards = ({ stats, isLoading }: StatCardsProps) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {cards.map((card) => (
        <motion.div
          key={card.key}
          variants={item}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                card.bgLight,
                card.bgDark,
              )}
            >
              <card.icon className={cn("w-6 h-6", card.iconColor)} />
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground font-medium text-sm mb-1">
              {card.title}
            </h3>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {fmt.format(stats[card.key])}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
