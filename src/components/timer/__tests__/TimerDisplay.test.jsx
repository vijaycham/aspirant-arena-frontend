import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TimerDisplay from '../TimerDisplay';

// Mock Framer Motion and Icons
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, className }) => <div onClick={onClick} className={className}>{children}</div>,
    form: ({ children, onSubmit, className }) => <form onSubmit={onSubmit} className={className}>{children}</form>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('react-icons/fa', () => ({
  FaEdit: () => <span data-testid="edit-icon">Edit</span>,
  FaExpand: () => <span data-testid="expand-icon">Expand</span>,
}));

describe('TimerDisplay Component', () => {
  const defaultProps = {
    mode: 'FOCUS',
    modes: {
      FOCUS: { label: 'Focus', time: 25 * 60 },
      SHORT_BREAK: { label: 'Short Break', time: 5 * 60 },
    },
    switchMode: vi.fn(),
    timeLeft: 1500, // 25 mins
    isEditing: false,
    setIsEditing: vi.fn(),
    manualMin: '',
    setManualMin: vi.fn(),
    handleManualSubmit: vi.fn((e) => e.preventDefault()),
    formatTime: (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
    cycleNumber: 1,
    isActive: false,
    onFullScreen: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly in default state', () => {
    render(<TimerDisplay {...defaultProps} />);
    
    // Time Display
    expect(screen.getByText('25:00')).toBeInTheDocument();
    
    // Toggle Switch
    expect(screen.getByText('Countdown')).toBeInTheDocument();
    expect(screen.getByText('Stopwatch')).toBeInTheDocument();
    
    // Mode Buttons (Visible in Countdown)
    expect(screen.getByText('Focus')).toBeInTheDocument();
    expect(screen.getByText('Short Break')).toBeInTheDocument();
    
    // Zen Mode Button
    expect(screen.getByText('Zen Mode')).toBeInTheDocument();
  });

  it('toggles mode when switches are clicked', () => {
    render(<TimerDisplay {...defaultProps} />);
    
    // Click Stopwatch
    fireEvent.click(screen.getByText('Stopwatch'));
    expect(defaultProps.switchMode).toHaveBeenCalledWith('STOPWATCH');
    
    // Click Countdown (should switch to FOCUS if currently STOPWATCH)
    // Note: To test this transition properly, we'd need to re-render with mode='STOPWATCH', 
    // but checking the call on the button is enough for unit test.
  });

  it('hides pomodoro tabs in stopwatch mode', () => {
    render(<TimerDisplay {...defaultProps} mode="STOPWATCH" />);
    
    expect(screen.queryByText('Focus')).not.toBeInTheDocument();
    expect(screen.queryByText('Short Break')).not.toBeInTheDocument();
    expect(screen.getByText('Health Cap: 4 Hours Max')).toBeInTheDocument();
  });

  it('activates editing mode on clicking time (Countdown only)', () => {
    render(<TimerDisplay {...defaultProps} />);
    fireEvent.click(screen.getByText('25:00').closest('div'));
    expect(defaultProps.setIsEditing).toHaveBeenCalledWith(true);
  });

  it('does NOT activate editing mode on clicking time (Stopwatch)', () => {
    render(<TimerDisplay {...defaultProps} mode="STOPWATCH" />);
    fireEvent.click(screen.getByText('25:00').closest('div')); // Assuming formatTime returns same for 25m
    expect(defaultProps.setIsEditing).not.toHaveBeenCalled();
  });

  it('displays input form when isEditing is true', () => {
    render(<TimerDisplay {...defaultProps} isEditing={true} />);
    expect(screen.getByPlaceholderText('Mins')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls setManualMin on input change', () => {
    render(<TimerDisplay {...defaultProps} isEditing={true} />);
    const input = screen.getByPlaceholderText('Mins');
    fireEvent.change(input, { target: { value: '20' } });
    expect(defaultProps.setManualMin).toHaveBeenCalledWith('20');
  });

  it('submits manual time form', () => {
    render(<TimerDisplay {...defaultProps} isEditing={true} />);
    fireEvent.submit(screen.getByText('Save').closest('form'));
    expect(defaultProps.handleManualSubmit).toHaveBeenCalled();
  });

  it('calls onFullScreen when Zen Mode is clicked', () => {
    render(<TimerDisplay {...defaultProps} />);
    fireEvent.click(screen.getByText('Zen Mode'));
    expect(defaultProps.onFullScreen).toHaveBeenCalled();
  });

  it('renders cycle indicators only in Countdown mode', () => {
    const { container, rerender } = render(<TimerDisplay {...defaultProps} />);
    // In Countdown, we expect 4 bars
    // Note: Zen Mode button and Toggle buttons also use .rounded-*, so specific class targeting is tricky.
    // relying on structure logic
    expect(container.querySelectorAll('.h-2.w-10').length).toBe(4);

    rerender(<TimerDisplay {...defaultProps} mode="STOPWATCH" />);
    expect(container.querySelectorAll('.h-2.w-10').length).toBe(0);
  });
});
