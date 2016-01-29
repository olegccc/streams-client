///<reference path="../interfaces/ICommunicationService.ts" />
///<reference path="../interfaces/IConfiguration.ts" />
///<reference path="../interfaces/Constants.ts" />
///<reference path="../interfaces/IRequest.ts" />
///<reference path="../interfaces/IResponse.ts" />
///<reference path="../modules/StreamsClientModule.ts" />

import IHttpPromise = angular.IHttpPromise;
import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;

class CommunicationService implements ICommunicationService {

    private httpService: ng.IHttpService;
    private qService: ng.IQService;
    private configuration: IConfiguration;

    constructor(httpService: ng.IHttpService, qService: ng.IQService, configuration: IConfiguration) {

        this.httpService = httpService;
        this.qService = qService;
        this.configuration = configuration;
    }

    private sendRequests(requests: IRequest[]): angular.IHttpPromise<IResponse[]> {

        return this.httpService.post('/' + this.configuration.ConnectionPath, requests);
    }

    getIds(streamId: string, nodeId: string, filter:any, options:IQueryOptions):angular.IPromise<string[]> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_IDS,
            nodeId: nodeId,
            filter: filter,
            options: options,
            streamId: streamId
        }]).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {
            return response.data && response.data.length === 1 && response.data[0].ids ?
                response.data[0].ids : this.qService.reject();
        });
    }

    readRecord(streamId: string, nodeId: string, id:string):angular.IPromise<IRecord> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_READ,
            id: id,
            nodeId: nodeId,
            streamId: streamId
        }]).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {
            return response.data && response.data.length === 1 ? response.data[0].record : this.qService.reject();
        });
    }

    updateRecord(streamId: string, nodeId: string, record:IRecord, echo:boolean):angular.IPromise<IRecord> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_UPDATE,
            record: record,
            nodeId: nodeId,
            echo: echo,
            streamId: streamId
        }]).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {
            return response.data && response.data.length === 1 && response.data[0].record ?
                response.data[0].record : this.qService.reject();
        });
    }

    createRecord(streamId: string, nodeId: string, record:IRecord) : angular.IPromise<IRecord> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_CREATE,
            record: record,
            nodeId: nodeId,
            streamId: streamId
        }]).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {
            return response.data && response.data.length === 1 || response.data[0].record ?
                response.data[0].record : this.qService.reject();
        });
    }

    deleteRecord(streamId: string, nodeId: string, id:string) : angular.IPromise<void> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_DELETE,
            id: id,
            nodeId: nodeId,
            streamId: streamId
        }]).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {
            if (!response.data || response.data.length !== 1) {
                return this.qService.reject();
            }
        });
    }

    getVersion(streamId: string) : angular.IPromise<string> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_VERSION,
            streamId: streamId
        }]).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {
            return response.data && response.data.length === 1 ? response.data[0].version : this.qService.reject();
        });
    }

    getOneStreamChanges(streamId: string, version:string) : angular.IPromise<IUpdate[]> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_CHANGES,
            version: version,
            streamId: streamId
        }]).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {
            return response.data && response.data.length === 1 ? response.data[0].changes : this.qService.reject();
        });
    }

    getManyStreamsChanges(streamsAndVersions:{}) : angular.IPromise<IUpdates[]> {

        var requests: IRequest[] = [];
        var keys = Object.keys(streamsAndVersions);

        for (var i = 0; i < keys.length; i++) {
            requests.push(<IRequest>{
                command: Constants.COMMAND_CHANGES,
                version: streamsAndVersions[keys[i]],
                streamId: keys[i]
            });
        }

        return this.sendRequests(requests).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {

            if (!response.data) {
                return this.qService.reject();
            }

            var responses: IUpdates[] = [];

            for (var i = 0; i < response.data.length; i++) {
                responses.push(<IUpdates>{
                    streamId: response.data[i].streamId,
                    updates: response.data[i].changes
                });
            }

            return responses;
        });
    }
}

streamsClientModule.service('streamsCommunication', ['$http', '$q', Constants.CONFIGURATION, CommunicationService]);
