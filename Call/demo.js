"use strict";

document.addEventListener('DOMContentLoaded', function(){
  let Socket = new WebSocketP("ws://localhost:9854");
  let Call = new WebRTCCall();

  Call.on('addstream', function(Event){
    addVideo(Event.stream);
  });

  Socket.on('Candidate', function(Candidate){
    Call.OnCandidate(Candidate)
  });
  Call.on('candidate', function(Info){
    Socket.Send(Info.type, Info)
  });

  // Accept Call
  Socket.on('Offer', function(Message){
    Call.OnOffer(Message).then(function(Info){
      Socket.Send('Answer', Info.Answer)
      addVideo(Info.Stream);
    });
  });

  // Request Call
  Socket.on('Answer', function(Answer){
    Call.setRemote(Answer);
  });
  window.Call = function(){
    Call.Call(true, true).then(function(Info){
      addVideo(Info.Stream);
      Socket.Send('Offer', Info.Offer)
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
