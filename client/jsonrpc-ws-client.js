/**
* JSON RPC library for communicating over websockets in nodejs.
*
* https://github.com/enix/node-jsonrpc-ws
* 
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*
*/

/**
* Opens a JSON rpc client on the given web socket
*
* @name constructor
* @param Socket socket The web socket object to use for communications.
*
* @type void
*/
var rpcClient = function(socket) {
	this.socket = socket;
	this.responseHandlers = {};
	
	var self = this;
	socket.on('message', function(r) { self._handleResponse(JSON.parse(r)) }) 
}

rpcClient.prototype = {

	/**
	 * Calls a remote function
	 *
	 * @name call
	 * @param String name The name of the remote function to call
	 * @optional Object param The method parameters
	 * @optional Function callback The callback to execute when the result comes in
	 *
	 * @example 
	 *    rpcClient.call('add', 20, 5, function(resp) { console.log(resp.result) });
	 *
     * @result Call the remote function 'add(20,5)' and prints the result
	 *
	 * @type void
	 */			
	call: function() {

	    var params = Array.prototype.slice.call(arguments),
	        method = params.length && params.shift(),
	        callback = params.length &&
	            typeof params[params.length-1] =="function" &&
	                params.pop(),
	        id = callback? new Date().getTime() : null,
	        req = {
	            method: method,
	            params: params,
	            id: id
	        }
	
	    if(!method)
	        return false;

		// store the callback if needed
		// schedule a timeout of 5 seconds to prevent memory leaks and cleanup
		if(req.id) {
			this.responseHandlers[cmd.id] = callback
			var self = this;
			setTimeout(function(){
				var idx = self.responseHandlers.indexOf(5);
				 if(idx!=-1) self.responseHandlers.splice(idx, 1)
			}, 5000)
		}
		
		this.socket.send( JSON.stringify(cmd) )
	},

	_handleResponse: function(message){
		if(message.id == null || this.responseHandlers[message.id] == null) return;
		this.responseHandlers[message.id].callback(message);
	}
};
