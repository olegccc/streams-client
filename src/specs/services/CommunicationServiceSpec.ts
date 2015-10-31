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

            var request: IRequest;

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, { ids: ['id1'] }];
            });

            var expectedFilter = { abc: 'def' };
            var expectedOptions: IQueryOptions = <any> {
                from: 10,
                count: 10
            };
            var expectedNodeId = 'nodeId';

            streamsCommunication.getIds(expectedNodeId, expectedFilter, expectedOptions).then((ids: string[]) => {
                expect(ids).toEqual(['id1']);
                expect(request.command).toBe(Constants.COMMAND_IDS);
                expect(request.filter).toEqual(expectedFilter);
                expect(request.options).toEqual(expectedOptions);
                expect(request.nodeId).toBe(expectedNodeId);
                done();
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should create new record', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest;

            var expectedId = '100';
            var expectedFieldValue = 'field1_2';
            var expectedNodeId = '200';

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, {
                    record: {
                        id: expectedId,
                        field1: expectedFieldValue
                    }
                }];
            });

            var recordToCreate = <any>{
                field1: 'field1_1'
            };

            streamsCommunication.createRecord(expectedNodeId, recordToCreate).then((record: IRecord) => {
                expect(request.command).toBe(Constants.COMMAND_CREATE);
                expect(request.record).toEqual(recordToCreate);
                expect(request.nodeId).toBe(expectedNodeId);
                expect(record.id).toBe(expectedId);
                expect(record['field1']).toBe(expectedFieldValue);
                done();
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should update existing record', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest;

            var expectedId = '100';
            var expectedFieldValue = 'field1_2';
            var expectedNodeId = '200';

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, {
                    record: {
                        id: expectedId,
                        field1: expectedFieldValue
                    }
                }];
            });

            var recordToUpdate = <any>{
                field1: 'field1_1'
            };

            streamsCommunication.updateRecord(expectedNodeId, recordToUpdate, true).then((record: IRecord) => {
                expect(request.command).toBe(Constants.COMMAND_UPDATE);
                expect(request.record).toEqual(recordToUpdate);
                expect(request.nodeId).toBe(expectedNodeId);
                expect(request.echo).toBeTruthy();
                expect(record.id).toBe(expectedId);
                expect(record['field1']).toBe(expectedFieldValue);
                done();
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should delete record', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest;

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, {}];
            });

            var expectedNodeId = "10";
            var expectedRecordId = "20";

            streamsCommunication.deleteRecord(expectedNodeId, expectedRecordId).then(() => {
                expect(request.command).toBe(Constants.COMMAND_DELETE);
                expect(request.nodeId).toBe(expectedNodeId);
                expect(request.id).toBe(expectedRecordId);
                done();
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should return version', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest;
            var expectedVersion = '150';

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, {
                    version: expectedVersion
                }];
            });

            streamsCommunication.getVersion().then((version: string) => {
                expect(version).toBe(expectedVersion);
                expect(request.command).toBe(Constants.COMMAND_VERSION);
                done();
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should get updates', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {

            var request: IRequest;
            var expectedChangeId = '100';
            var expectedChangeType = Constants.UPDATE_CREATED;
            var expectedVersion = 'xxx';
            var requestedVersion = 'yyy';

            $httpBackend.expectPOST('/' + connectionPath).respond((method: string, url: string, data: string) => {
                request = JSON.parse(data);
                return [200, {
                    changes: [
                        {
                            type: expectedChangeType,
                            id: expectedChangeId,
                            version: expectedVersion
                        }
                    ]
                }];
            });

            streamsCommunication.getChanges(requestedVersion).then((updates: IUpdate[]) => {
                expect(request.version).toBe(requestedVersion);
                expect(request.command).toBe(Constants.COMMAND_CHANGES);
                expect(updates.length).toBe(1);
                expect(updates[0].type).toBe(expectedChangeType);
                expect(updates[0].id).toBe(expectedChangeId);
                expect(updates[0].version).toBe(expectedVersion);
                done();
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
