import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatsGrid from "../StatsGrid";

describe("StatsGrid Component", () => {
  const mockQuickStats = {
    total: 10,
    accuracy: 85,
    avgSpeed: "0.75",
    best: "History",
    avgMistakes: "2.0",
    lastChange: 5,
  };

  it("should render correctly with stats in 'All' view", () => {
    render(<StatsGrid quickStats={mockQuickStats} selectedSubject="All" />);

    expect(screen.getByText(/10 Tests/i)).toBeInTheDocument();
    expect(screen.getByText(/85%/i)).toBeInTheDocument();
    expect(screen.getByText(/History/i)).toBeInTheDocument();
    expect(screen.getByText(/2.0/i)).toBeInTheDocument();
  });

  it("should render speed index when focused on a subject", () => {
    render(<StatsGrid quickStats={mockQuickStats} selectedSubject="Polity" />);
    expect(screen.getByText(/0.75 m\/m/i)).toBeInTheDocument();
  });

  it("should show 'Global Acc.' label when subject is 'All'", () => {
    render(<StatsGrid quickStats={mockQuickStats} selectedSubject="All" />);
    expect(screen.getByText(/Global Acc./i)).toBeInTheDocument();
  });

  it("should show 'Focus Acc.' label when a specific subject is selected", () => {
    render(<StatsGrid quickStats={mockQuickStats} selectedSubject="Polity" />);
    expect(screen.getByText(/Focus Acc./i)).toBeInTheDocument();
  });

  it("should display trend indicator correctly", () => {
    render(<StatsGrid quickStats={mockQuickStats} selectedSubject="All" />);
    const trend = screen.getByText(/↑ 5%/i);
    expect(trend).toBeInTheDocument();
    expect(trend).toHaveClass("bg-emerald-100");
  });

  it("should render shimmer loaders when loading", () => {
    render(<StatsGrid quickStats={null} selectedSubject="All" loading={true} />);
    const shimmers = screen.getAllByRole("generic").filter(el => el.className.includes("animate-shimmer"));
    expect(shimmers.length).toBeGreaterThan(0);
  });

  it("should return null if quickStats is missing and not loading", () => {
    const { container } = render(<StatsGrid quickStats={null} selectedSubject="All" loading={false} />);
    expect(container.firstChild).toBeNull();
  });
});
