///<reference path="../../structure/SynchronizedObject.ts" />
///<reference path="DataChannelStub.ts" />

describe('Synchronized object', () => {

    function createSynchronizedObject(state:IDataChannelStubState):Promise<ISynchronizedObject> {
        var dataChannel = createDataChannelStub(state);
        var ret = new SynchronizedObject(dataChannel);
        return ret.initialize().then(() => {
            return ret;
        });
    }

    var expectedId1 = 'aaa';
    var expectedId2 = 'bbb';

    var expectedValue1 = 'value1';
    var expectedValue2 = 'value2';

    function createCommonState(state:IDataChannelStubState) {

        state.idsResponse = [expectedId1, expectedId2];
        state.readManyResponse = <any>[
            {
                id: expectedId1,
                value: expectedValue1
            },
            {
                id: expectedId2,
                value: expectedValue2
            }
        ];

        return state;
    }

    it('should read all values on initialize', (done:() => void) => {

        var state = createCommonState(<any>{});

        createSynchronizedObject(state).then((synchronizedObject:ISynchronizedObject) => {

            expect(state.readManyRequestedIds.length).toBe(2);
            expect(state.readManyRequestedIds[0]).toBe(expectedId1);

            expect(state.addListenerCount).toBe(1);
            expect(state.removeListenerCount).toBe(0);
            expect(state.closeCount).toBe(0);

            var readOnlyObject = synchronizedObject.getReadOnlyObject();

            expect(readOnlyObject[expectedId1]).toBe(expectedValue1);
            expect(readOnlyObject[expectedId2]).toBe(expectedValue2);
            expect(synchronizedObject.getKeys()).toEqual(state.idsResponse);

            expect(synchronizedObject.get(expectedId1)).toBe(expectedValue1);

            done();
        });
    });

    it('should update its state on updates', (done) => {

        var expectedValue3 = 'value3';

        var state = createCommonState(<any>{
            readResponse: {
                id: expectedId2,
                value: expectedValue3
            }
        });

        createSynchronizedObject(state).then((synchronizedObject:ISynchronizedObject) => {

            expect(state.currentListener).toBeDefined();

            state.currentListener.onChange(Constants.UPDATE_CHANGED, expectedId2).then(() => {

                var readOnlyObject = synchronizedObject.getReadOnlyObject();

                expect(state.readRequestedId).toBe(expectedId2);
                expect(readOnlyObject[expectedId2]).toBe(expectedValue3);
                expect(readOnlyObject[expectedId1]).toBeDefined();

                state.currentListener.onChange(Constants.UPDATE_DELETED, expectedId1).then(() => {

                    expect(readOnlyObject[expectedId1]).toBeUndefined();

                    done();
                });
            });
        });
    });

    it('should send updates on changes', ((done) => {

        var state = createCommonState(<any>{});

        var expectedValue4 = 'value4';
        var expectedId3 = 'ccc';

        createSynchronizedObject(state).then((synchronizedObject:ISynchronizedObject) => {

            expect(state.updateRequestedRecord).toBeUndefined();

            synchronizedObject.set(expectedId2, expectedValue4).then(() => {

                expect(state.updateRequestedRecord["id"]).toBe(expectedId2);
                expect(state.createRequestedRecord).toBeUndefined();

                synchronizedObject.set(expectedId3, expectedValue1).then(() => {

                    expect(state.createRequestedRecord.id).toBe(expectedId3);

                    var readOnlyObject = synchronizedObject.getReadOnlyObject();

                    expect(readOnlyObject[expectedId3]).toBe(expectedValue1);
                    expect(state.deleteRecordId.length).toBe(0);

                    synchronizedObject.remove(expectedId2).then(() => {
                        expect(state.deleteRecordId[0]).toBe(expectedId2);
                        expect(readOnlyObject[expectedId2]).toBeUndefined();

                        done();
                    });
                });
            });

        });
    }));

    it('should unsubscribe on destroy', ((done) => {
        var state = createCommonState(<any>{});

        createSynchronizedObject(state).then((synchronizedObject:ISynchronizedObject) => {

            expect(state.addListenerCount).toBe(1);
            expect(state.removeListenerCount).toBe(0);
            expect(state.closeCount).toBe(0);

            synchronizedObject.destroy();

            expect(state.addListenerCount).toBe(1);
            expect(state.removeListenerCount).toBe(1);
            expect(state.closeCount).toBe(1);

            done();
        });
    }));
});
