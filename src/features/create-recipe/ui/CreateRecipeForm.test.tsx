 
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateRecipeForm } from "./CreateRecipeForm";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import { toast } from "sonner";

// Mock dependencies
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("@/entities/recipe/api/recipeApi", () => ({
  recipeApi: {
    createRecipe: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock RecipeEditorForm so we don't render its complex UI
vi.mock("@/widgets/recipe-editor/ui/RecipeEditorForm", () => ({
  RecipeEditorForm: ({ onSubmit, onCancel, headerTitle, submitButtonText }: any) => (
    <div data-testid="recipe-editor-mock">
      <h2>{headerTitle}</h2>
      <button data-testid="submit-btn" onClick={() => onSubmit(new FormData())}>
        {submitButtonText}
      </button>
      <button data-testid="cancel-btn" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

describe("CreateRecipeForm", () => {
  const mockNavigate = vi.fn();
  const mockInvalidateQueries = vi.fn();
  const mockMutate = vi.fn();

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
          // Simulate the onSuccess callback manually if needed, or we can just test the options passed to useMutation
          if (options.onSuccess) {
             // we'll trigger this manually in tests or let the component do it
          }
        },
        isPending: false,
        ...options
      };
    });
  });

  it("renders with correct props passed to RecipeEditorForm", () => {
    render(<CreateRecipeForm />);
    expect(screen.getByTestId("recipe-editor-mock")).toBeInTheDocument();
    expect(screen.getByText("Yeni Tarif Oluştur")).toBeInTheDocument();
    expect(screen.getByText("Tarifi Paylaş")).toBeInTheDocument();
  });

  it("navigates back on cancel", () => {
    render(<CreateRecipeForm />);
    screen.getByTestId("cancel-btn").click();
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("calls createMutation when submitted", () => {
    let capturedOptions: any;
    (useMutation as any).mockImplementation((options: any) => {
      capturedOptions = options;
      return { mutate: mockMutate, isPending: false };
    });

    render(<CreateRecipeForm />);
    screen.getByTestId("submit-btn").click();
    expect(mockMutate).toHaveBeenCalled();

    // Verify mutation options
    expect(capturedOptions.mutationFn).toBe(recipeApi.createRecipe);
    
    // Simulate onSuccess
    capturedOptions.onSuccess();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["my-recipes"] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["recipes"] });
    expect(toast.success).toHaveBeenCalledWith("Tarif başarıyla oluşturuldu ve onay sürecine gönderildi.");
    expect(mockNavigate).toHaveBeenCalledWith("/recipes");

    // Simulate onError without response
    capturedOptions.onError(new Error("Test Error"));
    expect(toast.error).toHaveBeenCalledWith("Tarif oluşturulurken bir hata oluştu.");

    // Simulate onError with response detail
    capturedOptions.onError({ response: { data: { detail: "Custom detail error" } } });
    expect(toast.error).toHaveBeenCalledWith("Custom detail error");
  });
});
