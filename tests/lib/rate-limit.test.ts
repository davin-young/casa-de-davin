import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, _resetForTest } from '@/lib/rate-limit';

describe('rate limiter', () => {
  beforeEach(() => {
    _resetForTest();
  });

  it('allows the first request', () => {
    const result = checkRateLimit('10.0.0.1');
    expect(result.allowed).toBe(true);
  });

  it('blocks the second request from the same IP within the window', () => {
    checkRateLimit('10.0.0.2');
    const result = checkRateLimit('10.0.0.2');

    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
    expect(result.retryAfter).toBeLessThanOrEqual(60);
  });

  it('allows requests from different IPs', () => {
    checkRateLimit('10.0.0.3');
    const result = checkRateLimit('10.0.0.4');

    expect(result.allowed).toBe(true);
  });

  it('allows requests after the window expires', () => {
    vi.useFakeTimers();

    checkRateLimit('10.0.0.5');

    // Advance past the 60-second window
    vi.advanceTimersByTime(61_000);

    const result = checkRateLimit('10.0.0.5');
    expect(result.allowed).toBe(true);

    vi.useRealTimers();
  });
});
