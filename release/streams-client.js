(function() { function ___f$(angular) {var Constants = (function () {
    function Constants() {
    }
    Constants.COMMAND_IDS = "ids";
    Constants.COMMAND_CREATE = "create";
    Constants.COMMAND_READ = "read";
    Constants.COMMAND_UPDATE = "update";
    Constants.COMMAND_DELETE = "delete";
    Constants.COMMAND_VERSION = "version";
    Constants.COMMAND_CHANGES = "changes";
    Constants.CONFIGURATION = "streamsConfiguration";
    Constants.UPDATE_DELETED = 1;
    Constants.UPDATE_CREATED = 2;
    Constants.UPDATE_CHANGED = 3;
    return Constants;
})();
///<reference path="IQueryOptions.ts" />
///<reference path="IRecord.ts" />
///<reference path="IUpdate.ts" />
///<reference path="IQueryOptions.ts" />
///<reference path='IRecord.ts'/>
///<reference path='IUpdate.ts'/>
///<reference path="../interfaces/Constants.ts" />
var streamsClientModule = angular.module('streams-client', []);
streamsClientModule.constant(Constants.CONFIGURATION, {
    ConnectionPath: "streams"
});
///<reference path="../interfaces/ICommunicationService.ts" />
///<reference path="../interfaces/IConfiguration.ts" />
///<reference path="../interfaces/Constants.ts" />
///<reference path="../interfaces/IRequest.ts" />
///<reference path="../interfaces/IResponse.ts" />
///<reference path="../modules/StreamsClientModule.ts" />
var CommunicationService = (function () {
    function CommunicationService(httpService, qService, configuration) {
        this.httpService = httpService;
        this.qService = qService;
        this.configuration = configuration;
    }
    CommunicationService.prototype.sendRequest = function (request) {
        return this.httpService.post('/' + this.configuration.ConnectionPath, request);
    };
    CommunicationService.prototype.getIds = function (nodeId, filter, options) {
        var request = {};
        request.command = Constants.COMMAND_IDS;
        request.nodeId = nodeId;
        request.filter = filter;
        request.options = options;
        var promise = this.qService.defer();
        this.sendRequest(request).success(function (response) {
            if (response.ids) {
                promise.resolve(response.ids);
            }
            else {
                promise.reject();
            }
        }).error(function (data) {
            promise.reject(data);
        });
        return promise.promise;
    };
    CommunicationService.prototype.readRecord = function (id) {
        return undefined;
    };
    CommunicationService.prototype.updateRecord = function (nodeId, record, echo) {
        var request = {};
        request.command = Constants.COMMAND_UPDATE;
        request.record = record;
        request.nodeId = nodeId;
        request.echo = echo;
        var promise = this.qService.defer();
        this.sendRequest(request).success(function (response) {
            if (response.record) {
                promise.resolve(response.record);
            }
            else {
                promise.reject();
            }
        }).error(function (data) {
            promise.reject(data);
        });
        return promise.promise;
    };
    CommunicationService.prototype.createRecord = function (nodeId, record) {
        var request = {};
        request.command = Constants.COMMAND_CREATE;
        request.record = record;
        request.nodeId = nodeId;
        var promise = this.qService.defer();
        this.sendRequest(request).success(function (response) {
            if (response.record) {
                promise.resolve(response.record);
            }
            else {
                promise.reject();
            }
        }).error(function (data) {
            promise.reject(data);
        });
        return promise.promise;
    };
    CommunicationService.prototype.deleteRecord = function (nodeId, id) {
        var request = {};
        request.command = Constants.COMMAND_DELETE;
        request.id = id;
        request.nodeId = nodeId;
        var promise = this.qService.defer();
        this.sendRequest(request).success(function () {
            promise.resolve();
        }).error(function (data) {
            promise.reject(data);
        });
        return promise.promise;
    };
    CommunicationService.prototype.getVersion = function () {
        var request = {};
        request.command = Constants.COMMAND_VERSION;
        var promise = this.qService.defer();
        this.sendRequest(request).success(function (response) {
            promise.resolve(response.version);
        }).error(function (data) {
            promise.reject(data);
        });
        return promise.promise;
    };
    CommunicationService.prototype.getChanges = function (version) {
        var request = {};
        request.command = Constants.COMMAND_CHANGES;
        request.version = version;
        var promise = this.qService.defer();
        this.sendRequest(request).success(function (response) {
            promise.resolve(response.changes);
        }).error(function (data) {
            promise.reject(data);
        });
        return promise.promise;
    };
    return CommunicationService;
})();
streamsClientModule.service('streamsCommunication', ['$http', '$q', Constants.CONFIGURATION, CommunicationService]);
///<reference path="../interfaces/IDataStreamService.ts" />
///<reference path="../modules/StreamsClientModule.ts" />
//class DataStreamService implements IDataStreamService {
//    constructor() {
//
//    }
//}
//
//streamsClientModule.provider('dataStream', [() => {
//    return {
//        $get: [DataStreamService]
//    }
//}]);
var templates = {
    "index.jade": ""
};
} if (typeof define === 'function' && define.amd) { define(["angular","angular.animate","angular.translate","angular.messages","angular.material","angular.aria","angular.touch"], function ($_v0,$_v1,$_v2,$_v3,$_v4,$_v5,$_v6) { ___f$($_v0); }); } else if (typeof exports === 'object') { var $_v0 = require('angular');require('angular.animate');require('angular.translate');require('angular.messages');require('angular.material');require('angular.aria');require('angular.touch'); module.exports = ___f$($_v0); } else  { ___f$(window['angular']); } })();