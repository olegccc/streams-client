///<reference path="../../services/DataChannelStorage.ts" />

describe('DataChannelStorage', () => {

    it('should return data channel for specified stream id', (done: () => void) => {

        var expectedValue1 = 'def';
        var expectedVersion = 'aaaa';
        var requestedStream = '';
        var expectedStream = 'test';
        var expectedNodeId = 'node1';
        var expectedRecordId = 'abc';

        var dataChannelStorage = new DataChannelStorage(<ICommunicationService>{
            readRecord: (streamId: string, nodeId: string, id: string): Promise<IRecord> => {
                return new Promise<IRecord>((resolve) => {
                    resolve(<IRecord>{
                        id: id,
                        field1: expectedValue1
                    });
                });
            },
            getVersion: function(streamId: string, nodeId: string) : Promise<string> {
                return new Promise<string>((resolve) => {
                    requestedStream = streamId;
                    resolve(expectedVersion);
                });
            }
        });

        dataChannelStorage.get(expectedStream, expectedNodeId).then((dataChannel: IDataChannel) => {
            dataChannel.read(expectedRecordId).then((record: IRecord) => {
                expect(record.id).toBe(expectedRecordId);
                expect(record['field1']).toBe(expectedValue1);
                expect(requestedStream).toBe(expectedStream);
                done();
            });
        });
    });

    it('should deliver updates', (done: () => void) => {

        var expectedStreamId = 'test1';
        var expectedRecordId = 'record1';
        var expectedNodeId = 'node1';
        var expectedVersion = 'version2';
        var requestedStream = '';
        var expectedChange = Constants.UPDATE_CHANGED;
        var requestedUpdates: IVersionRequest[] = [];

        var dataChannelStorage = new DataChannelStorage(<ICommunicationService>{
            getManyStreamsChanges: (streamsAndVersions: IVersionRequest[]) : Promise<IUpdates[]> => {

                requestedUpdates = streamsAndVersions;

                var resolvedUpdates = <IUpdates[]> [{
                    streamId: expectedStreamId,
                    nodeId: expectedNodeId,
                    updates: [{
                        type: expectedChange,
                        id: expectedRecordId,
                        version: expectedVersion
                    }]
                }];

                return new Promise<IUpdates[]>((resolve) => {
                    resolve(resolvedUpdates);
                });
            },
            getVersion: (streamId: string, nodeId: string) : Promise<string> => {
                return new Promise<string>((resolve) => {
                    requestedStream = streamId;
                    resolve(expectedVersion);
                });
            }
        });

        var changeCount = 0;
        var receivedChangeType = -1;
        var receivedRecordId = '';

        var listener = <IDataChannelListener>{
            onChange: (type: number, id: string) => {
                changeCount++;
                receivedChangeType = type;
                receivedRecordId = id;
            }
        };

        dataChannelStorage.get(expectedStreamId, expectedNodeId).then((dataChannel: IDataChannel) => {
            dataChannel.addListener(listener);

            dataChannelStorage.checkForUpdates().then(() => {

                expect(changeCount).toBe(1);
                expect(requestedUpdates.length).toBe(1);
                expect(receivedChangeType).toBe(expectedChange);
                expect(receivedRecordId).toBe(expectedRecordId);
                dataChannel.removeListener(listener);

                dataChannelStorage.checkForUpdates().then(() => {

                    expect(changeCount).toBe(1);
                    dataChannel.addListener(listener);
                    dataChannelStorage.checkForUpdates().then(() => {
                        expect(changeCount).toBe(2);
                        dataChannel.close();
                        dataChannelStorage.checkForUpdates().then(() => {
                            expect(changeCount).toBe(2);
                            done();
                        });
                    });
                });
            });
        });
    });
});
