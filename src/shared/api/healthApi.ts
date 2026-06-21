import axios from 'axios';

export interface HealthCheckResponse {
  status: string;
  totalDuration: string;
  entries: {
    [key: string]: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
      duration: string;
      status: string;
      tags: string[];
    };
  };
}

export const getHealthStatus = async (): Promise<HealthCheckResponse> => {
  const healthUrl = import.meta.env.VITE_HEALTH_URL || 'https://localhost:7190/health';
  
  const response = await axios.get<HealthCheckResponse>(healthUrl);
  return response.data;
};
