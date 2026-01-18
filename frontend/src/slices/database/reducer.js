import {createSlice} from "@reduxjs/toolkit";
import {createDatabase, deleteDatabaseList, getDatabaseList, updateDatabase} from './thunk';

export const initialState = {
    list: [],
    current: null,
    reload: 0,
    error: {},
    loading: false,
};


const DatabasesSlice = createSlice({
    name: 'DatabasesSlice',
    initialState,
    reducers: {
        setDatabaseCurrent(state, action) {
            state.current = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getDatabaseList.fulfilled, (state, action) => {
            state.list = action.payload;
        });
        builder.addCase(getDatabaseList.rejected, (state, action) => {
            state.error = action.payload || null;
        });

        builder.addCase(createDatabase.fulfilled, (state, action) => {
            state.reload += 1;
            state.loading = false;
        });
        builder.addCase(createDatabase.rejected, (state, action) => {
            state.error = action.payload || null;
            state.loading = false;
        });
        builder.addCase(updateDatabase.fulfilled, (state, action) => {
            state.reload += 1;
            state.loading = false;
        });
        builder.addCase(updateDatabase.rejected, (state, action) => {
            state.error = action.payload || null;
            state.loading = false;
        });
        builder.addCase(deleteDatabaseList.fulfilled, (state, action) => {
            if (action.payload.data) {
                state.list.records = state.list.records.filter(database => database.id.toString() !== action.payload.id.toString());
                state.list.paging.total -= 1
            }
            state.reload += 1
        });
        builder.addCase(deleteDatabaseList.rejected, (state, action) => {
            state.error = action.payload.error || null;
        });
    }
});

export const databaseActions = DatabasesSlice.actions;
export default DatabasesSlice.reducer;
