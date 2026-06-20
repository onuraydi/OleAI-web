import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateIngredientDialog } from "./UpdateIngredientDialog";

const mockMutateAsync = vi.fn();

vi.mock("@/entities/admin-ingredient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/admin-ingredient")>();
  return {
    ...actual,
    useUpdateIngredientMutation: vi.fn(() => ({
      mutateAsync: mockMutateAsync,
      isPending: false
    })),
    useIngredientCategories: vi.fn(() => ({
      data: [{ id: "cat-1", name: "Meyveler", iconName: "apple" }],
      isLoading: false
    }))
  };
});

vi.mock("@/shared/ui/select", () => ({
  Select: ({ onValueChange, value, children }: any) => (
    <select data-testid="mock-select" value={value || ""} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>
}));

describe("UpdateIngredientDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockIngredient = {
    id: "ing-1",
    name: "Elma",
    categoryName: "Meyveler",
    unitFamily: "count" as any,
    isPolarizing: false,
    isStaple: false,
    defaultExpirationMode: "ShelfLife" as any,
    estimatedShelfLifeInDays: 7,
    createdAt: "",
    updatedAt: "",
    aliases: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render if ingredient is null", () => {
    const { container } = render(
      <UpdateIngredientDialog ingredient={null} open={true} onOpenChange={mockOnOpenChange} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders correctly with ingredient and submits", async () => {
    mockMutateAsync.mockResolvedValue({});
    
    render(
      <UpdateIngredientDialog ingredient={mockIngredient} open={true} onOpenChange={mockOnOpenChange} />
    );
    
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/"Elma"/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Malzeme Adı/i)).toHaveValue("Elma");
    
    fireEvent.change(screen.getByLabelText(/Malzeme Adı/i), { target: { value: "Kırmızı Elma" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Değişiklikleri Kaydet" }));
    
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: "Kırmızı Elma",
        categoryId: "cat-1",
        unitFamily: "count",
        isPolarizing: false,
        isStaple: false,
        estimatedShelfLifeInDays: 7,
        defaultExpirationMode: "ShelfLife"
      });
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
