import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/userApi";
import { motion } from "framer-motion";
import { BookOpen, Bookmark, Refrigerator, Heart } from "lucide-react";

export const UserStatistics = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["user-statistics"],
    queryFn: userApi.getStatistics,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted/50 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return null;
  }

  const statItems = [
    {
      label: "Oluşturulan Tarif",
      value: stats.totalRecipesCreated,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      label: "Kaydedilen",
      value: stats.totalRecipesSaved,
      icon: Bookmark,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      label: "Kilerdeki Malzeme",
      value: stats.totalPantryItems,
      icon: Refrigerator,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20"
    },
    {
      label: "Beğenilen",
      value: stats.totalRecipesLiked,
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-5 rounded-2xl border ${item.borderColor} bg-white dark:bg-neutral-900/50 shadow-sm flex flex-col gap-3 transition-transform hover:-translate-y-1`}
        >
          <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center`}>
            <item.icon className={`w-5 h-5 ${item.color}`} />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">{item.value}</p>
            <p className="text-sm font-bold text-muted-foreground">{item.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
