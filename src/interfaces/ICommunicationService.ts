///<reference path="IQueryOptions.ts" />
///<reference path="IRecord.ts" />
///<reference path="IUpdate.ts" />
///<reference path="IUpdates.ts" />
///<reference path="IVersionRequest.ts" />

interface ICommunicationService {
    getIds(streamId: string, nodeId: string, filter: any, options: IQueryOptions): Promise<string[]>;
    readRecord(streamId: string, nodeId: string, id: string): Promise<IRecord>;
    readRecords(streamId: string, nodeId: string, ids: string[]): Promise<IRecord[]>;
    updateRecord(streamId: string, nodeId: string, record: IRecord, echo: boolean): Promise<IRecord>;
    updateRecords(streamId: string, nodeId: string, records: IRecord[], echo: boolean): Promise<IRecord[]>;
    createRecord(streamId: string, nodeId: string, record: IRecord, echo: boolean): Promise<IRecord>;
    deleteRecord(streamId: string, nodeId: string, id: string): Promise<void>;
    getVersion(streamId: string, nodeId: string): Promise<string>;
    getOneStreamChanges(streamId: string, nodeId: string, version: string): Promise<IUpdate[]>;
    getManyStreamsChanges(streamsAndVersions: IVersionRequest[]): Promise<IUpdates[]>;
}
