import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VerificationBanner from "../components/VerificationBanner";
import authReducer from "../redux/user/authSlice";
import api from "../utils/api";
import toast from "react-hot-toast";

// Mock API and toast
vi.mock("../utils/api");
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createMockStore = (currentUser) => {
  return configureStore({
    reducer: {
      user: authReducer,
    },
    preloadedState: {
      user: { currentUser, loading: false, error: null },
    },
  });
};

describe("VerificationBanner Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should not render if user is verified", () => {
    const user = { _id: "1", isEmailVerified: true };
    const store = createMockStore(user);
    const { container } = render(
      <Provider store={store}>
        <VerificationBanner />
      </Provider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render with amber background if within grace period (> 2h)", () => {
    const user = { 
      _id: "1", 
      isEmailVerified: false, 
      emailId: "test@example.com",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5h ago
    };
    const store = createMockStore(user);
    render(
      <Provider store={store}>
        <VerificationBanner />
      </Provider>
    );
    
    // Animation might wrap it, let's look for the classes
    const outerDiv = screen.getByText(/check your inbox/i).closest(".bg-amber-50");
    expect(outerDiv).toBeInTheDocument();
    expect(screen.getByText(/19 hours/i)).toBeInTheDocument();
  });

  it("should render with rose/red background if urgent (<= 2h remaining)", () => {
    const user = { 
      _id: "1", 
      isEmailVerified: false, 
      emailId: "test@example.com",
      createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString() // 23h ago
    };
    const store = createMockStore(user);
    render(
      <Provider store={store}>
        <VerificationBanner />
      </Provider>
    );
    
    // Should have rose-50 or rose-100 indicating urgency
    const outerDiv = screen.getByText(/check your inbox/i).closest(".bg-rose-50");
    expect(outerDiv).toBeInTheDocument();
  });

  it("should handle resend verification and start cooldown", async () => {
    const user = { 
      _id: "1", 
      isEmailVerified: false, 
      emailId: "test@example.com",
      createdAt: new Date().toISOString() 
    };
    const store = createMockStore(user);
    api.post.mockResolvedValue({ message: "Sent!" });

    render(
      <Provider store={store}>
        <VerificationBanner />
      </Provider>
    );

    const resendBtn = screen.getByRole("button", { name: /resend verification/i });
    await userEvent.click(resendBtn);

    expect(api.post).toHaveBeenCalledWith("/auth/resend-verification");
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Sent!");
      expect(screen.getByText(/Email Sent \(60s\)/i)).toBeInTheDocument();
      expect(resendBtn).toBeDisabled();
    });
  });

  it("should trigger shorter cooldown on rate limit (429)", async () => {
    const user = { _id: "1", isEmailVerified: false, emailId: "test@example.com" };
    const store = createMockStore(user);
    
    api.post.mockRejectedValue({
      response: { 
        status: 429,
        data: { message: "Too many requests" }
      }
    });

    render(
      <Provider store={store}>
        <VerificationBanner />
      </Provider>
    );

    const resendBtn = screen.getByRole("button", { name: /resend verification/i });
    await userEvent.click(resendBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Too many requests");
      expect(screen.getByText(/Email Sent \(30s\)/i)).toBeInTheDocument();
    });
  });
});
