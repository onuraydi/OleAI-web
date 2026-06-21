import { apiInstance } from "@/shared/api/base";

export interface AllergyRestriction {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export const allergyApi = {
  getList: async (): Promise<AllergyRestriction[]> => {
    const response = await apiInstance.get<AllergyRestriction[]>("/allergy-restrictions");
    return response.data;
  },
};
