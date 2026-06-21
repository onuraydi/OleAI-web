/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { useDeleteCategory } from "@/entities/admin-category/api/adminCategoryQueries";

vi.mock("@/entities/admin-category/api/adminCategoryQueries", () => ({
  useDeleteCategory: vi.fn(),
}));

vi.mock("@/shared/ui/dialog", () => ({
  Dialog: ({ open, onOpenChange, children }: any) => {
    if (!open) return null;
    return (
      <div data-testid="dialog">
        <button data-testid="dialog-overlay-click" onClick={() => onOpenChange(false)} />
        {children}
      </div>
    );
  },
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <header>{children}</header>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children, className }: any) => <p className={className}>{children}</p>,
  DialogFooter: ({ children }: any) => <footer>{children}</footer>,
}));

vi.mock("@/shared/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid={`button-${variant}`}>
      {children}
    </button>
  ),
}));

describe("DeleteCategoryDialog", () => {
  const mockDeleteCategory = vi.fn();
  const onCloseMock = vi.fn();
  
  const mockCategory: any = {
    id: "cat-1",
    name: "Dairy",
    iconName: "Milk",
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useDeleteCategory as any).mockReturnValue({
      mutate: mockDeleteCategory,
      isPending: false,
    });
  });

  it("should not render when isOpen is false", () => {
    render(<DeleteCategoryDialog category={mockCategory} isOpen={false} onClose={onCloseMock} />);
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("should render correctly when isOpen is true", () => {
    render(<DeleteCategoryDialog category={mockCategory} isOpen={true} onClose={onCloseMock} />);
    
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByText("Kategoriyi Sil")).toBeInTheDocument();
    expect(screen.getByText(/"Dairy"/)).toBeInTheDocument();
    expect(screen.getByText(/adlı kategoriyi silmek istediğinize emin misiniz/)).toBeInTheDocument();
  });

  it("should render safely if category is null", () => {
    render(<DeleteCategoryDialog category={null} isOpen={true} onClose={onCloseMock} />);
    // "undefined" or empty string when name is missing
    expect(screen.getByText(/adlı kategoriyi silmek istediğinize emin misiniz/)).toBeInTheDocument();
  });

  it("should handle cancel button click", async () => {
    const user = userEvent.setup();
    render(<DeleteCategoryDialog category={mockCategory} isOpen={true} onClose={onCloseMock} />);
    
    const cancelBtn = screen.getByTestId("button-outline");
    await user.click(cancelBtn);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should call deleteCategory mutation on delete button click", async () => {
    const user = userEvent.setup();
    render(<DeleteCategoryDialog category={mockCategory} isOpen={true} onClose={onCloseMock} />);
    
    mockDeleteCategory.mockImplementation((id: any, options: any) => {
      options.onSuccess();
    });

    const deleteBtn = screen.getByTestId("button-destructive");
    await user.click(deleteBtn);

    expect(mockDeleteCategory).toHaveBeenCalledWith("cat-1", expect.any(Object));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should not call deleteCategory if category is null", async () => {
    const user = userEvent.setup();
    render(<DeleteCategoryDialog category={null} isOpen={true} onClose={onCloseMock} />);
    
    const deleteBtn = screen.getByTestId("button-destructive");
    await user.click(deleteBtn);

    expect(mockDeleteCategory).not.toHaveBeenCalled();
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it("should handle loading state properly", () => {
    (useDeleteCategory as any).mockReturnValue({
      mutate: mockDeleteCategory,
      isPending: true,
    });
    
    render(<DeleteCategoryDialog category={mockCategory} isOpen={true} onClose={onCloseMock} />);
    
    expect(screen.getByTestId("button-outline")).toBeDisabled();
    expect(screen.getByTestId("button-destructive")).toBeDisabled();
    expect(screen.getByTestId("button-destructive")).toHaveTextContent("Siliniyor...");
  });
});
