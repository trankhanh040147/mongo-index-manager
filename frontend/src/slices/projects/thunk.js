import {createAsyncThunk} from "@reduxjs/toolkit";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Include Both Helper File with needed methods
import {
    getProjectList as getProjectListApi,
    addProjectList as addProjectListApi,
    updateProjectList as updateProjectListApi,
    deleteProjectList as deleteProjectListApi
} from "../../helpers/backend_helper";
import {setAuthorization} from "../../helpers/api_helper";

export const getProjectList = createAsyncThunk("projects/getProjectList", async () => {
    try {
        const token = JSON.parse(localStorage.getItem("tokens")).access_token
        setAuthorization(token);

        const response = getProjectListApi();

        return response.data;
    } catch (error) {
        return error;
    }
});

export const addProjectList = createAsyncThunk("projects/addProjectList", async (project) => {
    try {
        const response = addProjectListApi(project);
        const data = await response;
        toast.success("project-list Added Successfully", {autoClose: 3000});
        return data;
    } catch (error) {
        toast.error("project-list Added Failed", {autoClose: 3000});
        return error;
    }
});

export const updateProjectList = createAsyncThunk("projects/updateProjectList", async (project) => {
    try {
        const response = updateProjectListApi(project);
        const data = await response;
        toast.success("project-list Updated Successfully", {autoClose: 3000});
        return data;
    } catch (error) {
        toast.error("project-list Updated Failed", {autoClose: 3000});
        return error;
    }
});

export const deleteProjectList = createAsyncThunk("projects/deleteProjectList", async (data) => {
    try {
        const response = deleteProjectListApi(data);
        const newdata = await response;
        toast.success("project-list Delete Successfully", {autoClose: 3000});
        return data;
    } catch (error) {
        toast.error("project-list Delete Failed", {autoClose: 3000});
        return error;
    }
});