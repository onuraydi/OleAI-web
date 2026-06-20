import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { useUpdateCategory } from "@/entities/admin-category/api/adminCategoryQueries";
import { toPascalCase } from "@/shared/lib/icon-helpers";
import type { Category } from "@/entities/admin-category/model/types";

vi.mock("@/entities/admin-category/api/adminCategoryQueries", () => ({
  useUpdateCategory: vi.fn(),
}));

vi.mock("@/shared/lib/icon-helpers", () => ({
  toPascalCase: vi.fn((str) => `PascalCase_${str}`),
}));

vi.mock("@/widgets/admin-category/ui/CategoryForm", () => ({
  CategoryForm: vi.fn(({ onSubmit, onCancel, isPending, submitLabel, initialData }) => (
    <div data-testid="category-form">
      <div data-testid="initial-data-name">{initialData?.name}</div>
      <button
        data-testid="submit-btn"
        disabled={isPending}
        onClick={() =>
          onSubmit({
            name: "Updated Category",
            iconName: "updated-icon",
          })
        }
      >
        {submitLabel}
      </button>
      <button data-testid="cancel-btn" onClick={onCancel}>
        Cancel
      </button>
    </div>
  )),
}));

vi.mock("@/shared/ui/dialog", () => ({
  Dialog: ({ open, onOpenChange, children }: unknown) => {
    if (!open) return null;
    return (
      <div data-testid="dialog">
        <button data-testid="dialog-overlay-click" onClick={() => onOpenChange(false)} />
        {children}
      </div>
    );
  },
  DialogContent: ({ children }: unknown) => <div>{children}</div>,
  DialogHeader: ({ children }: unknown) => <header>{children}</header>,
  DialogTitle: ({ children }: unknown) => <h2>{children}</h2>,
  DialogDescription: ({ children }: unknown) => <p>{children}</p>,
}));

describe("EditCategoryDialog", () => {
  const mockUpdateCategory = vi.fn();
  const onCloseMock = vi.fn();

  const mockCategory: any = {
    id: "cat-1",
    name: "Old Category",
    iconName: "OldIcon",
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useUpdateCategory as unknown).mockReturnValue({
      mutate: mockUpdateCategory,
      isPending: false,
    });
  });

  it("should not render when isOpen is false", () => {
    render(<EditCategoryDialog category={mockCategory} isOpen={false} onClose={onCloseMock} />);
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("should render correctly when isOpen is true", () => {
    render(<EditCategoryDialog category={mockCategory} isOpen={true} onClose={onCloseMock} />);
    
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByText("Kategoriyi Düzenle")).toBeInTheDocument();
    expect(screen.getByTestId("category-form")).toBeInTheDocument();
    expect(screen.getByTestId("initial-data-name")).toHaveTextContent("Old Category");
  });

  it("should render with null initial data if category is null", () => {
    render(<EditCategoryDialog category={null} isOpen={true} onClose={onCloseMock} />);
    expect(screen.getByTestId("initial-data-name")).toBeEmptyDOMElement();
  });

  it("should handle close action via onCancel", async () => {
    const user = userEvent.setup();
    render(<EditCategoryDialog category={mockCategory} isOpen={true} onClose={onCloseMock} />);
    
    const cancelBtn = screen.getByTestId("cancel-btn");
    await user.click(cancelBtn);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should pass isPending to CategoryForm", () => {
    (useUpdateCategory as unknown).mockReturnValue({
      mutate: mockUpdateCategory,
      isPending: true,
    });
    
    render(<EditCategoryDialog category={mockCategory} isOpen={true} onClose={onCloseMock} />);
    
    const submitBtn = screen.getByTestId("submit-btn");
    expect(submitBtn).toBeDisabled();
  });

  it("should call updateCategory mutation and onClose on submit", async () => {
    const user = userEvent.setup();
    render(<EditCategoryDialog category={mockCategory} isOpen={true} onClose={onCloseMock} />);
    
    mockUpdateCategory.mockImplementation((data: unknown, options: unknown) => {
      options.onSuccess();
    });

    const submitBtn = screen.getByTestId("submit-btn");
    await user.click(submitBtn);

    expect(toPascalCase).toHaveBeenCalledWith("updated-icon");
    expect(mockUpdateCategory).toHaveBeenCalledWith(
      {
        id: "cat-1",
        name: "Updated Category",
        iconName: "PascalCase_updated-icon",
      },
      expect.any(Object)
    );
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should not call updateCategory if category is null", async () => {
    const user = userEvent.setup();
    render(<EditCategoryDialog category={null} isOpen={true} onClose={onCloseMock} />);
    
    const submitBtn = screen.getByTestId("submit-btn");
    await user.click(submitBtn);

    expect(mockUpdateCategory).not.toHaveBeenCalled();
    expect(onCloseMock).not.toHaveBeenCalled();
  });
});
