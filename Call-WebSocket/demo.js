"use strict";

document.addEventListener('DOMContentLoaded', function(){
  let Socket = new WebSocket("ws://localhost:9854");
  let Connection = new WebRTCCall();
  /** <Custom Events Emulation> **/
  let Events = new EventEmitter();
  Socket.sendJSON = function(Data){
    Socket.send(JSON.stringify(Data));
  };
  Socket.addEventListener('message', function(Message){
    Message = JSON.parse(Message.data);
    Events.emit(Message.type, Message);
  });
  /** </Custom Events Emulation> **/


  /** <Communication Methods> **/
  Connection.on('addstream', function(Event){
    addVideo(Event.stream);
  });
  Events.on('Candidate', Connection.OnCandidate.bind(Connection));
  Connection.on('candidate', Socket.sendJSON);
  /** </Communication Methods> **/

  // Accept Call
  Events.on('Offer', function(Message){
    Connection.OnOffer(Message.Offer).then(function(Info){
      Socket.sendJSON({type: 'Answer', Answer: Info.Answer});
      addVideo(Info.Stream);
    });
  });

  // Request Call
  Events.on('Answer', function(Message){
    Connection.setRemote(Message.Answer);
  });
  window.Call = function(){
    Connection.Call(true, true).then(function(Info){
      console.log(Info);
      addVideo(Info.Stream);
      Socket.sendJSON({type: 'Offer', Offer: Info.Offer});
    });
  };
  // Helpers
  window.addVideo = function(Source){
    var Video = document.createElement('video');
    Video.src = URL.createObjectURL(Source);
    document.body.appendChild(Video);
    Video.play();
  }
});
