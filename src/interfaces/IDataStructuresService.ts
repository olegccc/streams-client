///<reference path="ISynchronizedObject.ts" />
///<reference path="ISynchronizedTree.ts" />
///<reference path="ISynchronizedArray.ts" />

interface IDataStructuresService {
    getObject(streamId: string, nodeId: string): Promise<ISynchronizedObject>;
    getTree(streamId: string, nodeId: string): Promise<ISynchronizedTree>;
    getArray(streamId: string, nodeId: string): Promise<ISynchronizedArray>;
    checkForUpdates(): Promise<void>;
}
