/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResolveRequestDialog } from "./ResolveRequestDialog";
import { ResolutionAction } from "@/entities/admin-ingredient";

const mockResolveMutateAsync = vi.fn();

vi.mock("@/entities/admin-ingredient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/admin-ingredient")>();
  return {
    ...actual,
    useResolveRequestMutation: vi.fn(() => ({
      mutateAsync: mockResolveMutateAsync,
      isPending: false
    })),
    useIngredientCategories: vi.fn(() => ({
      data: [{ id: "cat-1", name: "Meyveler", iconName: "apple" }],
      isLoading: false
    })),
    useAdminIngredients: vi.fn(() => ({
      data: { items: [{ id: "master-1", name: "Elma", aliases: [] }] },
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

describe("ResolveRequestDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockRequest: any = {
    id: "req-1",
    requestedName: "Kırmızı Elma",
    userId: "user-1",
    status: "pending" as unknown,
    createdAt: "",
    updatedAt: ""
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render if request is null", () => {
    const { container } = render(
      <ResolveRequestDialog request={null} open={true} onOpenChange={mockOnOpenChange} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders correctly and resolves as reject", async () => {
    mockResolveMutateAsync.mockResolvedValue({});
    render(
      <ResolveRequestDialog request={mockRequest} open={true} onOpenChange={mockOnOpenChange} />
    );
    
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/"Kırmızı Elma"/)).toBeInTheDocument();
    
    // Select action "Reddet"
    fireEvent.click(screen.getByText("Reddet"));
    
    // Provide rejection note
    fireEvent.change(screen.getByLabelText(/Yönetici Notu/i), { target: { value: "Geçersiz malzeme" } });
    
    fireEvent.click(screen.getByRole("button", { name: "İşlemi Tamamla" }));
    
    await waitFor(() => {
      expect(mockResolveMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
        action: ResolutionAction.Reject,
        adminNote: "Geçersiz malzeme"
      }));
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("resolves as approve as new", async () => {
    mockResolveMutateAsync.mockResolvedValue({});
    render(
      <ResolveRequestDialog request={mockRequest} open={true} onOpenChange={mockOnOpenChange} />
    );
    
    // Select action "Yeni Ekle"
    fireEvent.click(screen.getByText("Yeni Ekle"));
    
    // Fill the category and unit family
    const selects = screen.getAllByTestId("mock-select");
    fireEvent.change(selects[0], { target: { value: "cat-1" } });
    fireEvent.change(selects[1], { target: { value: "Weight" } });

    // Need to provide shelf life (optional but lets do it)
    fireEvent.change(screen.getByLabelText(/Tahmini Raf Ömrü/i), { target: { value: "10" } });

    fireEvent.click(screen.getByRole("button", { name: "İşlemi Tamamla" }));
    
    await waitFor(() => {
      expect(mockResolveMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
        action: ResolutionAction.ApproveAsNew,
        newCategoryId: "cat-1",
        estimatedShelfLifeInDays: 10
      }));
    });
  });

  it("resolves as merge with existing", async () => {
    mockResolveMutateAsync.mockResolvedValue({});
    render(
      <ResolveRequestDialog request={mockRequest} open={true} onOpenChange={mockOnOpenChange} />
    );
    
    // Select action "Alias Yap"
    fireEvent.click(screen.getByText("Alias Yap"));
    
    // Select master ingredient via autocomplete
    const input = screen.getByPlaceholderText(/Ana malzeme aramak için yazın/i);
    fireEvent.change(input, { target: { value: "Elma" } });
    
    // Simulate clicking the matched item
    const elmaItem = screen.getByText("Elma");
    fireEvent.mouseDown(elmaItem);

    fireEvent.click(screen.getByRole("button", { name: "İşlemi Tamamla" }));
    
    await waitFor(() => {
      expect(mockResolveMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
        action: ResolutionAction.MergeAsAlias,
        masterIngredientId: "master-1"
      }));
    });
  });
});
