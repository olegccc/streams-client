///<reference path="IQueryOptions.ts" />
///<reference path="IRecord.ts" />
///<reference path="IUpdate.ts" />
///<reference path="IUpdates.ts" />

interface ICommunicationService {
    getIds(streamId: string, nodeId: string, filter: any, options: IQueryOptions): angular.IPromise<string[]>;
    readRecord(streamId: string, nodeId: string, id: string): angular.IPromise<IRecord>;
    updateRecord(streamId: string, nodeId: string, record: IRecord, echo: boolean): angular.IPromise<IRecord>;
    createRecord(streamId: string, nodeId: string, record: IRecord): angular.IPromise<IRecord>;
    deleteRecord(streamId: string, nodeId: string, id: string): angular.IPromise<void>;
    getVersion(streamId: string): angular.IPromise<string>;
    getOneStreamChanges(streamId: string, version: string): angular.IPromise<IUpdate[]>;
    getManyStreamsChanges(streamsAndVersions: {[key: string]: string}): angular.IPromise<IUpdates[]>;
}
