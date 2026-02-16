import { describe, it, expect } from 'vitest';
import { sanitizeForSearch } from '../../src/utils/sanitize.js';

describe('sanitizeForSearch', () => {
  it('returns empty string for null or non-string', () => {
    expect(sanitizeForSearch(null)).toBe('');
    expect(sanitizeForSearch(undefined)).toBe('');
    expect(sanitizeForSearch(123)).toBe('');
  });

  it('escapes single quotes and strips LIKE wildcards', () => {
    expect(sanitizeForSearch("foo'bar")).toBe("foo''bar");
    expect(sanitizeForSearch('a%b_c')).toBe('abc');
  });

  it('returns normal string unchanged when no special chars', () => {
    expect(sanitizeForSearch('hello')).toBe('hello');
  });
});
