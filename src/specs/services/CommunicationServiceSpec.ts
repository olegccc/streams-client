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

    it('should handle \'ids\' command', (done) => {
        angular.mock.inject((streamsCommunication: ICommunicationService, $httpBackend: angular.IHttpBackendService) => {
            var request: IRequest;
            $httpBackend.whenPOST('/' + connectionPath).respond((method, url, data: string) => {
                request = JSON.parse(data);
                return [200, { ids: ['id1'] }];
            });

            var expectedFilter = { abc: 'def' };
            var expectedOptions: IQueryOptions = <any> {
                from: 10,
                count: 10
            };
            var expectedNodeId = 'nodeId';

            expect(streamsCommunication).toBeDefined();
            streamsCommunication.getIds(expectedNodeId, expectedFilter, expectedOptions).then((ids: string[]) => {
                expect(ids).toEqual(['id1']);
                expect(request.command).toBe(Constants.COMMAND_IDS);
                expect(request.filter).toEqual(expectedFilter);
                expect(request.options).toEqual(expectedOptions);
                expect(request.nodeId).toBe(expectedNodeId);
                done();
            });
            $httpBackend.flush();
        });
    });
});
