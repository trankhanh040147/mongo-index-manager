import {createSlice} from "@reduxjs/toolkit";
// import { getSyncHistory, addSyncList, updateSyncList, deleteSyncList } from './thunk';
import {compareByCollection, compareByDatabase, createSync, getSyncHistory, syncFromDatabase} from './thunk';

export const initialState = {
    syncData: [],
    compareCollectionData: {},
    compareDatabaseData: {},
    reload: 0,
    error: {},
    loading: false,
};


const SyncsSlice = createSlice({
    name: 'SyncsSlice',
    initialState,
    reducer: {},
    extraReducers: (builder) => {
        builder.addCase(getSyncHistory.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getSyncHistory.fulfilled, (state, action) => {
            state.syncData = action.payload;
            state.loading = false;
        });
        builder.addCase(getSyncHistory.rejected, (state, action) => {
            // state.error = action.payload.error || null;
            state.error = action.payload || null;
            state.loading = false;
        });
        builder.addCase(createSync.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createSync.fulfilled, (state, action) => {
            state.reload += 1;
            state.loading = false;
        });
        builder.addCase(createSync.rejected, (state, action) => {
            state.error = action.payload || null;
            state.loading = false;
        });
        builder.addCase(syncFromDatabase.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(syncFromDatabase.fulfilled, (state, action) => {
            state.reload += 1;
            state.loading = false;
        });
        builder.addCase(syncFromDatabase.rejected, (state, action) => {
            state.error = action.payload || null;
            state.loading = false;
        });

        builder.addCase(compareByCollection.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(compareByCollection.fulfilled, (state, action) => {
            const payloadData = action.payload?.data || action.payload;
            if (Array.isArray(payloadData) && payloadData.length > 0) {
                state.compareCollectionData = payloadData.length === 1 ? payloadData[0] : payloadData;
            } else if (payloadData && typeof payloadData === 'object') {
                state.compareCollectionData = payloadData;
            } else {
                state.compareCollectionData = {};
            }
            state.loading = false;
        });
        builder.addCase(compareByCollection.rejected, (state, action) => {
            state.error = action.payload || null;
            state.loading = false;
        });
        builder.addCase(compareByDatabase.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(compareByDatabase.fulfilled, (state, action) => {
            const payloadData = action.payload?.data || action.payload;
            if (Array.isArray(payloadData)) {
                state.compareDatabaseData = payloadData;
            } else if (payloadData && typeof payloadData === 'object') {
                state.compareDatabaseData = payloadData;
            } else {
                state.compareDatabaseData = {};
            }
            state.loading = false;
        });
        builder.addCase(compareByDatabase.rejected, (state, action) => {
            state.error = action.payload || null;
            state.loading = false;
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