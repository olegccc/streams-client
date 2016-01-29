var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var streamsServerRoot = '../../../../../streams-server-node/build/';

var StreamHandler = require(streamsServerRoot + 'modules/StreamHandler').StreamHandler;
var HashDataChannelFactory = require(streamsServerRoot + 'structure/HashDataChannelFactory').HashDataChannelFactory;
var NedbDatabaseDataChannel = require(streamsServerRoot + 'dataChannels/NedbDatabaseDataChannel').NedbDatabaseDataChannel;

function createConfiguration() {
    return {
        access: {
            read: ['read'],
            write: ['read', 'write']
        }
    };
}

var dataChannel = new NedbDatabaseDataChannel();
var streamHandler = new StreamHandler(null, new HashDataChannelFactory({test: dataChannel}), createConfiguration());

app.use(bodyParser.json());

app.use('/streams', function(request, response) {

    console.log('request: ', request.body);

    streamHandler.processRequests(request.body, null, function(error, handlerResponse) {

        console.log('response: ', handlerResponse);
        console.log('error: ', error);

        response.setHeader('Content-Type', 'application/json');
        response.send(JSON.stringify(handlerResponse));
    });
});

app.use(function(req, res, next) {
    console.log('request: ' + req.url);
    return next();
});

app.use(express.static("build/specs/functional/simple"));
app.use("/bower_components/", express.static("bower_components"));
app.use(express.static("build"));

var server;

module.exports = {
    initialize: function() {
        console.log('initialize');
        server = app.listen(1000);
    },
    finalize: function() {
        console.log('finalize');
        server.close();
    }
};
