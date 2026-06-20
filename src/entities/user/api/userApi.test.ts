import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userApi, RecommendationMode } from './userApi';
import { apiInstance } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  apiInstance: {
    get: vi.fn(),
    put: vi.fn(),
  }
}));

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProfile calls /users/me', async () => {
    const mockRes = { id: '1' };
    vi.mocked(apiInstance.get).mockResolvedValueOnce({ data: mockRes });
    const result = await userApi.getProfile();
    expect(apiInstance.get).toHaveBeenCalledWith('/users/me');
    expect(result).toEqual(mockRes);
  });

  it('getStatistics calls /users/me/statistics', async () => {
    const mockRes = { totalRecipesCreated: 1 };
    vi.mocked(apiInstance.get).mockResolvedValueOnce({ data: mockRes });
    const result = await userApi.getStatistics();
    expect(apiInstance.get).toHaveBeenCalledWith('/users/me/statistics');
    expect(result).toEqual(mockRes);
  });

  it('updateProfile calls /users/me with formData', async () => {
    const mockRes = { message: 'success' };
    vi.mocked(apiInstance.put).mockResolvedValueOnce({ data: mockRes });
    const req = { firstName: 'a', lastName: 'b', username: 'c', birthDate: '2024-01-01' };
    const result = await userApi.updateProfile(req);
    expect(apiInstance.put).toHaveBeenCalledWith('/users/me', expect.any(FormData), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    expect(result).toEqual(mockRes);
  });

  it('updateDietaryPreferences calls /users/me/dietary-preferences', async () => {
    const mockRes = { message: 'success' };
    vi.mocked(apiInstance.put).mockResolvedValueOnce({ data: mockRes });
    const req = { dietaryPreferenceIds: ['1'] };
    const result = await userApi.updateDietaryPreferences(req);
    expect(apiInstance.put).toHaveBeenCalledWith('/users/me/dietary-preferences', req);
    expect(result).toEqual(mockRes);
  });

  it('updateAllergies calls /users/me/allergies', async () => {
    const mockRes = { message: 'success' };
    vi.mocked(apiInstance.put).mockResolvedValueOnce({ data: mockRes });
    const req = { allergyRestrictionIds: ['1'] };
    const result = await userApi.updateAllergies(req);
    expect(apiInstance.put).toHaveBeenCalledWith('/users/me/allergies', req);
    expect(result).toEqual(mockRes);
  });

  it('updateDislikedIngredients calls /users/me/disliked-ingredients', async () => {
    const mockRes = { message: 'success' };
    vi.mocked(apiInstance.put).mockResolvedValueOnce({ data: mockRes });
    const req = { ingredientIds: ['1'] };
    const result = await userApi.updateDislikedIngredients(req);
    expect(apiInstance.put).toHaveBeenCalledWith('/users/me/disliked-ingredients', req);
    expect(result).toEqual(mockRes);
  });

  it('getRecommendations calls /users/me/recommendations', async () => {
    const mockRes = [{ recipe: { id: '1' }, matchScore: 90 }];
    vi.mocked(apiInstance.get).mockResolvedValueOnce({ data: mockRes });
    const result = await userApi.getRecommendations(RecommendationMode.Default);
    expect(apiInstance.get).toHaveBeenCalledWith('/users/me/recommendations', {
      params: { 
        mode: RecommendationMode.Default, 
        useZeroWaste: false, 
        useAllergyFilters: true, 
        useDietFilters: true, 
        useDislikedFilters: true 
      }
    });
    expect(result).toEqual(mockRes);
  });
});
