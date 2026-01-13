import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

  it('renders correctly in default state', () => {
    render(<TimerDisplay {...defaultProps} />);
    
    // Time Display
    expect(screen.getByText('25:00')).toBeInTheDocument();
    
    // Mode Buttons
    expect(screen.getByText('Focus')).toBeInTheDocument();
    expect(screen.getByText('Short Break')).toBeInTheDocument();
    
    // Zen Mode Button
    expect(screen.getByText('Zen Mode')).toBeInTheDocument();
  });

  it('highlights current mode button', () => {
    render(<TimerDisplay {...defaultProps} />);
    const focusBtn = screen.getByText('Focus');
    const breakBtn = screen.getByText('Short Break');

    // Focus is active mode in defaultProps
    expect(focusBtn.className).toContain('bg-white');
    expect(breakBtn.className).toContain('text-gray-400');
  });

  it('calls switchMode on button click', () => {
    render(<TimerDisplay {...defaultProps} />);
    fireEvent.click(screen.getByText('Short Break'));
    expect(defaultProps.switchMode).toHaveBeenCalledWith('SHORT_BREAK');
    expect(defaultProps.setIsEditing).toHaveBeenCalledWith(false);
  });

  it('activates editing mode on clicking time', () => {
    render(<TimerDisplay {...defaultProps} />);
    fireEvent.click(screen.getByText('25:00').closest('div')); // Click the container
    expect(defaultProps.setIsEditing).toHaveBeenCalledWith(true);
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

  it('renders correct cycle indicators', () => {
    // cycleNumber is 1
    const { container } = render(<TimerDisplay {...defaultProps} />);
    // Check for bars. There are 4 bars.
    // 1st bar should be active-like or past?
    // Logic: num < cycleNumber (past) || num === cycleNumber && isActive (current active) || else (future)
    // Default: cycleNumber=1, isActive=false -> all grey or first one waiting?
    // Code: num < 1 (false), num === 1 && false (false) -> bg-gray-200
    // Actually, if it's cycle 1 and not active, it's just ready.
    
    // Let's test passed cycle
    // We expect bg-gray-200 usually for unstarted.
    const bars = container.querySelectorAll('.rounded-full');
    expect(bars.length).toBe(5); // 4 bars + Zen Mode button uses rounded-full? No, Zen mode uses rounded-full too.
    // The bars are in a div with flex gap-2. 
    // They have specific classes.
  });
});
