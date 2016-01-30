/// <reference path="../../interfaces/ICommunicationService.ts" />
/// <reference path="../../interfaces/IRequest.ts" />
/// <reference path="../../interfaces/IConfiguration.ts" />
/// <reference path="../../interfaces/IResponse.ts" />
/// <reference path="../../interfaces/Constants.ts" />

describe('Communication Service', () => {

    var connectionPath: string = "testConnection";

    beforeEach(() => {
        angular.mock.module('streams-client');
    });

    beforeEach(angular.mock.module(($provide: angular.auto.IProvideService) => {
        $provide.constant(Constants.CONFIGURATION, <IConfiguration> {
            ConnectionPath: connectionPath
        });
    }));

    it('should read record ids', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest[];

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, [{ ids: ['id1'] }]];
            });

            var expectedFilter = { abc: 'def' };
            var expectedOptions: IQueryOptions = <any> {
                from: 10,
                count: 10
            };
            var expectedNodeId = 'nodeId';
            var expectedStreamId = 'test';

            streamsCommunication.getIds(expectedStreamId, expectedNodeId, expectedFilter, expectedOptions).then((ids: string[]) => {
                expect(ids).toEqual(['id1']);
                expect(request.length).toBe(1);
                expect(request[0].command).toBe(Constants.COMMAND_IDS);
                expect(request[0].filter).toEqual(expectedFilter);
                expect(request[0].options).toEqual(expectedOptions);
                expect(request[0].nodeId).toBe(expectedNodeId);
                expect(request[0].streamId).toBe(expectedStreamId);
                done();
            }, (error: any) => {
                throw Error(error);
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should create new record', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest[];

            var expectedId = '100';
            var expectedFieldValue = 'field1_2';
            var expectedNodeId = '200';
            var expectedStreamId = 'stream1';

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, [{
                    record: {
                        id: expectedId,
                        field1: expectedFieldValue
                    }
                }]];
            });

            var recordToCreate = <any>{
                field1: 'field1_1'
            };

            streamsCommunication.createRecord(expectedStreamId, expectedNodeId, recordToCreate, true).then((record: IRecord) => {

                expect(request.length).toBe(1);
                expect(request[0].command).toBe(Constants.COMMAND_CREATE);
                expect(request[0].record).toEqual(recordToCreate);
                expect(request[0].nodeId).toBe(expectedNodeId);
                expect(request[0].streamId).toBe(expectedStreamId);
                expect(record.id).toBe(expectedId);
                expect(record['field1']).toBe(expectedFieldValue);
                done();
            }, (error: any) => {
                throw Error(error);
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should read record', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest[];

            var expectedId = '100';
            var expectedFieldValue = 'field1_2';
            var expectedNodeId = '200';
            var expectedStreamId = 'stream2';

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, [{
                    record: {
                        id: expectedId,
                        field1: expectedFieldValue
                    }
                }]];
            });

            streamsCommunication.readRecord(expectedStreamId, expectedNodeId, expectedId).then((record: IRecord) => {

                expect(request.length).toBe(1);
                expect(request[0].command).toBe(Constants.COMMAND_READ);
                expect(request[0].id).toEqual(expectedId);
                expect(request[0].nodeId).toBe(expectedNodeId);
                expect(request[0].streamId).toBe(expectedStreamId);
                expect(record.id).toBe(expectedId);
                expect(record['field1']).toBe(expectedFieldValue);
                done();
            }, (error: any) => {
                throw Error(error);
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should read many records at once', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest[];

            var expectedId1 = '100';
            var expectedId2 = '101';
            var expectedFieldValue1 = 'field1_2';
            var expectedFieldValue2 = 'field1_3';
            var expectedNodeId = '200';
            var expectedStreamId = 'stream2';

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, [{
                    record: {
                        id: expectedId1,
                        field1: expectedFieldValue1
                    }
                }, {
                    record: {
                        id: expectedId2,
                        field1: expectedFieldValue2
                    }
                }]];
            });

            streamsCommunication.readRecords(expectedStreamId, expectedNodeId, [expectedId1, expectedId2]).then((records: IRecord[]) => {

                expect(request.length).toBe(2);
                expect(request[0].command).toBe(Constants.COMMAND_READ);
                expect(request[0].id).toEqual(expectedId1);
                expect(request[0].nodeId).toBe(expectedNodeId);
                expect(request[0].streamId).toBe(expectedStreamId);
                expect(request[1].command).toBe(Constants.COMMAND_READ);
                expect(request[1].id).toEqual(expectedId2);
                expect(request[1].nodeId).toBe(expectedNodeId);
                expect(request[1].streamId).toBe(expectedStreamId);
                expect(records.length).toBe(2);
                expect(records[0].id).toBe(expectedId1);
                expect(records[0]['field1']).toBe(expectedFieldValue1);
                expect(records[1].id).toBe(expectedId2);
                expect(records[1]['field1']).toBe(expectedFieldValue2);
                done();
            }, (error: any) => {
                throw Error(error);
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should update existing record', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest[];

            var expectedId = '100';
            var expectedFieldValue = 'field1_2';
            var expectedNodeId = '200';
            var expectedStreamId = 'stream2';

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, [{
                    record: {
                        id: expectedId,
                        field1: expectedFieldValue
                    }
                }]];
            });

            var recordToUpdate = <any>{
                field1: 'field1_1'
            };

            streamsCommunication.updateRecord(expectedStreamId, expectedNodeId, recordToUpdate, true).then((record: IRecord) => {

                expect(request.length).toBe(1);
                expect(request[0].command).toBe(Constants.COMMAND_UPDATE);
                expect(request[0].record).toEqual(recordToUpdate);
                expect(request[0].nodeId).toBe(expectedNodeId);
                expect(request[0].echo).toBeTruthy();
                expect(request[0].streamId).toBe(expectedStreamId);
                expect(record.id).toBe(expectedId);
                expect(record['field1']).toBe(expectedFieldValue);
                done();
            }, (error: any) => {
                throw Error(error);
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should delete record', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest[];

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, [{}]];
            });

            var expectedNodeId = "10";
            var expectedRecordId = "20";
            var expectedStreamId = "stream3";

            streamsCommunication.deleteRecord(expectedStreamId, expectedNodeId, expectedRecordId).then(() => {

                expect(request.length).toBe(1);
                expect(request[0].command).toBe(Constants.COMMAND_DELETE);
                expect(request[0].nodeId).toBe(expectedNodeId);
                expect(request[0].id).toBe(expectedRecordId);
                expect(request[0].streamId).toBe(expectedStreamId);
                done();
            }, (error: any) => {
                throw Error(error);
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should return version', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest[];
            var expectedVersion = '150';
            var expectedStreamId = 'stream4';
            var expectedNodeId = 'node1';

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, [{
                    version: expectedVersion
                }]];
            });

            streamsCommunication.getVersion(expectedStreamId, expectedNodeId).then((version: string) => {

                expect(request.length).toBe(1);
                expect(version).toBe(expectedVersion);
                expect(request[0].command).toBe(Constants.COMMAND_VERSION);
                expect(request[0].streamId).toBe(expectedStreamId);
                expect(request[0].nodeId).toBe(expectedNodeId);
                done();
            }, (error: any) => {
                throw Error(error);
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should get updates for one stream', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest[];
            var expectedChangeId = '100';
            var expectedChangeType = Constants.UPDATE_CREATED;
            var expectedVersion = 'xxx';
            var requestedVersion = 'yyy';
            var expectedStreamId = 'stream5';
            var expectedNodeId = 'node2';

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, [{
                    changes: [
                        {
                            type: expectedChangeType,
                            id: expectedChangeId,
                            version: expectedVersion
                        }
                    ]
                }]];
            });

            streamsCommunication.getOneStreamChanges(expectedStreamId, expectedNodeId, requestedVersion).then((updates: IUpdate[]) => {

                expect(request.length).toBe(1);
                expect(request[0].version).toBe(requestedVersion);
                expect(request[0].command).toBe(Constants.COMMAND_CHANGES);
                expect(request[0].streamId).toBe(expectedStreamId);
                expect(request[0].nodeId).toBe(expectedNodeId);
                expect(updates.length).toBe(1);
                expect(updates[0].type).toBe(expectedChangeType);
                expect(updates[0].id).toBe(expectedChangeId);
                expect(updates[0].version).toBe(expectedVersion);
                done();
            }, (error: any) => {
                throw Error(error);
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should get updates for many streams', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest[];
            var expectedChange1Id = '100';
            var expectedChange1Type = Constants.UPDATE_CREATED;
            var expectedVersion1 = 'xxx';
            var expectedChange2Id = '101';
            var expectedChange2Type = Constants.UPDATE_CHANGED;
            var expectedVersion2 = 'xxx2';
            var requestedVersion1 = 'yyy';
            var requestedVersion2 = 'zzz';
            var expectedStream1Id = 'stream5';
            var expectedStream2Id = 'stream6';
            var expectedNode1Id = 'node1';
            var expectedNode2Id = 'node2';

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {

                request = JSON.parse(data);

                return [200, [{
                    streamId: expectedStream1Id,
                    nodeId: expectedNode1Id,
                    changes: [
                        {
                            type: expectedChange1Type,
                            id: expectedChange1Id,
                            version: expectedVersion1
                        }
                    ]
                }, {
                    streamId: expectedStream2Id,
                    nodeId: expectedNode2Id,
                    changes: [
                        {
                            type: expectedChange2Type,
                            id: expectedChange2Id,
                            version: expectedVersion2
                        }
                    ]
                }]];
            });

            streamsCommunication.getManyStreamsChanges([{
                streamId: expectedStream1Id,
                nodeId: expectedNode1Id,
                version: requestedVersion1
            },{
                streamId: expectedStream2Id,
                nodeId: expectedNode2Id,
                version: requestedVersion2
            }]).then((updates: IUpdates[]) => {

                expect(request.length).toBe(2);
                expect(updates.length).toBe(2);

                expect(request[0].version).toBe(requestedVersion1);
                expect(request[0].command).toBe(Constants.COMMAND_CHANGES);
                expect(request[0].streamId).toBe(expectedStream1Id);
                expect(request[0].nodeId).toBe(expectedNode1Id);
                expect(request[1].version).toBe(requestedVersion2);
                expect(request[1].command).toBe(Constants.COMMAND_CHANGES);
                expect(request[1].streamId).toBe(expectedStream2Id);
                expect(request[1].nodeId).toBe(expectedNode2Id);

                expect(updates[0].streamId).toBe(expectedStream1Id);
                expect(updates[0].nodeId).toBe(expectedNode1Id);
                expect(updates[0].updates.length).toBe(1);
                expect(updates[0].updates[0].type).toBe(expectedChange1Type);
                expect(updates[0].updates[0].id).toBe(expectedChange1Id);
                expect(updates[0].updates[0].version).toBe(expectedVersion1);
                expect(updates[1].streamId).toBe(expectedStream2Id);
                expect(updates[1].nodeId).toBe(expectedNode2Id);
                expect(updates[1].updates.length).toBe(1);
                expect(updates[1].updates[0].type).toBe(expectedChange2Type);
                expect(updates[1].updates[0].id).toBe(expectedChange2Id);
                expect(updates[1].updates[0].version).toBe(expectedVersion2);

                done();

            }, (error: any) => {
                throw Error(error);
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
