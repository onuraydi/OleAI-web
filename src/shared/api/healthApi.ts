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
  // Extract base URL without the /api suffix
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://localhost:7190';
  
  const response = await axios.get<HealthCheckResponse>(`${baseUrl}/health`);
  return response.data;
};
