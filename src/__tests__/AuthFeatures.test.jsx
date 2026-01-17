import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import authReducer from "../redux/user/authSlice";

// 1️⃣ Use vi.hoisted to create shared spies that are accessible to both the mock factory and the test functions.
// This is the most reliable way in Vitest to avoid "Number of calls: 0" errors caused by instance mismatch.
const { mockToast, mockNavigate, mockApi } = vi.hoisted(() => ({
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  mockNavigate: vi.fn(),
  mockApi: {
    post: vi.fn(),
  },
}));

// 2️⃣ Apply the mocks using the hoisted spies
vi.mock("react-hot-toast", () => ({
  toast: mockToast,
  default: mockToast,
  __esModule: true,
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("../utils/api", () => ({
  default: mockApi,
  __esModule: true,
}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      user: authReducer,
    },
    preloadedState: {
      user: { currentUser: null, loading: false, error: null },
    },
  });
};

describe("Auth Features Frontend Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("ForgotPassword Component", () => {
    it("should validate and call forgot-password API", async () => {
      mockApi.post.mockResolvedValue({ status: "success" });
      
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText(/email address/i);
      const form = emailInput.closest("form");

      // Test 1: Invalid email format
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.submit(form);
      
      expect(mockToast.error).toHaveBeenCalledWith("Invalid email address");
      vi.clearAllMocks();

      // Test 2: Valid email and success flow
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.submit(form);

      expect(mockApi.post).toHaveBeenCalledWith("/auth/forgot-password", { emailId: "test@example.com" });
      
      await waitFor(() => {
        expect(screen.getByText(/Check your email/i)).toBeInTheDocument();
        expect(mockToast.success).toHaveBeenCalledWith("Reset link sent to your email!");
      });
    });
  });

  describe("ResetPassword Component", () => {
    it("should validate matching passwords and handle successful reset", async () => {
        const store = createMockStore();
        const mockUser = { _id: "1", firstName: "Test" };
        
        mockApi.post.mockResolvedValue({ 
            userProfile: mockUser 
        });

        render(
          <Provider store={store}>
            <MemoryRouter initialEntries={["/reset-password/test-token"]}>
              <Routes>
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Routes>
            </MemoryRouter>
          </Provider>
        );

        const passwordInput = screen.getByPlaceholderText("New Password");
        const confirmInput = screen.getByPlaceholderText("Confirm Password");
        const form = passwordInput.closest("form");

        // 1. Password mismatch
        fireEvent.change(passwordInput, { target: { value: "pass123" } });
        fireEvent.change(confirmInput, { target: { value: "pass456" } });
        fireEvent.submit(form);
        
        expect(mockToast.error).toHaveBeenCalledWith("Passwords do not match");
        vi.clearAllMocks();

        // 2. Successful reset
        fireEvent.change(passwordInput, { target: { value: "strongPass@123" } });
        fireEvent.change(confirmInput, { target: { value: "strongPass@123" } });
        
        // Start fake timers BEFORE the component calls setTimeout
        vi.useFakeTimers();
        fireEvent.submit(form);

        expect(mockApi.post).toHaveBeenCalledWith("/auth/reset-password/test-token", {
            password: "strongPass@123"
        });

        // Use Async version to allow promises (api.post) to resolve while timers advance
        await vi.advanceTimersByTimeAsync(2500);

        expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining("successful"));
        expect(mockNavigate).toHaveBeenCalledWith("/");
        
        vi.useRealTimers();
    });
  });
});
