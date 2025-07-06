/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AuthLoginResponse = {
    /**
     * JWT token for authenticating subsequent requests.
     */
    access_token?: string;
    /**
     * JWT token for obtaining a new access token.
     */
    refresh_token?: string;
};

