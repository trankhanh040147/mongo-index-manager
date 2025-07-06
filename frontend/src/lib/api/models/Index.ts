/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Index = {
    id?: string;
    collection_id?: string;
    name?: string;
    /**
     * The fields included in the index and their sort order (1 for ascending, -1 for descending).
     */
    keys?: Record<string, any>;
    unique?: boolean;
};

