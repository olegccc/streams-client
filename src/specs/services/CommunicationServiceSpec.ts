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

            streamsCommunication.createRecord(expectedNodeId, <any>{
                field1: 'field1_1'
            }).then((record: IRecord) => {
                expect(record.id).toBe(expectedId);
                expect(record['field1']).toBe(expectedFieldValue);
                done();
            });

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
