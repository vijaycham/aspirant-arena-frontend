import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KanbanBoard from '../components/tasks/board/KanbanBoard';

// Mock dnd-kit because it uses complex browser APIs
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }) => <div>{children}</div>,
  useSensors: () => {},
  useSensor: () => {},
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  DragOverlay: () => null, 
  closestCorners: vi.fn(),
  defaultDropAnimationSideEffects: () => ({}),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => <div>{children}</div>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
  verticalListSortingStrategy: {},
  sortableKeyboardCoordinates: () => {}, // Mock function
}));

// Mock the Column component to avoid deep rendering issues
vi.mock('../components/tasks/board/KanbanColumn', () => ({
  default: ({ title, tasks }) => (
    <div data-testid={`column-${title}`}>
      <h2>{title}</h2>
      <ul>
        {tasks.map(t => <li key={t._id}>{t.text}</li>)}
      </ul>
    </div>
  )
}));

describe('KanbanBoard Component', () => {
  const mockTasks = [
    { _id: '1', text: 'Task 1', completed: false },
    { _id: '2', text: 'Task 2', completed: true },
  ];
  const mockToggle = vi.fn();

  it('renders both columns', () => {
    render(<KanbanBoard tasks={mockTasks} onToggleTask={mockToggle} />);
    
    expect(screen.getByTestId('column-To Do')).toBeInTheDocument();
    expect(screen.getByTestId('column-Completed')).toBeInTheDocument();
  });

  it('distributes tasks correctly', () => {
    render(<KanbanBoard tasks={mockTasks} onToggleTask={mockToggle} />);
    
    const todoColumn = screen.getByTestId('column-To Do');
    const doneColumn = screen.getByTestId('column-Completed');

    expect(todoColumn).toHaveTextContent('Task 1');
    expect(doneColumn).toHaveTextContent('Task 2');
  });
});
