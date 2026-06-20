<<<<<<< Updated upstream
import { render, screen, waitFor } from "@testing-library/react";
=======
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
>>>>>>> Stashed changes
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { useCreateCategory } from "@/entities/admin-category/api/adminCategoryQueries";
import { CategoryForm } from "@/widgets/admin-category/ui/CategoryForm";
import { toPascalCase } from "@/shared/lib/icon-helpers";

vi.mock("@/entities/admin-category/api/adminCategoryQueries", () => ({
  useCreateCategory: vi.fn(),
}));

vi.mock("@/shared/lib/icon-helpers", () => ({
  toPascalCase: vi.fn((str) => `PascalCase_${str}`),
}));

vi.mock("@/widgets/admin-category/ui/CategoryForm", () => ({
  CategoryForm: vi.fn(({ onSubmit, onCancel, isPending, submitLabel }) => (
    <div data-testid="category-form">
      <button
        data-testid="submit-btn"
        disabled={isPending}
        onClick={() =>
          onSubmit({
            name: "Test Category",
            iconName: "test-icon",
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
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

describe("CreateCategoryDialog", () => {
  const mockCreateCategory = vi.fn();
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCreateCategory as any).mockReturnValue({
      mutate: mockCreateCategory,
      isPending: false,
    });
  });

  it("should not render when isOpen is false", () => {
    render(<CreateCategoryDialog isOpen={false} onClose={onCloseMock} />);
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("should render correctly when isOpen is true", () => {
    render(<CreateCategoryDialog isOpen={true} onClose={onCloseMock} />);
    
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByText("Yeni Kategori Ekle")).toBeInTheDocument();
    expect(screen.getByTestId("category-form")).toBeInTheDocument();
  });

  it("should handle close action via onCancel", async () => {
    const user = userEvent.setup();
    render(<CreateCategoryDialog isOpen={true} onClose={onCloseMock} />);
    
    const cancelBtn = screen.getByTestId("cancel-btn");
    await user.click(cancelBtn);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should handle dialog onOpenChange with false", async () => {
    const user = userEvent.setup();
    render(<CreateCategoryDialog isOpen={true} onClose={onCloseMock} />);
    
    await user.click(screen.getByTestId("dialog-overlay-click"));
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should pass isPending to CategoryForm", () => {
    (useCreateCategory as any).mockReturnValue({
      mutate: mockCreateCategory,
      isPending: true,
    });
    
    render(<CreateCategoryDialog isOpen={true} onClose={onCloseMock} />);
    
    const submitBtn = screen.getByTestId("submit-btn");
    expect(submitBtn).toBeDisabled();
  });

  it("should call createCategory mutation and onClose on submit", async () => {
    const user = userEvent.setup();
    render(<CreateCategoryDialog isOpen={true} onClose={onCloseMock} />);
    
    mockCreateCategory.mockImplementation((data: any, options: any) => {
      options.onSuccess();
    });

    const submitBtn = screen.getByTestId("submit-btn");
    await user.click(submitBtn);

    expect(toPascalCase).toHaveBeenCalledWith("test-icon");
    expect(mockCreateCategory).toHaveBeenCalledWith(
      {
        name: "Test Category",
        iconName: "PascalCase_test-icon",
      },
      expect.any(Object)
    );
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
