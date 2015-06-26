"use strict";

class WebRTC extends EventEmitter{
  // Prototype Stuff
  constructor(Config, Constraints){
    super();

    Config = Config || {
      iceServers :[{'url': WebRTC.IsMozilla ? 'stun:23.21.150.121' : 'stun:stun.l.google.com:19302'}]
    };
    Constraints = Constraints || {
      optional: [{DtlsSrtpKeyAgreement: true},{RtpDataChannels: true}]
    };
    this.ID = (Math.random().toString(36)+'00000000000000000').slice(2, 7 + 2);
    this.Connection = new (window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection)(Config, Constraints);

    this.Connection.addEventListener('addstream', this.emit.bind(this, 'addstream'));
    this.Connection.addEventListener('icecandidate', this.emit.bind(this, 'icecandidate'));
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
        "mandatory": {
          "OfferToReceiveAudio": Me.MediaConstraints.audio || false,
          "OfferToReceiveVideo": Me.MediaConstraints.video ? true : false
        }
      });
    });
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