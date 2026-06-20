import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges tailwind classes properly', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('bg-red-500', 'hover:bg-red-600', { 'text-white': true, 'text-black': false })).toBe('bg-red-500 hover:bg-red-600 text-white');
  });

  it('handles falsy values', () => {
    expect(cn('p-4', null, undefined, false, 'm-2')).toBe('p-4 m-2');
  });
});
