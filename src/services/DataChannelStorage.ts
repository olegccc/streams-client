///<reference path="../interfaces/ICommunicationService.ts" />
///<reference path="../interfaces/IDataChannelStorage.ts" />
///<reference path="../interfaces/IDataChannel.ts" />
///<reference path="../interfaces/IUpdates.ts" />
///<reference path="../structure/DataChannel.ts" />

class DataChannelStorage implements IDataChannelStorage {

    private communicationService: ICommunicationService;
    private tempCounter: number;
    private channels: {[key: string]: DataChannel};

    constructor(communicationService: ICommunicationService) {
        this.communicationService = communicationService;
        this.tempCounter = 0;
        this.channels = {};
    }

    get(streamId: string, nodeId: string): Promise<IDataChannel> {

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

        return new Promise<IDataChannel>((resolve) => {
            dataChannel.initialize().then(() => {
                resolve(dataChannel);
            });
        });
    }

    close(instanceId: string) {
        delete this.channels[instanceId];
    }

    checkForUpdates(): Promise<void> {

        var requests: IVersionRequest[] = [];

        var keys = Object.keys(this.channels);

        var channels: {[key: string]: DataChannel[]} = {};

        for (var i = 0; i < keys.length; i++) {
            var channel = this.channels[keys[i]];
            var request: IVersionRequest = {
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

        return this.communicationService.getManyStreamsChanges(requests).then((updates: IUpdates[]) => {

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
    }
}
