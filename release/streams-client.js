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
    Constants.DEFAULT_CACHE_UPDATE_INTERVAL = 2000;
    return Constants;
})();
///<reference path="IQueryOptions.ts" />
///<reference path="IRecord.ts" />
///<reference path="IUpdate.ts" />
///<reference path="IUpdates.ts" />
///<reference path="IVersionRequest.ts" />
///<reference path="IQueryOptions.ts" />
///<reference path="IRecord.ts" />
///<reference path="IDataChannelListener.ts" />
///<reference path="IDataChannel.ts" />
///<reference path="IDestroyable.ts" />
///<reference path="IDestroyable.ts" />
///<reference path="ISynchronizedValue.ts" />
///<reference path="IDestroyable.ts" />
///<reference path="ISynchronizedValue.ts" />
///<reference path="ISynchronizedObject.ts" />
///<reference path="ISynchronizedTree.ts" />
///<reference path="ISynchronizedArray.ts" />
///<reference path="IRecord.ts" />
///<reference path="IQueryOptions.ts" />
///<reference path='IRecord.ts'/>
///<reference path='IUpdate.ts'/>
///<reference path="IDestroyable.ts" />
///<reference path="IUpdate.ts" />
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
    CommunicationService.prototype.readRecords = function (streamId, nodeId, ids) {
        var requests = [];
        for (var i = 0; i < ids.length; i++) {
            requests.push({
                command: Constants.COMMAND_READ,
                id: ids[i],
                nodeId: nodeId,
                streamId: streamId
            });
        }
        return this.sendRequests(requests).then(function (response) {
            var records = [];
            for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].record) {
                    records.push(response.data[i].record);
                }
            }
            return records;
        });
    };
    CommunicationService.prototype.updateRecords = function (streamId, nodeId, records, echo) {
        var requests = [];
        for (var i = 0; i < records.length; i++) {
            requests.push({
                command: Constants.COMMAND_UPDATE,
                id: records[i].id,
                nodeId: nodeId,
                record: records[i],
                streamId: streamId,
                echo: echo
            });
        }
        return this.sendRequests(requests).then(function (response) {
            var records = [];
            for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].record) {
                    records.push(response.data[i].record);
                }
            }
            return records;
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
    CommunicationService.prototype.getVersion = function (streamId, nodeId) {
        var _this = this;
        return this.sendRequests([{
                command: Constants.COMMAND_VERSION,
                streamId: streamId,
                nodeId: nodeId
            }]).then(function (response) {
            return response.data && response.data.length === 1 ? response.data[0].version : _this.qService.reject();
        });
    };
    CommunicationService.prototype.getOneStreamChanges = function (streamId, nodeId, version) {
        var _this = this;
        return this.sendRequests([{
                command: Constants.COMMAND_CHANGES,
                version: version,
                streamId: streamId,
                nodeId: nodeId
            }]).then(function (response) {
            return response.data && response.data.length === 1 ? response.data[0].changes : _this.qService.reject();
        });
    };
    CommunicationService.prototype.getManyStreamsChanges = function (streamsAndVersions) {
        var _this = this;
        var requests = [];
        for (var i = 0; i < streamsAndVersions.length; i++) {
            requests.push({
                command: Constants.COMMAND_CHANGES,
                version: streamsAndVersions[i].version,
                streamId: streamsAndVersions[i].streamId,
                nodeId: streamsAndVersions[i].nodeId
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
                    updates: response.data[i].changes,
                    nodeId: response.data[i].nodeId
                });
            }
            return responses;
        });
    };
    return CommunicationService;
})();
streamsClientModule.service('streamsCommunication', ['$http', '$q', Constants.CONFIGURATION, CommunicationService]);
///<reference path="../interfaces/IDataChannel.ts" />
///<reference path="../interfaces/ICommunicationService.ts" />
///<reference path="../interfaces/IDataChannelStorage.ts" />
///<reference path="../interfaces/IDataChannelListener.ts" />
///<reference path="../interfaces/IQueryOptions.ts" />
var DataChannel = (function () {
    function DataChannel(storage, instanceId, streamId, nodeId, version, communicationService) {
        this.storage = storage;
        this.instanceId = instanceId;
        this.streamId = streamId;
        this.nodeId = nodeId;
        this.communicationService = communicationService;
        this.version = version;
        this.listeners = [];
    }
    DataChannel.prototype.getStreamId = function () {
        return this.streamId;
    };
    DataChannel.prototype.getVersion = function () {
        return this.version;
    };
    DataChannel.prototype.getNodeId = function () {
        return this.nodeId;
    };
    DataChannel.prototype.onUpdate = function (type, id, version) {
        if (version < this.version) {
            return;
        }
        this.version = version;
        for (var i = 0; i < this.listeners.length; i++) {
            this.listeners[i].onChange(type, id);
        }
    };
    DataChannel.prototype.initialize = function () {
        var _this = this;
        if (this.version) {
            return new Promise(function (resolve) {
                resolve();
            });
        }
        return this.communicationService.getVersion(this.streamId, this.nodeId).then(function (version) {
            _this.version = version;
        });
    };
    DataChannel.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };
    DataChannel.prototype.removeListener = function (listener) {
        for (var i = 0; i < this.listeners.length; i++) {
            if (this.listeners[i] === listener) {
                this.listeners.splice(i, 1);
                break;
            }
        }
    };
    DataChannel.prototype.close = function () {
        this.storage.close(this.instanceId);
    };
    DataChannel.prototype.getIds = function (filter, options) {
        return this.communicationService.getIds(this.streamId, this.nodeId, filter, options);
    };
    DataChannel.prototype.read = function (id) {
        return this.communicationService.readRecord(this.streamId, this.nodeId, id);
    };
    DataChannel.prototype.readMany = function (ids) {
        return this.communicationService.readRecords(this.streamId, this.nodeId, ids);
    };
    DataChannel.prototype.update = function (record, echo) {
        return this.communicationService.updateRecord(this.streamId, this.nodeId, record, echo);
    };
    DataChannel.prototype.updateMany = function (records, echo) {
        return this.communicationService.updateRecords(this.streamId, this.nodeId, records, echo);
    };
    DataChannel.prototype.create = function (record, echo) {
        return this.communicationService.createRecord(this.streamId, this.nodeId, record, echo);
    };
    DataChannel.prototype.remove = function (id) {
        return this.communicationService.deleteRecord(this.streamId, this.nodeId, id);
    };
    return DataChannel;
})();
///<reference path="../interfaces/ICommunicationService.ts" />
///<reference path="../interfaces/IDataChannelStorage.ts" />
///<reference path="../interfaces/IDataChannel.ts" />
///<reference path="../interfaces/IUpdates.ts" />
///<reference path="../structure/DataChannel.ts" />
var DataChannelStorage = (function () {
    function DataChannelStorage(communicationService) {
        this.communicationService = communicationService;
        this.tempCounter = 0;
        this.channels = {};
    }
    DataChannelStorage.prototype.get = function (streamId, nodeId) {
        this.tempCounter++;
        var instanceId = this.tempCounter.toString();
        var keys = Object.keys(this.channels);
        var version = null;
        for (var i = 0; i < keys.length; i++) {
            var channel = this.channels[keys[i]];
            if (channel.getNodeId() === nodeId && channel.getStreamId() === streamId) {
                version = channel.getVersion();
                break;
            }
        }
        var dataChannel = new DataChannel(this, instanceId, streamId, nodeId, version, this.communicationService);
        this.channels[instanceId] = dataChannel;
        return new Promise(function (resolve) {
            dataChannel.initialize().then(function () {
                resolve(dataChannel);
            });
        });
    };
    DataChannelStorage.prototype.close = function (instanceId) {
        delete this.channels[instanceId];
    };
    DataChannelStorage.prototype.checkForUpdates = function () {
        var requests = [];
        var keys = Object.keys(this.channels);
        var channels = {};
        for (var i = 0; i < keys.length; i++) {
            var channel = this.channels[keys[i]];
            var request = {
                streamId: channel.getStreamId(),
                version: channel.getVersion(),
                nodeId: channel.getNodeId()
            };
            var key = request.streamId + ':' + request.nodeId;
            if (!channels[key]) {
                channels[key] = [];
                requests.push(request);
            }
            channels[key].push(channel);
        }
        return this.communicationService.getManyStreamsChanges(requests).then(function (updates) {
            for (var i = 0; i < updates.length; i++) {
                var update = updates[i];
                var key = update.streamId + ':' + update.nodeId;
                var updateChannels = channels[key];
                if (updateChannels) {
                    for (var j = 0; j < update.updates.length; j++) {
                        var change = update.updates[j];
                        for (var k = 0; k < updateChannels.length; k++) {
                            updateChannels[k].onUpdate(change.type, change.id, change.version);
                        }
                    }
                }
            }
        });
    };
    return DataChannelStorage;
})();
///<reference path="../interfaces/ISynchronizedObject.ts" />
///<reference path="../interfaces/IStreamObject.ts" />
///<reference path="../interfaces/IUpdate.ts" />
var SynchronizedObject = (function () {
    function SynchronizedObject(dataChannel) {
        this.dataChannel = dataChannel;
        this.dataChannel.addListener(this);
        this.innerObject = {};
    }
    SynchronizedObject.prototype.initialize = function () {
        var _this = this;
        return this.dataChannel.getIds().then(function (ids) {
            if (!ids.length) {
                return;
            }
            return _this.dataChannel.readMany(ids).then(function (records) {
                for (var i = 0; i < records.length; i++) {
                    _this.innerObject[records[i].id] = records[i]["value"];
                }
            });
        });
    };
    SynchronizedObject.prototype.onChange = function (type, id) {
        var _this = this;
        switch (type) {
            case Constants.UPDATE_CHANGED:
            case Constants.UPDATE_CREATED:
                return this.dataChannel.read(id).then(function (record) {
                    _this.innerObject[record.id] = record["value"];
                });
            case Constants.UPDATE_DELETED:
                delete this.innerObject[id];
                break;
        }
        return new Promise(function (resolve) { resolve(); });
    };
    SynchronizedObject.prototype.getKeys = function () {
        return Object.keys(this.innerObject);
    };
    SynchronizedObject.prototype.get = function (key) {
        return this.innerObject[key];
    };
    SynchronizedObject.prototype.set = function (key, value) {
        var exists = this.innerObject[key];
        this.innerObject[key] = value;
        var record = {
            id: key,
            value: value
        };
        if (exists) {
            return this.dataChannel.update(record, false).then(function () { });
        }
        else {
            return this.dataChannel.create(record, false).then(function () { });
        }
    };
    SynchronizedObject.prototype.remove = function (key) {
        delete this.innerObject[key];
        return this.dataChannel.remove(key);
    };
    SynchronizedObject.prototype.getReadOnlyObject = function () {
        return this.innerObject;
    };
    SynchronizedObject.prototype.destroy = function () {
        this.dataChannel.removeListener(this);
        this.dataChannel.close();
    };
    return SynchronizedObject;
})();
///<reference path="../interfaces/ISynchronizedTree.ts" />
///<reference path="../interfaces/IDataChannelListener.ts" />
///<reference path="../interfaces/IDataChannel.ts" />
///<reference path="../interfaces/INode.ts" />
var SynchronizedTree = (function () {
    function SynchronizedTree(dataChannel) {
        this.dataChannel = dataChannel;
        this.tree = null;
        this.recordMap = {};
        this.dataChannel.addListener(this);
    }
    SynchronizedTree.prototype.initialize = function () {
        var _this = this;
        return this.dataChannel.getIds().then(function (ids) {
            return _this.dataChannel.readMany(ids).then(function (records) {
                //console.log('read records: ', JSON.stringify(records, null, " "));
                _this.buildTree(records);
            });
        });
    };
    SynchronizedTree.getChildren = function (record) {
        return record["__children"];
    };
    SynchronizedTree.setChildren = function (record, children) {
        record["__children"] = children;
    };
    SynchronizedTree.getParent = function (record) {
        return record["__parent"];
    };
    SynchronizedTree.setParent = function (record, parent) {
        record["__parent"] = parent;
    };
    SynchronizedTree.removeServiceFields = function (record) {
        var ret = {};
        var keys = Object.keys(record);
        var key;
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            if (key === "__parent") {
                continue;
            }
            if (key === "__children") {
                continue;
            }
            if (record.hasOwnProperty(key)) {
                ret[key] = record[key];
            }
        }
        return ret;
    };
    SynchronizedTree.prototype.buildTree = function (records) {
        var treeMap = {};
        this.tree = null;
        this.recordMap = {};
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            if (!record.parentId) {
                if (!this.tree) {
                    this.tree = record;
                }
            }
            else {
                if (!treeMap.hasOwnProperty(record.parentId)) {
                    treeMap[record.parentId] = [];
                }
                treeMap[record.parentId].push(record);
            }
        }
        //console.log('treemap: ', JSON.stringify(treeMap, null, " "));
        if (this.tree) {
            this.fillChildren(this.tree, treeMap);
        }
    };
    SynchronizedTree.prototype.onRecordRemoved = function (record) {
        var children = SynchronizedTree.getChildren(record);
        if (children) {
            for (var i = 0; i < children.length; i++) {
                this.onRecordRemoved(children[i]);
            }
        }
        delete this.recordMap[record.id];
    };
    SynchronizedTree.prototype.onChange = function (type, id) {
        var _this = this;
        switch (type) {
            case Constants.UPDATE_CHANGED:
                return this.dataChannel.read(id).then(function (record) {
                    _this.updateRecord(record);
                });
                break;
            case Constants.UPDATE_DELETED:
                var currentRecord = this.recordMap[id];
                this.removeRecord(currentRecord);
                return new Promise(function (resolve) { return resolve(); });
            case Constants.UPDATE_CREATED:
                return this.dataChannel.read(id).then(function (record) {
                    _this.addRecord(record);
                });
                break;
        }
    };
    SynchronizedTree.prototype.getRoot = function () {
        return this.tree;
    };
    SynchronizedTree.prototype.getChildren = function (parentId) {
        var ret = [];
        var node = this.recordMap[parentId];
        if (node) {
            var children = SynchronizedTree.getChildren(node);
            for (var i = 0; i < children.length; i++) {
                ret.push(children[i]);
            }
        }
        return ret;
    };
    SynchronizedTree.prototype.getChildIds = function (parentId) {
        var ret = [];
        var node = this.recordMap[parentId];
        if (node) {
            var children = SynchronizedTree.getChildren(node);
            for (var i = 0; i < children.length; i++) {
                ret.push(children[i].id);
            }
        }
        return ret;
    };
    SynchronizedTree.prototype.getParentId = function (itemId) {
        var record = this.recordMap[itemId];
        if (!record) {
            return null;
        }
        return record.parentId;
    };
    SynchronizedTree.prototype.removeRecord = function (record) {
        this.onRecordRemoved(record);
        var parent = SynchronizedTree.getParent(record);
        if (parent) {
            var children = SynchronizedTree.getChildren(parent);
            for (var i = 0; i < children.length; i++) {
                if (children[i].id === record.id) {
                    children.splice(i, 1);
                    break;
                }
            }
        }
        else if (this.tree === record) {
            this.tree = null;
        }
    };
    SynchronizedTree.prototype.addRecord = function (record) {
        SynchronizedTree.setChildren(record, []);
        if (!record.parentId) {
            this.tree = record;
            this.recordMap[record.id] = record;
        }
        else {
            var parent = this.recordMap[record.parentId];
            SynchronizedTree.setParent(record, parent);
            if (parent) {
                SynchronizedTree.getChildren(parent).push(record);
                this.recordMap[record.id] = record;
            }
        }
    };
    SynchronizedTree.prototype.fillChildren = function (node, treeMap) {
        var children = treeMap[node.id] || [];
        SynchronizedTree.setChildren(node, children);
        this.recordMap[node.id] = node;
        for (var i = 0; i < children.length; i++) {
            SynchronizedTree.setParent(children[i], node);
            this.fillChildren(children[i], treeMap);
        }
    };
    SynchronizedTree.prototype.fillChildrenToRemove = function (record, ids) {
        var children = SynchronizedTree.getChildren(record);
        for (var i = 0; i < children.length; i++) {
            this.fillChildrenToRemove(children[i], ids);
            ids.push(children[i].id);
        }
    };
    SynchronizedTree.prototype.remove = function (itemId) {
        var ids = [];
        var record = this.recordMap[itemId];
        this.fillChildrenToRemove(record, ids);
        this.removeRecord(record);
        var promises = [];
        for (var i = 0; i < ids.length; i++) {
            promises.push(this.dataChannel.remove(ids[i]));
        }
        promises.push(this.dataChannel.remove(itemId));
        return Promise.all(promises).then(function () { });
    };
    SynchronizedTree.prototype.add = function (parentId, item) {
        var _this = this;
        var record = item;
        record.parentId = parentId;
        return this.dataChannel.create(record, true).then(function (record) {
            _this.addRecord(record);
        });
    };
    SynchronizedTree.prototype.get = function (id) {
        return this.recordMap[id];
    };
    SynchronizedTree.prototype.updateRecord = function (record) {
        var currentRecord = this.recordMap[record.id];
        if (record.parentId === currentRecord.parentId) {
            this.recordMap[record.id] = record;
            SynchronizedTree.setParent(record, SynchronizedTree.getParent(currentRecord));
            SynchronizedTree.setChildren(record, SynchronizedTree.getChildren(currentRecord));
        }
        else {
            var children = SynchronizedTree.getChildren(currentRecord);
            SynchronizedTree.setChildren(currentRecord, []);
            this.removeRecord(currentRecord);
            this.addRecord(record);
            SynchronizedTree.setChildren(record, children);
        }
    };
    SynchronizedTree.prototype.update = function (item) {
        var _this = this;
        var record = this.recordMap[item.id];
        return this.dataChannel.update(SynchronizedTree.removeServiceFields(record), false).then(function () {
            _this.updateRecord(item);
        });
    };
    SynchronizedTree.prototype.destroy = function () {
        this.dataChannel.removeListener(this);
        this.dataChannel.close();
    };
    return SynchronizedTree;
})();
///<reference path="../interfaces/ISynchronizedArray.ts" />
///<reference path="../interfaces/ISynchronizedValue.ts" />
///<reference path="../interfaces/IDataChannelListener.ts" />
var SynchronizedArray = (function () {
    function SynchronizedArray(dataChannel) {
        this.dataChannel = dataChannel;
        this.dataChannel.addListener(this);
        this.records = [];
        this.indexKey = "__index";
    }
    SynchronizedArray.prototype.getIndex = function (record) {
        return record[this.indexKey];
    };
    SynchronizedArray.prototype.setIndex = function (record, index) {
        record[this.indexKey] = index;
    };
    SynchronizedArray.prototype.initialize = function () {
        var _this = this;
        return this.dataChannel.getIds().then(function (ids) {
            return _this.dataChannel.readMany(ids).then(function (records) {
                for (var i = 0; i < records.length; i++) {
                    var record = records[i];
                    var recordIndex = _this.getIndex(record);
                    _this.records[recordIndex] = record;
                }
            });
        });
    };
    SynchronizedArray.prototype.count = function () {
        return this.records.length;
    };
    SynchronizedArray.prototype.createIndex = function (record) {
        var index = this.records.length;
        this.setIndex(record, index);
        this.records[this.records.length] = record;
        return this.dataChannel.update(record, false).then(function () { });
    };
    SynchronizedArray.prototype.onChange = function (type, id) {
        var _this = this;
        switch (type) {
            case Constants.UPDATE_CHANGED:
                return this.dataChannel.read(id).then(function (record) {
                    var index = _this.getIndex(record);
                    if (!index) {
                        return _this.createIndex(record);
                    }
                    _this.records[index] = record;
                    for (var i = 0; i < _this.records.length; i++) {
                        if (i !== index && _this.records[i] && _this.records[i].id === id) {
                            _this.records[i] = undefined;
                        }
                    }
                });
            case Constants.UPDATE_CREATED:
                return this.dataChannel.read(id).then(function (record) {
                    var index = _this.getIndex(record);
                    if (!index) {
                        return _this.createIndex(record);
                    }
                    _this.records[index] = record;
                });
            case Constants.UPDATE_DELETED:
                for (var i = 0; i < this.records.length; i++) {
                    if (this.records[i] && this.records[i].id === id) {
                        this.records.splice(i, 1);
                        break;
                    }
                }
                return new Promise(function (resolve) {
                    resolve();
                });
        }
    };
    SynchronizedArray.prototype.push = function (item) {
        this.setIndex(item, this.records.length);
        this.records[this.records.length] = item;
        return this.dataChannel.create(item, false).then(function (record) {
            item.id = record.id;
        });
    };
    SynchronizedArray.prototype.get = function (index) {
        return this.records[index];
    };
    SynchronizedArray.prototype.set = function (index, value) {
        var _this = this;
        var oldRecord = this.records[index];
        if (!oldRecord) {
            this.setIndex(value, index);
            if (value.id) {
                return this.dataChannel.update(value, false).then(function () {
                    _this.records[index] = value;
                });
            }
            else {
                return this.dataChannel.create(value, true).then(function (value) {
                    _this.records[index] = value;
                });
            }
        }
        if (oldRecord.id !== value.id) {
            return this.dataChannel.remove(oldRecord.id).then(function () {
                _this.setIndex(value, index);
                return _this.dataChannel.create(value, true).then(function (value) {
                    _this.records[index] = value;
                });
            });
        }
        this.setIndex(value, index);
        return this.dataChannel.update(value, false).then(function () {
            _this.records[index] = value;
        });
    };
    SynchronizedArray.prototype.getReadOnlyArray = function () {
        return this.records;
    };
    SynchronizedArray.prototype.destroy = function () {
        this.dataChannel.removeListener(this);
        this.dataChannel.close();
    };
    SynchronizedArray.prototype.remove = function (index) {
        var _this = this;
        var record = this.records[index];
        this.records.splice(index, 1);
        return this.dataChannel.remove(record.id).then(function () {
            var updates = [];
            for (var i = index; i < _this.records.length; i++) {
                updates.push(_this.records[i]);
                _this.setIndex(_this.records[i], i);
            }
            return _this.dataChannel.updateMany(updates, false).then(function () { });
        });
    };
    return SynchronizedArray;
})();
///<reference path="../interfaces/ICommunicationService.ts" />
///<reference path="../interfaces/IDataStructuresService.ts" />
///<reference path="../interfaces/Constants.ts" />
///<reference path="../interfaces/IDataChannelStorage.ts" />
///<reference path="../structure/SynchronizedObject.ts" />
///<reference path="../structure/SynchronizedTree.ts" />
///<reference path="../structure/SynchronizedArray.ts" />
var DataStructuresService = (function () {
    function DataStructuresService(communicationService) {
        this.dataChannelStorage = new DataChannelStorage(communicationService);
    }
    DataStructuresService.prototype.getObject = function (streamId, nodeId) {
        return this.dataChannelStorage.get(streamId, nodeId).then(function (dataChannel) {
            var synchronizedObject = new SynchronizedObject(dataChannel);
            return synchronizedObject.initialize().then(function () {
                return synchronizedObject;
            });
        });
    };
    DataStructuresService.prototype.getTree = function (streamId, nodeId) {
        return this.dataChannelStorage.get(streamId, nodeId).then(function (dataChannel) {
            var synchronizedTree = new SynchronizedTree(dataChannel);
            return synchronizedTree.initialize().then(function () {
                return synchronizedTree;
            });
        });
    };
    DataStructuresService.prototype.getArray = function (streamId, nodeId) {
        return this.dataChannelStorage.get(streamId, nodeId).then(function (dataChannel) {
            var synchronizedArray = new SynchronizedArray(dataChannel);
            return synchronizedArray.initialize().then(function () {
                return synchronizedArray;
            });
        });
    };
    return DataStructuresService;
})();
streamsClientModule.service('streamsDataStructures', ['streamsCommunication', DataStructuresService]);
var templates = {
    "index.jade": ""
};
} if (typeof define === 'function' && define.amd) { define(["angular","angular.animate","angular.translate","angular.messages","angular.material","angular.aria","angular.touch"], function ($_v0,$_v1,$_v2,$_v3,$_v4,$_v5,$_v6) { ___f$($_v0); }); } else if (typeof exports === 'object') { var $_v0 = require('angular');require('angular.animate');require('angular.translate');require('angular.messages');require('angular.material');require('angular.aria');require('angular.touch'); module.exports = ___f$($_v0); } else  { ___f$(window['angular']); } })();