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
};


const IndexesSlice = createSlice({
    name: 'IndexesSlice',
    initialState,
    reducer: {},
    extraReducers: (builder) => {
        builder.addCase(getIndexList.fulfilled, (state, action) => {
            state.indexLists = action.payload;
        });
        builder.addCase(getIndexList.rejected, (state, action) => {
            // state.error = action.payload.error || null;
            state.error = action.payload || null;
        });
        builder.addCase(exportIndexes.fulfilled, (state, action) => {
            state.indexesExport = action.payload;
        });
        builder.addCase(exportIndexes.rejected, (state, action) => {
            state.error = action.payload || null;
        });
        builder.addCase(createIndex.fulfilled, (state, action) => {
            state.reload += 1;
        });
        builder.addCase(createIndex.rejected, (state, action) => {
            state.error = action.payload || null;
        });
        builder.addCase(updateIndex.fulfilled, (state, action) => {
            state.reload += 1;
        });
        builder.addCase(updateIndex.rejected, (state, action) => {
            state.error = action.payload || null;
        });
        builder.addCase(deleteIndexList.fulfilled, (state, action) => {
            state.reload += 1
        });
        builder.addCase(deleteIndexList.rejected, (state, action) => {
            state.error = action.payload.error || null;
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