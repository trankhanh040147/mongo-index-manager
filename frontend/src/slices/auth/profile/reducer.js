import {createSlice} from "@reduxjs/toolkit";

export const initialState = {
    error: "",
    success: "",
    user: {}
};

const ProfileSlice = createSlice({
    name: "Profile",
    initialState,
    reducers: {
        profileSuccess(state, action) {
            state.success = true;
            state.user = action.payload
        },
        getProfileSuccess(state, action) {
            state.success = true;
            state.user = action.payload
        },
        profileError(state, action) {
            state.error = action.payload
        },
        editProfileChange(state) {
            state = {...state};
        },
        resetProfileFlagChange(state) {
            state.success = null
        }
    },
});

export const {
    profileSuccess,
    getProfileSuccess,
    profileError,
    editProfileChange,
    resetProfileFlagChange
} = ProfileSlice.actions

export default ProfileSlice.reducer;