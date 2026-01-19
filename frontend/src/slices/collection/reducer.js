import {createSlice} from "@reduxjs/toolkit";
import {createCollection, deleteCollectionList, getCollectionList, updateCollection} from './thunk';

const CollectionsSlice = createSlice({
    name: 'CollectionsSlice',
    initialState: {
        list: [],
        current: null,
        reload: 0,
        loading: false,
        error: null,
        success: false,
    },
    reducers: {
        setCollection(state, action) {
            state.current = action.payload;
        },
        postCollectionSuccess(state) {
            state.success = true;
        },
        postCollectionError(state, action) {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getCollectionList.fulfilled, (state, action) => {
            state.list = action.payload;
        });
        builder.addCase(getCollectionList.rejected, (state, action) => {
            // state.error = action.payload.error || null;
            state.error = action.payload || null;
        });

        //
        builder.addCase(createCollection.fulfilled, (state, action) => {
            state.reload += 1;
        });
        builder.addCase(createCollection.rejected, (state, action) => {
            state.error = action.payload || null;
        });
        builder.addCase(updateCollection.fulfilled, (state, action) => {
            state.reload += 1;
        });
        builder.addCase(updateCollection.rejected, (state, action) => {
            state.error = action.payload || null;
        });
        builder.addCase(deleteCollectionList.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                if (state.list.records) {
                    state.list.records = state.list.records.filter(collection => collection.id.toString() !== action.payload.id.toString());
                }
                if (state.list.data) {
                    state.list.data = state.list.data.filter(collection => collection.id.toString() !== action.payload.id.toString());
                }
                if (state.list.extra) {
                    state.list.extra.total = (state.list.extra.total || 0) - 1
                }
            }
            state.reload += 1
        });
        builder.addCase(deleteCollectionList.rejected, (state, action) => {
            state.error = action.payload.error || null;
        });
    }
});

export const collectionActions = CollectionsSlice.actions
export default CollectionsSlice.reducer;