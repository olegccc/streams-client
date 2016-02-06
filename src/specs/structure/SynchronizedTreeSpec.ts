///<reference path="../../structure/SynchronizedTree.ts" />
///<reference path="DataChannelStub.ts" />

describe('Synchronized tree', () => {

    function createSynchronizedTree(state:IDataChannelStubState):Promise<ISynchronizedTree> {

        var dataChannel = createDataChannelStub(state);
        var ret = new SynchronizedTree(dataChannel);
        return ret.initialize().then(() => {
            return ret;
        });
    }

    var expectedId1 = 'id1';
    var expectedId2 = 'id2';
    var expectedId3 = 'id3';
    var expectedId4 = 'id4';

    var expectedValue1 = 'value1';
    var expectedValue2 = 'value2';
    var expectedValue3 = 'value3';
    var expectedValue4 = 'value4';

    function createCommonState(state:IDataChannelStubState) {

        // id2 +-- id1 +-- id3
        //     |
        //     +-- id4
        //
        //

        state.idsResponse = [expectedId1, expectedId2, expectedId3];
        state.readManyResponse = <any>[
            {
                id: expectedId1,
                parentId: expectedId2,
                value: expectedValue1
            },
            {
                id: expectedId2,
                value: expectedValue2
            },
            {
                id: expectedId3,
                value: expectedValue3,
                parentId: expectedId1
            },
            {
                id: expectedId4,
                value: expectedValue4,
                parentId: expectedId2
            }
        ];

        return state;
    }

    it('should read tree structure on initialize', (done) => {

        var state = createCommonState(<any>{});

        createSynchronizedTree(state).then((tree: ISynchronizedTree) => {

            expect(tree.getRoot().id).toBe(expectedId2);
            expect(tree.getRoot()["value"]).toBe(expectedValue2);

            var children = tree.getChildren(expectedId1);

            expect(children.length).toBe(1);
            expect(children[0].id).toBe(expectedId3);
            expect(children[0]["value"]).toBe(expectedValue3);

            expect(tree.getChildIds(expectedId2).length).toBe(2);

            done();
        });
    });

    it('should react on update events', ((done) => {

        var expectedValue5 = 'value5';

        var state = createCommonState(<any>{
            readResponse: {
                id: expectedId3,
                parentId: expectedId2,
                value: expectedValue5
            }
        });

        createSynchronizedTree(state).then((tree: ISynchronizedTree) => {

            expect(state.currentListener).toBeDefined();

            state.currentListener.onChange(Constants.UPDATE_CHANGED, expectedId3).then(() => {
                expect(state.readRequestedId).toBe(expectedId3);
                var children = tree.getChildren(expectedId2);
                expect(children.length).toBe(3);
                expect(children[2]["value"]).toBe(expectedValue5);
                done();
            });
        });
    }));

    it('should react on delete events', ((done) => {

        var state = createCommonState(<any>{});

        createSynchronizedTree(state).then((tree: ISynchronizedTree) => {

            expect(tree.getChildIds(expectedId1).length).toBe(1);

            state.currentListener.onChange(Constants.UPDATE_DELETED, expectedId3).then(() => {
                expect(tree.getChildIds(expectedId1).length).toBe(0);
                done();
            });
        });
    }));

    it('should react on create events', ((done) => {

        var expectedId5 = '555';
        var expectedValue5 = 'value 5';
        var state = createCommonState(<any>{
            readResponse: {
                id: expectedId5,
                value: expectedValue5,
                parentId: expectedId4
            }
        });

        createSynchronizedTree(state).then((tree: ISynchronizedTree) => {

            expect(tree.getChildIds(expectedId4).length).toBe(0);

            state.currentListener.onChange(Constants.UPDATE_CREATED, expectedId5).then(() => {
                expect(tree.getChildIds(expectedId4).length).toBe(1);
                done();
            })
        });
    }));

    it('should delete nodes', ((done) => {

        var state = createCommonState(<any>{});

        createSynchronizedTree(state).then((tree: ISynchronizedTree) => {

            expect(state.deleteRecordId.length).toBe(0);
            expect(tree.getChildIds(expectedId2).length).toBe(2);

            tree.remove(expectedId1).then(() => {

                expect(state.deleteRecordId.length).toBe(2);
                expect(state.deleteRecordId[0]).toBe(expectedId3);
                expect(state.deleteRecordId[1]).toBe(expectedId1);

                expect(tree.getChildIds(expectedId2).length).toBe(1);

                done();
            });
        });
    }));

    it('should create nodes', ((done) => {

        var expectedValue5 = 'value 5';
        var expectedId5 = 'id5';

        var state = createCommonState(<any>{
            createResponse: {
                id: expectedId5,
                parentId: expectedId2,
                value: expectedValue5
            }
        });

        createSynchronizedTree(state).then((tree: ISynchronizedTree) => {

            expect(tree.getChildIds(expectedId2).length).toBe(2);

            tree.add(expectedId2, <any>{
                value: expectedValue5
            }).then(() => {

                expect(state.createRequestedRecord["value"]).toBe(expectedValue5);
                var children = tree.getChildren(expectedId2);
                expect(children.length).toBe(3);
                expect(children[2]["value"]).toBe(expectedValue5);

                expect(tree.get(expectedId5)["value"]).toBe(expectedValue5);

                done();
            });
        });
    }));

    it('should update value with changed parentId', ((done) => {

        var state = createCommonState(<any>{});

        createSynchronizedTree(state).then((tree: ISynchronizedTree) => {

            expect(tree.getChildIds(expectedId1).length).toBe(1);
            expect(tree.getChildIds(expectedId2).length).toBe(2);

            tree.update(<any>{
                id: expectedId4,
                parentId: expectedId1,
                value: expectedValue1
            }).then(() => {

                expect(tree.getChildIds(expectedId1).length).toBe(2);
                expect(tree.getChildIds(expectedId2).length).toBe(1);

                done();
            });
        });
    }));

    it('should unsubscribe on destroy', ((done) => {
        var state = createCommonState(<any>{});

        createSynchronizedTree(state).then((synchronizedTree) => {

            expect(state.addListenerCount).toBe(1);
            expect(state.removeListenerCount).toBe(0);
            expect(state.closeCount).toBe(0);

            synchronizedTree.destroy();

            expect(state.addListenerCount).toBe(1);
            expect(state.removeListenerCount).toBe(1);
            expect(state.closeCount).toBe(1);

            done();
        });
    }));
});
