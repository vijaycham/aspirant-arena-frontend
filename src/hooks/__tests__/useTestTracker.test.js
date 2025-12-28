import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import useTestTracker from "../useTestTracker";
import api from "../../utils/api";

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
    const { result } = renderHook(() => useTestTracker());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tests).toEqual(mockTests);
    expect(result.current.subjects).toEqual(mockSubjects);
  });

  it("should calculate quickStats correctly", async () => {
    const { result } = renderHook(() => useTestTracker());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.quickStats).not.toBeNull();
    expect(result.current.quickStats.accuracy).toBe(80);
    expect(result.current.quickStats.total).toBe(1);
    expect(result.current.quickStats.best).toBe("Polity");
  });

  it("should handle subject filter changes", async () => {
    const { result } = renderHook(() => useTestTracker());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSelectedSubject("History");
    });

    expect(result.current.selectedSubject).toBe("History");
    expect(result.current.filteredTests).toHaveLength(0);
  });

  it("should calculate marksLost and accountedMarks correctly", async () => {
    const { result } = renderHook(() => useTestTracker());

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
});
