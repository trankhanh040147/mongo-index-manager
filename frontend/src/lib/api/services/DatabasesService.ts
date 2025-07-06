/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Database } from '../models/Database';
import type { DatabaseCreate } from '../models/DatabaseCreate';
import type { DatabaseUpdate } from '../models/DatabaseUpdate';
import type { ListRequest } from '../models/ListRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DatabasesService {
    /**
     * Create a new database connection
     * Adds a new database connection record to the system.
     * @param requestBody
     * @returns any Database connection created successfully.
     * @throws ApiError
     */
    public static postDatabases(
        requestBody: DatabaseCreate,
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: Database;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/databases',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).`,
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
            },
        });
    }
    /**
     * List database connections
     * Retrieves a paginated list of database connections.
     * @param requestBody
     * @returns any A list of database connections.
     * @throws ApiError
     */
    public static postDatabasesList(
        requestBody: ListRequest,
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: Array<Database>;
        extra?: {
            page?: number;
            limit?: number;
            total?: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/databases/list',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
            },
        });
    }
    /**
     * Get a database connection
     * Retrieves details for a specific database connection by its ID.
     * @param id The ID of the database connection.
     * @returns any Database connection details.
     * @throws ApiError
     */
    public static getDatabases(
        id: string,
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: Database;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/databases/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
                404: `Not Found - The server can not find the requested resource.`,
            },
        });
    }
    /**
     * Update a database connection
     * Updates the details of a specific database connection.
     * @param id The ID of the database connection.
     * @param requestBody
     * @returns any Database connection updated successfully.
     * @throws ApiError
     */
    public static putDatabases(
        id: string,
        requestBody: DatabaseUpdate,
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: Database;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/databases/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).`,
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
                404: `Not Found - The server can not find the requested resource.`,
            },
        });
    }
    /**
     * Delete a database connection
     * Removes a database connection from the system.
     * @param id The ID of the database connection.
     * @returns void
     * @throws ApiError
     */
    public static deleteDatabases(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/databases/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
                404: `Not Found - The server can not find the requested resource.`,
            },
        });
    }
    /**
     * List collections in a database
     * Retrieves a list of collections for a specified database connection.
     * @param requestBody
     * @returns any A list of collection names.
     * @throws ApiError
     */
    public static postDatabasesCollectionsList(
        requestBody: {
            /**
             * The ID of the database to list collections from.
             */
            database_id: string;
        },
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: Array<string>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/databases/collections/list',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
                404: `Not Found - The server can not find the requested resource.`,
            },
        });
    }
}
