///<reference path="../interfaces/ISynchronizedArray.ts" />
///<reference path="../interfaces/IStreamObject.ts" />
///<reference path="../interfaces/IDataStructuresHolder.ts" />
///<reference path="../interfaces/IUpdate.ts" />
///<reference path="../interfaces/ISynchronizedValue.ts" />

class SynchronizedArray implements ISynchronizedArray, IStreamObject {

    private service: IDataStructuresHolder;
    private streamId: string;

    constructor(service: IDataStructuresHolder, streamId: string) {
        this.service = service;
        this.streamId = streamId;
    }

    onUpdate(update: IUpdate) {
    }

    push(item: ISynchronizedValue) {
    }

    get(index: number) : ISynchronizedValue {
        return undefined;
    }

    set(index: number, value: ISynchronizedValue) {
    }

    getReadOnlyArray() : ISynchronizedValue[] {
        return undefined;
    }

    destroy() {
        this.service.streamClosed(this.streamId);
    }

    remove(index: number) {
    }
}
