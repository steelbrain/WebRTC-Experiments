"use strict";

class WebRTC extends EventEmitter{
  // Prototype Stuff
  constructor(Config, Constraints){
    super();
    let Me = this

    Config = Config || {
      iceServers :[{'url': WebRTC.IsMozilla ? 'stun:23.21.150.121' : 'stun:stun.l.google.com:19302'}]
    };
    Constraints = Constraints || {
      optional: [{DtlsSrtpKeyAgreement: true},{RtpDataChannels: true}]
    };
    this.Connection = new (window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection)(Config, Constraints);

    this.Connection.addEventListener('addstream', this.emit.bind(this, 'addstream'));
    this.Connection.addEventListener('icecandidate', function(Event){
      if(Event.candidate){
        Me.emit('candidate', {
          type: 'Candidate',
          label: Event.candidate.sdpMLineIndex,
          id: Event.candidate.sdpMid,
          candidate: Event.candidate.candidate
        });
      }
    });
  }
  addMedia(Constraints){
    this.MediaConstraints = Constraints || {
      audio: true, video: true
    };
    let Me  = this;
    return new Promise(function(Resolve, Reject){
      (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).call(navigator, Me.MediaConstraints, function(Stream){
        Me.Connection.addStream(Stream);
        Resolve(Stream);
      }, Reject)
    });
  }
  createOffer(){
    let Me = this;
    return new Promise(function(Resolve, Reject){
      Me.Connection.createOffer(function(Offer){
        Me.Connection.setLocalDescription(Offer);
        Resolve(Offer);
      }, Reject, {
        mandatory: {
          OfferToReceiveAudio: Boolean(Me.MediaConstraints.audio),
          OfferToReceiveVideo: Boolean(Me.MediaConstraints.video)
        }
      });
    });
  }
  gotOffer(Offer){
    let Me = this
    return this.setRemote(Offer).then(function(){
        return Me.createAnswer()
      })
  }
  setRemote(Offer){
    let Me = this;
    return new Promise(function(Resolve, Reject){
      Me.Connection.setRemoteDescription(new RTCSessionDescription(Offer), Resolve, Reject);
    });
  }
  createAnswer(){
    let Me = this;
    return new Promise(function(Resolve, Reject){
      Me.Connection.createAnswer(function(Answer){
        Me.Connection.setLocalDescription(new RTCSessionDescription(Answer));
        Resolve(Answer);
      }, Reject);
    });
  }
  addCandidate(Candidate){
    this.Connection.addIceCandidate(Candidate);
  }
}
WebRTC.IsMozilla = ("mozGetUserMedia" in navigator);
WebRTC.IsWebkit = ("webkitGetUserMedia" in navigator);