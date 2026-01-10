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

export const updateNode = createAsyncThunk('arena/updateNode', async ({ nodeId, updates }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/arenas/nodes/${nodeId}`, updates);
    return response.data.node;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const arenaSlice = createSlice({
  name: 'arena',
  initialState: {
    arenas: [],
    currentArenaId: null,
    syllabus: {}, // arenaId -> nodes mapping
    loading: false,
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
      .addCase(fetchSyllabus.fulfilled, (state, action) => {
        state.syllabus[action.payload.arenaId] = action.payload.nodes;
      })
      .addCase(createArena.fulfilled, (state, action) => {
        state.arenas.push(action.payload);
        state.currentArenaId = action.payload._id;
      })
      .addCase(updateNode.fulfilled, (state, action) => {
        const { arenaId } = action.payload;
        if (state.syllabus[arenaId]) {
          const index = state.syllabus[arenaId].findIndex(n => n._id === action.payload._id);
          if (index !== -1) {
            state.syllabus[arenaId][index] = action.payload;
          }
        }
      });
  }
});

export const { setCurrentArena } = arenaSlice.actions;
export default arenaSlice.reducer;
