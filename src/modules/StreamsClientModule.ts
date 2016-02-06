///<reference path="../interfaces/Constants.ts" />
///<reference path="../services/CommunicationService.ts" />
///<reference path="../services/DataStructuresService.ts" />

var StreamsClient = function(configuration: IConfiguration) {

    var communicationService = new CommunicationService(configuration);

    return {
        structures: new DataStructuresService(communicationService),
        communication: communicationService
    }
};
