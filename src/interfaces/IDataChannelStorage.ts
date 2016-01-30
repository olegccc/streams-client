///<reference path="IDataChannel.ts" />

interface IDataChannelStorage {
    get(streamId: string, nodeId: string): Promise<IDataChannel>;
    close(instanceId: string);
    checkForUpdates(): Promise<void>;
}