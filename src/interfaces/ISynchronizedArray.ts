///<reference path="IDestroyable.ts" />
///<reference path="ISynchronizedValue.ts" />

interface ISynchronizedArray extends IDestroyable {
    push(item: ISynchronizedValue) : Promise<void>;
    get(index: number): ISynchronizedValue;
    set(index: number, value: ISynchronizedValue) : Promise<void>;
    count(): number;
    remove(index: number) : Promise<void>;
    getReadOnlyArray(): ISynchronizedValue[];
}
