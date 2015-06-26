"use strict";
class WebRTCCall extends WebRTC{
  constructor(Config, Constraints){
    super(Config, Constraints);
    let Me = this;
    Me.MediaStatus = false;
    Me.MediaStream = null;
    this.on('icecandidate', function(Event){
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
  Call(Audio, Video){
    let Me = this;
    return new Promise(function(Resolve, Reject){
      let MediaPromise;
      if(Me.MediaStatus){
        MediaPromise = Promise.resolve(Me.MediaStream);
      } else {
        MediaPromise = Me.addMedia({audio: Boolean(Audio), video: Boolean(Video)});
      }
      MediaPromise.then(function(Stream){
        Me.createOffer().then(function(Offer){
          Offer = Offer.toJSON();
          Offer.Audio = Audio;
          Offer.Video = Video;
          Resolve({Offer: Offer, Stream: Stream});
        }, Reject);
      }, Reject);
    });
  }
  GotCandidate(Message){
    if(this.MediaStatus)
      this.addCandidate(new RTCIceCandidate({sdpMLineIndex: Message.label,candidate: Message.candidate}));
  }
  GotOffer(Offer){
    let Me = this;
    return new Promise(function(Resolve, Reject){
      let MediaPromise;
      if(Me.MediaStatus){
        MediaPromise = Promise.resolve(Me.MediaStream);
      } else {
        MediaPromise = Me.addMedia({audio: Boolean(Offer.Audio), video: Boolean(Offer.Video)});
      }
      MediaPromise.then(function(Stream){
        Me.setRemote(Offer).then(function(){
          Me.createAnswer().then(function(Answer){
            Resolve({Answer: Answer, Stream: Stream});
          });
        });
      }, Reject);
    });
  }
  addMedia(Constraints){
    let DeSuper = super.addMedia.bind(this);
    let Me = this;
    return new Promise(function(Resolve, Reject){
      DeSuper(Constraints).then(function(Stream){
        Me.MediaStream = Stream;
        Me.MediaStatus = true;
        Resolve(Stream);
      }, Reject);
    });
  }
}