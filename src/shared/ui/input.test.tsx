import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('accepts custom classNames', () => {
    render(<Input data-testid="custom-input" className="custom-input-class" />);
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveClass('custom-input-class');
  });

  it('can be disabled', () => {
    render(<Input data-testid="disabled-input" disabled />);
    const input = screen.getByTestId('disabled-input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed');
  });
});
