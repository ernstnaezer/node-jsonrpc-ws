var http = require('http'),  
    io = require('socket.io'),
	rpc = require('jsonrpc-ws')

var RpcFunctions = {
	add: function (a, b) {
		var r = a + b;
		return r;
	},
};

rpc.exposeModule('rpc', RpcFunctions);

server = http.createServer(function(req, res){ 
 res.writeHead(200, {'Content-Type': 'text/html'}); 
 res.end('<h1>Hello world</h1>'); 
});

var socket = io.listen(server); 
rpc.listen(socket);

server.listen(8080);
