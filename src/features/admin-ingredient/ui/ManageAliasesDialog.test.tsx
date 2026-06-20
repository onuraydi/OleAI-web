/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ManageAliasesDialog } from "./ManageAliasesDialog";

const mockAddMutateAsync = vi.fn();
const mockDeleteMutateAsync = vi.fn();
const mockRestoreMutateAsync = vi.fn();

vi.mock("@/entities/admin-ingredient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/admin-ingredient")>();
  return {
    ...actual,
    useIngredientAliases: vi.fn(() => ({
      data: [
        { id: "alias-1", aliasName: "Elmacık", deletedDate: null },
        { id: "alias-2", aliasName: "Silinmiş Elma", deletedDate: "2024-01-01T00:00:00Z" }
      ],
      isLoading: false
    })),
    useAddAliasMutation: vi.fn(() => ({
      mutateAsync: mockAddMutateAsync,
      isPending: false
    })),
    useDeleteAliasMutation: vi.fn(() => ({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false
    })),
    useRestoreAliasMutation: vi.fn(() => ({
      mutateAsync: mockRestoreMutateAsync,
      isPending: false
    }))
  };
});

describe("ManageAliasesDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockIngredient: any = {
    id: "ing-1",
    name: "Elma",
    categoryName: "Meyveler",
    unitFamily: "count" as unknown,
    isPolarizing: false,
    isStaple: false,
    defaultExpirationMode: "ShelfLife" as unknown,
    estimatedShelfLifeInDays: 7,
    createdAt: "",
    updatedAt: "",
    aliases: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render if ingredient is null", () => {
    const { container } = render(
      <ManageAliasesDialog ingredient={null} open={true} onOpenChange={mockOnOpenChange} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders correctly with ingredient and lists aliases", () => {
    render(
      <ManageAliasesDialog ingredient={mockIngredient} open={true} onOpenChange={mockOnOpenChange} />
    );
    
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Elma Alias Yönetimi")).toBeInTheDocument();
    expect(screen.getByText("Elmacık")).toBeInTheDocument();
    expect(screen.getByText("Silinmiş Elma")).toBeInTheDocument();
  });

  it("adds a new alias", async () => {
    mockAddMutateAsync.mockResolvedValue({});
    render(
      <ManageAliasesDialog ingredient={mockIngredient} open={true} onOpenChange={mockOnOpenChange} />
    );
    
    const input = screen.getByPlaceholderText(/Yeni eş anlamlı kelime/i);
    fireEvent.change(input, { target: { value: "Yeni Elma" } });
    
    // Add button is the first button inside the form. In this dialog it's the submit button
    const addButton = input.nextElementSibling as HTMLButtonElement;
    
    await waitFor(() => {
      expect(addButton.disabled).toBe(false);
    });
    
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockAddMutateAsync).toHaveBeenCalledWith("Yeni Elma");
    });
  });

  it("deletes an alias", async () => {
    mockDeleteMutateAsync.mockResolvedValue({});
    render(
      <ManageAliasesDialog ingredient={mockIngredient} open={true} onOpenChange={mockOnOpenChange} />
    );
    
    // Delete button has no text, so get it by finding the button inside the li of "Elmacık"
    const elmacikSpan = screen.getByText("Elmacık");
    const deleteButton = elmacikSpan.nextElementSibling as HTMLElement;
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith("alias-1");
    });
  });

  it("restores a deleted alias", async () => {
    mockRestoreMutateAsync.mockResolvedValue({});
    render(
      <ManageAliasesDialog ingredient={mockIngredient} open={true} onOpenChange={mockOnOpenChange} />
    );
    
    const restoreButtons = screen.getAllByRole("button", { name: /Geri Getir/i });
    fireEvent.click(restoreButtons[0]);
    
    await waitFor(() => {
      expect(mockRestoreMutateAsync).toHaveBeenCalledWith("alias-2");
    });
  });
});
