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

    private sendRequests(requests: IRequest[]): Promise<IResponse[]> {

        return <Promise<IResponse[]>> this.httpService.post('/' + this.configuration.ConnectionPath, requests);
    }

    getIds(streamId: string, nodeId: string, filter:any, options:IQueryOptions) : Promise<string[]> {

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

    readRecord(streamId: string, nodeId: string, id:string) : Promise<IRecord> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_READ,
            id: id,
            nodeId: nodeId,
            streamId: streamId
        }]).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {
            return response.data && response.data.length === 1 ? response.data[0].record : this.qService.reject();
        });
    }

    readRecords(streamId: string, nodeId: string, ids: string[]) : Promise<IRecord[]> {

        var requests: IRequest[] = [];

        for (var i = 0; i < ids.length; i++) {
            requests.push(<IRequest>{
                command: Constants.COMMAND_READ,
                id: ids[i],
                nodeId: nodeId,
                streamId: streamId
            });
        }

        return this.sendRequests(requests).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {

            var records: IRecord[] = [];

            for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].record) {
                    records.push(response.data[i].record);
                }
            }

            return records;
        });
    }

    updateRecords(streamId: string, nodeId: string, records:IRecord[], echo:boolean) : Promise<IRecord[]> {
        var requests: IRequest[] = [];

        for (var i = 0; i < records.length; i++) {
            requests.push(<IRequest>{
                command: Constants.COMMAND_UPDATE,
                id: records[i].id,
                nodeId: nodeId,
                record: records[i],
                streamId: streamId,
                echo: echo
            });
        }

        return this.sendRequests(requests).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {

            var records: IRecord[] = [];

            for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].record) {
                    records.push(response.data[i].record);
                }
            }

            return records;
        });
    }

    updateRecord(streamId: string, nodeId: string, record:IRecord, echo:boolean) : Promise<IRecord> {

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

    createRecord(streamId: string, nodeId: string, record:IRecord) : Promise<IRecord> {

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

    deleteRecord(streamId: string, nodeId: string, id:string) : Promise<void> {

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

    getVersion(streamId: string, nodeId: string) : Promise<string> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_VERSION,
            streamId: streamId,
            nodeId: nodeId
        }]).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {
            return response.data && response.data.length === 1 ? response.data[0].version : this.qService.reject();
        });
    }

    getOneStreamChanges(streamId: string, nodeId: string, version:string) : Promise<IUpdate[]> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_CHANGES,
            version: version,
            streamId: streamId,
            nodeId: nodeId
        }]).then((response: IHttpPromiseCallbackArg<IResponse[]>) => {
            return response.data && response.data.length === 1 ? response.data[0].changes : this.qService.reject();
        });
    }

    getManyStreamsChanges(streamsAndVersions: IVersionRequest[]) : Promise<IUpdates[]> {

        var requests: IRequest[] = [];

        for (var i = 0; i < streamsAndVersions.length; i++) {
            requests.push(<IRequest>{
                command: Constants.COMMAND_CHANGES,
                version: streamsAndVersions[i].version,
                streamId: streamsAndVersions[i].streamId,
                nodeId: streamsAndVersions[i].nodeId
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
                    updates: response.data[i].changes,
                    nodeId: response.data[i].nodeId
                });
            }

            return responses;
        });
    }
}

streamsClientModule.service('streamsCommunication', ['$http', '$q', Constants.CONFIGURATION, CommunicationService]);
