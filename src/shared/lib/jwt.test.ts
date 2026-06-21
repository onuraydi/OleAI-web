import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { decodeRoleFromToken } from './jwt';

describe('decodeRoleFromToken', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return User if token is empty or invalid', () => {
    expect(decodeRoleFromToken('')).toBe('User');
    expect(decodeRoleFromToken('invalid-token')).toBe('User');
  });

  it('should extract standard role from JSON payload', () => {
    const payload = btoa(JSON.stringify({ role: 'Admin' }));
    const token = `header.${payload}.signature`;
    expect(decodeRoleFromToken(token)).toBe('Admin');
  });

  it('should extract .NET Identity role from JSON payload', () => {
    const payload = btoa(JSON.stringify({ 
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Editor" 
    }));
    const token = `header.${payload}.signature`;
    expect(decodeRoleFromToken(token)).toBe('Editor');
  });

  it('should handle role as an array and prioritize Admin', () => {
    const payload = btoa(JSON.stringify({ role: ['User', 'Admin'] }));
    const token = `header.${payload}.signature`;
    expect(decodeRoleFromToken(token)).toBe('Admin');
  });

  it('should return first role if array does not contain Admin', () => {
    const payload = btoa(JSON.stringify({ role: ['Moderator', 'User'] }));
    const token = `header.${payload}.signature`;
    expect(decodeRoleFromToken(token)).toBe('Moderator');
  });

  it('should handle URI encoded payloads', () => {
    // A payload with a unicode character
    const jsonStr = JSON.stringify({ role: 'Super Admin 😊' });
    const encodedStr = encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
    const payload = btoa(encodedStr);
    const token = `header.${payload}.signature`;
    expect(decodeRoleFromToken(token)).toBe('Super Admin 😊');
  });
});
