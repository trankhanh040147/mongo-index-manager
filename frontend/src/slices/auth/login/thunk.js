//Include Both Helper File with needed methods
import {getFirebaseBackend} from "../../../helpers/firebase_helper";
import {
    postFakeLogin,
    postJwtLogin,
    postRefreshToken,
} from "../../../helpers/backend_helper";

import {loginSuccess, logoutUserSuccess, apiError, reset_login_flag} from './reducer';
import {getProfileUser} from "../profile/thunk";
import {Navigate} from "react-router-dom";
import React from "react";
import {toast} from "react-toastify";
import {ACCESS_TTL_MS, REFRESH_TTL_MS, computeExpiry, nowMs} from "../../../helpers/jwt-token-access/auth-expiry";

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
            const base = nowMs();
            const tokensWithExpiry = {
                ...data,
                access_expires_at: computeExpiry(ACCESS_TTL_MS, base),
                refresh_expires_at: computeExpiry(REFRESH_TTL_MS, base),
            };
            localStorage.setItem("tokens", JSON.stringify(tokensWithExpiry));

            // if login success, get profile to update state.user
            dispatch(getProfileUser());

            dispatch(loginSuccess(tokensWithExpiry));
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

export const refreshToken = () => async (dispatch) => {
    try {
        const tokens = JSON.parse(localStorage.getItem("tokens"));
        if (!tokens || !tokens.refresh_token) {
            throw new Error("No refresh token available");
        }

        const response = postRefreshToken(tokens.refresh_token);
        const dataResponse = await response;

        if (dataResponse && dataResponse.data) {
            const newTokens = dataResponse.data;
            const base = nowMs();
            const tokensWithExpiry = {
                ...newTokens,
                access_expires_at: computeExpiry(ACCESS_TTL_MS, base),
                refresh_expires_at: computeExpiry(REFRESH_TTL_MS, base),
            };
            localStorage.setItem("tokens", JSON.stringify(tokensWithExpiry));
            dispatch(loginSuccess(tokensWithExpiry));
            return tokensWithExpiry;
        }
        throw new Error("Failed to refresh token");
    } catch (error) {
        dispatch(logoutUser());
        throw error;
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