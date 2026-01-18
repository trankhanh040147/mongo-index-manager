import {createSlice} from "@reduxjs/toolkit";
// import { getSyncHistory, addSyncList, updateSyncList, deleteSyncList } from './thunk';
import {compareByCollection, compareByDatabase, createSync, getSyncHistory} from './thunk';

export const initialState = {
    syncData: [],
    compareCollectionData: {},
    compareDatabaseData: {},
    reload: 0,
    error: {},
};


const SyncsSlice = createSlice({
    name: 'SyncsSlice',
    initialState,
    reducer: {},
    extraReducers: (builder) => {
        builder.addCase(getSyncHistory.fulfilled, (state, action) => {
            state.syncData = action.payload;
        });
        builder.addCase(getSyncHistory.rejected, (state, action) => {
            // state.error = action.payload.error || null;
            state.error = action.payload || null;
        });
        builder.addCase(createSync.fulfilled, (state, action) => {
            state.reload += 1;
        });
        builder.addCase(createSync.rejected, (state, action) => {
            state.error = action.payload || null;
        });

        builder.addCase(compareByCollection.fulfilled, (state, action) => {
            state.compareCollectionData = action.payload
        });
        builder.addCase(compareByCollection.rejected, (state, action) => {
            state.error = action.payload || null;
        });
        builder.addCase(compareByDatabase.fulfilled, (state, action) => {
            state.compareDatabaseData = action.payload
        });
        builder.addCase(compareByDatabase.rejected, (state, action) => {
            state.error = action.payload || null;
        });
        // builder.addCase(updateSync.rejected, (state, action) => {
        //     state.error = action.payload || null;
        // });
    }
});

const SyncSlice = createSlice({
    name: "Sync",
    initialState,
    reducers: {
        postSyncSuccess(state, action) {
            state.success = true;
        },
        CompareByCollectionSuccess(state, action) {
            state.success = true;
        },
        postSyncError(state, action) {
            state.error = action.payload
        },
    },
});

export const {
    postSyncSuccess,
    postSyncError,
    CompareByCollectionSuccess
} = SyncSlice.actions

export default SyncsSlice.reducer;