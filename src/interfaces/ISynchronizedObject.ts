///<reference path="IDestroyable.ts" />

interface ISynchronizedObject extends IDestroyable {
    get(key: string): any;
    set(key: string, value: any): Promise<void>;
    getKeys(): string[];
    remove(key: string): Promise<void>;
    getReadOnlyObject(): Promise<any>;
}
