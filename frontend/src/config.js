const runtimeConfig = window.__RUNTIME_CONFIG__ || {};

export const api = {
    API_URL: runtimeConfig.REACT_APP_API_URL || process.env.REACT_APP_API_URL || "http://127.0.0.1:8216/api/doctor-manager-api/v1",
};