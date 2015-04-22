"use strict";

document.addEventListener('DOMContentLoaded', function(){
  let Socket = new WebSocket("ws://localhost:9854");
  let Connection = new WebRTC();
  let Events = new EventEmitter();

  Connection.on('addstream', function(Event){
    let RemoteVideo = document.createElement('video');
    RemoteVideo.src = URL.createObjectURL(Event.stream);
    document.body.appendChild(RemoteVideo);
    RemoteVideo.play();
  });
  Connection.on('icecandidate', function(Event){
    if(Event.candidate){
      Socket.sendJSON({
        Type: 'Candidate',
        label: Event.candidate.sdpMLineIndex,
        id: Event.candidate.sdpMid,
        candidate: Event.candidate.candidate
      });
    }
  });


  Connection.addMedia({audio: true, video: true}).then(function(Stream){
    let LocalVideo = document.createElement('video');
    LocalVideo.src = URL.createObjectURL(Stream);
    document.body.appendChild(LocalVideo);
    LocalVideo.play();
  }).catch(function(e){
    console.log(e);
    console.log("You denied the stream access");
  });

  window.Call = function(){
    console.log("I am the Hostinator");
    Connection.createOffer().then(function(Offer){
      Socket.sendJSON({Type: 'Offer', Offer: Offer.toJSON()});
      Events.once('Answer', function(Message){
        Connection.setRemote(Message.Answer);
      });
    });
  };

  Events.on('Offer', function(Message){
    console.log("I am the Connectinator");
    let Offer = Message.Offer;
    Connection.setRemote(Offer).then(Connection.createAnswer.bind(Connection)).then(function(Answer){
      Socket.sendJSON({Type: 'Answer', Answer: Answer});
    });
  });
  Events.on('Candidate', function(Message){
    Connection.addCandidate(new RTCIceCandidate({sdpMLineIndex: Message.label,candidate: Message.candidate}));
  });

  Socket.sendJSON = function(Data){
    console.log("SENDING: " + Data.Type);
    Socket.send(JSON.stringify(Data));
  };
  Socket.addEventListener('message', function(Message){
    Message = JSON.parse(Message.data);
    console.log("RECIEVED: " + Message.Type);
    Events.emit(Message.Type, Message);
  });
});
