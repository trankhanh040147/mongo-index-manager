//Include Both Helper File with needed methods
import {postFakeProfile, getProfile,} from "../../../helpers/backend_helper";

// action
import {profileSuccess, profileError, resetProfileFlagChange, getProfileSuccess,} from "./reducer";
import {apiError} from "../login/reducer";
import {setAuthorization, getErrorMessage} from "../../../helpers/api_helper";


export const getProfileUser = () => async (dispatch) => {
    try {

        const token = JSON.parse(localStorage.getItem("tokens")).access_token
        setAuthorization(token);

        const response = getProfile()
        let dataResponse = await response
        if (dataResponse) {
            let data = dataResponse.data
            localStorage.setItem("authUser", JSON.stringify({data: data}));
            dispatch(getProfileSuccess(data));
        }

    } catch (error) {
        const errorMessage = getErrorMessage(error) || "Get Profile Failed";
        dispatch(apiError(errorMessage));
    }
}

export const editProfile = (user) => async (dispatch) => {
    try {
        let response;

        let token = JSON.parse(localStorage.getItem("tokens")).access_token
        setAuthorization(token);
        response = postFakeProfile(user);

        const data = await response;

        if (data && data.data) {
            const profileData = data.data;
            if (localStorage.getItem("authUser")) {
                const existing = JSON.parse(localStorage.getItem("authUser"));
                existing.data = {...existing.data, ...profileData};
                localStorage.setItem("authUser", JSON.stringify(existing));
            } else {
                localStorage.setItem("authUser", JSON.stringify({data: profileData}));
            }
            dispatch(profileSuccess(profileData));
        }


    } catch (error) {
        const errorMessage = getErrorMessage(error) || "Update Profile Failed";
        dispatch(profileError(errorMessage));
    }
};

export const resetProfileFlag = () => {
    try {
        return resetProfileFlagChange();
    } catch (error) {
        return error;
    }
};