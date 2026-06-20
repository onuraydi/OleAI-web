import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renders correctly', () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    const skeleton = container.firstChild;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('accepts custom classNames', () => {
    const { container } = render(<Skeleton className="custom-skeleton-class" />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass('custom-skeleton-class');
  });
});
