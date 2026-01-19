import {userForgetPasswordSuccess, userForgetPasswordError} from "./reducer"

//Include Both Helper File with needed methods
import {getFirebaseBackend} from "../../../helpers/firebase_helper";

import {
    postFakeForgetPwd,
    postJwtForgetPwd,
} from "../../../helpers/backend_helper";

const fireBaseBackend = getFirebaseBackend();

export const userForgetPassword = (user, history) => async (dispatch) => {
    try {
        let response;
        if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {

            response = fireBaseBackend.forgetPassword(
                user.email
            )

        } else if (process.env.REACT_APP_DEFAULTAUTH === "jwt") {
            response = postJwtForgetPwd(
                user.email
            )
        } else {
            response = postFakeForgetPwd(
                user.email
            )
        }

        const data = await response;

        if (data && data.status_code >= 200 && data.status_code < 300) {
            dispatch(userForgetPasswordSuccess(
                "Reset link are sended to your mailbox, check there first"
            ))
        } else {
            const errorMessage = data?.error || "Failed to send reset link";
            dispatch(userForgetPasswordError(errorMessage));
        }
    } catch (forgetError) {
        const errorData = forgetError.response?.data;
        const errorMessage = (errorData?.error && typeof errorData.error === 'string') 
            ? errorData.error 
            : (errorData?.message || forgetError.message || "Failed to send reset link");
        dispatch(userForgetPasswordError(errorMessage))
    }
}