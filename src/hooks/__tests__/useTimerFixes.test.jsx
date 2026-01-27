/* eslint-disable no-undef */
import React from 'react';
import { renderHook, act } from "@testing-library/react";
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTimer } from "../useTimer";
import api from "../../utils/api";
import { TIMER_STORAGE_KEYS } from "../../utils/timer/timerConstants";

// Mock dependencies
vi.mock("../../utils/api", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

vi.mock("react-hot-toast", () => {
    const toastMock = vi.fn();
    toastMock.success = vi.fn();
    toastMock.error = vi.fn();
    return {
        toast: toastMock
    };
});

const mockStore = configureStore({
    reducer: {
        arena: (state = {}) => state,
    },
});

const wrapper = ({ children }) => (
    <Provider store={mockStore}>{children}</Provider>
);

// Mock Worker
global.Worker = class {
    constructor() { this.onmessage = () => { }; }
    postMessage() { }
    terminate() { }
};

// Mock Audio
global.Audio = class {
    play = vi.fn().mockResolvedValue();
    pause = vi.fn();
    load = vi.fn();
};

describe("useTimer Hotfixes", () => {
    const BASE_TIME = 1738000000000;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        api.get.mockResolvedValue({ data: { totalMinutes: 0 } });
        api.post.mockResolvedValue({ data: { session: {} } });
        vi.useFakeTimers();
        vi.setSystemTime(BASE_TIME);
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    it("should cap stopwatch elapsed time at 14400 seconds (4 hours) during rehydration", () => {
        const fiveHoursAgo = BASE_TIME - (5 * 60 * 60 * 1000);
        localStorage.setItem('timer-startTime', fiveHoursAgo.toString());
        localStorage.setItem(TIMER_STORAGE_KEYS.TARGET_TIME, "STOPWATCH_RUNNING");
        localStorage.setItem(TIMER_STORAGE_KEYS.MODE, "STOPWATCH");

        const { result } = renderHook(() => useTimer(), { wrapper });
        expect(result.current.timeLeft).toBe(14400);
    });

    it("should use absolute time for POMODORO duration calculation", async () => {
        const { result } = renderHook(() => useTimer(), { wrapper });

        act(() => {
            result.current.toggleTimer();
        });

        // Move 25 mins forward
        vi.setSystemTime(BASE_TIME + (25 * 60 * 1000));

        act(() => {
            result.current.skipTimer();
        });

        await vi.waitFor(() => {
            if (api.post.mock.calls.length === 0) throw new Error("Not called yet");
            expect(api.post).toHaveBeenCalledWith(
                "/focus",
                expect.objectContaining({ duration: 25 })
            );
        }, { timeout: 2000 });
    });

    it("should cap duration at 240 minutes in saveSession for stopwatch", async () => {
        const { result } = renderHook(() => useTimer(), { wrapper });

        // Disable reflection to ensure immediate save
        act(() => {
            result.current.setReflectionEnabled(false);
        });

        // Manually prepare the stopwatch state as if it was running for 5 hours
        act(() => {
            const fiveHoursAgo = BASE_TIME - (5 * 60 * 60 * 1000);
            localStorage.setItem(TIMER_STORAGE_KEYS.MODE, "STOPWATCH");
            localStorage.setItem('timer-startTime', fiveHoursAgo.toString());
            localStorage.setItem(TIMER_STORAGE_KEYS.TARGET_TIME, "STOPWATCH_RUNNING");

            // Trigger the internal storage sync
            window.dispatchEvent(new StorageEvent('storage', {
                key: TIMER_STORAGE_KEYS.MODE,
                newValue: "STOPWATCH"
            }));
        });

        // Current time is BASE_TIME, so 5 hours have passed since fiveHoursAgo
        act(() => {
            result.current.skipTimer();
        });

        await vi.waitFor(() => {
            if (api.post.mock.calls.length === 0) throw new Error("Not called yet");
            expect(api.post).toHaveBeenCalledWith(
                "/focus",
                expect.objectContaining({ duration: 240 })
            );
        }, { timeout: 2000 });
    });

    it("should show 'Stopwatch' in document.title when in stopwatch mode", () => {
        act(() => {
            localStorage.setItem(TIMER_STORAGE_KEYS.MODE, "STOPWATCH");
            // Trigger storage sync
            window.dispatchEvent(new StorageEvent('storage', {
                key: TIMER_STORAGE_KEYS.MODE,
                newValue: "STOPWATCH"
            }));
            localStorage.setItem(TIMER_STORAGE_KEYS.TARGET_TIME, "STOPWATCH_RUNNING");
            window.dispatchEvent(new StorageEvent('storage', {
                key: TIMER_STORAGE_KEYS.TARGET_TIME,
                newValue: "STOPWATCH_RUNNING"
            }));
        });

        const { result } = renderHook(() => useTimer(), { wrapper });

        // Force a tick to update timeLeft and document.title
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(document.title).toContain("Stopwatch");
    });

    it("should save an interrupted session when resetting a valid stopwatch session", async () => {
        const { result } = renderHook(() => useTimer(), { wrapper });

        act(() => {
            const tenMinsAgo = BASE_TIME - (10 * 60 * 1000);
            localStorage.setItem(TIMER_STORAGE_KEYS.MODE, "STOPWATCH");
            localStorage.setItem('timer-startTime', tenMinsAgo.toString());
            localStorage.setItem(TIMER_STORAGE_KEYS.TARGET_TIME, "STOPWATCH_RUNNING");

            window.dispatchEvent(new StorageEvent('storage', {
                key: TIMER_STORAGE_KEYS.MODE,
                newValue: "STOPWATCH"
            }));
        });

        act(() => {
            result.current.resetTimer();
        });

        await vi.waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                "/focus",
                expect.objectContaining({
                    duration: 10,
                    status: "interrupted"
                })
            );
        });
    });
});
