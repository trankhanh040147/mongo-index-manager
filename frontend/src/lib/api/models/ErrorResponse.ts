/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Standard error response format for the API.
 */
export type ErrorResponse = {
    /**
     * Application-specific error code for programmatic handling.
     */
    error_code?: number;
    /**
     * HTTP status code.
     */
    status_code?: number;
    /**
     * A human-readable error message or a structured object with validation details.
     */
    error?: (string | Record<string, any>);
};

