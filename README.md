node-jsonrpc-ws
================

This module makes it easy to serve JSON-RPC (v1.0) style remote procedures over web sockets.

JSON-RPC is an extremely simple communication protocol intended for remote method invocation by a client (for example a browser) and the host (the server).

The request / response sequence looks something like this:

	request:  {"id":1302294821045,"method":"rpc.add","params":[10,20]}
	response: {"id":1302294821045,"result":30,"error":null}

Installation
------------

Simply use npm to install it

  npm install jsonrpc-ws

or download the code from the repo and stick it in your project folder.

Exposing server functions
-------------------------

The library supports two ways of exposing remote functions. Either a single function or exposing all functions in a 'module'. 

*Module example script*
	
	var TestModule = {
   		add: function (a, b) { return a + b }
	}
	
	rpc.exposeModule('rpc', TestModule);

This exposes the given module with the given method prefix. So in this case the client can call 'rpc.add(10,20)' and the result will be 30.

*Function example script*

   function timesTen(a) { return a * 10 }

   rpc.expose('add', add);

This exposes the given function under the given name . So in this case the client can call 'rpc.timesTen(2)' and the result will be 20.

Server side node.JS
-------------------

The server side script is fairly straight forward.  

* create a web sockets server, using socket.io
* define the function to be exported
* start the RPC server with the given socket.

*Please note* JSON RPC message are not tagged in anyway, so each message that it received it processed like an RPC call. 
If you're sticking solely to RPC messages this isn't a problem, but it could interfere with other messages types. 
Luckily there are plenty of way to solve this. The most easiest being opening up a separate socket for RPC communications to filtering 
incoming messages before dispatching them. 

	var http = require('http'),  
	    io = require('socket.io'),
		rpc = require('./jsonrpc-ws.js')

	/**
	 * Simple module definition
	 */
	var RpcFunctions = {
		add: function (a, b) {
			var r = a + b;
			return r;
		},
	};

	// expose our module
	rpc.exposeModule('rpc', RpcFunctions);

	server = http.createServer(function(req, res){ 
	 res.writeHead(200, {'Content-Type': 'text/html'}); 
	 res.end('<h1>Hello world</h1>'); 
	});

	var socket = io.listen(server); 
	rpc.listen(socket);

	// wait for it!
	server.listen(8080);

Client side javascript
----------------------

	$(document).ready(function() {
		 var socket = new io.Socket("localhost",{
				port: 8080
		 }); 

		 socket.on('connect', function(){ 
			var rpc = new rpcClient(socket);
			rpc.call('rpc.add', 10, 20, function(resp){ console.log("result: " +  resp.result) )});
	 	 });

		 socket.on('message', function(r){ console.log("response: " + r) }) 

		 socket.connect();
	});

A-sync operations
-----------------

The message ID is used to match request and response messages. Since Web sockets are one way by nature the client has to store 
any callbacks that need to be executed when the result comes in. This also makes the client responsible for cleaning up is for 
some reason the servers fails to make it back.
