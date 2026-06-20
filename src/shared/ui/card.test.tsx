import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card Components', () => {
  it('renders all card components correctly', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="card-header">
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="card-content">
          <p>Card Content</p>
        </CardContent>
        <CardFooter data-testid="card-footer">
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('accepts custom classNames for Card', () => {
    render(<Card data-testid="card" className="custom-card-class" />);
    expect(screen.getByTestId('card')).toHaveClass('custom-card-class');
  });

  it('accepts custom classNames for CardTitle', () => {
    render(<CardTitle data-testid="card-title" className="custom-title-class">Title</CardTitle>);
    expect(screen.getByTestId('card-title')).toHaveClass('custom-title-class');
  });
});
