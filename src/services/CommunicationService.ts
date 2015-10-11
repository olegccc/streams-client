///<reference path="../interfaces/ICommunicationService.ts" />
///<reference path="../interfaces/IConfiguration.ts" />
///<reference path="../interfaces/Constants.ts" />
///<reference path="../interfaces/IRequest.ts" />
///<reference path="../interfaces/IResponse.ts" />

class CommunicationService implements ICommunicationService {

    private httpService: ng.IHttpService;
    private qService: ng.IQService;
    private configuration: IConfiguration;

    constructor(httpService: ng.IHttpService, qService: ng.IQService, configuration: IConfiguration) {
        this.httpService = httpService;
        this.qService = qService;
        this.configuration = configuration;
    }

    getIds(filter?:any, options?:IQueryOptions):angular.IPromise<string[]> {
        var request: IRequest = <any>{};
        request.command = Constants.COMMAND_IDS;
        request.filter = filter;
        request.options = options;

        var promise = this.qService.defer<string[]>();

        this.httpService.post('/' + this.configuration.ConnectionPath, request).success((response: IResponse) => {
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
}

streamsClientModule.service('streamsCommunication', ['$http', '$q', Constants.CONFIGURATION, CommunicationService]);
