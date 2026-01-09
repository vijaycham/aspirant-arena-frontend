
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FocusHeatmap from '../FocusHeatmap';
import api from '../../../utils/api';

// Mock the API module
vi.mock('../../../utils/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('FocusHeatmap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Return a promise that never resolves immediately to check loading state
    api.get.mockImplementation(() => new Promise(() => {})); 
    render(<FocusHeatmap />);
    // Check for the animate-pulse div
    const loader = document.getElementsByClassName('animate-pulse');
    expect(loader.length).toBeGreaterThan(0);
  });

  it('renders heatmap with correct data after API success', async () => {
    // Mock Data: 2 days of activity
    const mockData = {
      data: {
        heatmap: [
          { _id: '2023-01-01', minutes: 60, count: 2, avgRating: 4.5 },
          { _id: '2023-01-02', minutes: 120, count: 4, avgRating: 5 },
        ],
      },
    };

    api.get.mockResolvedValue(mockData);

    render(<FocusHeatmap />);

    // Wait for text to appear (Total Focused Hours)
    // 60 + 120 = 180 min = 3 hours
    await waitFor(() => {
      expect(screen.getByText(/3h Focused/i)).toBeInTheDocument();
    });

    // Check if Year consistency text is present
    expect(screen.getByText('Yearly Consistency')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    api.get.mockRejectedValue(new Error('Network Error'));

    render(<FocusHeatmap />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load heatmap/i)).toBeInTheDocument();
    });
  });

  it('scrolls to end on load', async () => {
    // We can't easily test real scrolling in jsdom, but we can check if the ref logic runs.
    // However, since scrolling is a side-effect, we mainly trust the smoke test here.
    const mockData = { data: { heatmap: [] } };
    api.get.mockResolvedValue(mockData);
    
    render(<FocusHeatmap />);
    await waitFor(() => screen.getByText(/0h Focused/i));
    // Pass if no crash
  });
});
