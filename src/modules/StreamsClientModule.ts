///<reference path="../interfaces/Constants.ts" />

var streamsClientModule = angular.module('streams-client', [
]);

streamsClientModule.constant(Constants.CONFIGURATION, <IConfiguration> {
    ConnectionPath: "streams"
});
