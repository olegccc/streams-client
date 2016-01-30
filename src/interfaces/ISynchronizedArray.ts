///<reference path="IDestroyable.ts" />
///<reference path="ISynchronizedValue.ts" />

interface ISynchronizedArray extends IDestroyable {
    push(item: ISynchronizedValue);
    get(index: number): ISynchronizedValue;
    set(index: number, value: ISynchronizedValue);
    remove(index: number);
    getReadOnlyArray(): ISynchronizedValue[];
}
