import axios from "axios";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {SessionKeyCollection, SessionKeyDatabase} from "../common/const";
import {api} from "../config";
import {logoutUser} from "../slices/auth/login/thunk";

// default
axios.defaults.baseURL = api.API_URL;
// content type
axios.defaults.headers.post["Content-Type"] = "application/json";

// content type
const token = JSON.parse(localStorage.getItem("tokens")) ? JSON.parse(localStorage.getItem("tokens")).access_token : null;
if (token)
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;

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
                    if (tokens && tokens.refresh_token && !error.config._retry) {
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
                                localStorage.setItem("tokens", JSON.stringify(newTokens));
                                setAuthorization(newTokens.access_token);
                                error.config.headers['Authorization'] = `Bearer ${newTokens.access_token}`;
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
                    message = error.message || error;
            }
        }
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (errorData.error !== undefined) {
                message = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
            } else if (errorData.message) {
                message = errorData.message;
            }
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
        logoutUser();
        return null;
    } else {
        return JSON.parse(tokens);
    }
};

const getAccessToken = () => {
    const tokens = getTokens();
    return tokens?.access_token ?? null
}

export {APIClient, setAuthorization, getLoggedinUser, getTokens, getAccessToken};