import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recipeApi } from './recipeApi';
import { apiInstance } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  apiInstance: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  }
}));

describe('recipeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPublishedRecipes calls /recipes with correct params', async () => {
    vi.mocked(apiInstance.get).mockResolvedValueOnce({ data: { items: [] } });
    await recipeApi.getPublishedRecipes(1, 20, "test", 2);
    expect(apiInstance.get).toHaveBeenCalledWith('/recipes', {
      params: { page: 1, size: 20, searchTerm: "test", categoryId: 2, minRating: undefined, difficulty: undefined, maxTotalTime: undefined, tagId: undefined, sortBy: undefined, isForYou: undefined }
    });
  });

  it('getRecipeById calls /recipes/:id', async () => {
    vi.mocked(apiInstance.get).mockResolvedValueOnce({ data: { id: '1' } });
    await recipeApi.getRecipeById('1');
    expect(apiInstance.get).toHaveBeenCalledWith('/recipes/1');
  });

  it('toggleLike calls POST /recipes/:id/like', async () => {
    vi.mocked(apiInstance.post).mockResolvedValueOnce({ data: {} });
    await recipeApi.toggleLike('1');
    expect(apiInstance.post).toHaveBeenCalledWith('/recipes/1/like');
  });

  it('addComment calls POST /recipes/:id/comments', async () => {
    vi.mocked(apiInstance.post).mockResolvedValueOnce({ data: {} });
    await recipeApi.addComment('1', 'Good', undefined, 5);
    expect(apiInstance.post).toHaveBeenCalledWith('/recipes/1/comments', { content: 'Good', parentCommentId: undefined, rating: 5 });
  });

  it('createRecipe calls POST /recipes with formData', async () => {
    vi.mocked(apiInstance.post).mockResolvedValueOnce({ data: {} });
    const formData = new FormData();
    await recipeApi.createRecipe(formData);
    expect(apiInstance.post).toHaveBeenCalledWith('/recipes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  });

  it('deleteRecipe calls DELETE /recipes/:id', async () => {
    vi.mocked(apiInstance.delete).mockResolvedValueOnce({ data: {} });
    await recipeApi.deleteRecipe('1');
    expect(apiInstance.delete).toHaveBeenCalledWith('/recipes/1');
  });

  it('getMyRecipes calls /recipes/my-recipes', async () => {
    vi.mocked(apiInstance.get).mockResolvedValueOnce({ data: { items: [] } });
    await recipeApi.getMyRecipes(1, 10, 'search');
    expect(apiInstance.get).toHaveBeenCalledWith('/recipes/my-recipes', {
      params: { page: 1, size: 10, searchTerm: 'search', categoryId: undefined, minRating: undefined, difficulty: undefined, maxTotalTime: undefined, tagId: undefined, visibility: undefined, sortBy: undefined }
    });
  });
});
