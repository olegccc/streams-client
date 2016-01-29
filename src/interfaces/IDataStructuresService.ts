///<reference path="ISynchronizedObject.ts" />
///<reference path="ISynchronizedTree.ts" />
///<reference path="ISynchronizedArray.ts" />

interface IDataStructuresService {
    getObject(id: string): ISynchronizedObject;
    getTree(id: string): ISynchronizedTree;
    getArray(id: string, filter?: any): ISynchronizedArray;
}
