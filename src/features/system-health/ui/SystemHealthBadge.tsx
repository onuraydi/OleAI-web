import { useQuery } from '@tanstack/react-query';
import { getHealthStatus } from '@/shared/api/healthApi';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const SystemHealthBadge = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['system-health'],
    queryFn: getHealthStatus,
    refetchInterval: 30000, // Poll every 30 seconds
    retry: false,
  });

  const isHealthy = !isError && data?.status === 'Healthy';

  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-muted"
      title={isHealthy ? "Sistem Sağlıklı" : "Sistemde Sorun Var"}
    >
      <Activity className={`w-4 h-4 ${isHealthy ? 'text-green-500' : 'text-red-500'}`} />
      
      <div className="relative flex h-2.5 w-2.5">
        {isLoading ? (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
        ) : isHealthy ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        )}
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
        {isLoading ? 'Denetleniyor...' : isHealthy ? 'Sağlıklı' : 'Hata'}
      </span>
    </div>
  );
};
