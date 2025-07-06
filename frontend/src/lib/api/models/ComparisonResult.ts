/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Index } from './Index';
export type ComparisonResult = {
    only_in_source?: Array<Index>;
    only_in_target?: Array<Index>;
    different?: Array<{
        source?: Index;
        target?: Index;
    }>;
};

