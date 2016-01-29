///<reference path="IStreamObject.ts" />
///<reference path="ISynchronizedValue.ts" />

interface ISynchronizedArray extends IStreamObject {
    push(item: ISynchronizedValue);
    get(index: number): ISynchronizedValue;
    set(index: number, value: ISynchronizedValue);
    remove(index: number);
    getReadOnlyArray(): ISynchronizedValue[];
}
