/// <reference path="../../../src/services/DataStreamService.ts" />

describe('Data Stream Service', () => {
    it('should be defined', () => {
        var service: IDataStreamService = new DataStreamService();
        expect(service).toBeDefined();
    });
});
