WebRTC-Experiments
=========

A collection of WebRTC Experiments that I do in my free time. This repo contains some really useful JS classes that can make working with WebRTC a piece of chocolate cake.

__Note:__ This project uses [Le-Emitter][Le-Emitter] as it's Event Emitter.

#### API
```js
// Main
type MediaConstraints = shape(audio => bool, video => bool|VideoInfo);
class WebRTC extends EventEmitter{
  Connection:PeerConnection;
  ID:String;
  MediaConstraints:MediaConstraints;
  constructor(PC_Config:Object = default, PC_Constraints:Object = default); // Initializes the Peer Connection
  addMedia(MediaConstraints:MediaConstaints = default):Promise<Stream>;
  createOffer():Promise<Offer>;
  setRemote(Offer):Promise<void>;
  createAnswer():Promise<Answer>;
  addCandidate(Candidate:ICECandidate):void;
}
Events: addstream, addcandidate
```
```js
// WebRTCCall
class WebRTCCall extends WebRTC{
  Call(Audio:Boolean, Video:Boolean):Promise<{Offer, Stream}>;
  OnCandidate(Message:Object):void;
  OnOffer(Offer:Objcet):Promise<{Answer, Stream}>;
  addMedia(Constraints:MediaConstraints):Promise<Stream>;
}
Events: candidate
```

#### How It Works
- For Caller
  - A Peer Connection is Created
  - Media Resources are Requested from the User
  - An Offer is Created
  - Offer is sent to the User
  - Response is received from the Callee
- For Callee
 - A Peer Connection is Created
 - Media Resources are Requested from the User
 - Offer is received from the Caller
 - an Answer is generated
 - Answer is given to the Caller

#### Available Signaling Demos
 - WebSocket (You can easily port it to Socket.io)

#### LICENSE
This project is licensed under the terms of MIT License.
[Le-Emitter]:https://github.com/steelbrain/Le-Emitter