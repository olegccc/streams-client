///<reference path="IDestroyable.ts" />

interface ISynchronizedObject extends IDestroyable {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    getKeys(): Promise<string[]>;
    remove(key: string): Promise<void>;
    getReadOnlyObject(): Promise<any>;
}
