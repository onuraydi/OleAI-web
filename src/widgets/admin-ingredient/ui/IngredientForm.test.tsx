import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IngredientForm } from "./IngredientForm";
import { MeasurementCategory } from "@/entities/admin-ingredient";

const mockCategories = [
  { id: "cat-1", name: "Sebzeler", iconName: "carrot" },
  { id: "cat-2", name: "Meyveler", iconName: "apple" }
];

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

vi.mock("@/entities/admin-ingredient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/admin-ingredient")>();
  return {
    ...actual,
    useIngredientCategories: vi.fn(() => ({
      data: mockCategories,
      isLoading: false
    }))
  };
});

describe("IngredientForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with empty initial data", () => {
    render(<IngredientForm onSubmit={mockOnSubmit} isPending={false} submitLabel="Kaydet" />);
    
    expect(screen.getByLabelText(/Malzeme Adı/i)).toBeInTheDocument();
    expect(screen.getByText("Kategori")).toBeInTheDocument();
    expect(screen.getByText(/Ölçü Birimi Ailesi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tahmini Raf Ömrü/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Yaygın Olarak Sevilmeyen Malzeme/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Temel Gıda/i)).toBeInTheDocument();
  });

  it("fills the form and submits correctly", async () => {
    render(<IngredientForm onSubmit={mockOnSubmit} isPending={false} submitLabel="Kaydet" />);
    
    fireEvent.change(screen.getByLabelText(/Malzeme Adı/i), { target: { value: "Domates" } });
    
    // Select category
    const selects = screen.getAllByTestId("mock-select");
    fireEvent.change(selects[0], { target: { value: "cat-1" } });
    
    // Fill shelf life
    fireEvent.change(screen.getByLabelText(/Tahmini Raf Ömrü/i), { target: { value: "14" } });
    
    // Check staple
    fireEvent.click(screen.getByLabelText(/Temel Gıda/i));

    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: "Domates",
        categoryId: "cat-1",
        unitFamily: MeasurementCategory.Other,
        isPolarizing: false,
        isStaple: true,
        estimatedShelfLifeInDays: 14
      }), expect.anything());
    });
  });

  it("populates initial data correctly", () => {
    const initialData = {
      id: "ing-1",
      name: "Elma",
      categoryName: "Meyveler",
      unitFamily: MeasurementCategory.Count,
      isPolarizing: false,
      isStaple: false,
      defaultExpirationMode: "ShelfLife" as any,
      estimatedShelfLifeInDays: 7,
      createdAt: "",
      updatedAt: "",
      aliases: []
    };

    render(<IngredientForm initialData={initialData} onSubmit={mockOnSubmit} isPending={false} submitLabel="Güncelle" />);
    
    expect(screen.getByLabelText(/Malzeme Adı/i)).toHaveValue("Elma");
    expect(screen.getByLabelText(/Tahmini Raf Ömrü/i)).toHaveValue(7);
    expect(screen.getByRole("button", { name: "Güncelle" })).toBeInTheDocument();
  });
});
