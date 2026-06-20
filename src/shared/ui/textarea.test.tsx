import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders correctly', () => {
    render(<Textarea placeholder="Type your message" />);
    const textarea = screen.getByPlaceholderText('Type your message');
    expect(textarea).toBeInTheDocument();
  });

  it('accepts custom classNames', () => {
    render(<Textarea data-testid="custom-textarea" className="custom-textarea-class" />);
    const textarea = screen.getByTestId('custom-textarea');
    expect(textarea).toHaveClass('custom-textarea-class');
  });

  it('can be disabled', () => {
    render(<Textarea data-testid="disabled-textarea" disabled />);
    const textarea = screen.getByTestId('disabled-textarea');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:cursor-not-allowed');
  });
});
