 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostCookDepletedModal } from './PostCookDepletedModal';
import { MeasurementCategory, MeasurementUnit } from '@/shared/constants/measurement';

describe('PostCookDepletedModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSync = vi.fn();

  const depletedIngredients: any[] = [
    { id: '1', name: 'Salt', unitFamily: MeasurementCategory.Weight },
    { id: '2', name: 'Water', unitFamily: MeasurementCategory.Volume },
    { id: '3', name: 'Apple', unitFamily: MeasurementCategory.Count },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (isOpen = true, isSyncing = false) => {
    return render(
      <PostCookDepletedModal
        isOpen={isOpen}
        onClose={mockOnClose}
        depletedIngredients={depletedIngredients}
        onSync={mockOnSync}
        isSyncing={isSyncing}
      />
    );
  };

  it('does not render when isOpen is false', () => {
    renderComponent(false);
    expect(screen.queryByText('Biten Malzemeler')).not.toBeInTheDocument();
  });

  it('renders correctly and sets default quantities based on unit family', () => {
    renderComponent();
    expect(screen.getByText('Biten Malzemeler')).toBeInTheDocument();
    
    expect(screen.getByText('Salt')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();

    const inputs = screen.getAllByRole('spinbutton');
    // weight -> 250
    expect(inputs[0]).toHaveValue(250);
    // volume -> 500
    expect(inputs[1]).toHaveValue(500);
    // count -> 1
    expect(inputs[2]).toHaveValue(1);
  });

  it('toggles selection and syncs selected items', () => {
    renderComponent();

    // Toggle Apple off
    const appleToggle = screen.getByText('Apple');
    fireEvent.click(appleToggle);

    // Sync
    const syncButton = screen.getByRole('button', { name: /Listeye Ekle/i });
    fireEvent.click(syncButton);

    expect(mockOnSync).toHaveBeenCalledWith([
      { ingredientId: '1', quantity: 250, unit: MeasurementUnit.Gram },
      { ingredientId: '2', quantity: 500, unit: MeasurementUnit.Milliliter },
    ]);
  });

  it('handles quantity and unit changes', () => {
    renderComponent();

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '100' } });

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: MeasurementUnit.Kilogram.toString() } });

    // Untoggle others to keep test simple
    fireEvent.click(screen.getByText('Water'));
    fireEvent.click(screen.getByText('Apple'));

    const syncButton = screen.getByRole('button', { name: /Listeye Ekle/i });
    fireEvent.click(syncButton);

    expect(mockOnSync).toHaveBeenCalledWith([
      { ingredientId: '1', quantity: 100, unit: MeasurementUnit.Kilogram },
    ]);
  });

  it('disables buttons when syncing', () => {
    renderComponent(true, true);
    expect(screen.getByRole('button', { name: /Ekleniyor.../i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Atla/i })).toBeDisabled();
  });

  it('calls onClose when Atla is clicked', () => {
    renderComponent();
    const closeButton = screen.getByRole('button', { name: /Atla/i });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
