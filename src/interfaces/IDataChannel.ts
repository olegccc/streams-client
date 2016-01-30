///<reference path="IQueryOptions.ts" />
///<reference path="IRecord.ts" />
///<reference path="IDataChannelListener.ts" />

interface IDataChannel {
    getIds(filter?: any, options?: IQueryOptions) : Promise<string[]>;
    read(id: string) : Promise<IRecord>;
    readMany(ids: string[]) : Promise<IRecord[]>;
    update(record: IRecord, echo: boolean) : Promise<IRecord>;
    create(record: IRecord, echo: boolean) : Promise<IRecord>;
    remove(id: string) : Promise<void>;
    addListener(listener: IDataChannelListener);
    removeListener(listener: IDataChannelListener);
    close();
}
