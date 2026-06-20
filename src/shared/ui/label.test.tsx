import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from './label';

describe('Label', () => {
  it('renders correctly', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('accepts custom classNames', () => {
    render(<Label className="custom-class">Custom</Label>);
    const label = screen.getByText('Custom');
    expect(label).toHaveClass('custom-class');
  });
});
