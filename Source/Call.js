"use strict";
class WebRTCCall extends WebRTC{
  constructor(Config, Constraints){
    super(Config, Constraints);
    let Me = this;
    Me.MediaStatus = false;
    Me.MediaStream = null;
  }
  Call(Audio, Video){
    let Me = this;
    return new Promise(function(Resolve){
      Resolve(Me.MediaStatus ? Me.MediaStream : Me.addMedia({audio: Boolean(Audio), video: Boolean(Video)}))
    })
    .then(function(LocalStream){
      return Me.createOffer().then(function(Offer){
        return {Offer, LocalStream}
      })
    })
    .then(function(Info){
      Info.Offer = Info.Offer.toJSON();
      Info.Offer.Audio = Audio;
      Info.Offer.Video = Video;
      return {Offer: Info.Offer, LocalStream: Info.LocalStream}
    })
  }
  gotCandidate(Message){
    if(this.MediaStatus)
      this.addCandidate(new RTCIceCandidate({sdpMLineIndex: Message.label,candidate: Message.candidate}));
  }
  gotOffer(Offer){
    let Me = this;
    let SuperGotOffer = super.gotOffer.bind(this)
    return new Promise(function(Resolve){
      Resolve(Me.MediaStatus ? Me.MediaStream : Me.addMedia({audio: Boolean(Offer.Audio), video: Boolean(Offer.Video)}))
    })
    .then(function(LocalStream){
      return SuperGotOffer(Offer).then(function(Answer){
        return {LocalStream, Answer}
      })
    })
  }
  addMedia(Constraints){
    let SuperAddMedia = super.addMedia.bind(this);
    let Me = this;
    return new Promise(function(Resolve, Reject){
      SuperAddMedia(Constraints).then(function(Stream){
        Me.MediaStream = Stream;
        Me.MediaStatus = true;
        Resolve(Stream);
      }, Reject);
    });
  }
}