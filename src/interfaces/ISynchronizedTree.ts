///<reference path="IDestroyable.ts" />
///<reference path="ISynchronizedValue.ts" />

interface ISynchronizedTree extends IDestroyable {
    getRoot(): ISynchronizedValue;
    getChildren(parentId: any): ISynchronizedValue[];
    getChildIds(parentId: any): any[];
    getParentId(itemId: any): any;
    remove(itemId: any) : Promise<void>;
    add(parentId: any, item: ISynchronizedValue);
    get(id: any): ISynchronizedValue;
    update(item: ISynchronizedValue);
}
