import {createSlice} from "@reduxjs/toolkit";
// import { getIndexList, addIndexList, updateIndexList, deleteIndexList } from './thunk';
import {
    compareByCollection,
    compareByDatabase,
    createIndex,
    deleteIndexList,
    exportIndexes,
    getIndexList,
    updateIndex
} from './thunk';

export const initialState = {
    indexLists: [],
    reload: 0,
    error: {},
    indexesExport: null,
    loading: false,
};


const IndexesSlice = createSlice({
    name: 'IndexesSlice',
    initialState,
    reducer: {},
    extraReducers: (builder) => {
        builder.addCase(getIndexList.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getIndexList.fulfilled, (state, action) => {
            state.indexLists = action.payload;
            state.loading = false;
        });
        builder.addCase(getIndexList.rejected, (state, action) => {
            // state.error = action.payload.error || null;
            state.error = action.payload || null;
            state.loading = false;
        });
        builder.addCase(exportIndexes.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(exportIndexes.fulfilled, (state, action) => {
            state.indexesExport = action.payload;
            state.loading = false;
        });
        builder.addCase(exportIndexes.rejected, (state, action) => {
            state.error = action.payload || null;
            state.loading = false;
        });
        builder.addCase(createIndex.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createIndex.fulfilled, (state, action) => {
            state.reload += 1;
            state.loading = false;
        });
        builder.addCase(createIndex.rejected, (state, action) => {
            state.error = action.payload || null;
            state.loading = false;
        });
        builder.addCase(updateIndex.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(updateIndex.fulfilled, (state, action) => {
            state.reload += 1;
            state.loading = false;
        });
        builder.addCase(updateIndex.rejected, (state, action) => {
            state.error = action.payload || null;
            state.loading = false;
        });
        builder.addCase(deleteIndexList.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(deleteIndexList.fulfilled, (state, action) => {
            state.reload += 1
            state.loading = false;
        });
        builder.addCase(deleteIndexList.rejected, (state, action) => {
            state.error = action.payload.error || null;
            state.loading = false;
        });
    }
});

const IndexSlice = createSlice({
    name: "Index",
    initialState,
    reducers: {
        postIndexSuccess(state, action) {
            state.success = true;
        },
        CompareByCollectionSuccess(state, action) {
            state.success = true;
        },
        postIndexError(state, action) {
            state.error = action.payload
        },
    },
});

export const {
    postIndexSuccess,
    postIndexError,
    CompareByCollectionSuccess
} = IndexSlice.actions

export default IndexesSlice.reducer;