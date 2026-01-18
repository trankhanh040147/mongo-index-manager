//Include Both Helper File with needed methods
import {postFakeProfile, getProfile,} from "../../../helpers/backend_helper";

// action
import {profileSuccess, profileError, resetProfileFlagChange, getProfileSuccess,} from "./reducer";
import {apiError} from "../login/reducer";
import {setAuthorization} from "../../../helpers/api_helper";


export const getProfileUser = () => async (dispatch) => {
    try {

        const token = JSON.parse(localStorage.getItem("tokens")).access_token
        setAuthorization(token);

        const response = getProfile()
        let dataResponse = await response
        if (dataResponse) {
            let data = dataResponse
            localStorage.setItem("authUser", JSON.stringify(data));
            dispatch(getProfileSuccess(data));
        }

    } catch (error) {
        dispatch(apiError(error));
    }
}

export const editProfile = (user) => async (dispatch) => {
    try {
        let response;

        let token = JSON.parse(localStorage.getItem("tokens")).access_token
        setAuthorization(token);
        response = postFakeProfile(user);

        const data = await response;

        if (data) {
            dispatch(profileSuccess(data));
        }


    } catch (error) {
        dispatch(profileError(error));
    }
};

export const resetProfileFlag = () => {
    try {
        return resetProfileFlagChange();
    } catch (error) {
        return error;
    }
};