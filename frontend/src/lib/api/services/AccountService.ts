/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthGetProfileResponse } from '../models/AuthGetProfileResponse';
import type { AuthUpdateProfile } from '../models/AuthUpdateProfile';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccountService {
    /**
     * Get user profile
     * Retrieves the profile information for the currently authenticated user.
     * @returns any User profile retrieved successfully.
     * @throws ApiError
     */
    public static getAuthProfile(): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: AuthGetProfileResponse;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/profile',
            errors: {
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
            },
        });
    }
    /**
     * Update user profile
     * Updates the profile information (first name, last name, avatar) for the currently authenticated user.
     * @param requestBody
     * @returns any Profile updated successfully.
     * @throws ApiError
     */
    public static putAuthProfile(
        requestBody: AuthUpdateProfile,
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: AuthGetProfileResponse;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/auth/profile',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).`,
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
            },
        });
    }
}
