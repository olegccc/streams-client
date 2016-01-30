///<reference path="../interfaces/ISynchronizedObject.ts" />
///<reference path="../interfaces/IStreamObject.ts" />
///<reference path="../interfaces/IDataStructuresHolder.ts" />
///<reference path="../interfaces/IUpdate.ts" />

class SynchronizedObject implements ISynchronizedObject, IStreamObject {
    private service: IDataStructuresHolder;
    private streamId: string;

    constructor(service: IDataStructuresHolder, streamId: string) {
        this.service = service;
        this.streamId = streamId;
    }

    getKeys() : Promise<string[]> {
        return undefined;
    }

    onUpdate(update: IUpdate) {
    }

    get(key:string) : Promise<any> {
        return undefined;
    }

    set(key: string, value: any) : Promise<void> {
        return undefined;
    }

    remove(key: string): Promise<void> {
        return undefined;
    }

    getReadOnlyObject() : Promise<any> {
        return undefined;
    }

    destroy() {
        this.service.streamClosed(this.streamId);
    }
}
