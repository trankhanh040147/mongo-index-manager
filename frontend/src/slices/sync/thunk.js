//Include Both Helper File with needed methods
import {
    postSync,
    getSyncListApi, compareByCollectionAPI, compareByDatabaseAPI, postSyncByCollection, postSyncByDatabase, getSyncStatus,
} from "../../helpers/backend_helper";

import {apiError, loginSuccess} from "../auth/login/reducer";
import {getAccessToken, setAuthorization} from "../../helpers/api_helper";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {toast} from "react-toastify";
import {CompareByCollectionSuccess, postSyncError, postSyncSuccess} from "./reducer";

export const createSync = createAsyncThunk(
    "syncs/createSync",
    async ({values}, thunkAPI) => {
        let resp = null;

        try {
            let response;

            setAuthorization(getAccessToken());

            console.log("POST /syncing ", values)
            if (values.collection_name) {
                response = postSyncByCollection(values);
            } else {
                response = postSyncByDatabase(values)
            }

            resp = await response;
            let data = resp.data

            if (data) {
                console.log(data)
                thunkAPI.dispatch(postSyncSuccess(data));
                // toast.success("Sync Created Successfully", {autoClose: 3000});
            } else {
                console.log("error: ", resp)
            }
            return data
        } catch (error) {
            const errorData = error.response?.data;
            const errorMessage = (errorData?.error && typeof errorData.error === 'string') 
                ? errorData.error 
                : (errorData?.message || error.message || "Create Sync Failed");
            toast.error(errorMessage, {autoClose: 3000});
            console.log("error: ", error);
            thunkAPI.dispatch(postSyncError(errorMessage))
        }
    });

export const getSyncStatusById = createAsyncThunk("syncs/getSyncStatusById", async (syncId) => {
    try {
        setAuthorization(getAccessToken());
        const response = getSyncStatus(syncId);
        const dataResponse = await response;
        if (dataResponse && dataResponse.data !== undefined) {
            return dataResponse.data;
        }
        return dataResponse;
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = (errorData?.error && typeof errorData.error === 'string') 
            ? errorData.error 
            : (errorData?.message || error.message || "Get Sync Status Failed");
        toast.error(errorMessage, {autoClose: 3000});
        return error;
    }
});

export const getSyncHistory = createAsyncThunk("syncs/getSyncList", async (params) => {
    try {
        setAuthorization(getAccessToken());

        const response = getSyncListApi(params);
        let dataResponse = await response
        let data = dataResponse.data
        if (data) {
            console.log(data)
            return data;
        }

    } catch (error) {
        return error;
    }
});

export const compareByCollection = createAsyncThunk("indexes/comparing/collection",
    async ({values}, thunkAPI) => {
        try {
            setAuthorization(getAccessToken());
            let response;

            response = compareByCollectionAPI(values);
            let resp = await response;
            // resp is now {status_code, error_code, data} after interceptor
            let data = resp.data

            if (data) {
                console.log(data)
                thunkAPI.dispatch(CompareByCollectionSuccess(data));
                // toast.success("Index Created Successfully", {autoClose: 3000});
                return data
            } else {
                console.log("error: ", resp)
            }
        } catch (error) {
            return error;
        }
    }
);


export const compareByDatabase = createAsyncThunk("indexes/comparing/database",
    async ({values}, thunkAPI) => {
        try {
            setAuthorization(getAccessToken());
            let response;

            response = compareByDatabaseAPI(values);
            let resp = await response;
            // resp is now {status_code, error_code, data} after interceptor
            let data = resp.data

            if (data) {
                console.log(data)
                thunkAPI.dispatch(CompareByCollectionSuccess(data));
                return data
            } else {
                console.log("error: ", resp)
            }
        } catch (error) {
            return error;
        }
    }
);