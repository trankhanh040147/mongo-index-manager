/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthLogin } from '../models/AuthLogin';
import type { AuthLoginResponse } from '../models/AuthLoginResponse';
import type { AuthRefreshTokenResponse } from '../models/AuthRefreshTokenResponse';
import type { AuthRegister } from '../models/AuthRegister';
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register a new user
     * Creates a new user account with the provided username, email, and password.
     * @param requestBody
     * @returns SuccessResponse User registered successfully.
     * @throws ApiError
     */
    public static postAuthRegister(
        requestBody: AuthRegister,
    ): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).`,
                409: `Conflict - Username or email already exists.`,
            },
        });
    }
    /**
     * Log in a user
     * Authenticates a user with their identity (username or email) and password, returning JWT access and refresh tokens.
     * @param requestBody
     * @returns any Login successful. Returns access and refresh tokens.
     * @throws ApiError
     */
    public static postAuthLogin(
        requestBody: AuthLogin,
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: AuthLoginResponse;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).`,
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
            },
        });
    }
    /**
     * Refresh access token
     * Generates a new pair of access and refresh tokens using a valid refresh token.
     * @returns any Tokens refreshed successfully.
     * @throws ApiError
     */
    public static postAuthRefreshToken(): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: AuthRefreshTokenResponse;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/refresh-token',
            errors: {
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
            },
        });
    }
}
