import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Checkbox } from './checkbox';
import userEvent from '@testing-library/user-event';

describe('Checkbox', () => {
  it('renders correctly', () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('can be checked and unchecked', async () => {
    const user = userEvent.setup();
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    
    // Default is unchecked
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    
    // Check it
    await user.click(checkbox);
    expect(checkbox).toHaveAttribute('data-state', 'checked');
    
    // Uncheck it
    await user.click(checkbox);
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  });

  it('can be disabled', () => {
    render(<Checkbox data-testid="disabled-checkbox" disabled />);
    const checkbox = screen.getByTestId('disabled-checkbox');
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveClass('disabled:cursor-not-allowed');
  });

  it('accepts custom classNames', () => {
    render(<Checkbox data-testid="custom-checkbox" className="custom-class" />);
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toHaveClass('custom-class');
  });
});
