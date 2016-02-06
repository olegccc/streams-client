///<reference path="../interfaces/ICommunicationService.ts" />
///<reference path="../interfaces/IDataStructuresService.ts" />
///<reference path="../interfaces/Constants.ts" />
///<reference path="../interfaces/IDataChannelStorage.ts" />
///<reference path="../structure/SynchronizedObject.ts" />
///<reference path="../structure/SynchronizedTree.ts" />
///<reference path="../structure/SynchronizedArray.ts" />

class DataStructuresService implements IDataStructuresService {

    private dataChannelStorage: IDataChannelStorage;

    constructor(communicationService: ICommunicationService) {
        this.dataChannelStorage = new DataChannelStorage(communicationService);
    }

    checkForUpdates() : Promise<void> {
        return this.dataChannelStorage.checkForUpdates();
    }

    getObject(streamId: string, nodeId: string) : Promise<ISynchronizedObject> {
        return this.dataChannelStorage.get(streamId, nodeId).then((dataChannel: IDataChannel) => {
            var synchronizedObject = new SynchronizedObject(dataChannel);
            return synchronizedObject.initialize().then(() => {
                return synchronizedObject;
            });
        });
    }

    getTree(streamId: string, nodeId: string) : Promise<ISynchronizedTree> {
        return this.dataChannelStorage.get(streamId, nodeId).then((dataChannel: IDataChannel) => {
            var synchronizedTree = new SynchronizedTree(dataChannel);
            return synchronizedTree.initialize().then(() => {
                return synchronizedTree;
            });
        });
    }

    getArray(streamId: string, nodeId: string) : Promise<ISynchronizedArray> {
        return this.dataChannelStorage.get(streamId, nodeId).then((dataChannel: IDataChannel) => {
            var synchronizedArray = new SynchronizedArray(dataChannel);
            return synchronizedArray.initialize().then(() => {
                return synchronizedArray;
            });
        });
    }
}
