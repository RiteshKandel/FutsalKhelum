import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchFutsals = createAsyncThunk(
  'futsals/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/futsals', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchFutsalDetails = createAsyncThunk(
  'futsals/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/futsals/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const futsalSlice = createSlice({
  name: 'futsals',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFutsals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFutsals.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
      })
      .addCase(fetchFutsals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFutsalDetails.fulfilled, (state, action) => {
        state.current = action.payload.data;
      });
  },
});

export default futsalSlice.reducer;
