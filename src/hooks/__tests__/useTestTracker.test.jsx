import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import useTestTracker from "../useTestTracker";
import authReducer from "../../redux/user/authSlice";
import api from "../../utils/api";

const createMockStore = (currentUser = { _id: "123", isEmailVerified: true }) => {
  return configureStore({
    reducer: {
      user: authReducer,
    },
    preloadedState: {
      user: { currentUser, loading: false, error: null },
    },
  });
};

const wrapper = ({ children, store }) => (
  <Provider store={store}>{children}</Provider>
);

// Mock API
vi.mock("../../utils/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useTestTracker hook", () => {
  const mockTests = [
    {
      _id: "1",
      subject: "Polity",
      testName: "Mock 1",
      marksObtained: 80,
      totalMarks: 100,
      date: "2023-10-01",
      conceptualErrors: 5,
    },
  ];

  const mockStats = [{ _id: "Polity", avgScore: 0.8, avgTarget: 70 }];
  const mockSubjects = ["Polity", "History"];

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === "/test") return Promise.resolve({ data: { tests: mockTests } });
      if (url === "/test/stats") return Promise.resolve({ data: { stats: mockStats } });
      if (url === "/test/subjects") return Promise.resolve({ data: { subjects: mockSubjects } });
      return Promise.resolve({ data: {} });
    });
  });

  it("should fetch data on mount", async () => {
    const store = createMockStore();
    const { result } = renderHook(() => useTestTracker(), {
      wrapper: (props) => wrapper({ ...props, store })
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tests).toEqual(mockTests);
    expect(result.current.subjects).toEqual(mockSubjects);
  });

  it("should calculate quickStats correctly", async () => {
    const store = createMockStore();
    const { result } = renderHook(() => useTestTracker(), {
      wrapper: (props) => wrapper({ ...props, store })
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.quickStats).not.toBeNull();
    expect(result.current.quickStats.accuracy).toBe(80);
    expect(result.current.quickStats.total).toBe(1);
    expect(result.current.quickStats.best).toBe("Polity");
  });

  it("should handle subject filter changes", async () => {
    const store = createMockStore();
    const { result } = renderHook(() => useTestTracker(), {
      wrapper: (props) => wrapper({ ...props, store })
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSelectedSubject("History");
    });

    expect(result.current.selectedSubject).toBe("History");
    expect(result.current.filteredTests).toHaveLength(0);
  });

  it("should calculate marksLost and accountedMarks correctly", async () => {
    const store = createMockStore();
    const { result } = renderHook(() => useTestTracker(), {
      wrapper: (props) => wrapper({ ...props, store })
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        marksObtained: 70,
        totalMarks: 100,
        conceptualErrors: 10,
        sillyMistakes: 5,
        timeErrors: 5,
        unattendedQuestions: 10,
      });
    });

    expect(result.current.marksLost).toBe(30);
    expect(result.current.accountedMarks).toBe(30);
  });
  it("should sync revision task on update when conceptual errors > 0", async () => {
    const store = createMockStore();
    const { result } = renderHook(() => useTestTracker(), {
      wrapper: (props) => wrapper({ ...props, store })
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Mock Tasks response (No existing task)
    api.get.mockImplementation((url) => {
      if (url === "/tasks") return Promise.resolve({ data: { tasks: [] } });
      return Promise.resolve({ data: {} });
    });

    // Simulate clicking Edit
    act(() => {
      result.current.handleEdit(mockTests[0]);
    });

    // Update form data
    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        conceptualErrors: 5, // Triggers sync
        testName: "Mock 1 Updated"
      });
    });

    // Submit
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    // Verify Task Sync was called (POST /tasks because mock returned empty list)
    expect(api.post).toHaveBeenCalledWith("/tasks", expect.objectContaining({
      text: expect.stringContaining("Revise conceptual errors: Polity (Mock 1 Updated)"),
      priority: "high"
    }));
  });
});
