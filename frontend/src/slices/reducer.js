import {createSlice} from "@reduxjs/toolkit";

export const initialState = {
    error: "",
    success: "",
    loading: false
};

const DatabaseSlice = createSlice({
    name: "Database",
    initialState,
    reducers: {
        postDatabaseSuccess(state, action) {
            state.success = true;
        },
        postDatabaseError(state, action) {
            state.error = action.payload
        },
        setLoading(state, action) {
            console.log("databases: loading")
            state.loading = true;
        }
    },
});

export const {
    postDatabaseSuccess,
    postDatabaseError,
    setLoading
} = DatabaseSlice.actions

export default DatabaseSlice.reducer;