///<reference path="IQueryOptions.ts" />

interface ICommunicationService {
    getIds(nodeId: string, filter: any, options: IQueryOptions): angular.IPromise<string[]>;
}
