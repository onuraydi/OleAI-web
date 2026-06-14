import { apiInstance } from "@/shared/api";

export interface DailyStatPoint {
  date: string;
  count: number;
}

export interface RecentActivityDto {
  type: string;
  description: string;
  timestamp: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalRecipes: number;
  totalComments: number;
  totalIngredients: number;

  recipesPendingLlm: number;
  recipesPendingAdmin: number;
  recipesPublished: number;
  recipesRejected: number;

  totalLikes: number;
  totalSaves: number;
  totalDislikes: number;

  pendingIngredientRequests: number;
  resolvedIngredientRequests: number;

  userGrowth: DailyStatPoint[];
  recipeGrowth: DailyStatPoint[];

  easyRecipes: number;
  mediumRecipes: number;
  hardRecipes: number;

  recentActivities: RecentActivityDto[];
}

export const adminDashboardApi = {
  getStats: async (): Promise<AdminDashboardStats> => {
    const response = await apiInstance.get<AdminDashboardStats>("/admin/dashboard/stats");
    return response.data;
  },
};
