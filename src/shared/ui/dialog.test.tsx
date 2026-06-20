import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './dialog';
import userEvent from '@testing-library/user-event';

describe('Dialog Components', () => {
  it('renders dialog trigger and opens content', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent data-testid="dialog-content">
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Body content</div>
          <DialogFooter>
            <button>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    // Initial state: Content should not be visible
    expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();

    // Click trigger
    const trigger = screen.getByText('Open Dialog');
    await user.click(trigger);

    // Dialog content should now be visible
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog Description')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getAllByText('Close').length).toBeGreaterThan(0);
  });
});
