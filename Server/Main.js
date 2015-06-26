

"use strict";
let Socket = new (require('websocket-promise'))({port: 9854});
Socket.on('connection', function(Connection){
  Connection.Broadcast("Connect")
  Connection.on('All', function(Message, Data){
    Connection.Broadcast(Data.SubType, Message)
  })
})