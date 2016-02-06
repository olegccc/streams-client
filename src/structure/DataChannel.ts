///<reference path="../interfaces/IDataChannel.ts" />
///<reference path="../interfaces/ICommunicationService.ts" />
///<reference path="../interfaces/IDataChannelStorage.ts" />
///<reference path="../interfaces/IDataChannelListener.ts" />
///<reference path="../interfaces/IQueryOptions.ts" />

class DataChannel implements IDataChannel {

    private version: string;
    private storage: IDataChannelStorage;
    private instanceId: string;
    private streamId: string;
    private communicationService: ICommunicationService;
    private listeners: IDataChannelListener[];
    private nodeId: string;

    constructor(storage: IDataChannelStorage, instanceId: string, streamId: string, nodeId: string, version: string, communicationService: ICommunicationService) {
        this.storage = storage;
        this.instanceId = instanceId;
        this.streamId = streamId;
        this.nodeId = nodeId;
        this.communicationService = communicationService;
        this.version = version;
        this.listeners = [];
    }

    getStreamId(): string {
        return this.streamId;
    }

    getVersion(): string {
        return this.version;
    }

    getNodeId(): string {
        return this.nodeId;
    }

    onUpdate(type: number, id: string, version: string) {
        if (version < this.version) {
            return;
        }
        this.version = version;
        for (var i = 0; i < this.listeners.length; i++) {
            this.listeners[i].onChange(type, id);
        }
    }

    initialize() : Promise<void> {

        if (this.version) {
            return new Promise<void>((resolve) => {
                resolve();
            });
        }

        return this.communicationService.getVersion(this.streamId, this.nodeId).then((version: string) => {
            this.version = version;
        });
    }

    addListener(listener: IDataChannelListener) {
        this.listeners.push(listener);
    }

    removeListener(listener: IDataChannelListener) {
        for (var i = 0; i < this.listeners.length; i++) {
            if (this.listeners[i] === listener) {
                this.listeners.splice(i, 1);
                break;
            }
        }
    }

    close() {
        this.storage.close(this.instanceId);
    }

    getIds(filter:any, options: IQueryOptions):Promise<string[]> {
        return this.communicationService.getIds(this.streamId, this.nodeId, filter, options);
    }

    read(id: string):Promise<IRecord> {
        return this.communicationService.readRecord(this.streamId, this.nodeId, id);
    }

    readMany(ids: string[]):Promise<IRecord[]> {
        return this.communicationService.readRecords(this.streamId, this.nodeId, ids);
    }

    update(record: IRecord, echo: boolean):Promise<IRecord> {
        return this.communicationService.updateRecord(this.streamId, this.nodeId, record, echo);
    }

    updateMany(records:IRecord[], echo:boolean):Promise<IRecord[]> {
        return this.communicationService.updateRecords(this.streamId, this.nodeId, records, echo);
    }

    create(record: IRecord, echo: boolean):Promise<IRecord> {
        return this.communicationService.createRecord(this.streamId, this.nodeId, record, echo);
    }

    remove(id: string):Promise<void> {
        return this.communicationService.deleteRecord(this.streamId, this.nodeId, id);
    }
}
