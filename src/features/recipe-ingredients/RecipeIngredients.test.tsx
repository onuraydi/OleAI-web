import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecipeIngredients } from "./RecipeIngredients";
import type { RecipeIngredientResponse } from "@/entities/recipe/api/recipeApi";
import { MeasurementUnit } from "@/shared/constants/measurement";

// Mock measurement converter
vi.mock("@/shared/lib/measurement-converter", () => ({
  convertMeasurement: vi.fn((amount, unitId, system) => {
    return {
      amount: amount * 2, // fake multiplier for testing
      unitLabel: system === 'metric' ? 'g' : 'oz'
    };
  })
}));

describe("RecipeIngredients", () => {
  const mockIngredients = [
    {
      ingredientId: "1",
      ingredientName: "Flour",
      amount: 100,
      unitId: MeasurementUnit.Gram as unknown as number,
      unitFamily: 1,
      isRequired: true,
      notes: ""
    } as RecipeIngredientResponse,
    {
      ingredientId: "2",
      ingredientName: "Sugar",
      amount: 50,
      unitId: MeasurementUnit.Gram as unknown as number,
      unitFamily: 1,
      isRequired: false,
      notes: ""
    } as RecipeIngredientResponse
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ingredients and toggles checked state", () => {
    render(<RecipeIngredients ingredients={mockIngredients} />);
    
    expect(screen.getByText("Malzemeler")).toBeInTheDocument();
    expect(screen.getByText("Flour")).toBeInTheDocument();
    expect(screen.getByText("Sugar")).toBeInTheDocument();

    const firstIngredient = screen.getByText("Flour").closest("div[role='button']")!;
    expect(firstIngredient).not.toHaveClass("opacity-60");

    // Toggle check
    fireEvent.click(firstIngredient);
    expect(firstIngredient).toHaveClass("opacity-60");

    // Untoggle
    fireEvent.click(firstIngredient);
    expect(firstIngredient).not.toHaveClass("opacity-60");
  });

  it("changes servings", () => {
    render(<RecipeIngredients ingredients={mockIngredients} />);
    
    const servingsText = screen.getByText("1");
    expect(servingsText).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    const minusBtn = buttons[0]; // Minus button
    const plusBtn = buttons[1]; // Plus button

    // Initially minus should be disabled
    expect(minusBtn).toBeDisabled();

    // Increase servings
    fireEvent.click(plusBtn);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(minusBtn).not.toBeDisabled();

    // Decrease servings
    fireEvent.click(minusBtn);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(minusBtn).toBeDisabled();
  });

  it("toggles measurement system", () => {
    render(<RecipeIngredients ingredients={mockIngredients} />);

    // Metric is active by default
    const metricBtn = screen.getByText("Metrik");
    const imperialBtn = screen.getByText("İngiliz");

    expect(metricBtn).toHaveClass("bg-background");
    expect(imperialBtn).toHaveClass("text-muted-foreground");

    // Switch to Imperial
    fireEvent.click(imperialBtn);
    expect(imperialBtn).toHaveClass("bg-background");
    expect(metricBtn).toHaveClass("text-muted-foreground");

    // Measurement strings
    // In our mock, amount * 2 = 200, unitLabel = 'oz' for imperial
    expect(screen.getByText("200 oz")).toBeInTheDocument();
    expect(screen.getByText("100 oz")).toBeInTheDocument();
  });

  it("supports keyboard interaction for checking items", () => {
    render(<RecipeIngredients ingredients={mockIngredients} />);
    
    const firstIngredient = screen.getByText("Flour").closest("div[role='button']")!;
    
    fireEvent.keyDown(firstIngredient, { key: "Enter" });
    expect(firstIngredient).toHaveClass("opacity-60");
    
    fireEvent.keyDown(firstIngredient, { key: " " });
    expect(firstIngredient).not.toHaveClass("opacity-60");
  });
});
