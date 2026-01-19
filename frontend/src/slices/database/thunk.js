//Include Both Helper File with needed methods
import {
    postDatabase,
    getDatabaseListApi,
    deleteDatabaseListApi, putDatabase, getDatabase
} from "../../helpers/backend_helper";

// action
import {
    postDatabaseError,
    postDatabaseSuccess, setLoading,
} from "../reducer";
import {apiError, loginSuccess, logoutUserSuccess} from "../auth/login/reducer";
import {getAccessToken, setAuthorization, getErrorMessage} from "../../helpers/api_helper";
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
            const errorMessage = getErrorMessage(error) || "Create Database Failed";
            toast.error(errorMessage, {autoClose: 3000});
            console.dir("error: ", error);
            console.log("error: ", error);
            thunkAPI.dispatch(postDatabaseError(errorMessage));
            return thunkAPI.rejectWithValue(errorMessage);
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
            const errorMessage = getErrorMessage(error) || "Update Database Failed";
            toast.error(errorMessage, {autoClose: 3000});
            console.dir("error: ", error);
            console.log("error: ", error);
            thunkAPI.dispatch(postDatabaseError(errorMessage));
            return thunkAPI.rejectWithValue(errorMessage);
        }
    });

export const getDatabaseList = createAsyncThunk("databases/getDatabaseList", async (params, thunkAPI) => {
    try {
        setAuthorization(getAccessToken());

        const response = getDatabaseListApi(params);
        const dataResponse = await response
        if (dataResponse && dataResponse.data !== undefined) {
            return {
                records: dataResponse.data,
                data: dataResponse.data,
                extra: dataResponse.extra
            };
        }
        return dataResponse;

    } catch (error) {
        const errorMessage = getErrorMessage(error) || "Get Database List Failed";
        return thunkAPI.rejectWithValue(errorMessage);
    }
});

export const getDatabaseById = createAsyncThunk("databases/getDatabaseById", async (id, thunkAPI) => {
    try {
        setAuthorization(getAccessToken());
        const response = getDatabase(id);
        const dataResponse = await response;
        if (dataResponse && dataResponse.data !== undefined) {
            return dataResponse.data;
        }
        return dataResponse;
    } catch (error) {
        const errorMessage = getErrorMessage(error) || "Get Database Failed";
        toast.error(errorMessage, {autoClose: 3000});
        return thunkAPI.rejectWithValue(errorMessage);
    }
});

export const deleteDatabaseList = createAsyncThunk("databases/deleteDatabaseList", async (data, thunkAPI) => {
    try {
        setAuthorization(getAccessToken());
        const response = deleteDatabaseListApi(data.id);
        const dataResponse = await response;
        if (dataResponse && dataResponse.status_code >= 200 && dataResponse.status_code < 300) {
            toast.success("Delete Successfully", {autoClose: 3000});
            return { id: data.id, data: dataResponse.data };
        } else {
            throw new Error("Delete failed");
        }
    } catch (error) {
        const errorMessage = getErrorMessage(error) || "Delete Failed";
        toast.error(errorMessage, {autoClose: 3000});
        return thunkAPI.rejectWithValue(errorMessage);
    }
});

