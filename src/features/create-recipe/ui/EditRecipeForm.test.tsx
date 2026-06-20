import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditRecipeForm } from "./EditRecipeForm";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import { toast } from "sonner";
import type { RecipeDetailResponse } from "@/entities/recipe/api/recipeApi";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("@/entities/recipe/api/recipeApi", () => ({
  recipeApi: {
    updateRecipe: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/widgets/recipe-editor/ui/RecipeEditorForm", () => ({
  RecipeEditorForm: ({ onSubmit, onCancel, headerTitle, submitButtonText, initialData }: any) => (
    <div data-testid="recipe-editor-mock">
      <h2>{headerTitle}</h2>
      <div data-testid="initial-data-id">{initialData?.id}</div>
      <button data-testid="submit-btn" onClick={() => onSubmit(new FormData())}>
        {submitButtonText}
      </button>
      <button data-testid="cancel-btn" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

describe("EditRecipeForm", () => {
  const mockNavigate = vi.fn();
  const mockInvalidateQueries = vi.fn();
  const mockMutate = vi.fn();
  
  const mockInitialData = {
    id: "recipe-123",
    title: "Test Recipe",
    // add other required fields as needed, mostly we just need id to pass TS/tests
  } as RecipeDetailResponse;

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useQueryClient as any).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (useMutation as any).mockImplementation((options: any) => {
      return {
        mutate: (data: any) => {
          mockMutate(data);
        },
        isPending: false,
        ...options
      };
    });
  });

  it("renders with correct props", () => {
    render(<EditRecipeForm initialData={mockInitialData} />);
    expect(screen.getByTestId("recipe-editor-mock")).toBeInTheDocument();
    expect(screen.getByText("Tarifi Düzenle")).toBeInTheDocument();
    expect(screen.getByText("Tarifi Güncelle")).toBeInTheDocument();
    expect(screen.getByTestId("initial-data-id")).toHaveTextContent("recipe-123");
  });

  it("navigates back on cancel", () => {
    render(<EditRecipeForm initialData={mockInitialData} />);
    screen.getByTestId("cancel-btn").click();
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("calls updateMutation when submitted", () => {
    let capturedOptions: any;
    (useMutation as any).mockImplementation((options: any) => {
      capturedOptions = options;
      return { mutate: mockMutate, isPending: false };
    });

    render(<EditRecipeForm initialData={mockInitialData} />);
    screen.getByTestId("submit-btn").click();
    expect(mockMutate).toHaveBeenCalled();

    // Verify mutation options
    const dummyFormData = new FormData();
    capturedOptions.mutationFn(dummyFormData);
    expect(recipeApi.updateRecipe).toHaveBeenCalledWith("recipe-123", dummyFormData);
    
    // Simulate onSuccess
    capturedOptions.onSuccess();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["my-recipes"] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["recipe-detail", "recipe-123"] });
    expect(mockNavigate).toHaveBeenCalledWith("/recipes/recipe-123");

    // Simulate onError without response
    capturedOptions.onError(new Error("Test Error"));
    expect(toast.error).toHaveBeenCalledWith("Tarif güncellenirken bir hata oluştu.");

    // Simulate onError with response detail
    capturedOptions.onError({ response: { data: { detail: "Custom update error" } } });
    expect(toast.error).toHaveBeenCalledWith("Custom update error");
  });
});
