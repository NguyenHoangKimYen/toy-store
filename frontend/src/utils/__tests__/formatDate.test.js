import { describe, it, expect } from 'vitest';
import { formatDate } from '../formatDate';

describe('formatDate', () => {
  it('should format a Date object', () => {
    const date = new Date('2025-12-10');
    const result = formatDate(date, 'en-US');
    // Uses short month format (Dec instead of December)
    expect(result).toMatch(/Dec|December/);
    expect(result).toContain('2025');
  });

  it('should handle string dates', () => {
    const result = formatDate('2025-06-15', 'en-US');
    expect(result).toMatch(/Jun|June/);
    expect(result).toContain('2025');
  });

  it('should handle MongoDB date format', () => {
    const mongoDate = { $date: '2025-03-20T00:00:00.000Z' };
    const result = formatDate(mongoDate, 'en-US');
    expect(result).toMatch(/Mar|March/);
    expect(result).toContain('2025');
  });

  it('should return "Invalid Date" for invalid input', () => {
    expect(formatDate('not-a-date', 'en-US')).toBe('Invalid Date');
    expect(formatDate({}, 'en-US')).toBe('Invalid Date');
  });

  it('should add ordinal suffix for English locales', () => {
    const date1 = new Date('2025-01-01');
    const result1 = formatDate(date1, 'en-US');
    expect(result1).toMatch(/1st/);

    const date2 = new Date('2025-01-02');
    const result2 = formatDate(date2, 'en-US');
    expect(result2).toMatch(/2nd/);

    const date3 = new Date('2025-01-03');
    const result3 = formatDate(date3, 'en-US');
    expect(result3).toMatch(/3rd/);

    const date4 = new Date('2025-01-04');
    const result4 = formatDate(date4, 'en-US');
    expect(result4).toMatch(/4th/);
  });

  it('should use default date when no argument provided', () => {
    const result = formatDate();
    expect(result).not.toBe('Invalid Date');
  });
});
