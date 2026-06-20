import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateAllergyDialog } from "./UpdateAllergyDialog";
import { useUpdateAllergy, useAdminAllergyById } from "@/entities/admin-allergy";
import { toPascalCase } from "@/shared/lib/icon-helpers";

vi.mock("@/entities/admin-allergy", () => ({
  useUpdateAllergy: vi.fn(),
  useAdminAllergyById: vi.fn(),
}));

vi.mock("@/shared/lib/icon-helpers", () => ({
  toPascalCase: vi.fn((str) => `PascalCase_${str}`),
}));

vi.mock("@/widgets/admin-allergy/ui/AllergyForm", () => ({
  AllergyForm: vi.fn(({ onSubmit, onCancel, isPending, initialData, submitLabel }) => (
    <div data-testid="allergy-form">
      <div data-testid="initial-data-name">{initialData?.name}</div>
      <button
        data-testid="submit-btn"
        disabled={isPending}
        onClick={() =>
          onSubmit({
            name: "Updated Allergy",
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

describe("UpdateAllergyDialog", () => {
  const mockUpdateAllergy = vi.fn();
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUpdateAllergy as unknown).mockReturnValue({
      mutate: mockUpdateAllergy,
      isPending: false,
    });
    (useAdminAllergyById as unknown).mockReturnValue({
      data: { id: "123", name: "Old Allergy" },
      isLoading: false,
    });
  });

  it("should not render when allergyId is null", () => {
    render(<UpdateAllergyDialog allergyId={null} onClose={onCloseMock} />);
    expect(screen.queryByTestId("premium-entity-dialog")).not.toBeInTheDocument();
  });

  it("should display loading state when allergy data is loading", () => {
    (useAdminAllergyById as unknown).mockReturnValue({
      isLoading: true,
    });
    
    render(<UpdateAllergyDialog allergyId="123" onClose={onCloseMock} />);
    
    expect(screen.getByText("Profil Bilgileri Yükleniyor...")).toBeInTheDocument();
    expect(screen.queryByTestId("allergy-form")).not.toBeInTheDocument();
  });

  it("should render AllergyForm with initialData when loaded", () => {
    render(<UpdateAllergyDialog allergyId="123" onClose={onCloseMock} />);
    
    expect(screen.getByTestId("premium-entity-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("allergy-form")).toBeInTheDocument();
    expect(screen.getByTestId("initial-data-name")).toHaveTextContent("Old Allergy");
    expect(screen.getByText("Kısıtlamayı Güncelle")).toBeInTheDocument();
  });

  it("should handle close action", async () => {
    const user = userEvent.setup();
    render(<UpdateAllergyDialog allergyId="123" onClose={onCloseMock} />);
    
    const cancelBtn = screen.getByTestId("cancel-btn");
    await user.click(cancelBtn);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should call updateAllergy mutation and onClose on submit", async () => {
    const user = userEvent.setup();
    render(<UpdateAllergyDialog allergyId="123" onClose={onCloseMock} />);
    
    mockUpdateAllergy.mockImplementation((data: unknown, options: unknown) => {
      options.onSuccess();
    });

    const submitBtn = screen.getByTestId("submit-btn");
    await user.click(submitBtn);

    expect(toPascalCase).toHaveBeenCalledWith("updated-icon");
    expect(mockUpdateAllergy).toHaveBeenCalledWith(
      {
        id: "123",
        name: "Updated Allergy",
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

  it("should handle submit when allergyId is somehow null (edge case)", async () => {
    // We render it directly using a tricked prop to simulate the component being mounted
    // but without an allergyId or allergyId disappearing during render
    render(<UpdateAllergyDialog allergyId="" onClose={onCloseMock} />);
    
    const submitBtn = screen.queryByTestId("submit-btn");
    expect(submitBtn).not.toBeInTheDocument();
  });

  it("should pass isPending to AllergyForm", () => {
    (useUpdateAllergy as unknown).mockReturnValue({
      mutate: mockUpdateAllergy,
      isPending: true,
    });
    
    render(<UpdateAllergyDialog allergyId="123" onClose={onCloseMock} />);
    
    const submitBtn = screen.getByTestId("submit-btn");
    expect(submitBtn).toBeDisabled();
  });
});
