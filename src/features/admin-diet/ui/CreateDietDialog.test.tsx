import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateDietDialog } from "./CreateDietDialog";
import { useCreateDiet } from "@/entities/admin-diet";
import { DietForm } from "@/widgets/admin-diet/ui/DietForm";
import { toPascalCase } from "@/shared/lib/icon-helpers";

vi.mock("@/entities/admin-diet", () => ({
  useCreateDiet: vi.fn(),
}));

vi.mock("@/shared/lib/icon-helpers", () => ({
  toPascalCase: vi.fn((str) => `PascalCase_${str}`),
}));

vi.mock("@/widgets/admin-diet/ui/DietForm", () => ({
  DietForm: vi.fn(({ onSubmit, onCancel, isPending, submitLabel }) => (
    <div data-testid="diet-form">
      <button
        data-testid="submit-btn"
        disabled={isPending}
        onClick={() =>
          onSubmit({
            name: "Test Diet",
            iconName: "test-icon",
            description: "Test description",
            isActive: true,
            excludedIngredientIds: ["1", "2"],
            excludedCategoryIds: ["3"],
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

vi.mock("@/shared/ui/dialog/PremiumEntityDialog", () => ({
  PremiumEntityDialog: ({ isOpen, children, title }: unknown) => {
    if (!isOpen) return null;
    return (
      <div data-testid="premium-entity-dialog">
        <h1>{title}</h1>
        {children}
      </div>
    );
  },
}));

describe("CreateDietDialog", () => {
  const mockCreateDiet = vi.fn();
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCreateDiet as unknown).mockReturnValue({
      mutate: mockCreateDiet,
      isPending: false,
    });
  });

  it("should not render when isOpen is false", () => {
    render(<CreateDietDialog isOpen={false} onClose={onCloseMock} />);
    expect(screen.queryByTestId("premium-entity-dialog")).not.toBeInTheDocument();
  });

  it("should render correctly when isOpen is true", () => {
    render(<CreateDietDialog isOpen={true} onClose={onCloseMock} />);
    
    expect(screen.getByTestId("premium-entity-dialog")).toBeInTheDocument();
    expect(screen.getByText("Yeni Diyet Tercihi")).toBeInTheDocument();
    expect(screen.getByTestId("diet-form")).toBeInTheDocument();
  });

  it("should handle close action", async () => {
    const user = userEvent.setup();
    render(<CreateDietDialog isOpen={true} onClose={onCloseMock} />);
    
    const cancelBtn = screen.getByTestId("cancel-btn");
    await user.click(cancelBtn);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should pass isPending to DietForm", () => {
    (useCreateDiet as unknown).mockReturnValue({
      mutate: mockCreateDiet,
      isPending: true,
    });
    
    render(<CreateDietDialog isOpen={true} onClose={onCloseMock} />);
    
    const submitBtn = screen.getByTestId("submit-btn");
    expect(submitBtn).toBeDisabled();
  });

  it("should call createDiet mutation and onClose on submit", async () => {
    const user = userEvent.setup();
    render(<CreateDietDialog isOpen={true} onClose={onCloseMock} />);
    
    mockCreateDiet.mockImplementation((data: unknown, options: unknown) => {
      options.onSuccess();
    });

    const submitBtn = screen.getByTestId("submit-btn");
    await user.click(submitBtn);

    expect(toPascalCase).toHaveBeenCalledWith("test-icon");
    expect(mockCreateDiet).toHaveBeenCalledWith(
      {
        name: "Test Diet",
        iconName: "PascalCase_test-icon",
        description: "Test description",
        isActive: true,
        excludedIngredientIds: ["1", "2"],
        excludedCategoryIds: ["3"],
      },
      expect.any(Object)
    );
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should handle description being null correctly", async () => {
    const user = userEvent.setup();
    (DietForm as unknown).mockImplementationOnce(({ onSubmit }: unknown) => (
      <button
        data-testid="submit-null-desc"
        onClick={() => onSubmit({ name: "D1", iconName: "icon", description: null })}
      >
        Submit
      </button>
    ));

    render(<CreateDietDialog isOpen={true} onClose={onCloseMock} />);
    
    await user.click(screen.getByTestId("submit-null-desc"));
    
    expect(mockCreateDiet).toHaveBeenCalledWith(
      expect.objectContaining({
        description: undefined,
      }),
      expect.any(Object)
    );
  });
});
