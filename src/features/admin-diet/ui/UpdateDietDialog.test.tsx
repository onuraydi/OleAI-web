/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateDietDialog } from "./UpdateDietDialog";
import { useUpdateDiet, useAdminDietById } from "@/entities/admin-diet";
import { toPascalCase } from "@/shared/lib/icon-helpers";

vi.mock("@/entities/admin-diet", () => ({
  useUpdateDiet: vi.fn(),
  useAdminDietById: vi.fn(),
}));

vi.mock("@/shared/lib/icon-helpers", () => ({
  toPascalCase: vi.fn((str) => `PascalCase_${str}`),
}));

vi.mock("@/widgets/admin-diet/ui/DietForm", () => ({
  DietForm: vi.fn(({ onSubmit, onCancel, isPending, initialData, submitLabel }) => (
    <div data-testid="diet-form">
      <div data-testid="initial-data-name">{initialData?.name}</div>
      <button
        data-testid="submit-btn"
        disabled={isPending}
        onClick={() =>
          onSubmit({
            name: "Updated Diet",
            iconName: "updated-icon",
            description: "Updated description",
            isActive: false,
            excludedIngredientIds: ["4"],
            excludedCategoryIds: ["5"],
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

describe("UpdateDietDialog", () => {
  const mockUpdateDiet = vi.fn();
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUpdateDiet as unknown).mockReturnValue({
      mutate: mockUpdateDiet,
      isPending: false,
    });
    (useAdminDietById as unknown).mockReturnValue({
      data: { id: "d123", name: "Old Diet" },
      isLoading: false,
    });
  });

  it("should not render when dietId is null", () => {
    render(<UpdateDietDialog dietId={null} onClose={onCloseMock} />);
    expect(screen.queryByTestId("premium-entity-dialog")).not.toBeInTheDocument();
  });

  it("should display loading state when diet data is loading", () => {
    (useAdminDietById as unknown).mockReturnValue({
      isLoading: true,
    });
    
    render(<UpdateDietDialog dietId="d123" onClose={onCloseMock} />);
    
    expect(screen.getByText("Profil Bilgileri Yükleniyor...")).toBeInTheDocument();
    expect(screen.queryByTestId("diet-form")).not.toBeInTheDocument();
  });

  it("should render DietForm with initialData when loaded", () => {
    render(<UpdateDietDialog dietId="d123" onClose={onCloseMock} />);
    
    expect(screen.getByTestId("premium-entity-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("diet-form")).toBeInTheDocument();
    expect(screen.getByTestId("initial-data-name")).toHaveTextContent("Old Diet");
    expect(screen.getByText("Diyeti Güncelle")).toBeInTheDocument();
  });

  it("should handle close action", async () => {
    const user = userEvent.setup();
    render(<UpdateDietDialog dietId="d123" onClose={onCloseMock} />);
    
    const cancelBtn = screen.getByTestId("cancel-btn");
    await user.click(cancelBtn);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should call updateDiet mutation and onClose on submit", async () => {
    const user = userEvent.setup();
    render(<UpdateDietDialog dietId="d123" onClose={onCloseMock} />);
    
    mockUpdateDiet.mockImplementation((data: unknown, options: unknown) => {
      options.onSuccess();
    });

    const submitBtn = screen.getByTestId("submit-btn");
    await user.click(submitBtn);

    expect(toPascalCase).toHaveBeenCalledWith("updated-icon");
    expect(mockUpdateDiet).toHaveBeenCalledWith(
      {
        id: "d123",
        name: "Updated Diet",
        iconName: "PascalCase_updated-icon",
        description: "Updated description",
        isActive: false,
        excludedIngredientIds: ["4"],
        excludedCategoryIds: ["5"],
      },
      expect.any(Object)
    );
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should handle submit when dietId is somehow null (edge case)", async () => {
    render(<UpdateDietDialog dietId="" onClose={onCloseMock} />);
    
    const submitBtn = screen.queryByTestId("submit-btn");
    expect(submitBtn).not.toBeInTheDocument();
  });

  it("should pass isPending to DietForm", () => {
    (useUpdateDiet as unknown).mockReturnValue({
      mutate: mockUpdateDiet,
      isPending: true,
    });
    
    render(<UpdateDietDialog dietId="d123" onClose={onCloseMock} />);
    
    const submitBtn = screen.getByTestId("submit-btn");
    expect(submitBtn).toBeDisabled();
  });
});
