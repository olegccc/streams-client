///<reference path="../../structure/SynchronizedObject.ts" />

describe('Synchronized object', () => {

    it('should read all values on initialize', (done: () => void) => {

        var expectedId1 = 'aaa';
        var expectedId2 = 'bbb';
        var expectedId3 = 'ccc';
        var expectedValue1 = 'value1';
        var expectedValue2 = 'value2';
        var expectedValue3 = 'value3';
        var expectedValue4 = 'value4';
        var ids = [expectedId1, expectedId2];
        var requestedIds = [];
        var addListenerCount = 0;
        var removeListenerCount = 0;
        var closeCount = 0;
        var currentListener: IDataChannelListener;
        var requestedId = '';
        var updateRecord: IRecord;
        var createRecord: IRecord;
        var deleteRecordId: string;

        var dataChannel = <IDataChannel> {

            getIds: (filter?: any, options?: IQueryOptions) : Promise<string[]> => {
                return new Promise<string[]>((resolve) => {
                    resolve(ids);
                });
            },

            read: (id: string) : Promise<IRecord> => {
                requestedId = id;
                return new Promise<IRecord> ((resolve) => {
                    resolve(<any>{
                        id: expectedId2,
                        value: expectedValue3
                    });
                });
            },

            update: (record: IRecord, echo: boolean) : Promise<IRecord> => {
                updateRecord = record;
                return new Promise<IRecord>((resolve) => {
                    resolve(record);
                });
            },

            remove: (id: string) : Promise<void> => {
                deleteRecordId = id;
                return new Promise<void>((resolve) => {
                    resolve();
                });
            },

            create: (record: IRecord, echo: boolean) : Promise<IRecord> => {
                createRecord = record;
                return new Promise<IRecord>((resolve) => {
                    resolve(record);
                });
            },

            readMany: (ids: string[]) : Promise<IRecord[]> => {

                requestedIds = ids;

                return new Promise<IRecord[]> ((resolve) => {
                    resolve([
                        <any>{
                            id: expectedId1,
                            value: expectedValue1
                        },
                        <any>{
                            id: expectedId2,
                            value: expectedValue2
                        }
                    ]);
                });
            },
            addListener: (listener: IDataChannelListener) => {
                currentListener = listener;
                addListenerCount++;
            },
            removeListener: (listener: IDataChannelListener) => {
                if (currentListener === listener) {
                    currentListener = null;
                }
                removeListenerCount++;
            },
            close: () => {
                closeCount++;
            }
        };

        var synchronizedObject = new SynchronizedObject(dataChannel);

        expect(addListenerCount).toBe(1);
        expect(removeListenerCount).toBe(0);

        synchronizedObject.initialize().then(() => {

            var readOnlyObject = synchronizedObject.getReadOnlyObject();
            expect(readOnlyObject[expectedId1]).toBe(expectedValue1);
            expect(readOnlyObject[expectedId2]).toBe(expectedValue2);
            expect(closeCount).toBe(0);

            synchronizedObject.getKeys().then((keys: string[]) => {

                expect(keys).toEqual(ids);

                synchronizedObject.get(expectedId1).then((value) => {
                    expect(value).toBe(expectedValue1);
                    expect(requestedIds.length).toBe(2);
                    expect(requestedIds[0]).toBe(expectedId1);

                    expect(currentListener).toBeDefined();

                    currentListener.onChange(Constants.UPDATE_CHANGED, expectedId2).then(() => {

                        expect(requestedId).toBe(expectedId2);
                        expect(readOnlyObject[expectedId2]).toBe(expectedValue3);
                        expect(readOnlyObject[expectedId1]).toBeDefined();

                        currentListener.onChange(Constants.UPDATE_DELETED, expectedId1).then(() => {

                            expect(readOnlyObject[expectedId1]).toBeUndefined();

                            expect(updateRecord).toBeUndefined();

                            synchronizedObject.set(expectedId2, expectedValue4).then(() => {
                                expect(updateRecord["id"]).toBe(expectedId2);
                                expect(createRecord).toBeUndefined();

                                synchronizedObject.set(expectedId3, expectedValue1).then(() => {
                                    expect(createRecord.id).toBe(expectedId3);
                                    expect(readOnlyObject[expectedId3]).toBe(expectedValue1);
                                    expect(deleteRecordId).toBeUndefined();

                                    synchronizedObject.remove(expectedId2).then(() => {
                                        expect(deleteRecordId).toBe(expectedId2);
                                        expect(readOnlyObject[expectedId2]).toBeUndefined();

                                        synchronizedObject.destroy();
                                        expect(addListenerCount).toBe(1);
                                        expect(removeListenerCount).toBe(1);
                                        expect(closeCount).toBe(1);
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
