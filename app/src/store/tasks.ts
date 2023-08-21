import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '.';

const initialState = {
    tasks: [],
};

export const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        addNewTasks: (state:any, action: PayloadAction) => {
            const tasks:any = action.payload;

            Array.from(tasks).forEach((task:any) => {
                state.tasks.push(task);
            })
        },

        updateTask: (state:any, action: PayloadAction) => {
            const task:any = action.payload;

            const index = state.tasks.findIndex((item:any) => item.id === task.id);

            if(index !== -1) {
                state.tasks[index] = {
                    ...state.tasks[index],
                    ...task.value,
                };
            }
        },

        resetTasks: (state:any) =>{
            state.tasks = [];
        }

    },
})

export const { addNewTasks,updateTask,resetTasks } = tasksSlice.actions;

export const selectTasks = (state: RootState) => state.tasks.tasks;

export default tasksSlice.reducer;