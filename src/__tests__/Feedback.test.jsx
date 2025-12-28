import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Feedback from "../pages/Feedback";
import api from "../utils/api";
import { toast } from "react-toastify";

// Mock API and Toast
vi.mock("../utils/api");
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Feedback Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the feedback form correctly", () => {
    render(<Feedback />);
    expect(screen.getByText(/Help us build the/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Summary of your message/i)).toBeInTheDocument();
  });

  it("switches tabs correctly", async () => {
    render(<Feedback />);
    const bugTab = screen.getByText("Report Bug");
    await userEvent.click(bugTab);
    
    expect(screen.getByText("Report a Bug")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Steps to reproduce/i)).toBeInTheDocument();
  });

  it("submits the form successfully", async () => {
    // Mock API success response
    // api.post returns a promise that resolves to the response object
    // In our component logic, we check res.status (since api interceptor unwraps data, wait...)
    // Actually, in api.js: returns response.data.
    // In Feedback.jsx: we fixed it to check `res.status === 'success'`.
    // So api.post should resolve to { status: 'success', ... }
    
    api.post.mockResolvedValue({ status: "success" });

    render(<Feedback />);

    const subjectInput = screen.getByPlaceholderText(/Summary of your message/i);
    const messageInput = screen.getByPlaceholderText(/Tell us more/i);
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    const submitBtn = screen.getByRole("button", { name: /Send Feedback/i });

    await userEvent.type(emailInput, "user@example.com");
    await userEvent.type(subjectInput, "Great App");
    await userEvent.type(messageInput, "I love the design.");
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/feedback", expect.objectContaining({
        subject: "Great App",
        message: "I love the design.",
        type: "contact"
      }));
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("sent successfully"));
    });
  });

  it("handles API errors gracefully", async () => {
    // Mock API failure
    const error = {
      response: {
        data: { message: "Server Error" }
      }
    };
    api.post.mockRejectedValue(error);

    render(<Feedback />);

    const subjectInput = screen.getByPlaceholderText(/Summary of your message/i);
    const messageInput = screen.getByPlaceholderText(/Tell us more/i);
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    const submitBtn = screen.getByRole("button", { name: /Send Feedback/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(subjectInput, "Crash Test");
    await userEvent.type(messageInput, "Boom");
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server Error");
    });
  });
});
