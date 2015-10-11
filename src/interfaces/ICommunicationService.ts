///<reference path="IQueryOptions.ts" />

interface ICommunicationService {
    getIds(filter?: any, options?: IQueryOptions): angular.IPromise<string[]>;
}
