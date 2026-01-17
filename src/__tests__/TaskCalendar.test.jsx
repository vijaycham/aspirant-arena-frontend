import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskCalendar from '../components/tasks/calendar/TaskCalendar';

// Mock react-big-calendar as it requires real dates/DOM sizing
vi.mock('react-big-calendar', () => ({
  Calendar: ({ events }) => (
    <div data-testid="calendar-mock">
      {events.map(e => (
        <div key={e.id} data-testid="calendar-event">{e.title}</div>
      ))}
    </div>
  ),
  momentLocalizer: () => {},
  dateFnsLocalizer: () => {}, // Mock this one as we switched to date-fns
  Views: { MONTH: 'month', WEEK: 'week', DAY: 'day' }
}));

vi.mock('date-fns', () => ({
    format: () => 'Formatted Date',
    parse: () => new Date(),
    startOfWeek: () => new Date(),
    getDay: () => 0,
    enUS: {}
}));

describe('TaskCalendar Component', () => {
  const mockTasks = [
    { _id: '1', text: 'Task A', dueDate: '2023-10-10T10:00:00Z', priority: 'high' },
    { _id: '2', text: 'Task B', dueDate: '2023-10-11T12:00:00Z', priority: 'medium' }
  ];
  const mockEdit = vi.fn();

  it('renders the calendar container', () => {
    render(<TaskCalendar tasks={mockTasks} onEdit={mockEdit} />);
    expect(screen.getByTestId('calendar-mock')).toBeInTheDocument();
  });

  it('maps tasks to calendar events', () => {
    render(<TaskCalendar tasks={mockTasks} onEdit={mockEdit} />);
    const events = screen.getAllByTestId('calendar-event');
    expect(events).toHaveLength(2);
    expect(events[0]).toHaveTextContent('Task A');
    expect(events[1]).toHaveTextContent('Task B');
  });

  it('filters out tasks without due dates', () => {
    const tasksWithNoDate = [
      ...mockTasks,
      { _id: '3', text: 'Task No Date', dueDate: null }
    ];
    render(<TaskCalendar tasks={tasksWithNoDate} onEdit={mockEdit} />);
    const events = screen.getAllByTestId('calendar-event');
    expect(events).toHaveLength(2); // Should still be 2, ignoring the 3rd
  });
});
