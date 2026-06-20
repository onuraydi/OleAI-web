<<<<<<< Updated upstream
import { render, screen, waitFor } from "@testing-library/react";
=======
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
>>>>>>> Stashed changes
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateAllergyDialog } from "./CreateAllergyDialog";
import { useCreateAllergy } from "@/entities/admin-allergy";
import { AllergyForm } from "@/widgets/admin-allergy/ui/AllergyForm";
import { toPascalCase } from "@/shared/lib/icon-helpers";

vi.mock("@/entities/admin-allergy", () => ({
  useCreateAllergy: vi.fn(),
}));

vi.mock("@/shared/lib/icon-helpers", () => ({
  toPascalCase: vi.fn((str) => `PascalCase_${str}`),
}));

vi.mock("@/widgets/admin-allergy/ui/AllergyForm", () => ({
  AllergyForm: vi.fn(({ onSubmit, onCancel, isPending, submitLabel }) => (
    <div data-testid="allergy-form">
      <button
        data-testid="submit-btn"
        disabled={isPending}
        onClick={() =>
          onSubmit({
            name: "Test Allergy",
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

// We mock PremiumEntityDialog to just render its children, so it's easier to test the dialog's content
vi.mock("@/shared/ui/dialog/PremiumEntityDialog", () => ({
  PremiumEntityDialog: ({ isOpen, children, title }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="premium-entity-dialog">
        <h1>{title}</h1>
        {children}
      </div>
    );
  },
}));

describe("CreateAllergyDialog", () => {
  const mockCreateAllergy = vi.fn();
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCreateAllergy as any).mockReturnValue({
      mutate: mockCreateAllergy,
      isPending: false,
    });
  });

  it("should not render when isOpen is false", () => {
    render(<CreateAllergyDialog isOpen={false} onClose={onCloseMock} />);
    expect(screen.queryByTestId("premium-entity-dialog")).not.toBeInTheDocument();
  });

  it("should render correctly when isOpen is true", () => {
    render(<CreateAllergyDialog isOpen={true} onClose={onCloseMock} />);
    
    expect(screen.getByTestId("premium-entity-dialog")).toBeInTheDocument();
    expect(screen.getByText("Yeni Kısıtlama Ekle")).toBeInTheDocument();
    expect(screen.getByTestId("allergy-form")).toBeInTheDocument();
  });

  it("should handle close action", async () => {
    const user = userEvent.setup();
    render(<CreateAllergyDialog isOpen={true} onClose={onCloseMock} />);
    
    const cancelBtn = screen.getByTestId("cancel-btn");
    await user.click(cancelBtn);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("should pass isPending to AllergyForm", () => {
    (useCreateAllergy as any).mockReturnValue({
      mutate: mockCreateAllergy,
      isPending: true,
    });
    
    render(<CreateAllergyDialog isOpen={true} onClose={onCloseMock} />);
    
    const submitBtn = screen.getByTestId("submit-btn");
    expect(submitBtn).toBeDisabled();
  });

  it("should call createAllergy mutation and onClose on submit", async () => {
    const user = userEvent.setup();
    render(<CreateAllergyDialog isOpen={true} onClose={onCloseMock} />);
    
    // Setup mutation to call onSuccess
    mockCreateAllergy.mockImplementation((data: any, options: any) => {
      options.onSuccess();
    });

    const submitBtn = screen.getByTestId("submit-btn");
    await user.click(submitBtn);

    expect(toPascalCase).toHaveBeenCalledWith("test-icon");
    expect(mockCreateAllergy).toHaveBeenCalledWith(
      {
        name: "Test Allergy",
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
    (AllergyForm as any).mockImplementationOnce(({ onSubmit }: any) => (
      <button
        data-testid="submit-null-desc"
        onClick={() => onSubmit({ name: "A1", iconName: "icon", description: null })}
      >
        Submit
      </button>
    ));

    render(<CreateAllergyDialog isOpen={true} onClose={onCloseMock} />);
    
    await user.click(screen.getByTestId("submit-null-desc"));
    
    expect(mockCreateAllergy).toHaveBeenCalledWith(
      expect.objectContaining({
        description: undefined,
      }),
      expect.any(Object)
    );
  });
});
