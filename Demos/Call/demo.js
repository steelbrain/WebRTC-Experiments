"use strict";

document.addEventListener('DOMContentLoaded', function(){
  let Socket = new WebSocketP("ws://localhost:9854");
  let Call = new WebRTCCall();

  Call.on('addstream', function(Event){
    showVideo(Event.stream);
  });

  Socket.on('Candidate', function(Candidate){
    Call.gotCandidate(Candidate)
  });
  Call.on('candidate', function(Info){
    Socket.Send(Info.type, Info)
  });

  // Accept Call
  Socket.on('Offer', function(Message){
    Call.gotOffer(Message).then(function(Info){
      console.log(Info);
      Socket.Send('Answer', Info.Answer)
      showVideo(Info.LocalStream);
    });
  });

  // On Call Answered
  Socket.on('Answer', function(Answer){
    Call.setRemote(Answer);
  });
  window.Call = function(){
    Call.Call(true, true).then(function(Info){
      showVideo(Info.LocalStream);
      Socket.Send('Offer', Info.Offer)
    });
  };
  // Helpers
  window.showVideo = function(Source){
    var Video = document.createElement('video');
    Video.src = URL.createObjectURL(Source);
    document.body.appendChild(Video);
    Video.play();
  }
});
