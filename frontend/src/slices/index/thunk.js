//Include Both Helper File with needed methods
import {saveAs} from 'file-saver';
import {
    postIndex,
    getIndexListApi,
    deleteIndexListApi, putIndex, compareByCollectionAPI, compareByDatabaseAPI, exportIndexesApi, importIndexesApi
} from "../../helpers/backend_helper";

import {apiError, loginSuccess} from "../auth/login/reducer";
import {getAccessToken, setAuthorization} from "../../helpers/api_helper";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {toast} from "react-toastify";
import {CompareByCollectionSuccess, postIndexError, postIndexSuccess} from "./reducer";

export const createIndex = createAsyncThunk(
    "indexes/createIndex",
    async ({values}, thunkAPI) => {
        let resp = null;

        try {
            let response;

            setAuthorization(getAccessToken());

            console.log("POST /indexes ", values)
            values.options = {
                is_unique: values.unique,
                expire_after_seconds: values.expireAfterSeconds,
            }
            response = postIndex(values);

            resp = await response;
            let data = resp.data

            if (data) {
                console.log(data)
                thunkAPI.dispatch(postIndexSuccess(data));
                toast.success("Index Created Successfully", {autoClose: 3000});
            } else {
                console.log("error: ", resp)
            }
            return data
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Create Index Failed";
            // toast.error(errorMessage, {autoClose: 3000});
            console.log("error: ", error);
            thunkAPI.dispatch(postIndexError(errorMessage))
        }
    });

export const updateIndex = createAsyncThunk(
    "indexes/updateIndex",
    async ({values}, thunkAPI) => {
        let resp = null;

        try {
            let response;

            setAuthorization(getAccessToken());
            console.log("POST /indexes ", values)
            values.options = {
                is_unique: values.unique,
                expire_after_seconds: values.expireAfterSeconds,
            }
            response = putIndex(values);

            resp = await response;
            let data = resp.data

            if (data) {
                console.log(data)
                thunkAPI.dispatch(postIndexSuccess(data));
                toast.success("Index Updated Successfully", {autoClose: 3000});
            } else {
                console.log("error: ", resp)
            }
            return data
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Update Index Failed";
            toast.error(errorMessage, {autoClose: 3000});
            console.dir("error: ", error);
            console.log("error: ", error);
            thunkAPI.dispatch(postIndexError(errorMessage))
        }
    });

export const getIndexList = createAsyncThunk("indexes/getIndexList",
    async (params) => {
        try {
            setAuthorization(getAccessToken());

            if (!params.limit) {
                params.limit = 4
            }
            console.log("database_id: ", params.database_id)
            console.log("collection: ", params.collection)

            const response = getIndexListApi(params);
            let dataResponse = await response
            let data = dataResponse.data
            if (data) {
                return data;
            }

        } catch (error) {
            return error;
        }
    });

export const exportIndexes = createAsyncThunk("indexes/export",
    async (params) => {
        try {
            setAuthorization(getAccessToken());
            console.log("database_id: ", params.database_id)

            const response = exportIndexesApi(params);
            let dataResponse = await response
            if (dataResponse) {
                const blob = new Blob([JSON.stringify(dataResponse, null, 2)], {type: 'application/json'});
                saveAs(blob, 'exported_data.json');
                console.log(dataResponse);
                return dataResponse;
            }
        } catch (error) {
            return error;
        }
    });

export const importIndexes = createAsyncThunk("indexes/import",
    async (params) => {
        try {
            setAuthorization(getAccessToken());
            console.log("params: ", params)
            console.log("database_id: ", params.database_id)
            console.log("file: ", params.file)
            const response = importIndexesApi(params);
            let dataResponse = await response
            let data = dataResponse.data
            if (data) {
                toast.success("Import successfully!", {autoClose: 3000});
                return data;
            }
        } catch (error) {
            return error;
        }
    });


export const deleteIndexList = createAsyncThunk("indexes/deleteIndexList", async ({data}) => {
    try {
        setAuthorization(getAccessToken());
        const response = deleteIndexListApi(data.id);
        let newdata = await response;
        toast.success("Delete Successfully", {autoClose: 3000});
        console.log(data)
        console.log(newdata)
        return newdata;
    } catch (error) {
        toast.error("Delete Failed", {autoClose: 3000});
        return error;
    }
});


