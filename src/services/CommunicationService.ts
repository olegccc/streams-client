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

    create() {
    }
}

streamsClientModule.service('streamsCommunication', ['$http', '$q', Constants.CONFIGURATION, CommunicationService]);
