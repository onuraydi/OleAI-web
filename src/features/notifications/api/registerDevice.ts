import { apiInstance as api } from '@/shared/api/base';

export interface RegisterDevicePayload {
  deviceToken: string;
  platform: 'Web' | 'Android' | 'IOS';
}

export const registerDeviceToken = async (payload: RegisterDevicePayload) => {
  const response = await api.post('/UserDevices', payload);
  return response.data;
};
