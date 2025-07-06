/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompareByCollectionsRequest } from '../models/CompareByCollectionsRequest';
import type { CompareByDatabaseRequest } from '../models/CompareByDatabaseRequest';
import type { ComparisonResult } from '../models/ComparisonResult';
import type { Index } from '../models/Index';
import type { IndexCreate } from '../models/IndexCreate';
import type { IndexUpdate } from '../models/IndexUpdate';
import type { SuccessResponse } from '../models/SuccessResponse';
import type { SyncByCollectionsRequest } from '../models/SyncByCollectionsRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IndexesService {
    /**
     * Create an index
     * Creates a new index on a specified collection.
     * @param requestBody
     * @returns any Index created successfully.
     * @throws ApiError
     */
    public static postIndexes(
        requestBody: IndexCreate,
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: Index;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/indexes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).`,
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
            },
        });
    }
    /**
     * Get an index
     * Retrieves details for a specific index by its ID.
     * @param id The ID of the index.
     * @returns any Index details.
     * @throws ApiError
     */
    public static getIndexes(
        id: string,
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: Index;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/indexes/{id}',
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
     * Update an index
     * Updates the details of a specific index.
     * @param id The ID of the index.
     * @param requestBody
     * @returns any Index updated successfully.
     * @throws ApiError
     */
    public static putIndexes(
        id: string,
        requestBody: IndexUpdate,
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: Index;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/indexes/{id}',
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
     * Delete an index
     * Removes an index from a collection.
     * @param id The ID of the index.
     * @returns void
     * @throws ApiError
     */
    public static deleteIndexes(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/indexes/{id}',
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
     * List indexes by collection
     * Retrieves a list of all indexes for a given collection.
     * @param requestBody
     * @returns any A list of indexes.
     * @throws ApiError
     */
    public static postIndexesListByCollection(
        requestBody: {
            /**
             * The ID of the collection.
             */
            collection_id: string;
        },
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: Array<Index>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/indexes/list-by-collection',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
            },
        });
    }
    /**
     * Compare indexes between two collections
     * Compares the indexes of a source collection against a target collection and reports the differences.
     * @param requestBody
     * @returns any Comparison result.
     * @throws ApiError
     */
    public static postIndexesCompareByCollections(
        requestBody: CompareByCollectionsRequest,
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: ComparisonResult;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/indexes/compare-by-collections',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
            },
        });
    }
    /**
     * Compare indexes between two databases
     * Compares all indexes across all collections between a source and target database.
     * @param requestBody
     * @returns any Comparison result.
     * @throws ApiError
     */
    public static postIndexesCompareByDatabase(
        requestBody: CompareByDatabaseRequest,
    ): CancelablePromise<{
        status_code?: number;
        error_code?: number;
        data?: ComparisonResult;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/indexes/compare-by-database',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
            },
        });
    }
    /**
     * Synchronize indexes between collections
     * Synchronizes the indexes from a source collection to a target collection based on a comparison.
     * @param requestBody
     * @returns SuccessResponse Synchronization successful.
     * @throws ApiError
     */
    public static postIndexesSyncByCollections(
        requestBody: SyncByCollectionsRequest,
    ): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/indexes/sync-by-collections',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized - The client must authenticate itself to get the requested response. The token is missing, invalid, or expired.`,
            },
        });
    }
}
