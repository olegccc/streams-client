///<reference path="../interfaces/ICommunicationService.ts" />
///<reference path="../interfaces/IDataStructuresService.ts" />
///<reference path="../interfaces/IConfiguration.ts" />
///<reference path="../interfaces/Constants.ts" />
///<reference path="../interfaces/IRequest.ts" />
///<reference path="../interfaces/IResponse.ts" />
///<reference path="../modules/StreamsClientModule.ts" />
///<reference path="../interfaces/IDataStructuresHolder.ts" />

class DataStructuresService implements IDataStructuresService, IDataStructuresHolder {

    private qService: ng.IQService;
    private communicationService: ICommunicationService;

    constructor(qService: ng.IQService, communicationService: ICommunicationService) {
        this.qService = qService;
        this.communicationService = communicationService;
    }

    getObject(id: string) : ISynchronizedObject {
        return undefined;
    }

    getTree(id: string) : ISynchronizedTree {
        return undefined;
    }

    getArray(id: string, filter?: any) : ISynchronizedArray {
        return undefined;
    }

    streamClosed(streamId: string) {

    }
}

streamsClientModule.service('streamsDataStructures', ['$q', 'streamsCommunication', DataStructuresService]);
