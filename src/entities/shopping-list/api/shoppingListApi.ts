import { apiInstance } from "@/shared/api";

export interface ShoppingListItem {
  id: string;
  ingredientId: string;
  ingredientName: string;
  categoryName: string;
  quantity: number;
  unit: number; // MeasurementUnit enum
  isPurchased: boolean;
  isPendingApproval?: boolean;
}

export interface AddShoppingListItemRequest {
  ingredientId?: string;
  requestedName?: string;
  suggestedCategoryId?: string;
  quantity: number;
  unit: number;
}

export interface UpdateShoppingListItemRequest {
  newQuantity: number;
  newUnit: number;
}

export interface AddMultipleShoppingListItemsRequest {
  items: AddShoppingListItemRequest[];
}

export const shoppingListApi = {
  getMyShoppingList: async (): Promise<ShoppingListItem[]> => {
    const response = await apiInstance.get<ShoppingListItem[]>("/shopping-list");
    return response.data;
  },

  addItem: async (request: AddShoppingListItemRequest): Promise<ShoppingListItem> => {
    const response = await apiInstance.post<ShoppingListItem>("/shopping-list", request);
    return response.data;
  },

  bulkAddItems: async (request: AddMultipleShoppingListItemsRequest): Promise<ShoppingListItem[]> => {
    const response = await apiInstance.post<ShoppingListItem[]>("/shopping-list/bulk", request);
    return response.data;
  },

  updateItem: async (id: string, request: UpdateShoppingListItemRequest) => {
    const response = await apiInstance.put<{ message: string }>(`/shopping-list/${id}`, request);
    return response.data;
  },

  markAsPurchased: async (id: string) => {
    const response = await apiInstance.patch<{ message: string }>(`/shopping-list/${id}/purchase`);
    return response.data;
  },

  bulkMarkAsPurchased: async (itemIds: string[]) => {
    const response = await apiInstance.patch<{ message: string }>("/shopping-list/bulk-purchase", itemIds);
    return response.data;
  },

  removeItem: async (id: string) => {
    const response = await apiInstance.delete<{ message: string }>(`/shopping-list/${id}`);
    return response.data;
  },

  syncDepleted: async (itemsToRestock: { ingredientId: string; quantity: number; unit: number }[]) => {
    const response = await apiInstance.post<{ message: string }>("/shopping-list/sync-depleted", { itemsToRestock });
    return response.data;
  }
};
