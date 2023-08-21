import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '.';

const initialState = {
    goalInput: '',
};

export const goalSlice = createSlice({
    name: 'goalInput',
    initialState,
    reducers: {
        setInputGoal: (state, action: PayloadAction<string>) => {
            console.log("talking after this",state, action)
            state.goalInput = action.payload;
        },
    },
})

export const { setInputGoal } = goalSlice.actions;

export const selectInputGoal = (state: RootState) => state.goalInput.goalInput;

export default goalSlice.reducer;