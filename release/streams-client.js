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
///<reference path="IUpdates.ts" />
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
    CommunicationService.prototype.sendRequests = function (requests) {
        return this.httpService.post('/' + this.configuration.ConnectionPath, requests);
    };
    CommunicationService.prototype.getIds = function (streamId, nodeId, filter, options) {
        var _this = this;
        return this.sendRequests([{
                command: Constants.COMMAND_IDS,
                nodeId: nodeId,
                filter: filter,
                options: options,
                streamId: streamId
            }]).then(function (response) {
            return response.data && response.data.length === 1 && response.data[0].ids ?
                response.data[0].ids : _this.qService.reject();
        });
    };
    CommunicationService.prototype.readRecord = function (streamId, nodeId, id) {
        var _this = this;
        return this.sendRequests([{
                command: Constants.COMMAND_READ,
                id: id,
                nodeId: nodeId,
                streamId: streamId
            }]).then(function (response) {
            return response.data && response.data.length === 1 ? response.data[0].record : _this.qService.reject();
        });
    };
    CommunicationService.prototype.updateRecord = function (streamId, nodeId, record, echo) {
        var _this = this;
        return this.sendRequests([{
                command: Constants.COMMAND_UPDATE,
                record: record,
                nodeId: nodeId,
                echo: echo,
                streamId: streamId
            }]).then(function (response) {
            return response.data && response.data.length === 1 && response.data[0].record ?
                response.data[0].record : _this.qService.reject();
        });
    };
    CommunicationService.prototype.createRecord = function (streamId, nodeId, record) {
        var _this = this;
        return this.sendRequests([{
                command: Constants.COMMAND_CREATE,
                record: record,
                nodeId: nodeId,
                streamId: streamId
            }]).then(function (response) {
            return response.data && response.data.length === 1 || response.data[0].record ?
                response.data[0].record : _this.qService.reject();
        });
    };
    CommunicationService.prototype.deleteRecord = function (streamId, nodeId, id) {
        var _this = this;
        return this.sendRequests([{
                command: Constants.COMMAND_DELETE,
                id: id,
                nodeId: nodeId,
                streamId: streamId
            }]).then(function (response) {
            if (!response.data || response.data.length !== 1) {
                return _this.qService.reject();
            }
        });
    };
    CommunicationService.prototype.getVersion = function (streamId) {
        var _this = this;
        return this.sendRequests([{
                command: Constants.COMMAND_VERSION,
                streamId: streamId
            }]).then(function (response) {
            return response.data && response.data.length === 1 ? response.data[0].version : _this.qService.reject();
        });
    };
    CommunicationService.prototype.getOneStreamChanges = function (streamId, version) {
        var _this = this;
        return this.sendRequests([{
                command: Constants.COMMAND_CHANGES,
                version: version,
                streamId: streamId
            }]).then(function (response) {
            return response.data && response.data.length === 1 ? response.data[0].changes : _this.qService.reject();
        });
    };
    CommunicationService.prototype.getManyStreamsChanges = function (streamsAndVersions) {
        var _this = this;
        var requests = [];
        var keys = Object.keys(streamsAndVersions);
        for (var i = 0; i < keys.length; i++) {
            requests.push({
                command: Constants.COMMAND_CHANGES,
                version: streamsAndVersions[keys[i]],
                streamId: keys[i]
            });
        }
        return this.sendRequests(requests).then(function (response) {
            if (!response.data) {
                return _this.qService.reject();
            }
            var responses = [];
            for (var i = 0; i < response.data.length; i++) {
                responses.push({
                    streamId: response.data[i].streamId,
                    updates: response.data[i].changes
                });
            }
            return responses;
        });
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