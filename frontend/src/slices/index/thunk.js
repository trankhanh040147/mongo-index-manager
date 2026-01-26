//Include Both Helper File with needed methods
import {saveAs} from 'file-saver';
import {
    postIndex,
    getIndexListApi,
    deleteIndexListApi, putIndex, compareByCollectionAPI, compareByDatabaseAPI, exportIndexesApi, importIndexesApi, getIndex
} from "../../helpers/backend_helper";

import {apiError, loginSuccess} from "../auth/login/reducer";
import {getAccessToken, setAuthorization, getErrorMessage} from "../../helpers/api_helper";
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
            
            // Build options object
            const options = {
                is_unique: values.unique,
                expire_after_seconds: values.expireAfterSeconds || null,
            };

            // Default to regular if indexType is not set (backward compatibility)
            const indexType = values.indexType || 'regular';

            // Add collation if index type is regular and collation is enabled
            if (indexType === 'regular' && values.collationEnabled) {
                options.collation = {
                    locale: values.collationLocale,
                };
                if (values.collationStrength !== null && values.collationStrength !== undefined) {
                    options.collation.strength = values.collationStrength;
                }
                if (values.collationCaseLevel) {
                    options.collation.case_level = values.collationCaseLevel;
                }
                if (values.collationCaseFirst) {
                    options.collation.case_first = values.collationCaseFirst;
                }
                if (values.collationNumericOrdering) {
                    options.collation.numeric_ordering = values.collationNumericOrdering;
                }
            } else {
                options.collation = null;
            }

            // Add text index options if index type is text
            if (indexType === 'text') {
                // v0.3.1: Send "none" instead of null when default language is not specified
                if (values.defaultLanguage && values.defaultLanguage.trim() !== '') {
                    options.default_language = values.defaultLanguage;
                } else {
                    options.default_language = 'none';
                }
                if (values.weights && typeof values.weights === 'object' && Object.keys(values.weights).length > 0) {
                    options.weights = values.weights;
                } else {
                    options.weights = null;
                }
            } else {
                options.default_language = null;
                options.weights = null;
            }

            values.options = options;
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
            const errorMessage = getErrorMessage(error) || "Create Index Failed";
            console.log("error: ", error);
            thunkAPI.dispatch(postIndexError(errorMessage));
            return thunkAPI.rejectWithValue(errorMessage);
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
            
            // Build options object
            const options = {
                is_unique: values.unique,
                expire_after_seconds: values.expireAfterSeconds || null,
            };

            // Default to regular if indexType is not set (backward compatibility)
            const indexType = values.indexType || 'regular';

            // Add collation if index type is regular and collation is enabled
            if (indexType === 'regular' && values.collationEnabled) {
                options.collation = {
                    locale: values.collationLocale,
                };
                if (values.collationStrength !== null && values.collationStrength !== undefined) {
                    options.collation.strength = values.collationStrength;
                }
                if (values.collationCaseLevel) {
                    options.collation.case_level = values.collationCaseLevel;
                }
                if (values.collationCaseFirst) {
                    options.collation.case_first = values.collationCaseFirst;
                }
                if (values.collationNumericOrdering) {
                    options.collation.numeric_ordering = values.collationNumericOrdering;
                }
            } else {
                options.collation = null;
            }

            if (indexType === 'text') {
                if (values.defaultLanguage && values.defaultLanguage.trim() !== '') {
                    options.default_language = values.defaultLanguage;
                } else {
                    options.default_language = 'none';
                }
                if (values.weights && typeof values.weights === 'object' && Object.keys(values.weights).length > 0) {
                    options.weights = values.weights;
                } else {
                    options.weights = null;
                }
            } else {
                options.default_language = null;
                options.weights = null;
            }

            values.options = options;
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
            const errorMessage = getErrorMessage(error) || "Update Index Failed";
            toast.error(errorMessage, {autoClose: 3000});
            console.dir("error: ", error);
            console.log("error: ", error);
            thunkAPI.dispatch(postIndexError(errorMessage));
            return thunkAPI.rejectWithValue(errorMessage);
        }
    });

export const getIndexList = createAsyncThunk("indexes/getIndexList",
    async (params, thunkAPI) => {
        try {
            setAuthorization(getAccessToken());

            if (!params.limit) {
                params.limit = 4
            }
            console.log("database_id: ", params.database_id)
            console.log("collection: ", params.collection)

            const response = getIndexListApi(params);
            let dataResponse = await response
            if (dataResponse && dataResponse.data !== undefined) {
                return {
                    records: dataResponse.data,
                    data: dataResponse.data,
                    extra: dataResponse.extra
                };
            }
            return dataResponse;

        } catch (error) {
            const errorMessage = getErrorMessage(error) || "Get Index List Failed";
            return thunkAPI.rejectWithValue(errorMessage);
        }
    });

export const exportIndexes = createAsyncThunk("indexes/export",
    async (params, thunkAPI) => {
        try {
            setAuthorization(getAccessToken());
            console.log("database_id: ", params.database_id)

            const response = exportIndexesApi(params);
            let dataResponse = await response
            if (dataResponse && dataResponse.data) {
                const blob = new Blob([JSON.stringify(dataResponse.data, null, 2)], {type: 'application/json'});
                saveAs(blob, 'exported_data.json');
                return dataResponse.data;
            }
        } catch (error) {
            const errorMessage = getErrorMessage(error) || "Export Failed";
            toast.error(errorMessage, {autoClose: 3000});
            return thunkAPI.rejectWithValue(errorMessage);
        }
    });

export const importIndexes = createAsyncThunk("indexes/import",
    async (params, thunkAPI) => {
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
            const errorMessage = getErrorMessage(error) || "Import Failed";
            toast.error(errorMessage, {autoClose: 3000});
            return thunkAPI.rejectWithValue(errorMessage);
        }
    });


export const getIndexById = createAsyncThunk("indexes/getIndexById", async (id, thunkAPI) => {
    try {
        setAuthorization(getAccessToken());
        const response = getIndex(id);
        const dataResponse = await response;
        if (dataResponse && dataResponse.data !== undefined) {
            return dataResponse.data;
        }
        return dataResponse;
    } catch (error) {
        const errorMessage = getErrorMessage(error) || "Get Index Failed";
        toast.error(errorMessage, {autoClose: 3000});
        return thunkAPI.rejectWithValue(errorMessage);
    }
});

export const deleteIndexList = createAsyncThunk("indexes/deleteIndexList", async ({data}, thunkAPI) => {
    try {
        setAuthorization(getAccessToken());
        const response = deleteIndexListApi(data.id);
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


