import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTimer } from '../hooks/useTimer';
import api from '../utils/api';
import { TIMER_STORAGE_KEYS } from '../utils/timer/timerConstants';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock API and Toast
vi.mock('../utils/api');
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Web Worker
global.Worker = class {
  constructor() {
    this.postMessage = vi.fn();
    this.terminate = vi.fn();
    this.onmessage = vi.fn();
  }
};

const mockStore = configureStore([]);

describe('useTimer Hook', () => {
  let store;
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default stats response
    api.get.mockResolvedValue({ data: { totalMinutes: 0, sessionCount: 0 } });
    
    store = mockStore({
      arena: {
        arenas: [],
        syllabus: {}
      }
    });

    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    expect(result.current.mode).toBe('FOCUS');
    expect(result.current.timeLeft).toBe(25 * 60);
    expect(result.current.isActive).toBe(false);
    expect(result.current.cycleNumber).toBe(1);
  });

  it('should load values from localStorage', () => {
    localStorage.setItem(TIMER_STORAGE_KEYS.MODE, 'SHORT_BREAK');
    localStorage.setItem(TIMER_STORAGE_KEYS.TIME_LEFT, '300');
    localStorage.setItem(TIMER_STORAGE_KEYS.CYCLE, '3');
    
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    expect(result.current.mode).toBe('SHORT_BREAK');
    expect(result.current.timeLeft).toBe(300);
    expect(result.current.cycleNumber).toBe(3);
  });

  it('should toggle timer state', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    act(() => {
      result.current.toggleTimer();
    });
    expect(result.current.isActive).toBe(true);
    
    act(() => {
      result.current.toggleTimer();
    });
    expect(result.current.isActive).toBe(false);
  });

  it('should reset timer', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    act(() => {
      result.current.setManualTime(10); // set to 10 mins
    });
    expect(result.current.timeLeft).toBe(10 * 60);
    
    act(() => {
      result.current.resetTimer();
    });
    expect(result.current.timeLeft).toBe(10 * 60); // It resets to the current mode timing
    expect(result.current.isActive).toBe(false);
  });

  it('should skip timer and advance cycle', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    expect(result.current.mode).toBe('FOCUS');
    expect(result.current.cycleNumber).toBe(1);
    
    act(() => {
      result.current.skipTimer();
    });
    
    expect(result.current.mode).toBe('SHORT_BREAK');
    expect(result.current.cycleNumber).toBe(2);
  });

  it('should not save session if less than 60 seconds elapsed on reset', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    act(() => {
      result.current.toggleTimer();
    });
    
    // Simulate 10 seconds passing (manually setting timeLeft)
    act(() => {
      result.current.resetTimer();
    });
    
    expect(api.post).not.toHaveBeenCalled();
  });

  it('should save session if more than 60 seconds elapsed on reset', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    act(() => {
      result.current.toggleTimer();
    });
  });

  it('should catch up time if was active when tab was closed', () => {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    localStorage.setItem(TIMER_STORAGE_KEYS.IS_ACTIVE, "true");
    localStorage.setItem(TIMER_STORAGE_KEYS.LAST_UPDATE, fiveMinutesAgo.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.TIME_LEFT, (25 * 60).toString()); // Start with 25 mins
    
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    // 25 mins - 5 mins = 20 mins = 1200 seconds
    expect(result.current.timeLeft).toBe(20 * 60);
    expect(result.current.isActive).toBe(true);
  });

  it('should persist pending session to localStorage', () => {
    const sessionData = { seconds: 120, status: 'completed' };
    localStorage.setItem(TIMER_STORAGE_KEYS.PENDING_SESSION, JSON.stringify(sessionData));
    
    const { result } = renderHook(() => useTimer(), { wrapper });
    
    expect(result.current.pendingSession).toEqual(sessionData);
  });
});
