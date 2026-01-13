import taskReducer, {
  setTasks,
  setArchivedTasks,
  addTask,
  removeTask,
  toggleTask,
  updateTask,
  archiveTask,
  clearArchived
} from '../taskSlice';
import { describe, it, expect } from 'vitest';

describe('taskSlice Reducer', () => {
  const initialState = { tasks: [], archivedTasks: [] };

  it('should handle initial state', () => {
    expect(taskReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setTasks', () => {
    const todos = [{ _id: '1', title: 'Task 1' }];
    const actual = taskReducer(initialState, setTasks(todos));
    expect(actual.tasks).toEqual(todos);
  });

  it('should handle setArchivedTasks', () => {
    const archived = [{ _id: '2', title: 'Done' }];
    const actual = taskReducer(initialState, setArchivedTasks(archived));
    expect(actual.archivedTasks).toEqual(archived);
  });

  it('should add task', () => {
    const task = { _id: '1', title: 'New' };
    const actual = taskReducer(initialState, addTask(task));
    expect(actual.tasks).toHaveLength(1);
    expect(actual.tasks[0]).toEqual(task);
  });

  it('should remove task', () => {
    const state = { ...initialState, tasks: [{ _id: '1' }, { _id: '2' }] };
    const actual = taskReducer(state, removeTask('1'));
    expect(actual.tasks).toHaveLength(1);
    expect(actual.tasks[0]._id).toEqual('2');
  });

  describe('toggleTask', () => {
    it('should move active task to archive', () => {
      const task = { _id: '1', isArchived: true };
      const state = { ...initialState, tasks: [{ _id: '1' }] };
      const actual = taskReducer(state, toggleTask(task));
      expect(actual.tasks).toHaveLength(0);
      expect(actual.archivedTasks).toHaveLength(1);
      expect(actual.archivedTasks[0]).toEqual(task);
    });

    it('should move archived task to active', () => {
      const task = { _id: '1', isArchived: false };
      const state = { ...initialState, archivedTasks: [{ _id: '1' }] };
      const actual = taskReducer(state, toggleTask(task));
      expect(actual.archivedTasks).toHaveLength(0);
      expect(actual.tasks).toHaveLength(1);
      expect(actual.tasks[0]).toEqual(task);
    });
  });

  it('should update task', () => {
    const state = { ...initialState, tasks: [{ _id: '1', title: 'Old' }] };
    const update = { _id: '1', title: 'New' };
    const actual = taskReducer(state, updateTask(update));
    expect(actual.tasks[0].title).toEqual('New');
  });

  it('should archive task', () => {
    const task = { _id: '1', title: 'Archive Me' };
    const state = { ...initialState, tasks: [task] };
    const actual = taskReducer(state, archiveTask(task));
    expect(actual.tasks).toHaveLength(0);
    expect(actual.archivedTasks).toHaveLength(1);
    expect(actual.archivedTasks[0]).toEqual(task);
  });

  it('should clear archived', () => {
    const state = { ...initialState, archivedTasks: [{ _id: '1' }] };
    const actual = taskReducer(state, clearArchived());
    expect(actual.archivedTasks).toHaveLength(0);
  });
});
