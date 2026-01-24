import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

export const fetchArenas = createAsyncThunk('arena/fetchArenas', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/arenas');
    return response.data.arenas;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch arenas');
  }
});

export const fetchSyllabus = createAsyncThunk('arena/fetchSyllabus', async (arenaId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/arenas/${arenaId}/syllabus`);
    return { arenaId, nodes: response.data.nodes };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch syllabus');
  }
});

export const togglePrimaryArena = createAsyncThunk(
  'arena/togglePrimary',
  async (arenaId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/arenas/${arenaId}`);
      return response.data.arena;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle primary');
    }
  }
);

export const createArena = createAsyncThunk('arena/createArena', async (arenaData, { rejectWithValue }) => {
  try {
    const response = await api.post('/arenas', arenaData);
    toast.success('New Arena initialized! 🏛️');
    return response.data.arena;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to create arena');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deleteArena = createAsyncThunk('arena/deleteArena', async (arenaId, { rejectWithValue }) => {
  try {
    await api.delete(`/arenas/${arenaId}`);
    toast.success('Arena deleted successfully 🗑️');
    return arenaId;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete arena');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateNode = createAsyncThunk('arena/updateNode', async ({ nodeId, arenaId, ...updates }, { rejectWithValue }) => {
  try {
    const result = await api.patch(`/arenas/nodes/${nodeId}`, updates);
    const payload = result.data; // The JSend 'data' field
    const nodes = payload?.updatedNodes || (payload?.node ? [payload.node] : []);
    return { nodes, arenaId };
  } catch (err) {
    console.error('[arenaSlice] updateNode failed:', err);
    const message = err.response?.data?.message || 'Update failed';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const syncNodeTime = createAsyncThunk('arena/syncNodeTime', async ({ nodeId, duration }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/arenas/nodes/${nodeId}/time`, { duration });
    return response.data.node;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

// Create Custom Node
export const createCustomNode = createAsyncThunk('arena/createCustomNode', async ({ arenaId, parentId, title, type }, { rejectWithValue }) => {
  try {
    const result = await api.post(`/arenas/${arenaId}/nodes`, { parentId, title, type });
    toast.success('Topic added! 🌳');
    return result.data.node;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

// Delete Node
export const deleteNode = createAsyncThunk('arena/deleteNode', async ({ arenaId, nodeId }, { rejectWithValue }) => {
  try {
    const result = await api.delete(`/arenas/nodes/${nodeId}`);
    const payload = result.data; // The JSend 'data' field
    const deletedIds = payload?.deletedIds || [nodeId];

    toast.success('Topic deleted 🗑️');
    return {
      arenaId,
      deletedIds,
      deletedNodeId: nodeId
    };
  } catch (err) {
    console.error('[arenaSlice] deleteNode failed:', err);
    const message = err.response?.data?.message || 'Delete failed';
    toast.error(message);
    return rejectWithValue(message);
  }
});

// Helper to normalize the flat node array into O(1) lookup maps
const normalizeNodes = (nodes) => {
  const byId = {};
  const childrenMap = {};
  const rootIds = [];

  nodes.forEach(n => {
    byId[n._id] = n;
    if (!n.parentId) {
      rootIds.push(n._id);
    } else {
      if (!childrenMap[n.parentId]) childrenMap[n.parentId] = [];
      childrenMap[n.parentId].push(n._id);
    }
  });

  return { byId, childrenMap, rootIds };
};

const arenaSlice = createSlice({
  name: 'arena',
  initialState: {
    arenas: [],
    currentArenaId: null,
    syllabus: {}, // arenaId -> { byId: {}, childrenMap: {}, rootIds: [] }
    loading: false,
    syllabusLoading: false,
    error: null
  },
  reducers: {
    setCurrentArena: (state, action) => {
      state.currentArenaId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArenas.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchArenas.fulfilled, (state, action) => {
        state.loading = false;
        state.arenas = action.payload;
        if (!state.currentArenaId && action.payload.length > 0) {
          const primary = action.payload.find(a => a.isPrimary) || action.payload[0];
          state.currentArenaId = primary._id;
        }
      })
      .addCase(fetchArenas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSyllabus.pending, (state) => {
        state.syllabusLoading = true;
      })
      .addCase(fetchSyllabus.fulfilled, (state, action) => {
        state.syllabusLoading = false;
        state.syllabus[action.payload.arenaId] = normalizeNodes(action.payload.nodes);
      })
      .addCase(fetchSyllabus.rejected, (state) => {
        state.syllabusLoading = false;
      })
      .addCase(createArena.fulfilled, (state, action) => {
        state.arenas.push(action.payload);
        state.currentArenaId = action.payload._id;
      })
      .addCase(createCustomNode.fulfilled, (state, action) => {
        const node = action.payload;
        const { arenaId } = node;
        if (!state.syllabus[arenaId]) {
          state.syllabus[arenaId] = { byId: {}, childrenMap: {}, rootIds: [] };
        }
        const arenaData = state.syllabus[arenaId];

        // Immutable replacement
        arenaData.byId = { ...arenaData.byId, [node._id]: node };
        if (node.parentId) {
          const currentChildren = arenaData.childrenMap[node.parentId] || [];
          arenaData.childrenMap = {
            ...arenaData.childrenMap,
            [node.parentId]: [...currentChildren, node._id]
          };
        } else {
          arenaData.rootIds = [...arenaData.rootIds, node._id];
        }
      })
      .addCase(updateNode.fulfilled, (state, action) => {
        const { arenaId, nodes } = action.payload;
        const arenaData = state.syllabus[arenaId];
        if (!arenaData) return;

        const newById = { ...arenaData.byId };
        nodes.forEach(node => {
          newById[node._id] = node;
        });
        arenaData.byId = newById;
      })
      .addCase(syncNodeTime.fulfilled, (state, action) => {
        const { arenaId, ...updatedNode } = action.payload;
        const arenaData = state.syllabus[arenaId];
        if (arenaData) {
          arenaData.byId = { ...arenaData.byId, [updatedNode._id]: updatedNode };
        }
      })
      .addCase(deleteNode.fulfilled, (state, action) => {
        const { arenaId, deletedIds } = action.payload;
        const arenaData = state.syllabus[arenaId];
        if (!arenaData) return;

        const newChildrenMap = { ...arenaData.childrenMap };
        Object.keys(newChildrenMap).forEach(parentId => {
          newChildrenMap[parentId] = newChildrenMap[parentId].filter(id => !deletedIds.includes(id));
        });
        deletedIds.forEach(id => delete newChildrenMap[id]);
        arenaData.childrenMap = newChildrenMap;

        arenaData.rootIds = arenaData.rootIds.filter(id => !deletedIds.includes(id));

        const newById = { ...arenaData.byId };
        deletedIds.forEach(id => delete newById[id]);
        arenaData.byId = newById;
      })
      .addCase(deleteArena.fulfilled, (state, action) => {
        state.arenas = state.arenas.filter(a => a._id !== action.payload);
        if (state.currentArenaId === action.payload) {
          state.currentArenaId = state.arenas.length > 0 ? (state.arenas.find(a => a.isPrimary)?._id || state.arenas[0]._id) : null;
        }
        delete state.syllabus[action.payload];
      })
      .addCase(togglePrimaryArena.fulfilled, (state, action) => {
        state.arenas = state.arenas.map(a => ({
          ...a,
          isPrimary: a._id === action.payload._id
        }));
        toast.success(`Primary Arena set to ${action.payload.title} ⭐`);
      })
      .addCase(togglePrimaryArena.rejected, (state, action) => {
        toast.error(action.payload);
      });
  }
});

export const { setCurrentArena } = arenaSlice.actions;
export default arenaSlice.reducer;
