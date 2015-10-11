///<reference path="IQueryOptions.ts" />
///<reference path="IRecord.ts" />
///<reference path="IUpdate.ts" />

interface ICommunicationService {
    getIds(nodeId: string, filter: any, options: IQueryOptions): angular.IPromise<string[]>;
    readRecord(nodeId: string, id: string): angular.IPromise<IRecord>;
    updateRecord(nodeId: string, record: IRecord, echo: boolean): angular.IPromise<IRecord>;
    createRecord(nodeId: string, record: IRecord): angular.IPromise<IRecord>;
    deleteRecord(nodeId: string, id: string): angular.IPromise<void>;
    getVersion(): angular.IPromise<string>;
    getChanges(version: string): angular.IPromise<IUpdate[]>;
}
