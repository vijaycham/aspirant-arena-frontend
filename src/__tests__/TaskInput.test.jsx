import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskInput from '../components/tasks/TaskInput';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock Framer Motion to render children immediately
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, ...props }) => <div className={className} onClick={onClick} {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock React Icons
vi.mock('react-icons/fi', () => ({
  FiLayers: () => <span data-testid="icon-layers" />,
  FiTarget: () => <span data-testid="icon-target" />,
  FiSearch: () => <span data-testid="icon-search" />,
  FiChevronRight: () => <span data-testid="icon-chevron" />,
  FiPlus: () => <span data-testid="icon-plus" />,
  FiX: () => <span data-testid="icon-x" />,
  FiZap: () => <span data-testid="icon-zap" />
}));

// Mock Redux Actions
vi.mock('../redux/slice/arenaSlice', () => ({
  fetchArenas: () => ({ type: 'arena/fetchArenas' }),
  fetchSyllabus: () => ({ type: 'arena/fetchSyllabus' })
}));

const mockStore = configureStore([]);

const mockSyllabus = {
  'arena-1': {
    byId: {
      '1': { _id: '1', title: 'History', type: 'subject', children: ['2'] },
      '2': { _id: '2', title: 'Ancient India', type: 'topic', parentId: '1' }
    },
    rootIds: ['1']
  }
};

const mockArenas = [
  { _id: 'arena-1', title: 'UPSC GS' }
];

describe('TaskInput Component', () => {
  let store;
  let props;

  beforeEach(() => {
    store = mockStore({
      arena: {
        arenas: mockArenas,
        syllabus: mockSyllabus
      }
    });

    props = {
      task: '',
      setTask: vi.fn(),
      priority: 'low',
      setPriority: vi.fn(),
      dueDate: '',
      setDueDate: vi.fn(),
      onAdd: vi.fn(),
      onCancel: vi.fn(),
      isEditing: false,
      selectedArenaId: 'arena-1',
      setSelectedArenaId: vi.fn(),
      selectedNodeId: null,
      setSelectedNodeId: vi.fn()
    };
  });

  const renderComponent = (customProps = {}) => {
    return render(
      <Provider store={store}>
        <TaskInput {...{ ...props, ...customProps }} />
      </Provider>
    );
  };

  it('renders input fields correctly', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/What needs to be done?/i)).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('updates task input on typing', () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/What needs to be done?/i);
    fireEvent.change(input, { target: { value: 'New Task' } });
    expect(props.setTask).toHaveBeenCalledWith('New Task');
  });

  it('updates priority on selection', () => {
    renderComponent();
    const select = screen.getByRole('combobox'); // Select is implicitly combobox role
    fireEvent.change(select, { target: { value: 'high' } });
    expect(props.setPriority).toHaveBeenCalledWith('high');
  });

  it('updates due date on change', () => {
    const { container } = renderComponent();
    const dateInput = container.querySelector('input[type="date"]');
    const timeInput = container.querySelector('input[type="time"]');

    // Simulate picking a date: 2023-12-31
    fireEvent.change(dateInput, { target: { value: '2023-12-31' } });

    // Default time is 09:00. This is local time.
    // The helpers convert Local '2023-12-31T09:00' -> ISO (UTC).
    const expectedISO1 = new Date('2023-12-31T09:00').toISOString();
    expect(props.setDueDate).toHaveBeenCalledWith(expectedISO1);

    // Simulate picking a time: 14:30
    fireEvent.change(timeInput, { target: { value: '14:30' } });

    // Uses "today" if date isn't set in state (mocked).
    // Local 'YYYY-MM-DDT14:30' -> ISO (UTC).
    const today = new Date().toISOString().split('T')[0];
    const expectedISO2 = new Date(`${today}T14:30`).toISOString();
    expect(props.setDueDate).toHaveBeenCalledWith(expectedISO2);
  });

  it('calls onAdd when Add Task is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Add Task'));
    expect(props.onAdd).toHaveBeenCalled();
  });

  it('shows and calls onCancel in edit mode', () => {
    renderComponent({ isEditing: true });
    expect(screen.getByText('Update Task')).toBeInTheDocument();

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    expect(props.onCancel).toHaveBeenCalled();
  });

  it('shows smart suggestions when typing matches syllabus', () => {
    // We need 'task' prop to match mock syllabus title for suggestion logic to trigger
    // The component derives suggestions from 'task' prop, not internal state (it's controlled)
    renderComponent({ task: 'Ancient' }); // Should match 'Ancient India'

    // Focus input to trigger showSuggestions(true)
    const input = screen.getByPlaceholderText(/What needs to be done?/i);
    fireEvent.focus(input);

    expect(screen.getByText('Ancient India')).toBeInTheDocument();
  });

  it('selects suggestion when clicked', () => {
    renderComponent({ task: 'Ancient' });
    fireEvent.focus(screen.getByPlaceholderText(/What needs to be done?/i));

    const suggestion = screen.getByText('Ancient India');
    fireEvent.click(suggestion);

    expect(props.setSelectedNodeId).toHaveBeenCalledWith('2');
    expect(props.setTask).toHaveBeenCalledWith('Ancient India');
  });

  it('opens arena selector when Link Roadmap is clicked', () => {
    renderComponent({ selectedNodeId: null });
    fireEvent.click(screen.getByText('UPSC GS'));

    // Checks if the dropdown appeared (mocked motion div renders children)
    expect(screen.getByText('Select Context')).toBeInTheDocument();
  });
});
