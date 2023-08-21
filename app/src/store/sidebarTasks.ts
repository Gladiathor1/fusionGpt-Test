import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.';

const initialState = {
    open: false,
};

export const uiSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
        openSidebarTask(state) {
            state.open = true;
        },
        closeSidebarTask(state) {
            state.open = false;
        },
        toggleSidebarTask(state) {
            state.open = !state.open;
        },
    },
})

export const { openSidebarTask, closeSidebarTask, toggleSidebarTask } = uiSlice.actions;

export const selectSidebarTaskOpen = (state: RootState) => state.sidebarTasks.open;

export default uiSlice.reducer;