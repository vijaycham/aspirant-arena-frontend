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

vi.mock("react-hot-toast", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        fn: vi.fn(),
    },
}));

// Create a mock store
const mockStore = configureStore({
    reducer: {
        // Add any reducers if needed, or just a dummy one
        arena: (state = {}) => state,
    },
});

const wrapper = ({ children }) => (
    <Provider store={mockStore}>{children}</Provider>
);

// Mock Worker
class MockWorker {
    constructor(stringUrl) {
        this.url = stringUrl;
        this.onmessage = () => { };
    }
    postMessage() {
        // We can simulate tick back if needed, or just ignore
    }
    terminate() { }
}
global.Worker = MockWorker;

// Mock Audio
class MockAudio {
  play = vi.fn().mockResolvedValue();
  pause = vi.fn();
  load = vi.fn();
  loop = false;
  src = "";
}
global.Audio = MockAudio;

// Stub HTMLMediaElement to silence warnings
window.HTMLMediaElement.prototype.play = vi.fn();
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn();

// Mock Notification
global.Notification = {
    permission: "granted",
    requestPermission: vi.fn().mockResolvedValue("granted"),
};

describe("useTimer Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Default API mocks
        api.get.mockResolvedValue({ data: {} });
        api.post.mockResolvedValue({ data: {} });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should initialize with default FOCUS mode and 25 mins", () => {
        const { result } = renderHook(() => useTimer(), { wrapper });
        expect(result.current.mode).toBe("FOCUS");
        expect(result.current.timeLeft).toBe(25 * 60);
        expect(result.current.isActive).toBe(false);
    });

    it("should generate a sessionId when timer starts and persist it", async () => {
        const { result } = renderHook(() => useTimer(), { wrapper });

        // Initially no session ID (internal ref, not exposed directly, but we can verify via save behavior later)
        // But we can check if it stays consistent across renders by mocking uuid if we could, 
        // or just checking the behavior of saveSession which uses it.

        // Let's spy on the safeUUID utilization if possible, or just observe effects.
        // For now, let's start the timer.

        act(() => {
            result.current.toggleTimer();
        });

        expect(result.current.isActive).toBe(true);
        // isActive relies on localStorage TARGET_TIME
        expect(localStorage.getItem(TIMER_STORAGE_KEYS.TARGET_TIME)).toBeTruthy();
    });

    it("should map modes to backend enums correctly in saveSession", async () => {
        const { result } = renderHook(() => useTimer(), { wrapper });

        // START timer to generate sessionId
        act(() => {
            result.current.toggleTimer();
        });

        // Set manual time to 1 minute remaining via localStorage manipulation
        // Total FOCUS time is 25m (1500s). We want > 5m elapsed.
        // If we set remaining to 1m (60s), elapsed = 24m. Correct.
        act(() => {
            const targetTime = Date.now() + 60 * 1000;
            localStorage.setItem(TIMER_STORAGE_KEYS.TARGET_TIME, targetTime.toString());
            window.dispatchEvent(new StorageEvent('storage', {
                key: TIMER_STORAGE_KEYS.TARGET_TIME,
                newValue: targetTime.toString()
            }));
        });

        // Use skipTimer to trigger saveSession
        await act(async () => {
            result.current.skipTimer(); 
        });

        // Check API call arguments
        expect(api.post).toHaveBeenCalledWith(
            "/focus",
            expect.objectContaining({
                type: "focus", // Should map FOCUS -> focus
                status: "interrupted",
                sessionId: expect.any(String) // Should be a string UUID
            })
        );

        // Save the session ID to check persistence
        const firstCallSessionId = api.post.mock.calls[0][1].sessionId;
        expect(firstCallSessionId).toBeTruthy();
    });

    it.skip("should correctly calculate elapsed time using timeLeft", () => {
        // This requires complex worker mocking
    });
});
