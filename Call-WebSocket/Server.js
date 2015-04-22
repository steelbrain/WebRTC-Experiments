

"use strict";
let Socket = new (require('ws').Server)({port: 9854});
Socket.broadcast = function(Except, data) {
  Socket.clients.forEach(function(client) {
    if(client === Except) return ;
    client.send(data);
  });
};

Socket.on('connection', function(Connection){
  Socket.broadcast(Connection, JSON.stringify({type: 'Connect'}));
  Connection.on('message', function(data){
    Socket.broadcast(Connection, data);
  });
});