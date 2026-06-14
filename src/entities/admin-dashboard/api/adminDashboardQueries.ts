import { useQuery } from "@tanstack/react-query";
import { adminDashboardApi } from "./adminDashboardApi";

export const useAdminDashboardStats = () =>
  useQuery({
    queryKey: ["admin-dashboard", "stats"],
    queryFn: () => adminDashboardApi.getStats(),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
