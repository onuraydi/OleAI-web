import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SystemHealthBadge } from './SystemHealthBadge';
import { getHealthStatus } from '@/shared/api/healthApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/shared/api/healthApi', () => ({
  getHealthStatus: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('SystemHealthBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('renders loading state initially', () => {
    (getHealthStatus as unknown).mockImplementation(() => new Promise(() => {})); // pending promise
    renderWithProviders(<SystemHealthBadge />);
    expect(screen.getByText('Denetleniyor...')).toBeInTheDocument();
  });

  it('renders healthy state on success', async () => {
    (getHealthStatus as unknown).mockResolvedValue({ status: 'Healthy' });
    renderWithProviders(<SystemHealthBadge />);
    
    expect(await screen.findByText('Sağlıklı')).toBeInTheDocument();
    expect(screen.getByTitle('Sistem Sağlıklı')).toBeInTheDocument();
  });

  it('renders error state on failure', async () => {
    (getHealthStatus as unknown).mockRejectedValue(new Error('API Error'));
    renderWithProviders(<SystemHealthBadge />);
    
    expect(await screen.findByText('Hata')).toBeInTheDocument();
    expect(screen.getByTitle('Sistemde Sorun Var')).toBeInTheDocument();
  });
});
