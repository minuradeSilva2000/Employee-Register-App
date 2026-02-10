/**
 * Dashboard Redux Slice
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardMetric, Activity, ChartData } from '../../types/enterprise';

interface DashboardState {
  metrics: DashboardMetric[];
  activities: Activity[];
  chartData: ChartData[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: [],
  activities: [],
  chartData: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setMetrics: (state, action: PayloadAction<DashboardMetric[]>) => {
      state.metrics = action.payload;
    },
    setActivities: (state, action: PayloadAction<Activity[]>) => {
      state.activities = action.payload;
    },
    setChartData: (state, action: PayloadAction<ChartData[]>) => {
      state.chartData = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.activities.unshift(action.payload);
    },
  },
});

export const {
  setMetrics,
  setActivities,
  setChartData,
  setLoading,
  setError,
  addActivity,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
