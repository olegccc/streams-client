///<reference path="../../interfaces/ISynchronizedArray.ts" />
///<reference path="../../structure/SynchronizedArray.ts" />

describe('Synchronized array', () => {

    function createSynchronizedArray(state: IDataChannelStubState) : Promise<ISynchronizedArray> {

        var dataChannel = createDataChannelStub(state);
        var ret = new SynchronizedArray(dataChannel);
        return ret.initialize().then(() => {
            return ret;
        });
    }

    var expectedId1 = 'aaa';
    var expectedId2 = 'bbb';
    var expectedId3 = 'ccc';
    var expectedId4 = 'ddd';

    var expectedValue1 = 'value1';
    var expectedValue2 = 'value2';
    var expectedValue3 = 'value3';
    var expectedValue4 = 'value4';

    var expectedIndex1 = 3;
    var expectedIndex2 = 1;
    var expectedIndex3 = 2;
    var expectedIndex4 = 0;

    function createCommonState(state: IDataChannelStubState) {

        state.idsResponse = [];
        state.readManyResponse = <any>[
            {
                id: expectedId1,
                value: expectedValue1,
                __index: expectedIndex1,
            },
            {
                id: expectedId2,
                value: expectedValue2,
                __index: expectedIndex2
            },
            {
                id: expectedId3,
                value: expectedValue3,
                __index: expectedIndex3
            },
            {
                id: expectedId4,
                value: expectedValue4,
                __index: expectedIndex4
            }
        ];

        return state;
    }

    it('should read array structure on initialize', ((done) => {

        var state = createCommonState(<any>{});

        createSynchronizedArray(state).then((array: ISynchronizedArray) => {

            expect(array.count()).toBe(4);
            expect(array.get(expectedIndex1).id).toBe(expectedId1);
            expect(array.get(expectedIndex2)["value"]).toBe(expectedValue2);

            var readOnlyArray = array.getReadOnlyArray();

            expect(readOnlyArray).toBeDefined();

            expect(readOnlyArray[expectedIndex3]["value"]).toBe(expectedValue3);

            done();
        });
    }));

    it('should handle create event (no index defined)', ((done) => {

        var expectedId5 = 'id5';
        var expectedValue5 = 'value5';

        var state = createCommonState(<any>{
            readResponse: {
                id: expectedId5,
                value: expectedValue5
            }
        });

        createSynchronizedArray(state).then((array: ISynchronizedArray) => {

            expect(array.count()).toBe(4);

            state.currentListener.onChange(Constants.UPDATE_CREATED, expectedId5).then(() => {

                expect(array.count()).toBe(5);
                expect(array.get(4)["value"]).toBe(expectedValue5);
                expect(state.updateRequestedRecord.id).toBe(expectedId5);
                expect(state.updateRequestedRecord["__index"]).toBe(4);

                done();
            });
        });
    }));

    it('should handle create event (with index)', ((done) => {

        var expectedId5 = 'id5';
        var expectedValue5 = 'value5';
        var expectedIndex5 = 5;

        var state = createCommonState(<any>{
            readResponse: {
                id: expectedId5,
                value: expectedValue5,
                __index: expectedIndex5
            }
        });

        createSynchronizedArray(state).then((array: ISynchronizedArray) => {

            expect(array.count()).toBe(4);

            state.currentListener.onChange(Constants.UPDATE_CREATED, expectedId5).then(() => {

                expect(array.count()).toBe(6);
                expect(array.get(5)["value"]).toBe(expectedValue5);
                expect(state.updateRequestedRecord).toBeUndefined();

                done();
            });
        });
    }));

    it('should handle update event', ((done) => {

        var expectedValue5 = 'value5';

        var state = createCommonState(<any>{
            readResponse: {
                id: expectedId3,
                value: expectedValue5,
                __index: expectedIndex3
            }
        });

        createSynchronizedArray(state).then((array: ISynchronizedArray) => {

            expect(array.get(2)["value"]).toBe(expectedValue3);

            state.currentListener.onChange(Constants.UPDATE_CHANGED, expectedId3).then(() => {
                expect(state.readRequestedId).toBe(expectedId3);
                expect(array.get(2)["value"]).toBe(expectedValue5);

                done();
            });
        });
    }));

    it('should handle delete event', ((done) => {

        var state = createCommonState(<any>{});

        createSynchronizedArray(state).then((array: ISynchronizedArray) => {

            expect(array.get(expectedIndex2)).toBeDefined();
            expect(array.count()).toBe(4);

            state.currentListener.onChange(Constants.UPDATE_DELETED, expectedId2).then(() => {

                expect(array.get(expectedIndex2).id).toBe(expectedId3);
                expect(array.count()).toBe(3);

                done();
            });
        });
    }));

    it('should handle push', ((done) => {

        var expectedValue5 = 'value5';

        var state = createCommonState(<any>{});

        createSynchronizedArray(state).then((array: ISynchronizedArray) => {

            expect(array.count()).toBe(4);

            array.push(<any>{
                id: undefined,
                value: expectedValue5
            }).then(() => {
                expect(array.count()).toBe(5);
                expect(state.createRequestedRecord["value"]).toBe(expectedValue5);
                expect(array.get(4)["value"]).toBe(expectedValue5);
                done();
            });
        });
    }));

    it('should handle delete', ((done) => {

        var state = createCommonState(<any>{});

        createSynchronizedArray(state).then((array: ISynchronizedArray) => {

            array.remove(expectedIndex3).then(() => {

                expect(state.deleteRecordId[0]).toBe(expectedId3);
                expect(state.updateManyRequestedRecords.length).toBe(1);
                expect(state.updateManyRequestedRecords[0].id).toBe(expectedId1);
                expect(state.updateManyRequestedRecords[0]["__index"]).toBe(expectedIndex3);

                done();
            });
        });
    }));

    it('should handle set (no id specified)', ((done) => {

        var expectedValue5 = 'value5';
        var expectedId5 = "id5";

        var state = createCommonState(<any>{
            createResponse: {
                id: expectedId5,
                value: expectedValue5,
                __index: expectedIndex2
            }
        });

        createSynchronizedArray(state).then((array: ISynchronizedArray) => {

            array.set(expectedIndex2, <any>{
                id: undefined,
                value: expectedValue5
            }).then(() => {

                expect(state.deleteRecordId[0]).toBe(expectedId2);
                expect(state.createRequestedRecord["value"]).toBe(expectedValue5);
                expect(array.get(expectedIndex2).id).toBe(expectedId5);

                done();
            });
        });
    }));

    it('should handle set (cell is empty, new record)', ((done) => {

        var expectedValue5 = 'value5';
        var expectedId5 = "id5";

        var state = createCommonState(<any>{
            createResponse: {
                id: expectedId5,
                value: expectedValue5,
                __index: expectedIndex3
            }
        });

        createSynchronizedArray(state).then((array: ISynchronizedArray) => {

            state.currentListener.onChange(Constants.UPDATE_DELETED, expectedId3).then(() => {

                array.set(expectedIndex3, <any>{
                    id: undefined,
                    value: expectedValue5
                }).then(() => {

                    expect(state.createRequestedRecord["value"]).toBe(expectedValue5);
                    expect(array.get(expectedIndex3).id).toBe(expectedId5);

                    done();
                });
            });
        });
    }));
});
