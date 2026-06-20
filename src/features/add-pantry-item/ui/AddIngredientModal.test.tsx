 
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddIngredientModal } from "./AddIngredientModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAddIngredientStore } from "@/entities/pantry/model/useAddIngredientStore";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("@/entities/pantry/api/pantryApi", () => ({
  pantryApi: {
    searchIngredients: vi.fn(),
    getCategories: vi.fn(),
    getPopularByCategory: vi.fn(),
    addMultipleIngredients: vi.fn(),
  },
}));

vi.mock("@/entities/pantry/model/useAddIngredientStore", () => {
  // Use a simple scoped variable to maintain state in our mock
  let pantryDrafts: any[] = [];
  let shoppingListDrafts: any[] = [];
  return {
    useAddIngredientStore: vi.fn(() => ({
      pantryDrafts,
      setPantryDrafts: (items: any) => { pantryDrafts = items; },
      clearPantryDrafts: () => { pantryDrafts = []; },
      shoppingListDrafts,
      setShoppingListDrafts: (items: any) => { shoppingListDrafts = items; },
      clearShoppingListDrafts: () => { shoppingListDrafts = []; },
    })),
  };
});

// Mock Framer Motion to bypass animations
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("AddIngredientModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmitOverride = vi.fn();
  const mockQueryClient = { invalidateQueries: vi.fn() };
  let mockMutate: any;

  beforeEach(() => {
    vi.clearAllMocks();

    (useQueryClient as any).mockReturnValue(mockQueryClient);

    (useQuery as any).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === "categories") {
        return { data: [{ id: "cat1", name: "Fruits" }], isLoading: false };
      }
      if (queryKey[0] === "popular-ingredients-by-category") {
        return { 
          data: [{
            categoryId: "cat1",
            categoryName: "Fruits",
            ingredients: [
              { masterIngredientId: "ing1", displayName: "Apple", categoryName: "Fruits", unitFamily: 1 }
            ]
          }], 
          isLoading: false 
        };
      }
      if (queryKey[0] === "search-ingredients") {
        return { data: [], isLoading: false };
      }
      return { data: undefined, isLoading: false };
    });

    mockMutate = vi.fn();
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      reset: vi.fn(),
    });

    // Reset store state
    const store = useAddIngredientStore() as any;
    store.clearPantryDrafts();
    store.clearShoppingListDrafts();
  });

  it("does not render when isOpen is false", () => {
    render(<AddIngredientModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText("Dolaba Malzeme Ekle")).not.toBeInTheDocument();
  });

  it("renders properly and shows popular categories initially", () => {
    render(<AddIngredientModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText("Dolaba Malzeme Ekle")).toBeInTheDocument();
    expect(screen.getByText("Fruits")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("handles input search and adds an item to draft list", async () => {
    // Override search query to return something
    (useQuery as any).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === "search-ingredients" && queryKey[1] === "App") {
        return {
          data: [{ masterIngredientId: "ing2", displayName: "Apple Pie", categoryName: "Desserts", unitFamily: 1 }],
          isLoading: false
        };
      }
      return { data: [], isLoading: false };
    });

    render(<AddIngredientModal isOpen={true} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText("Elma, Un, Süt...");
    fireEvent.change(searchInput, { target: { value: "App" } });

    await waitFor(() => {
      expect(screen.getByText("Apple Pie")).toBeInTheDocument();
    });
    
    // Select the ingredient
    fireEvent.click(screen.getByText("Apple Pie"));

    // Check if right side form is populated
    expect(screen.getAllByText("Apple Pie").length).toBeGreaterThan(0);

    // Submit right side form
    const addBtn = screen.getByText("Listeye Ekle");
    fireEvent.click(addBtn);

    // Should appear in staging area
    const store = useAddIngredientStore() as any;
    expect(store.pantryDrafts.length).toBe(1);
    expect(store.pantryDrafts[0].ingredient.displayName).toBe("Apple Pie");
  });

  it("handles custom ingredient add", () => {
    render(<AddIngredientModal isOpen={true} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText("Elma, Un, Süt...");
    fireEvent.change(searchInput, { target: { value: "Dragonfruit" } });

    // Since it won't find it, we click "Sistemde Bulunamadı"
    const notFoundBtn = screen.getByText(/"Dragonfruit" Bulunamadı/i);
    fireEvent.click(notFoundBtn);

    // Then add to list
    const addBtn = screen.getByText("Listeye Ekle");
    fireEvent.click(addBtn);

    const store = useAddIngredientStore() as any;
    expect(store.pantryDrafts.length).toBe(1);
    expect(store.pantryDrafts[0].customName).toBe("Dragonfruit");
  });

  it("submits the staged list using mutation", async () => {
    render(<AddIngredientModal isOpen={true} onClose={mockOnClose} />);

    // Add an item first
    const searchInput = screen.getByPlaceholderText("Elma, Un, Süt...");
    fireEvent.change(searchInput, { target: { value: "Egg" } });
    
    const notFoundBtn = screen.getByText(/"Egg" Bulunamadı/i);
    fireEvent.click(notFoundBtn);

    fireEvent.click(screen.getByText("Listeye Ekle"));

    // Save All
    const saveAllBtn = screen.getByText("1 Ürünü Dolaba Ekle");
    fireEvent.click(saveAllBtn);

    expect(mockMutate).toHaveBeenCalled();
    const payload = mockMutate.mock.calls[0][0];
    expect(payload.ingredients.length).toBe(1);
    expect(payload.ingredients[0].requestedName).toBe("Egg");
  });

  it("respects onSubmitOverride", () => {
    render(<AddIngredientModal isOpen={true} onClose={mockOnClose} onSubmitOverride={mockOnSubmitOverride} />);

    const searchInput = screen.getByPlaceholderText("Elma, Un, Süt...");
    fireEvent.change(searchInput, { target: { value: "Egg" } });
    
    const notFoundBtn = screen.getByText(/"Egg" Bulunamadı/i);
    fireEvent.click(notFoundBtn);

    fireEvent.click(screen.getByText("Listeye Ekle"));

    const saveAllBtn = screen.getByText("1 Ürünü Dolaba Ekle");
    fireEvent.click(saveAllBtn);

    expect(mockOnSubmitOverride).toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("handles mode 'shopping-list' and stores in shoppingListDrafts", () => {
    render(<AddIngredientModal isOpen={true} onClose={mockOnClose} mode="shopping-list" />);
    
    expect(screen.getByText("Listeye Malzeme Ekle")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Elma, Un, Süt...");
    fireEvent.change(searchInput, { target: { value: "Milk" } });
    
    const notFoundBtn = screen.getByText(/"Milk" Bulunamadı/i);
    fireEvent.click(notFoundBtn);

    fireEvent.click(screen.getAllByText("Listeye Ekle")[0]);

    const store = useAddIngredientStore() as any;
    expect(store.shoppingListDrafts.length).toBe(1);
    expect(store.pantryDrafts.length).toBe(0);

    const saveAllBtn = screen.getByText("1 Ürünü Listeye Ekle");
    expect(saveAllBtn).toBeInTheDocument();
  });
});
