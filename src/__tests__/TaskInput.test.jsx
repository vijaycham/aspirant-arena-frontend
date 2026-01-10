import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskInput from '../components/tasks/TaskInput';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock React Icons to prevent ESM issues in test
vi.mock('react-icons/fi', () => ({
  FiLayers: () => <div data-testid="icon-layers" />,
  FiTarget: () => <div data-testid="icon-target" />,
  FiSearch: () => <div data-testid="icon-search" />,
  FiChevronRight: () => <div data-testid="icon-chevron" />,
  FiPlus: () => <div data-testid="icon-plus" />
}));

// Mock Redux Actions
vi.mock('../redux/slice/arenaSlice', () => ({
  fetchArenas: () => ({ type: 'arena/fetchArenas' }),
  fetchSyllabus: () => ({ type: 'arena/fetchSyllabus' })
}));

// Mock the dynamic import
vi.mock('../../data/syllabus/upsc-gs.json', () => ({
  default: {
    root: {
      title: "General Studies",
      type: "subject",
      children: [
        {
          title: "History",
          type: "topic",
          children: [
             { title: "Ancient India", type: "subtopic", children: [] }
          ]
        }
      ]
    }
  }
}));

const mockStore = configureStore([]);

describe('TaskInput Component', () => {
  let store;
  let props;

  beforeEach(() => {
    store = mockStore({
      arena: {
        arenas: [],
        syllabus: {}
      }
    });

    props = {
      task: '',
      setTask: vi.fn(),
      priority: 'medium',
      setPriority: vi.fn(),
      dueDate: '',
      setDueDate: vi.fn(),
      onAdd: vi.fn(),
      onCancel: vi.fn(),
      isEditing: false,
      selectedArenaId: 'upsc-gs',
      setSelectedArenaId: vi.fn(),
      selectedNodeId: null,
      setSelectedNodeId: vi.fn()
    };
  });

  it('should render input fields correctly', () => {
    render(
      <Provider store={store}>
        <TaskInput {...props} />
      </Provider>
    );
    
    expect(screen.getByPlaceholderText(/What needs to be done?/i)).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument(); // Priority dropdown option
  });

  it('should trigger setTask when typing', () => {
    render(
      <Provider store={store}>
        <TaskInput {...props} />
      </Provider>
    );

    const input = screen.getByPlaceholderText(/What needs to be done?/i);
    fireEvent.change(input, { target: { value: 'Revise History' } });

    expect(props.setTask).toHaveBeenCalledWith('Revise History');
  });

});
