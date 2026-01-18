//Include Both Helper File with needed methods
import {
    postDatabase,
    getDatabaseListApi,
    deleteDatabaseListApi, putDatabase
} from "../../helpers/backend_helper";

// action
import {
    postDatabaseError,
    postDatabaseSuccess, setLoading,
} from "../reducer";
import {apiError, loginSuccess, logoutUserSuccess} from "../auth/login/reducer";
import {getAccessToken, setAuthorization} from "../../helpers/api_helper";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {toast} from "react-toastify";

export const createDatabase = createAsyncThunk(
    "databases/createDatabase",
    async (database, thunkAPI) => {
        let resp = null;

        try {
            let response;

            setAuthorization(getAccessToken());
            response = postDatabase(database);
            thunkAPI.dispatch(setLoading())

            resp = await response;
            let data = resp.data

            if (data) {
                console.log(data)
                thunkAPI.dispatch(postDatabaseSuccess(data));
                toast.success("Database Created Successfully", {autoClose: 3000});
            } else {
                console.log("error: ", resp)
            }
            return data
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Create Database Failed";
            toast.error(errorMessage, {autoClose: 3000});
            console.dir("error: ", error);
            console.log("error: ", error);
            thunkAPI.dispatch(postDatabaseError(errorMessage))
        }
    });

export const updateDatabase = createAsyncThunk(
    "databases/updateDatabase",
    async (database, thunkAPI) => {
        let resp = null;

        try {
            let response;

            setAuthorization(getAccessToken());
            console.log('database data:', database)
            // dispatch(setLoading(true));
            response = putDatabase(database);
            thunkAPI.dispatch(setLoading())

            resp = await response;
            let data = resp.data

            if (data) {
                console.log(data)
                thunkAPI.dispatch(postDatabaseSuccess(data));
                toast.success("Database Updated Successfully", {autoClose: 3000});
            } else {
                console.log("error: ", resp)
            }
            return data
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Update Database Failed";
            toast.error(errorMessage, {autoClose: 3000});
            console.dir("error: ", error);
            console.log("error: ", error);
            thunkAPI.dispatch(postDatabaseError(errorMessage))
        }
    });

export const getDatabaseList = createAsyncThunk("databases/getDatabaseList", async (params) => {
    try {
        setAuthorization(getAccessToken());

        const response = getDatabaseListApi(params);
        const dataResponse = await response
        const data = dataResponse.data
        if (data) {
            return data;
        }

    } catch (error) {
        return error;
    }
});

export const deleteDatabaseList = createAsyncThunk("databases/deleteDatabaseList", async (data, dispatch) => {
    try {
        setAuthorization(getAccessToken());
        const response = deleteDatabaseListApi(data.id);
        const newdata = await response;
        toast.success("Delete Successfully", {autoClose: 3000});
        console.log(data)
        return data;
    } catch (error) {
        toast.error("Delete Failed", {autoClose: 3000});
        return error;
    }
});

