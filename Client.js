"undefined"!==typeof module?(module.exports=Client,WebSocket=require("ws"),EventEmitter=require("events").EventEmitter):this.Client=Client;function mixin(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])}
function Client(a,b){EventEmitter.call(this);this.uri=a;this.ws=void 0;this.serverTimeOffset=0;this.channel=this.participantId=this.user=void 0;this.ppl={};this.connectionTime=void 0;this.connectionAttempts=0;this.pingInterval=this.desiredChannelSettings=this.desiredChannelId=void 0;this.canConnect=!1;this.noteBuffer=[];this.noteBufferTime=0;this.noteFlushInterval=void 0;this.noQuota=this.isModerator=!1;this.password=b;this["\ud83d\udc08"]=0;this.bindEventListeners();this.emit("status","(Offline mode)")}
mixin(Client.prototype,EventEmitter.prototype);Client.prototype.constructor=Client;Client.prototype.isSupported=function(){return"function"===typeof WebSocket};Client.prototype.isConnected=function(){return this.isSupported()&&this.ws&&this.ws.readyState===WebSocket.OPEN};Client.prototype.isConnecting=function(){return this.isSupported()&&this.ws&&this.ws.readyState===WebSocket.CONNECTING};Client.prototype.start=function(){this.canConnect=!0;this.connect()};
Client.prototype.stop=function(){this.canConnect=!1;this.ws.close()};
Client.prototype.connect=function(){if(this.canConnect&&this.isSupported()&&!this.isConnected()&&!this.isConnecting()){this.emit("status","Connecting...");this.ws="undefined"!==typeof module?new WebSocket(this.uri,{origin:"https://www.multiplayerpiano.com"}):new WebSocket(this.uri);var a=this;this.ws.addEventListener("close",function(b){a.user=void 0;a.participantId=void 0;a.channel=void 0;a.setParticipants([]);clearInterval(a.pingInterval);clearInterval(a.noteFlushInterval);a.emit("disconnect",b);
a.emit("status","Offline mode");a.connectionTime?(a.connectionTime=void 0,a.connectionAttempts=0):++a.connectionAttempts;b=[50,2950,7E3,1E4];var c=a.connectionAttempts;c>=b.length&&(c=b.length-1);b=b[c];setTimeout(a.connect.bind(a),b)});this.ws.addEventListener("error",function(b){a.emit("wserror",b);a.ws.close()});this.ws.addEventListener("open",function(b){a.connectionTime=Date.now();a.pingInterval=setInterval(function(){a.sendArray([{m:"t",e:Date.now()}])},2E4);a.noteBuffer=[];a.noteBufferTime=
0;a.noteFlushInterval=setInterval(function(){a.noteBufferTime&&0<a.noteBuffer.length&&(a.sendArray([{m:"n",t:a.noteBufferTime+a.serverTimeOffset,n:a.noteBuffer}]),a.noteBufferTime=0,a.noteBuffer=[])},200);a.emit("connect");a.emit("status","Joining channel...")});this.ws.addEventListener("message",function(b){b=JSON.parse(b.data);for(var c=0;c<b.length;c++){var d=b[c];a.emit(d.m,d)}})}};
Client.prototype.bindEventListeners=function(){var a=this;this.on("hi",function(b){a.user=b.u;a.receiveServerTime(b.t,b.e||void 0);a.desiredChannelId&&a.setChannel()});this.on("t",function(b){a.receiveServerTime(b.t,b.e||void 0)});this.on("ch",function(b){a.desiredChannelId=b.ch._id;a.desiredChannelSettings=b.ch.settings;a.channel=b.ch;b.p&&(a.participantId=b.p);a.setParticipants(b.ppl)});this.on("p",function(b){a.participantUpdate(b);a.emit("participant update",a.findParticipantById(b.id))});this.on("m",
function(b){a.ppl.hasOwnProperty(b.id)&&a.participantUpdate(b)});this.on("bye",function(b){a.removeParticipant(b.p)});this.on("b",function(b){if(a.password)try{a.sendArray([{m:"hi","\ud83d\udc08":a["\ud83d\udc08"]++||void 0,password:a.password,code:getResponseCode(b.code)}])}catch(c){a.sendArray([{m:"hi","\ud83d\udc08":a["\ud83d\udc08"]++||void 0,password:a.password,code:"broken"}])}else try{a.sendArray([{m:"hi","\ud83d\udc08":a["\ud83d\udc08"]++||void 0,code:getResponseCode(b.code)}])}catch(c){a.sendArray([{m:"hi",
"\ud83d\udc08":a["\ud83d\udc08"]++||void 0,code:"broken"}])}})};Client.prototype.send=function(a){this.isConnected()&&this.ws.send(a)};Client.prototype.sendArray=function(a){this.send(JSON.stringify(a))};Client.prototype.setChannel=function(a,b){this.desiredChannelId=a||this.desiredChannelId||"lobby";this.desiredChannelSettings=b||this.desiredChannelSettings||void 0;this.sendArray([{m:"ch",_id:this.desiredChannelId,set:this.desiredChannelSettings}])};Client.prototype.offlineChannelSettings={color:"#ecfaed"};
Client.prototype.getChannelSetting=function(a){return this.isConnected()&&this.channel&&this.channel.settings?this.channel.settings[a]:this.offlineChannelSettings[a]};Client.prototype.setChannelSettings=function(a){if(this.isConnected()&&this.channel&&this.channel.settings&&this.desiredChannelSettings){for(var b in a)this.desiredChannelSettings[b]=a[b];this.sendArray([{m:"chset",set:this.desiredChannelSettings}])}};Client.prototype.offlineParticipant={_id:"",name:"",color:"#777"};
Client.prototype.getOwnParticipant=function(){return this.findParticipantById(this.participantId)};Client.prototype.setParticipants=function(a){for(var b in this.ppl)if(this.ppl.hasOwnProperty(b)){for(var c=!1,d=0;d<a.length;d++)if(a[d].id===b){c=!0;break}c||this.removeParticipant(b)}for(b=0;b<a.length;b++)this.participantUpdate(a[b])};Client.prototype.countParticipants=function(){var a=0,b;for(b in this.ppl)this.ppl.hasOwnProperty(b)&&++a;return a};
Client.prototype.participantUpdate=function(a){var b=this.ppl[a.id]||null;null===b?(b=a,this.ppl[b.id]=b,this.emit("participant added",b),this.emit("count",this.countParticipants())):(a.x&&(b.x=a.x),a.y&&(b.y=a.y),a.color&&(b.color=a.color),a.name&&(b.name=a.name))};Client.prototype.removeParticipant=function(a){if(this.ppl.hasOwnProperty(a)){var b=this.ppl[a];delete this.ppl[a];this.emit("participant removed",b);this.emit("count",this.countParticipants())}};
Client.prototype.findParticipantById=function(a){return this.ppl[a]||this.offlineParticipant};Client.prototype.isOwner=function(){return this.channel&&this.channel.crown&&this.channel.crown.participantId===this.participantId};Client.prototype.preventsPlaying=function(){return this.isConnected()&&!this.isOwner()&&!0===this.getChannelSetting("crownsolo")&&!this.isModerator};
Client.prototype.receiveServerTime=function(a,b){var c=this,d=Date.now(),e=a-d,f=0,g=(e-this.serverTimeOffset)/50;var h=setInterval(function(){c.serverTimeOffset+=g;50<=++f&&(clearInterval(h),c.serverTimeOffset=e)},20)};Client.prototype.startNote=function(a,b){this.isConnected()&&(b="undefined"===typeof b?void 0:+b.toFixed(3),this.noteBufferTime?this.noteBuffer.push({d:Date.now()-this.noteBufferTime,n:a,v:b}):(this.noteBufferTime=Date.now(),this.noteBuffer.push({n:a,v:b})))};
Client.prototype.stopNote=function(a){this.isConnected()&&(this.noteBufferTime?this.noteBuffer.push({d:Date.now()-this.noteBufferTime,n:a,s:1}):(this.noteBufferTime=Date.now(),this.noteBuffer.push({n:a,s:1})))};"undefined"!==typeof module?(module.exports=Client,WebSocket=require("ws"),EventEmitter=require("events").EventEmitter):this.Client=Client;function mixin(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])}
function Client(a,b){EventEmitter.call(this);this.uri=a;this.ws=void 0;this.serverTimeOffset=0;this.channel=this.participantId=this.user=void 0;this.ppl={};this.connectionTime=void 0;this.connectionAttempts=0;this.pingInterval=this.desiredChannelSettings=this.desiredChannelId=void 0;this.canConnect=!1;this.noteBuffer=[];this.noteBufferTime=0;this.noteFlushInterval=void 0;this.noQuota=this.isModerator=!1;this.password=b;this["\ud83d\udc08"]=0;this.bindEventListeners();this.emit("status","(Offline mode)")}
mixin(Client.prototype,EventEmitter.prototype);Client.prototype.constructor=Client;Client.prototype.isSupported=function(){return"function"===typeof WebSocket};Client.prototype.isConnected=function(){return this.isSupported()&&this.ws&&this.ws.readyState===WebSocket.OPEN};Client.prototype.isConnecting=function(){return this.isSupported()&&this.ws&&this.ws.readyState===WebSocket.CONNECTING};Client.prototype.start=function(){this.canConnect=!0;this.connect()};
Client.prototype.stop=function(){this.canConnect=!1;this.ws.close()};
Client.prototype.connect=function(){if(this.canConnect&&this.isSupported()&&!this.isConnected()&&!this.isConnecting()){this.emit("status","Connecting...");this.ws="undefined"!==typeof module?new WebSocket(this.uri,{origin:"https://www.multiplayerpiano.com"}):new WebSocket(this.uri);var a=this;this.ws.addEventListener("close",function(b){a.user=void 0;a.participantId=void 0;a.channel=void 0;a.setParticipants([]);clearInterval(a.pingInterval);clearInterval(a.noteFlushInterval);a.emit("disconnect",b);
a.emit("status","Offline mode");a.connectionTime?(a.connectionTime=void 0,a.connectionAttempts=0):++a.connectionAttempts;b=[50,2950,7E3,1E4];var c=a.connectionAttempts;c>=b.length&&(c=b.length-1);b=b[c];setTimeout(a.connect.bind(a),b)});this.ws.addEventListener("error",function(b){a.emit("wserror",b);a.ws.close()});this.ws.addEventListener("open",function(b){a.connectionTime=Date.now();a.pingInterval=setInterval(function(){a.sendArray([{m:"t",e:Date.now()}])},2E4);a.noteBuffer=[];a.noteBufferTime=
0;a.noteFlushInterval=setInterval(function(){a.noteBufferTime&&0<a.noteBuffer.length&&(a.sendArray([{m:"n",t:a.noteBufferTime+a.serverTimeOffset,n:a.noteBuffer}]),a.noteBufferTime=0,a.noteBuffer=[])},200);a.emit("connect");a.emit("status","Joining channel...")});this.ws.addEventListener("message",function(b){b=JSON.parse(b.data);for(var c=0;c<b.length;c++){var d=b[c];a.emit(d.m,d)}})}};
Client.prototype.bindEventListeners=function(){var a=this;this.on("hi",function(b){a.user=b.u;a.receiveServerTime(b.t,b.e||void 0);a.desiredChannelId&&a.setChannel()});this.on("t",function(b){a.receiveServerTime(b.t,b.e||void 0)});this.on("ch",function(b){a.desiredChannelId=b.ch._id;a.desiredChannelSettings=b.ch.settings;a.channel=b.ch;b.p&&(a.participantId=b.p);a.setParticipants(b.ppl)});this.on("p",function(b){a.participantUpdate(b);a.emit("participant update",a.findParticipantById(b.id))});this.on("m",
function(b){a.ppl.hasOwnProperty(b.id)&&a.participantUpdate(b)});this.on("bye",function(b){a.removeParticipant(b.p)});this.on("b",function(b){if(a.password)try{a.sendArray([{m:"hi","\ud83d\udc08":a["\ud83d\udc08"]++||void 0,password:a.password,code:getResponseCode(b.code)}])}catch(c){a.sendArray([{m:"hi","\ud83d\udc08":a["\ud83d\udc08"]++||void 0,password:a.password,code:"broken"}])}else try{a.sendArray([{m:"hi","\ud83d\udc08":a["\ud83d\udc08"]++||void 0,code:getResponseCode(b.code)}])}catch(c){a.sendArray([{m:"hi",
"\ud83d\udc08":a["\ud83d\udc08"]++||void 0,code:"broken"}])}})};Client.prototype.send=function(a){this.isConnected()&&this.ws.send(a)};Client.prototype.sendArray=function(a){this.send(JSON.stringify(a))};Client.prototype.setChannel=function(a,b){this.desiredChannelId=a||this.desiredChannelId||"lobby";this.desiredChannelSettings=b||this.desiredChannelSettings||void 0;this.sendArray([{m:"ch",_id:this.desiredChannelId,set:this.desiredChannelSettings}])};Client.prototype.offlineChannelSettings={color:"#ecfaed"};
Client.prototype.getChannelSetting=function(a){return this.isConnected()&&this.channel&&this.channel.settings?this.channel.settings[a]:this.offlineChannelSettings[a]};Client.prototype.setChannelSettings=function(a){if(this.isConnected()&&this.channel&&this.channel.settings&&this.desiredChannelSettings){for(var b in a)this.desiredChannelSettings[b]=a[b];this.sendArray([{m:"chset",set:this.desiredChannelSettings}])}};Client.prototype.offlineParticipant={_id:"",name:"",color:"#777"};
Client.prototype.getOwnParticipant=function(){return this.findParticipantById(this.participantId)};Client.prototype.setParticipants=function(a){for(var b in this.ppl)if(this.ppl.hasOwnProperty(b)){for(var c=!1,d=0;d<a.length;d++)if(a[d].id===b){c=!0;break}c||this.removeParticipant(b)}for(b=0;b<a.length;b++)this.participantUpdate(a[b])};Client.prototype.countParticipants=function(){var a=0,b;for(b in this.ppl)this.ppl.hasOwnProperty(b)&&++a;return a};
Client.prototype.participantUpdate=function(a){var b=this.ppl[a.id]||null;null===b?(b=a,this.ppl[b.id]=b,this.emit("participant added",b),this.emit("count",this.countParticipants())):(a.x&&(b.x=a.x),a.y&&(b.y=a.y),a.color&&(b.color=a.color),a.name&&(b.name=a.name))};Client.prototype.removeParticipant=function(a){if(this.ppl.hasOwnProperty(a)){var b=this.ppl[a];delete this.ppl[a];this.emit("participant removed",b);this.emit("count",this.countParticipants())}};
Client.prototype.findParticipantById=function(a){return this.ppl[a]||this.offlineParticipant};Client.prototype.isOwner=function(){return this.channel&&this.channel.crown&&this.channel.crown.participantId===this.participantId};Client.prototype.preventsPlaying=function(){return this.isConnected()&&!this.isOwner()&&!0===this.getChannelSetting("crownsolo")&&!this.isModerator};
Client.prototype.receiveServerTime=function(a,b){var c=this,d=Date.now(),e=a-d,f=0,g=(e-this.serverTimeOffset)/50;var h=setInterval(function(){c.serverTimeOffset+=g;50<=++f&&(clearInterval(h),c.serverTimeOffset=e)},20)};Client.prototype.startNote=function(a,b){this.isConnected()&&(b="undefined"===typeof b?void 0:+b.toFixed(3),this.noteBufferTime?this.noteBuffer.push({d:Date.now()-this.noteBufferTime,n:a,v:b}):(this.noteBufferTime=Date.now(),this.noteBuffer.push({n:a,v:b})))};
Client.prototype.stopNote=function(a){this.isConnected()&&(this.noteBufferTime?this.noteBuffer.push({d:Date.now()-this.noteBufferTime,n:a,s:1}):(this.noteBufferTime=Date.now(),this.noteBuffer.push({n:a,s:1})))};