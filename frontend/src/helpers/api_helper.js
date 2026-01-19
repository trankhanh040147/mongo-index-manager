import axios from "axios";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {SessionKeyCollection, SessionKeyDatabase} from "../common/const";
import {api} from "../config";
import {logoutUser} from "../slices/auth/login/thunk";
import {isRefreshUsable} from "./jwt-token-access/auth-expiry";

// default
axios.defaults.baseURL = api.API_URL;
// content type
axios.defaults.headers.post["Content-Type"] = "application/json";

// content type
const token = JSON.parse(localStorage.getItem("tokens")) ? JSON.parse(localStorage.getItem("tokens")).access_token : null;
if (token)
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;

const extractErrorMessage = (errorResponse) => {
    if (!errorResponse || !errorResponse.data) {
        return "An unexpected error occurred";
    }

    const errorData = errorResponse.data;
    
    // OpenAPI ErrorResponse format: {status_code, error_code, error}
    if (errorData.error !== undefined) {
        if (typeof errorData.error === 'string') {
            return errorData.error;
        } else if (typeof errorData.error === 'object') {
            // Handle validation errors object
            const errorObj = errorData.error;
            if (errorObj.detail) {
                return errorObj.detail;
            }
            // Try to extract first error message from object
            const firstKey = Object.keys(errorObj)[0];
            if (firstKey && errorObj[firstKey]) {
                const firstError = Array.isArray(errorObj[firstKey]) 
                    ? errorObj[firstKey][0] 
                    : errorObj[firstKey];
                return `${firstKey}: ${firstError}`;
            }
            return JSON.stringify(errorObj);
        }
    }
    
    // Fallback to message field (for backward compatibility)
    if (errorData.message) {
        return errorData.message;
    }
    
    return "An unexpected error occurred";
};

axios.interceptors.response.use(
    function (response) {
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    async function (error) {
        console.log("API Error")
        console.log(error)
        let message;
        if (error.response) {
            switch (error.response.status) {
                case 500:
                    message = "Internal Server Error";
                    break;
                case 401:
                    const tokens = getTokens();
                    if (tokens && isRefreshUsable(tokens) && !error.config._retry) {
                        error.config._retry = true;
                        try {
                            const refreshResponse = await axios.post(
                                `${api.API_URL}/auth/refresh-token`,
                                {},
                                {
                                    headers: {
                                        'Authorization': `Bearer ${tokens.refresh_token}`,
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );
                            if (refreshResponse && refreshResponse.data && refreshResponse.data.data) {
                                const newTokens = refreshResponse.data.data;
                                const base = Date.now();
                                const tokensWithExpiry = {
                                    ...newTokens,
                                    access_expires_at: base + 10 * 60 * 1000,
                                    refresh_expires_at: base + 24 * 60 * 60 * 1000,
                                };
                                localStorage.setItem("tokens", JSON.stringify(tokensWithExpiry));
                                setAuthorization(tokensWithExpiry.access_token);
                                error.config.headers['Authorization'] = `Bearer ${tokensWithExpiry.access_token}`;
                                return axios.request(error.config);
                            }
                        } catch (refreshError) {
                            console.log("Token refresh failed:", refreshError);
                        }
                    }
                    message = "Invalid credentials";
                    localStorage.removeItem("authUser");
                    localStorage.removeItem("tokens");
                    toast.error("Authentication Failed!", {
                        autoClose: 3000,
                        onClose: () => {
                            window.location.reload();
                        }
                    });
                    break;
                case 404:
                    message = "Sorry! the data you are looking for could not be found";
                    break;
                default:
                    // Use standardized error extraction
                    message = extractErrorMessage(error.response) || error.message || "An unexpected error occurred";
            }
        } else {
            // Network error or no response
            message = error.message || "Network error. Please check your connection.";
        }
        
        // Extract error message from response if not already set
        if (error.response && !message) {
            message = extractErrorMessage(error.response);
        }
        
        toast.error(message, {
            autoClose: 3000,
        });
        return Promise.reject(error);
    }
);
/**
 * Sets the default authorization
 * @param {*} token
 */
const setAuthorization = (token) => {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

class APIClient {
    /**
     * Fetches data from given url
     */

        //  get = (url, params) => {
        //   return axios.get(url, params);
        // };
    get = (url, params) => {
        let response;

        let paramKeys = [];

        if (params) {
            Object.keys(params).map(key => {
                paramKeys.push(key + '=' + params[key]);
                return paramKeys;
            });

            const queryString = paramKeys && paramKeys.length ? paramKeys.join('&') : "";
            response = axios.get(`${url}?${queryString}`, params);
        } else {
            response = axios.get(`${url}`, params);
        }

        // console.log("APIClient - get -----")
        // console.log(response)
        // console.log(url)
        // console.log(params)
        // console.log("APIClient - get -----")
        //
        return response;
    };
    /**
     * post given data to url
     */
    create = (url, data) => {
        return axios.post(url, data)
    };
    createForm = (url, data) => {
        return axios.postForm(url, data)
    };
    /**
     * Updates data
     */
    update = (url, data) => {
        return axios.patch(url, data);
    };

    put = (url, data) => {
        return axios.put(url, data);
    };
    /**
     * Delete
     */
    delete = (url, config) => {
        return axios.delete(url, {...config});
    };
}

const getLoggedinUser = () => {
    const user = localStorage.getItem("authUser");
    if (!user) {
        return null;
    } else {
        return JSON.parse(user);
    }
};

const getTokens = () => {
    const tokens = localStorage.getItem("tokens");
    if (!tokens) {
        return null;
    } else {
        return JSON.parse(tokens);
    }
};

const getAccessToken = () => {
    const tokens = getTokens();
    return tokens?.access_token ?? null
}

const getErrorMessage = (error) => {
    if (!error) {
        return "An unexpected error occurred";
    }
    
    if (error.response && error.response.data) {
        return extractErrorMessage(error.response);
    }
    
    return error.message || "An unexpected error occurred";
};

export {APIClient, setAuthorization, getLoggedinUser, getTokens, getAccessToken, getErrorMessage};