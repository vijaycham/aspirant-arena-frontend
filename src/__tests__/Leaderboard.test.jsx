import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Leaderboard from "../pages/Leaderboard";
import api from "../utils/api";
import { toast } from "react-hot-toast";

// Mock API and Toast
vi.mock("../utils/api");
vi.mock("react-hot-toast");

// Mock Framer Motion to skip animations
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }) => <div className={className} {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockUsers = [
  { _id: "1", name: "Alpha", score: 100, photoUrl: "" },
  { _id: "2", name: "Beta", score: 90, photoUrl: "http://pic.com/b.jpg" },
  { _id: "3", name: "Gamma", score: 80, photoUrl: "" },
  { _id: "4", name: "Delta", score: 70, photoUrl: "" },
];

describe("Leaderboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    // Resolve promise later
    api.get.mockReturnValue(new Promise(() => {}));
    
    render(<Leaderboard />);
    expect(screen.getByText(/Calculating Ranks/i)).toBeInTheDocument();
  });

  it("renders Podium and List correctly", async () => {
    api.get.mockResolvedValue({ data: mockUsers });

    render(<Leaderboard />);

    await waitFor(() => {
        expect(screen.queryByText(/Calculating Ranks/i)).not.toBeInTheDocument();
    });

    // Check Podium Names
    expect(screen.getByText(/Alpha/)).toBeInTheDocument();
    expect(screen.getByText(/Beta/)).toBeInTheDocument();
    expect(screen.getByText(/Gamma/)).toBeInTheDocument();

    // Check List Name
    expect(screen.getByText(/Delta/)).toBeInTheDocument();
    
    // Check Scores
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();
  });

  it("shows empty state when no users are returned", async () => {
    api.get.mockResolvedValue({ data: [] });

    render(<Leaderboard />);

    await waitFor(() => {
        expect(screen.getByText(/No one has focused yet/i)).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    api.get.mockRejectedValue(new Error("Network Error"));

    render(<Leaderboard />);

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to load rankings");
    });
  });
});
