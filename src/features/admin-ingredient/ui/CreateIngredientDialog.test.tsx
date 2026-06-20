import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateIngredientDialog } from "./CreateIngredientDialog";

const mockMutateAsync = vi.fn();

vi.mock("@/entities/admin-ingredient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/admin-ingredient")>();
  return {
    ...actual,
    useCreateIngredientMutation: vi.fn(() => ({
      mutateAsync: mockMutateAsync,
      isPending: false
    })),
    useIngredientCategories: vi.fn(() => ({
      data: [{ id: "cat-1", name: "Sebzeler", iconName: "carrot" }],
      isLoading: false
    }))
  };
});

vi.mock("@/shared/ui/select", () => ({
  Select: ({ onValueChange, value, children }: unknown) => (
    <select data-testid="mock-select" value={value || ""} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: unknown) => <>{children}</>,
  SelectItem: ({ value, children }: unknown) => <option value={value}>{children}</option>
}));

describe("CreateIngredientDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens dialog on button click and submits the form", async () => {
    mockMutateAsync.mockResolvedValue({});
    render(<CreateIngredientDialog />);
    
    // Open dialog
    fireEvent.click(screen.getByRole("button", { name: /Yeni Malzeme/i }));
    
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText(/Malzeme Adı/i), { target: { value: "Yeni Malzeme 1" } });
    
    // Open category select and click
    const selects = screen.getAllByTestId("mock-select");
    fireEvent.change(selects[0], { target: { value: "cat-1" } });
    
    // Submit
    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));
    
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: "Yeni Malzeme 1",
        categoryId: "cat-1",
        unitFamily: "other",
        isPolarizing: false,
        isStaple: false,
        estimatedShelfLifeInDays: null,
        defaultExpirationMode: "shelflife"
      });
    });
  });
});
