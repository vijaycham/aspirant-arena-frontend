import { render, screen, act, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ExamCountdown from '../ExamCountdown';

describe('ExamCountdown Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly with default Prelims mode', () => {
    render(<ExamCountdown />);
    expect(screen.getByText('UPSC CSE Prelims 2026')).toBeInTheDocument();
  });

  it('calculates time remaining correctly for Prelims (May 24, 2026)', () => {
    // Mock Now: 1 Day before Prelims
    // Prelims: 2026-05-24
    const mockNow = new Date('2026-05-23T00:00:00'); 
    vi.setSystemTime(mockNow);

    render(<ExamCountdown />);

    // Should show 01 Days
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('days')).toBeInTheDocument();
  });

  it('calculates time correctly for Mains when switched', () => {
    // Mock Now: 1 Day before Mains
    // Mains: 2026-09-18
    const mockNow = new Date('2026-09-17T00:00:00');
    vi.setSystemTime(mockNow);

    render(<ExamCountdown />);

    // Default is Prelims (which is past in this mock time? No, May < Sept)
    // Wait, if today is Sept 17, Prelims (May 24) is passed.
    // It should show "Mission Accomplished" for Prelims? 
    // Let's verify standard behavior first.
    
    // Switch to Mains
    const switchBtn = screen.getByText('Switch to Mains');
    fireEvent.click(switchBtn);

    // Now expecting 1 day left for Mains
    expect(screen.getByText('UPSC CSE Mains 2026')).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
  });

  it('shows mission accomplished when date is past', () => {
    // Date after Prelims
    const mockNow = new Date('2026-06-01T00:00:00');
    vi.setSystemTime(mockNow);

    render(<ExamCountdown />); // Defaults to Prelims

    expect(screen.getByText(/Mission Accomplished/i)).toBeInTheDocument();
  });
});
