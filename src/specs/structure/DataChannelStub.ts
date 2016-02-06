interface IDataChannelStubState {
    idsResponse: string[];
    readRequestedId: string;
    readResponse: IRecord;
    updateRequestedRecord: IRecord;
    deleteRecordId: string[];
    createRequestedRecord: IRecord;
    createResponse: IRecord;
    updateResponse: IRecord;
    readManyRequestedIds: string[];
    readManyResponse: IRecord[];
    currentListener: IDataChannelListener;
    addListenerCount: number;
    removeListenerCount: number;
    closeCount: number;
    updateManyRequestedRecords: IRecord[];
    updateManyResponse: IRecord[];
}

function createDataChannelStub(state): IDataChannel {

    state.addListenerCount = 0;
    state.removeListenerCount = 0;
    state.closeCount = 0;
    state.deleteRecordId = [];

    return {

        getIds: (filter?: any, options?: IQueryOptions) : Promise<string[]> => {
            return new Promise<string[]>((resolve) => {
                resolve(state.idsResponse);
            });
        },

        read: (id: string) : Promise<IRecord> => {
            state.readRequestedId = id;
            return new Promise<IRecord> ((resolve) => {
                resolve(state.readResponse);
            });
        },

        update: (record: IRecord, echo: boolean) : Promise<IRecord> => {
            state.updateRequestedRecord = record;
            return new Promise<IRecord>((resolve) => {
                resolve(state.updateResponse || record);
            });
        },

        updateMany: (records: IRecord[], echo: boolean) : Promise<IRecord[]> => {
            state.updateManyRequestedRecords = records;
            return new Promise<IRecord[]>((resolve) => {
                resolve(state.updateManyResponse);
            });
        },


        remove: (id: string) : Promise<void> => {
            state.deleteRecordId.push(id);
            return new Promise<void>((resolve) => {
                resolve();
            });
        },

        create: (record: IRecord, echo: boolean) : Promise<IRecord> => {
            state.createRequestedRecord = record;
            return new Promise<IRecord>((resolve) => {
                resolve(state.createResponse || record);
            });
        },

        readMany: (ids: string[]) : Promise<IRecord[]> => {

            state.readManyRequestedIds = ids;

            return new Promise<IRecord[]> ((resolve) => {
                resolve(state.readManyResponse);
            });
        },

        addListener: (listener: IDataChannelListener) => {
            state.currentListener = listener;
            state.addListenerCount++;
        },

        removeListener: (listener: IDataChannelListener) => {
            if (state.currentListener === listener) {
                state.currentListener = null;
            }
            state.removeListenerCount++;
        },

        close: () => {
            state.closeCount++;
        }
    };
}
