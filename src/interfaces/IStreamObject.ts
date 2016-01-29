///<reference path="IDestroyable.ts" />
///<reference path="IUpdate.ts" />

interface IStreamObject extends IDestroyable {
    onUpdate(update: IUpdate);
}
