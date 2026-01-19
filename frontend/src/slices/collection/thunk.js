//Include Both Helper File with needed methods
import {
    postCollection,
    getCollectionListApi,
    deleteCollectionListApi, putCollection
} from "../../helpers/backend_helper";

import {getAccessToken, setAuthorization} from "../../helpers/api_helper";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {toast} from "react-toastify";
import {collectionActions} from "./reducer";

export const createCollection = createAsyncThunk(
    "collections/createCollection",
    async ({databaseID, collection}, thunkAPI) => {
        let resp = null;

        try {
            setAuthorization(getAccessToken());
            const response = postCollection(databaseID, collection);
            resp = await response;
            const data = resp.data
            if (data) {
                console.log(data)
                thunkAPI.dispatch(collectionActions.postCollectionSuccess(data));
                toast.success("Collection Created Successfully", {autoClose: 3000});
            } else {
                console.log("error: ", resp)
            }
            return data
        } catch (error) {
            const errorData = error.response?.data;
            const errorMessage = (errorData?.error && typeof errorData.error === 'string') 
                ? errorData.error 
                : (errorData?.message || error.message || "Create Collection Failed");
            toast.error(errorMessage, {autoClose: 3000});
            thunkAPI.dispatch(collectionActions.postCollectionError(errorMessage))
        }
    });

export const updateCollection = createAsyncThunk(
    "collections/updateCollection",
    async (collection, thunkAPI) => {
        let resp = null;

        try {
            setAuthorization(getAccessToken());
            console.log('collection data:', collection)
            const response = putCollection(collection);
            resp = await response;
            const data = resp.data
            if (data) {
                console.log(data)
                thunkAPI.dispatch(collectionActions.postCollectionSuccess(data));
                toast.success("Collection Updated Successfully", {autoClose: 3000});
            } else {
                console.log("error: ", resp)
            }
            return data
        } catch (error) {
            const errorData = error.response?.data;
            const errorMessage = (errorData?.error && typeof errorData.error === 'string') 
                ? errorData.error 
                : (errorData?.message || error.message || "Update Collection Failed");
            toast.error(errorMessage, {autoClose: 3000});
            thunkAPI.dispatch(collectionActions.postCollectionError(errorMessage))
        }
    });

export const getCollectionList = createAsyncThunk("collections/getCollectionList", async (params) => {
    try {
        setAuthorization(getAccessToken());
        if (!params.limit) {
            params.limit = 4
        }
        const response = getCollectionListApi(params);
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
        return error;
    }
});

export const deleteCollectionList = createAsyncThunk("collections/deleteCollectionList", async (params) => {
    try {
        setAuthorization(getAccessToken());
        const response = deleteCollectionListApi(params.id);
        const dataResponse = await response;
        if (dataResponse && dataResponse.status_code >= 200 && dataResponse.status_code < 300) {
            toast.success("Delete Successfully", {autoClose: 3000});
            return { id: params.id, data: dataResponse.data };
        } else {
            throw new Error("Delete failed");
        }
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = (errorData?.error && typeof errorData.error === 'string') 
            ? errorData.error 
            : (errorData?.message || error.message || "Delete Failed");
        toast.error(errorMessage, {autoClose: 3000});
        return error;
    }
});

