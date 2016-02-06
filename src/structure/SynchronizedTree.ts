///<reference path="../interfaces/ISynchronizedTree.ts" />
///<reference path="../interfaces/IDataChannelListener.ts" />
///<reference path="../interfaces/IDataChannel.ts" />
///<reference path="../interfaces/INode.ts" />

class SynchronizedTree implements ISynchronizedTree, IDataChannelListener {

    private dataChannel: IDataChannel;
    private tree: INode;
    private recordMap: { [key: string] : INode };

    constructor(dataChannel: IDataChannel) {
        this.dataChannel = dataChannel;
        this.tree = null;
        this.recordMap = {};
        this.dataChannel.addListener(this);
    }

    initialize(): Promise<void> {
        return this.dataChannel.getIds().then((ids: string[]) => {
            return this.dataChannel.readMany(ids).then((records: INode[]) => {
                //console.log('read records: ', JSON.stringify(records, null, " "));
                this.buildTree(records);
            });
        });
    }

    private static getChildren(record: INode): INode[] {
        return record["__children"];
    }

    private static setChildren(record: INode, children: INode[]) {
        record["__children"] = children;
    }

    private static getParent(record: INode) : INode {
        return record["__parent"];
    }

    private static setParent(record: INode, parent: INode) {
        record["__parent"] = parent;
    }

    private static removeServiceFields(record: INode) : INode {
        var ret: INode = <any>{};
        var keys = Object.keys(record);
        var key;
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            if (key === "__parent") {
                continue;
            }
            if (key === "__children") {
                continue;
            }
            if (record.hasOwnProperty(key)) {
                ret[key] = record[key];
            }
        }
        return ret;
    }

    private buildTree(records: INode[]) {

        var treeMap: { [key: string]: INode[] } = {};

        this.tree = null;
        this.recordMap = {};

        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            if (!record.parentId) {
                if (!this.tree) {
                    this.tree = record;
                }
            } else {
                if (!treeMap.hasOwnProperty(record.parentId)) {
                    treeMap[record.parentId] = [];
                }
                treeMap[record.parentId].push(record);
            }
        }

        //console.log('treemap: ', JSON.stringify(treeMap, null, " "));

        if (this.tree) {
            this.fillChildren(this.tree, treeMap);
        }
    }

    onRecordRemoved(record: INode) {
        var children = SynchronizedTree.getChildren(record);
        if (children) {
            for (var i = 0; i < children.length; i++) {
                this.onRecordRemoved(children[i]);
            }
        }

        delete this.recordMap[record.id];
    }

    onChange(type:number, id:string):Promise<void> {
        switch (type) {
            case Constants.UPDATE_CHANGED:
                return this.dataChannel.read(id).then((record: INode) => {
                    this.updateRecord(record);
                });
                break;
            case Constants.UPDATE_DELETED:
                var currentRecord = this.recordMap[id];
                this.removeRecord(currentRecord);
                return new Promise<void>((resolve) => resolve());
            case Constants.UPDATE_CREATED:
                return this.dataChannel.read(id).then((record: INode) => {
                    this.addRecord(record);
                });
                break;
        }
    }

    getRoot() : ISynchronizedValue {
        return this.tree;
    }

    getChildren(parentId:any) : ISynchronizedValue[] {

        var ret: ISynchronizedValue[] = [];

        var node = this.recordMap[parentId];
        if (node) {
            var children = SynchronizedTree.getChildren(node);
            for (var i = 0; i < children.length; i++) {
                ret.push(children[i]);
            }
        }

        return ret;
    }

    getChildIds(parentId:any) : any[] {

        var ret: any[] = [];

        var node = this.recordMap[parentId];
        if (node) {
            var children = SynchronizedTree.getChildren(node);
            for (var i = 0; i < children.length; i++) {
                ret.push(children[i].id);
            }
        }

        return ret;
    }

    getParentId(itemId:any):any {

        var record = this.recordMap[itemId];
        if (!record) {
            return null;
        }

        return record.parentId;
    }

    private removeRecord(record: INode) {
        this.onRecordRemoved(record);
        var parent = SynchronizedTree.getParent(record);
        if (parent) {
            var children = SynchronizedTree.getChildren(parent);
            for (var i = 0; i < children.length; i++) {
                if (children[i].id === record.id) {
                    children.splice(i, 1);
                    break;
                }
            }
        } else if (this.tree === record) {
            this.tree = null;
        }
    }

    private addRecord(record: INode) {
        SynchronizedTree.setChildren(record, []);
        if (!record.parentId) {
            this.tree = record;
            this.recordMap[record.id] = record;
        } else {
            var parent = this.recordMap[record.parentId];
            SynchronizedTree.setParent(record, parent);
            if (parent) {
                SynchronizedTree.getChildren(parent).push(record);
                this.recordMap[record.id] = record;
            }
        }
    }

    private fillChildren(node: INode, treeMap: { [key: string]: INode[] }) {
        var children : INode[] = treeMap[node.id] || [];
        SynchronizedTree.setChildren(node, children);
        this.recordMap[node.id] = node;
        for (var i = 0; i < children.length; i++) {
            SynchronizedTree.setParent(children[i], node);
            this.fillChildren(children[i], treeMap);
        }
    }

    private fillChildrenToRemove(record: INode, ids: string[]) {
        var children = SynchronizedTree.getChildren(record);
        for (var i = 0; i < children.length; i++) {
            this.fillChildrenToRemove(children[i], ids);
            ids.push(children[i].id);
        }
    }

    remove(itemId:any): Promise<void> {
        var ids = [];
        var record = this.recordMap[itemId];
        this.fillChildrenToRemove(record, ids);
        this.removeRecord(record);

        var promises = [];

        for (var i = 0; i < ids.length; i++) {
            promises.push(this.dataChannel.remove(ids[i]));
        }

        promises.push(this.dataChannel.remove(itemId));

        return Promise.all(promises).then(() => {});
    }

    add(parentId:any, item:ISynchronizedValue) {
        var record = <INode> item;
        record.parentId = parentId;
        return this.dataChannel.create(record, true).then((record: INode) => {
            this.addRecord(record);
        });
    }

    get(id:any):ISynchronizedValue {
        return this.recordMap[id];
    }

    private updateRecord(record: INode) {
        var currentRecord = this.recordMap[record.id];
        if (record.parentId === currentRecord.parentId) {
            this.recordMap[record.id] = record;
            SynchronizedTree.setParent(record, SynchronizedTree.getParent(currentRecord));
            SynchronizedTree.setChildren(record, SynchronizedTree.getChildren(currentRecord));
        } else {
            var children = SynchronizedTree.getChildren(currentRecord);
            SynchronizedTree.setChildren(currentRecord, []);
            this.removeRecord(currentRecord);
            this.addRecord(record);
            SynchronizedTree.setChildren(record, children);
        }
    }

    update(item:ISynchronizedValue) {
        var record = this.recordMap[item.id];
        return this.dataChannel.update(SynchronizedTree.removeServiceFields(record), false).then(() => {
            this.updateRecord(<INode>item);
        });
    }

    destroy():void {
        this.dataChannel.removeListener(this);
        this.dataChannel.close();
    }
}