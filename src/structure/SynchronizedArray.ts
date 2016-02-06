///<reference path="../interfaces/ISynchronizedArray.ts" />
///<reference path="../interfaces/ISynchronizedValue.ts" />
///<reference path="../interfaces/IDataChannelListener.ts" />

class SynchronizedArray implements ISynchronizedArray, IDataChannelListener {

    private dataChannel: IDataChannel;
    private records: IRecord[];
    private indexKey: string;

    constructor(dataChannel: IDataChannel) {
        this.dataChannel = dataChannel;
        this.dataChannel.addListener(this);
        this.records = [];
        this.indexKey = "__index";
    }

    private getIndex(record: IRecord): number {
        return record[this.indexKey];
    }

    private setIndex(record: IRecord, index: number) {
        record[this.indexKey] = index;
    }

    initialize(): Promise<void> {
        return this.dataChannel.getIds().then((ids: string[]) => {
            return this.dataChannel.readMany(ids).then((records: IRecord[]) => {
                for (var i = 0; i < records.length; i++) {
                    var record = records[i];
                    var recordIndex = this.getIndex(record);
                    this.records[recordIndex] = record;
                }
            });
        });
    }

    count():number {
        return this.records.length;
    }

    private createIndex(record) : Promise<void> {
        var index = this.records.length;
        this.setIndex(record, index);
        this.records[this.records.length] = record;
        return this.dataChannel.update(record, false).then(() => {});
    }

    onChange(type:number, id:string) : Promise<void> {
        switch (type) {
            case Constants.UPDATE_CHANGED:
                return this.dataChannel.read(id).then((record: IRecord) => {
                    var index = this.getIndex(record);
                    if (!index) {
                        return this.createIndex(record);
                    }
                    this.records[index] = record;
                    for (var i = 0; i < this.records.length; i++) {
                        if (i !== index && this.records[i] && this.records[i].id === id) {
                            this.records[i] = undefined;
                        }
                    }
                });
            case Constants.UPDATE_CREATED:
                return this.dataChannel.read(id).then((record: IRecord) => {
                    var index = this.getIndex(record);
                    if (!index) {
                        return this.createIndex(record);
                    }
                    this.records[index] = record;
                });
            case Constants.UPDATE_DELETED:
                for (var i = 0; i < this.records.length; i++) {
                    if (this.records[i] && this.records[i].id === id) {
                        this.records.splice(i, 1);
                        break;
                    }
                }

                return new Promise<void>((resolve) => {
                    resolve();
                });
        }
    }

    push(item: ISynchronizedValue) : Promise<void> {
        this.setIndex(item, this.records.length);
        this.records[this.records.length] = item;
        return this.dataChannel.create(item, false).then((record: IRecord) => {
            item.id = record.id;
        });
    }

    get(index: number) : ISynchronizedValue {
        return this.records[index];
    }

    set(index: number, value: ISynchronizedValue): Promise<void> {

        var oldRecord = this.records[index];

        if (!oldRecord) {
            this.setIndex(value, index);

            if (value.id) {
                return this.dataChannel.update(value, false).then(() => {
                    this.records[index] = value;
                });
            } else {
                return this.dataChannel.create(value, true).then((value: IRecord) => {
                    this.records[index] = value;
                });
            }
        }

        if (oldRecord.id !== value.id) {
            return this.dataChannel.remove(oldRecord.id).then(() => {
                this.setIndex(value, index);
                return this.dataChannel.create(value, true).then((value: IRecord) => {
                    this.records[index] = value;
                });
            });
        }

        this.setIndex(value, index);

        return this.dataChannel.update(value, false).then(() => {
            this.records[index] = value;
        });
    }

    getReadOnlyArray() : ISynchronizedValue[] {
        return this.records;
    }

    destroy() {
        this.dataChannel.removeListener(this);
        this.dataChannel.close();
    }

    remove(index: number): Promise<void> {

        var record = this.records[index];
        this.records.splice(index, 1);
        return this.dataChannel.remove(record.id).then(() => {
            var updates = [];
            for (var i = index; i < this.records.length; i++) {
                updates.push(this.records[i]);
                this.setIndex(this.records[i], i);
            }
            return this.dataChannel.updateMany(updates, false).then(() => {});
        });
    }
}
