/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type IndexCreate = {
    /**
     * The ID of the collection to create the index on.
     */
    collection_id: string;
    /**
     * The name of the index.
     */
    name: string;
    /**
     * The fields to index.
     */
    keys: Record<string, any>;
    unique?: boolean;
};

