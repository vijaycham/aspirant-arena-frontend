import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import taskReducer from '../redux/slice/taskSlice';
import authReducer from '../redux/user/authSlice';
import api from '../utils/api';

// Mock API and Toast
vi.mock('../utils/api');
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock scrollTo
global.scrollTo = vi.fn();

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      task: taskReducer,
      user: authReducer,
    },
    preloadedState: {
      user: { currentUser: { _id: '123', isEmailVerified: true }, loading: false },
      ...initialState,
    },
  });
};

const wrapper = ({ children, store }) => (
  <Provider store={store}>{children}</Provider>
);

describe('useTasks Hook', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createMockStore();
    // Default empty responses for the auto-fetch on mount
    api.get.mockImplementation((url) => {
      if (url === '/tasks') return Promise.resolve({ data: { tasks: [] } });
      if (url === '/tasks/archived') return Promise.resolve({ data: { tasks: [] } });
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('should fetch tasks on mount if user is logged in', async () => {
    const mockTasks = [{ _id: '1', text: 'Task 1', priority: 'medium' }];
    const mockArchived = [{ _id: '2', text: 'Archived 1', priority: 'low' }];

    api.get.mockImplementation((url) => {
      if (url === '/tasks') return Promise.resolve({ data: { tasks: mockTasks } });
      if (url === '/tasks/archived') return Promise.resolve({ data: { tasks: mockArchived } });
      return Promise.reject(new Error('Unknown URL'));
    });

    renderHook(() => useTasks(), {
      wrapper: (props) => wrapper({ ...props, store })
    });

    await waitFor(() => {
      const state = store.getState().task;
      expect(state.tasks).toHaveLength(1);
      expect(state.archivedTasks).toHaveLength(1);
    });
  });

  it('should add a new task', async () => {
    const newTask = { _id: '3', text: 'New Task', priority: 'high' };
    api.post.mockResolvedValue({ data: { task: newTask } });

    const { result } = renderHook(() => useTasks(), {
      wrapper: (props) => wrapper({ ...props, store })
    });

    // Wait for initial fetch to complete
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/tasks'));

    act(() => {
      result.current.setTask('New Task');
      result.current.setPriority('high');
    });

    await act(async () => {
      await result.current.addTask();
    });

    expect(api.post).toHaveBeenCalledWith('/tasks', expect.objectContaining({
      text: 'New Task',
      priority: 'high'
    }));
    
    expect(store.getState().task.tasks).toContainEqual(newTask);
    expect(result.current.task).toBe(''); // Reset after add
  });

  it('should update an existing task', async () => {
    const existingTask = { _id: '1', text: 'Original', priority: 'medium' };
    store = createMockStore({
      task: { tasks: [existingTask], archivedTasks: [] }
    });

    api.get.mockImplementation((url) => {
      if (url === '/tasks') return Promise.resolve({ data: { tasks: [existingTask] } });
      if (url === '/tasks/archived') return Promise.resolve({ data: { tasks: [] } });
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useTasks(), {
      wrapper: (props) => wrapper({ ...props, store })
    });

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/tasks'));

    const updatedTask = { ...existingTask, text: 'Updated' };
    api.patch.mockResolvedValue({ data: { task: updatedTask } });

    act(() => {
      result.current.startEditing(existingTask);
    });

    expect(result.current.task).toBe('Original');

    act(() => {
      result.current.setTask('Updated');
    });

    await act(async () => {
      await result.current.addTask();
    });

    expect(api.patch).toHaveBeenCalledWith(`/tasks/${existingTask._id}`, expect.objectContaining({
      text: 'Updated'
    }));
    
    expect(store.getState().task.tasks[0].text).toBe('Updated');
    expect(result.current.editingTask).toBeNull();
  });

  it('should toggle task completion (archive it)', async () => {
    const activeTask = { _id: '1', text: 'To Complete', completed: false };
    store = createMockStore({
      task: { tasks: [activeTask], archivedTasks: [] }
    });

    api.get.mockImplementation((url) => {
      if (url === '/tasks') return Promise.resolve({ data: { tasks: [activeTask] } });
      if (url === '/tasks/archived') return Promise.resolve({ data: { tasks: [] } });
      return Promise.reject(new Error('Unknown URL'));
    });

    const archivedTask = { ...activeTask, completed: true, isArchived: true };
    api.patch.mockResolvedValue({ data: { task: archivedTask } });

    const { result } = renderHook(() => useTasks(), {
      wrapper: (props) => wrapper({ ...props, store })
    });

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/tasks'));

    await act(async () => {
      await result.current.toggleTask('1', false);
    });

    expect(api.patch).toHaveBeenCalledWith('/tasks/1', expect.objectContaining({
      completed: true,
      isArchived: true
    }));
    
    const state = store.getState().task;
    expect(state.tasks).toHaveLength(0);
    expect(state.archivedTasks).toHaveLength(1);
    expect(state.archivedTasks[0].completed).toBe(true);
  });
});
