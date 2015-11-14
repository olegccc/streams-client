var connect = require('connect');
var bodyParser = require('body-parser');
var http = require('http');
var st = require('st');
var app = connect();
var streamHandler = require('../../../../../streams-server-node/build/modules/StreamHandler');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use('/streams', function(request, response) {
    streamHandler.processRequest(request.body, null, function(error, handlerResponse) {
        response.setHeader('Content-Type', 'application/json');
        response.send(JSON.stringify(handlerResponse));
    });
});

app.use(st(process.cwd()));

var server = http.createServer(app);

module.exports = {
    initialize: function() {
        console.log('initialize');
        server.listen(1000);
    },
    finalize: function() {
        console.log('finalize');
        server.close();
    }
};
