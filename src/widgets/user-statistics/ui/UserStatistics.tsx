import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/userApi";
import { motion } from "framer-motion";
import { BookOpen, Bookmark, Refrigerator, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UserStatistics = () => {
  const navigate = useNavigate();
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
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      onClick: () => navigate("/profile", { state: { activeTab: "recipes", subTab: "created" } })
    },
    {
      label: "Kaydedilen",
      value: stats.totalRecipesSaved,
      icon: Bookmark,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      onClick: () => navigate("/profile", { state: { activeTab: "recipes", subTab: "saved" } })
    },
    {
      label: "Kilerdeki Malzeme",
      value: stats.totalPantryItems,
      icon: Refrigerator,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      onClick: () => navigate("/pantry")
    },
    {
      label: "Beğenilen",
      value: stats.totalRecipesLiked,
      icon: Heart,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      onClick: () => navigate("/profile", { state: { activeTab: "recipes", subTab: "liked" } })
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          onClick={item.onClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative overflow-hidden p-6 sm:p-8 rounded-[2rem] border-2 bg-card ${item.borderColor} shadow-sm group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1`}
        >
          {/* Subtle background glow */}
          <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${item.bgColor} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className={`w-12 h-12 rounded-2xl ${item.bgColor} flex items-center justify-center border border-white/5`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
              <p className={`text-4xl sm:text-5xl font-black ${item.color} tracking-tighter mb-1`}>
                {item.value}
              </p>
              <p className="text-sm sm:text-base font-bold text-muted-foreground/80 leading-tight">
                {item.label}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
