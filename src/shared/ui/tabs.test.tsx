import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import userEvent from '@testing-library/user-event';

describe('Tabs', () => {
  it('renders and switches tabs correctly', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="content-1">Content 1</TabsContent>
        <TabsContent value="tab2" data-testid="content-2">Content 2</TabsContent>
      </Tabs>
    );

    // Initial state: Tab 1 content is visible
    expect(screen.getByTestId('content-1')).toBeVisible();
    expect(screen.getByTestId('content-2')).not.toBeVisible();

    // Click tab 2
    await user.click(screen.getByText('Tab 2'));

    // Tab 2 content should be visible, tab 1 hidden
    expect(screen.getByTestId('content-1')).not.toBeVisible();
    expect(screen.getByTestId('content-2')).toBeVisible();
  });
});
