///<reference path="../interfaces/ICommunicationService.ts" />
///<reference path="../interfaces/IConfiguration.ts" />
///<reference path="../interfaces/Constants.ts" />
///<reference path="../interfaces/IRequest.ts" />
///<reference path="../interfaces/IResponse.ts" />
///<reference path="../modules/StreamsClientModule.ts" />

class CommunicationService implements ICommunicationService {

    private configuration: IConfiguration;

    constructor(configuration: IConfiguration) {

        this.configuration = configuration;
    }

    protected sendRequests(requests: IRequest[]): Promise<IResponse[]> {

        return new Promise<IResponse[]>((resolve, reject) => {

            var xhr = new XMLHttpRequest();

            xhr.open("POST", '/' + this.configuration.ConnectionPath);
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.onreadystatechange = () => {

                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                if (xhr.status !== 200) {
                    reject(xhr.statusText);
                }
                resolve(JSON.parse(xhr.responseText));
            };

            xhr.send(JSON.stringify(requests));
        });
    }

    private static getReject<T>() {
        return new Promise<T>((resolve, reject) => {
            reject();
        });
    }

    getIds(streamId: string, nodeId: string, filter:any, options:IQueryOptions) : Promise<string[]> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_IDS,
            nodeId: nodeId,
            filter: filter,
            options: options,
            streamId: streamId
        }]).then((response: IResponse[]) => {
            return response && response.length === 1 && response[0].ids ?
                response[0].ids : CommunicationService.getReject();
        });
    }

    readRecord(streamId: string, nodeId: string, id:string) : Promise<IRecord> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_READ,
            id: id,
            nodeId: nodeId,
            streamId: streamId
        }]).then((response: IResponse[]) => {
            return response && response.length === 1 ? response[0].record : CommunicationService.getReject();
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

        return this.sendRequests(requests).then((response: IResponse[]) => {

            var records: IRecord[] = [];

            for (var i = 0; i < response.length; i++) {
                if (response[i].record) {
                    records.push(response[i].record);
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

        return this.sendRequests(requests).then((response: IResponse[]) => {

            var records: IRecord[] = [];

            for (var i = 0; i < response.length; i++) {
                if (response[i].record) {
                    records.push(response[i].record);
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
        }]).then((response: IResponse[]) => {
            return response && response.length === 1 && response[0].record ?
                response[0].record : CommunicationService.getReject();
        });
    }

    createRecord(streamId: string, nodeId: string, record:IRecord) : Promise<IRecord> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_CREATE,
            record: record,
            nodeId: nodeId,
            streamId: streamId
        }]).then((response: IResponse[]) => {
            return response && response.length === 1 || response[0].record ?
                response[0].record : CommunicationService.getReject();
        });
    }

    deleteRecord(streamId: string, nodeId: string, id:string) : Promise<void> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_DELETE,
            id: id,
            nodeId: nodeId,
            streamId: streamId
        }]).then((response: IResponse[]) => {
            if (!response || response.length !== 1) {
                return CommunicationService.getReject<void>();
            }
        });
    }

    getVersion(streamId: string, nodeId: string) : Promise<string> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_VERSION,
            streamId: streamId,
            nodeId: nodeId
        }]).then((response: IResponse[]) => {
            return response && response.length === 1 ? response[0].version : CommunicationService.getReject();
        });
    }

    getOneStreamChanges(streamId: string, nodeId: string, version:string) : Promise<IUpdate[]> {

        return this.sendRequests([<IRequest>{
            command: Constants.COMMAND_CHANGES,
            version: version,
            streamId: streamId,
            nodeId: nodeId
        }]).then((response: IResponse[]) => {
            return response && response.length === 1 ? response[0].changes : CommunicationService.getReject();
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

        return this.sendRequests(requests).then((response: IResponse[]) => {

            if (!response) {
                return CommunicationService.getReject();
            }

            var responses: IUpdates[] = [];

            for (var i = 0; i < response.length; i++) {
                responses.push(<IUpdates>{
                    streamId: response[i].streamId,
                    updates: response[i].changes,
                    nodeId: response[i].nodeId
                });
            }

            return responses;
        });
    }
}
