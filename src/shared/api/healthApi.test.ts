import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { getHealthStatus } from './healthApi';

vi.mock('axios');

describe('healthApi', () => {
  it('calls the health endpoint correctly and returns data', async () => {
    const mockData = { status: 'Healthy', totalDuration: '10ms', entries: {} };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData });

    const result = await getHealthStatus();

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/health'));
    expect(result).toEqual(mockData);
  });
});
