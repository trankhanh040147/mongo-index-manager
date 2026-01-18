//Include Both Helper File with needed methods
import {getFirebaseBackend} from "../../../helpers/firebase_helper";
import {
    postFakeLogin,
    postJwtLogin,
} from "../../../helpers/backend_helper";

import {loginSuccess, logoutUserSuccess, apiError, reset_login_flag} from './reducer';
import {getProfileUser} from "../profile/thunk";
import {Navigate} from "react-router-dom";
import React from "react";
import {toast} from "react-toastify";

export const loginUser = (user, history) => async (dispatch) => {
    try {
        let response;

        response = postFakeLogin({
            identity: user.identity,
            password: user.password,
        });

        var dataResponse = await response

        if (dataResponse) {
            let data = dataResponse.data
            console.log(data)
            localStorage.setItem("tokens", JSON.stringify(data));

            // if login success, get profile to update state.user
            dispatch(getProfileUser());

            dispatch(loginSuccess(data));
            toast.success("Login Successfully", {
                autoClose: 250,
                onClose: () => {
                    history('/databases')
                }
            });
            //dispatch(apiError(finallogin));
        }
    } catch (error) {
        dispatch(apiError(error));
        // dispatch(reset_login_flag());
    }
};

export const logoutUser = () => async (dispatch) => {
    try {
        localStorage.removeItem("authUser");
        localStorage.removeItem("tokens");
        dispatch(logoutUserSuccess(true));

        // navigate to /login
        return <Navigate to="/login"/>;
    } catch (error) {
        dispatch(apiError(error));
    }
};

export const socialLogin = (type, history) => async (dispatch) => {
    try {
        let response;

        if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
            const fireBaseBackend = getFirebaseBackend();
            response = fireBaseBackend.socialLoginUser(type);
        }
        //  else {
        //   response = postSocialLogin(data);
        // }

        const socialdata = await response;
        if (socialdata) {
            localStorage.setItem("authUser", JSON.stringify(response));
            dispatch(loginSuccess(response));
            history('/dashboard')
        }

    } catch (error) {
        dispatch(apiError(error));
    }
};

export const resetLoginFlag = () => async (dispatch) => {
    try {
        const response = dispatch(reset_login_flag());
        return response;
    } catch (error) {
        dispatch(apiError(error));
    }
};