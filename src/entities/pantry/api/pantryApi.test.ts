import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pantryApi } from './pantryApi';
import { MeasurementUnit } from '@/shared/constants/measurement';
import { apiInstance } from '@/shared/api/base';

vi.mock('@/shared/api/base', () => ({
  apiInstance: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('pantryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMyPantry calls /Pantry', async () => {
    vi.mocked(apiInstance.get).mockResolvedValueOnce({ data: [] });
    const result = await pantryApi.getMyPantry();
    expect(apiInstance.get).toHaveBeenCalledWith('/Pantry');
    expect(result).toEqual([]);
  });

  it('searchIngredients calls /Pantry/search with keyword', async () => {
    vi.mocked(apiInstance.get).mockResolvedValueOnce({ data: [] });
    const result = await pantryApi.searchIngredients('apple');
    expect(apiInstance.get).toHaveBeenCalledWith('/Pantry/search', { params: { keyword: 'apple' } });
    expect(result).toEqual([]);
  });

  it('getPopularDislikes calls /Pantry/popular-dislikes', async () => {
    vi.mocked(apiInstance.get).mockResolvedValueOnce({ data: [] });
    await pantryApi.getPopularDislikes();
    expect(apiInstance.get).toHaveBeenCalledWith('/Pantry/popular-dislikes');
  });

  it('getPopularByCategory calls /Pantry/popular-by-category', async () => {
    vi.mocked(apiInstance.get).mockResolvedValueOnce({ data: [] });
    await pantryApi.getPopularByCategory();
    expect(apiInstance.get).toHaveBeenCalledWith('/Pantry/popular-by-category');
  });

  it('getCategories calls /IngredientCategories', async () => {
    vi.mocked(apiInstance.get).mockResolvedValueOnce({ data: [] });
    await pantryApi.getCategories();
    expect(apiInstance.get).toHaveBeenCalledWith('/IngredientCategories');
  });

  it('addIngredient calls POST /Pantry', async () => {
    vi.mocked(apiInstance.post).mockResolvedValueOnce({});
    const req = { quantity: 1, unit: MeasurementUnit.Piece };
    await pantryApi.addIngredient(req);
    expect(apiInstance.post).toHaveBeenCalledWith('/Pantry', { request: req });
  });

  it('addMultipleIngredients calls POST /Pantry/bulk', async () => {
    vi.mocked(apiInstance.post).mockResolvedValueOnce({});
    const req = { ingredients: [{ quantity: 1, unit: MeasurementUnit.Piece }] };
    await pantryApi.addMultipleIngredients(req);
    expect(apiInstance.post).toHaveBeenCalledWith('/Pantry/bulk', { request: req });
  });

  it('updateIngredientQuantity calls PUT /Pantry/:id', async () => {
    vi.mocked(apiInstance.put).mockResolvedValueOnce({});
    await pantryApi.updateIngredientQuantity('1', 5, '2024-01-01');
    expect(apiInstance.put).toHaveBeenCalledWith('/Pantry/1', { newQuantity: 5, expirationDate: '2024-01-01' }, { headers: { "Content-Type": "application/json" } });
  });

  it('deleteIngredient calls DELETE /Pantry/:id', async () => {
    vi.mocked(apiInstance.delete).mockResolvedValueOnce({});
    await pantryApi.deleteIngredient('1');
    expect(apiInstance.delete).toHaveBeenCalledWith('/Pantry/1');
  });
});
