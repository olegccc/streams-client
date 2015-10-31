///<reference path="../interfaces/ICommunicationService.ts" />
///<reference path="../interfaces/IConfiguration.ts" />
///<reference path="../interfaces/Constants.ts" />
///<reference path="../interfaces/IRequest.ts" />
///<reference path="../interfaces/IResponse.ts" />
///<reference path="../modules/StreamsClientModule.ts" />

class CommunicationService implements ICommunicationService {

    private httpService: ng.IHttpService;
    private qService: ng.IQService;
    private configuration: IConfiguration;

    constructor(httpService: ng.IHttpService, qService: ng.IQService, configuration: IConfiguration) {
        this.httpService = httpService;
        this.qService = qService;
        this.configuration = configuration;
    }

    private sendRequest(request: IRequest): angular.IHttpPromise<IResponse> {
        return this.httpService.post('/' + this.configuration.ConnectionPath, request);
    }

    getIds(nodeId: string, filter:any, options:IQueryOptions):angular.IPromise<string[]> {
        var request: IRequest = <any>{};
        request.command = Constants.COMMAND_IDS;
        request.nodeId = nodeId;
        request.filter = filter;
        request.options = options;

        var promise = this.qService.defer<string[]>();

        this.sendRequest(request).success((response: IResponse) => {
            if (response.ids) {
                promise.resolve(response.ids);
            } else {
                promise.reject();
            }
        }).error((data: any) => {
            promise.reject(data);
        });

        return promise.promise;
    }

    readRecord(id:string):angular.IPromise<IRecord> {
        return undefined;
    }

    updateRecord(nodeId: string, record:IRecord, echo:boolean):angular.IPromise<IRecord> {
        var request: IRequest = <any>{};
        request.command = Constants.COMMAND_UPDATE;
        request.record = record;
        request.nodeId = nodeId;
        request.echo = echo;

        var promise = this.qService.defer<IRecord>();

        this.sendRequest(request).success((response: IResponse) => {
            if (response.record) {
                promise.resolve(response.record);
            } else {
                promise.reject();
            }
        }).error((data: any) => {
            promise.reject(data);
        });

        return promise.promise;
    }

    createRecord(nodeId: string, record:IRecord):angular.IPromise<IRecord> {
        var request: IRequest = <any>{};
        request.command = Constants.COMMAND_CREATE;
        request.record = record;
        request.nodeId = nodeId;

        var promise = this.qService.defer<IRecord>();

        this.sendRequest(request).success((response: IResponse) => {
            if (response.record) {
                promise.resolve(response.record);
            } else {
                promise.reject();
            }
        }).error((data: any) => {
            promise.reject(data);
        });

        return promise.promise;
    }

    deleteRecord(nodeId: string, id:string):angular.IPromise<void> {
        var request: IRequest = <any>{};
        request.command = Constants.COMMAND_DELETE;
        request.id = id;
        request.nodeId = nodeId;

        var promise = this.qService.defer<void>();

        this.sendRequest(request).success(() => {
            promise.resolve();
        }).error((data: any) => {
            promise.reject(data);
        });

        return promise.promise;
    }

    getVersion():angular.IPromise<string> {
        var request: IRequest = <any>{};
        request.command = Constants.COMMAND_VERSION;

        var promise = this.qService.defer<string>();

        this.sendRequest(request).success((response: IResponse) => {
            promise.resolve(response.version);
        }).error((data: any) => {
            promise.reject(data);
        });

        return promise.promise;
    }

    getChanges(version:string):angular.IPromise<IUpdate[]> {
        var request: IRequest = <any>{};
        request.command = Constants.COMMAND_CHANGES;
        request.version = version;

        var promise = this.qService.defer<IUpdate[]>();

        this.sendRequest(request).success((response: IResponse) => {
            promise.resolve(response.changes);
        }).error((data: any) => {
            promise.reject(data);
        });

        return promise.promise;
    }
}

streamsClientModule.service('streamsCommunication', ['$http', '$q', Constants.CONFIGURATION, CommunicationService]);
