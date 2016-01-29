///<reference path="IStreamObject.ts" />

interface ISynchronizedObject extends IStreamObject {
    get(key: string): any;
    set(key: string, value: any);
    remove(key: string);
    getReadOnlyObject(): any;
}
