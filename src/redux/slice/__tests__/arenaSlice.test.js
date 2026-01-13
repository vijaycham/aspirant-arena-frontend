import arenaReducer, {
  setCurrentArena,
  fetchArenas,
  createArena,
  deleteArena,
  fetchSyllabus,
  updateNode,
  syncNodeTime
} from '../arenaSlice';
import { describe, it, expect, vi } from 'vitest';

describe('arenaSlice Reducer', () => {
  const initialState = {
    arenas: [],
    currentArenaId: null,
    syllabus: {},
    loading: false,
    error: null
  };

  it('should handle initial state', () => {
    expect(arenaReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setCurrentArena', () => {
    const actual = arenaReducer(initialState, setCurrentArena('123'));
    expect(actual.currentArenaId).toEqual('123');
  });

  describe('fetchArenas', () => {
    it('should set loading true on pending', () => {
      const action = { type: fetchArenas.pending.type };
      const actual = arenaReducer(initialState, action);
      expect(actual.loading).toBe(true);
    });

    it('should set arenas on fulfilled', () => {
      const mockArenas = [{ _id: '1', title: 'Arena 1', isPrimary: true }];
      const action = { type: fetchArenas.fulfilled.type, payload: mockArenas };
      const actual = arenaReducer(initialState, action);
      expect(actual.loading).toBe(false);
      expect(actual.arenas).toEqual(mockArenas);
      expect(actual.currentArenaId).toEqual('1'); // Sets primary as current
    });

    it('should set error on rejected', () => {
      const errorMsg = 'Failed to fetch';
      const action = { type: fetchArenas.rejected.type, payload: errorMsg };
      const actual = arenaReducer(initialState, action);
      expect(actual.loading).toBe(false);
      expect(actual.error).toEqual(errorMsg);
    });
  });

  describe('createArena', () => {
    it('should add new arena on fulfilled', () => {
      const newArena = { _id: '2', title: 'New Arena' };
      const action = { type: createArena.fulfilled.type, payload: newArena };
      const actual = arenaReducer(initialState, action);
      expect(actual.arenas).toHaveLength(1);
      expect(actual.arenas[0]).toEqual(newArena);
      expect(actual.currentArenaId).toEqual('2'); // Auto-switch to new
    });
  });

  describe('deleteArena', () => {
    it('should remove arena on fulfilled', () => {
      const state = {
        ...initialState,
        arenas: [
          { _id: '1', title: 'Keep Me' },
          { _id: '2', title: 'Delete Me' }
        ],
        currentArenaId: '2',
        syllabus: { '2': [] }
      };
      
      const action = { type: deleteArena.fulfilled.type, payload: '2' };
      const actual = arenaReducer(state, action);
      
      expect(actual.arenas).toHaveLength(1);
      expect(actual.arenas[0]._id).toEqual('1');
      expect(actual.currentArenaId).toEqual('1'); // Fallback to first
      expect(actual.syllabus['2']).toBeUndefined();
    });
  });

  describe('fetchSyllabus', () => {
    it('should store syllabus nodes on fulfilled', () => {
      const payload = { arenaId: '1', nodes: [{ _id: 'n1' }] };
      const action = { type: fetchSyllabus.fulfilled.type, payload };
      const actual = arenaReducer(initialState, action);
      expect(actual.syllabus['1']).toEqual(payload.nodes);
    });
  });

  describe('updateNode', () => {
    it('should update existing node on fulfilled', () => {
      const state = {
        ...initialState,
        syllabus: { '1': [{ _id: 'n1', title: 'Old' }, { _id: 'n2' }] }
      };
      const payload = { _id: 'n1', title: 'New', arenaId: '1' };
      const action = { type: updateNode.fulfilled.type, payload };
      const actual = arenaReducer(state, action);
      expect(actual.syllabus['1'][0].title).toEqual('New');
    });

    it('should ignore if arena or node not found', () => {
      const state = { ...initialState, syllabus: { '1': [] } };
      const payload = { _id: 'n1', arenaId: '2' }; // Wrong arena
      const action = { type: updateNode.fulfilled.type, payload };
      const actual = arenaReducer(state, action);
      expect(actual).toEqual(state);
    });
  });

  describe('syncNodeTime', () => {
    it('should update node time on fulfilled', () => {
      const state = {
        ...initialState,
        syllabus: { '1': [{ _id: 'n1', timeSpent: 0 }] }
      };
      const payload = { _id: 'n1', timeSpent: 100, arenaId: '1' };
      const action = { type: syncNodeTime.fulfilled.type, payload };
      const actual = arenaReducer(state, action);
      expect(actual.syllabus['1'][0].timeSpent).toEqual(100);
    });
  });
});
