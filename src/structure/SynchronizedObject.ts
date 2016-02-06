///<reference path="../interfaces/ISynchronizedObject.ts" />
///<reference path="../interfaces/IStreamObject.ts" />
///<reference path="../interfaces/IUpdate.ts" />

class SynchronizedObject implements ISynchronizedObject, IDataChannelListener {

    private dataChannel: IDataChannel;
    private innerObject: any;

    constructor(dataChannel: IDataChannel) {
        this.dataChannel = dataChannel;
        this.dataChannel.addListener(this);
        this.innerObject = {};
    }

    initialize(): Promise<void> {
        return this.dataChannel.getIds().then((ids: string[]) => {
            if (!ids.length) {
                return;
            }

            return this.dataChannel.readMany(ids).then((records: IRecord[]) => {
                for (var i = 0; i < records.length; i++) {
                    this.innerObject[records[i].id] = records[i]["value"];
                }
            });
        });
    }

    onChange(type:number, id:string) : Promise<void> {
        switch (type) {
            case Constants.UPDATE_CHANGED:
            case Constants.UPDATE_CREATED:
                return this.dataChannel.read(id).then((record: IRecord) => {
                    this.innerObject[record.id] = record["value"];
                });
            case Constants.UPDATE_DELETED:
                delete this.innerObject[id];
                break;
        }
        return new Promise<void>((resolve) => { resolve(); });
    }

    getKeys() : string[] {
        return Object.keys(this.innerObject);
    }

    get(key:string) : any {
        return this.innerObject[key];
    }

    set(key: string, value: any) : Promise<void> {
        var exists = this.innerObject[key];
        this.innerObject[key] = value;
        var record: IRecord = <any>{
            id: key,
            value: value
        };
        if (exists) {
            return this.dataChannel.update(record, false).then(() => {});
        } else {
            return this.dataChannel.create(record, false).then(() => {});
        }
    }

    remove(key: string): Promise<void> {
        delete this.innerObject[key];
        return this.dataChannel.remove(key);
    }

    getReadOnlyObject() : Promise<any> {
        return this.innerObject;
    }

    destroy() {
        this.dataChannel.removeListener(this);
        this.dataChannel.close();
    }
}
