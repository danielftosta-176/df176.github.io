function mixin(a,b){for(var d in b)b.hasOwnProperty(d)&&(a[d]=b[d])}function EventEmitter(){this._events={}}EventEmitter.prototype.on=function(a,b){this._events.hasOwnProperty(a)||(this._events[a]=[]);this._events[a].push(b)};EventEmitter.prototype.off=function(a,b){if(this._events.hasOwnProperty(a)){var d=this._events[a].indexOf(b);0>d||this._events[a].splice(d,1)}};
EventEmitter.prototype.emit=function(a){if(this._events.hasOwnProperty(a)){var b=this._events[a].slice(0);if(!(1>b.length))for(var d=Array.prototype.slice.call(arguments,1),f=0;f<b.length;f++)b[f].apply(this,d)}};function hashFnv32a(a,b,d){var f,h=void 0===d?2166136261:d;d=0;for(f=a.length;d<f;d++)h^=a.charCodeAt(d),h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);return b?("0000000"+(h>>>0).toString(16)).substr(-8):h>>>0}function round(a,b,d){return Math.round((a-d)/b)*b+d}
var Knob=function(a,b,d,f,h,t,u){function k(){var e=document.getElementById("tooltip");if(!e){e=document.createElement("div");document.body.appendChild(e);e.id="tooltip";var l=c.canvas.getBoundingClientRect();e.style.left=l.left+"px";e.style.top=l.bottom+"px"}if(e.textContent=c.name)e.textContent+=": ";e.textContent+=c.valueString()+c.unit}function p(){var e=document.getElementById("tooltip");e&&e.parentElement.removeChild(e)}EventEmitter.call(this);this.min=b||0;this.max=d||10;this.step=f||.01;this.value=
h||this.min;this.knobValue=(this.value-this.min)/(this.max-this.min);this.name=t||"";this.unit=u||"";b=f.toString().indexOf(".");-1==b&&(b=f.toString().length-1);this.fixedPoint=f.toString().substr(b).length-1;this.dragY=0;this.mouse_over=!1;this.canvas=a;this.ctx=a.getContext("2d");this.radius=.3333*this.canvas.width;this.baseImage=document.createElement("canvas");this.baseImage.width=a.width;this.baseImage.height=a.height;f=this.baseImage.getContext("2d");f.fillStyle="#444";f.shadowColor="rgba(0, 0, 0, 0.5)";
f.shadowBlur=5;f.shadowOffsetX=.02*this.canvas.width;f.shadowOffsetY=.02*this.canvas.width;f.beginPath();f.arc(this.canvas.width/2,this.canvas.height/2,this.radius,0,2*Math.PI);f.fill();var c=this,m=!1;(function(){function e(g){if(g.screenY!==c.dragY){var n=-(g.screenY-c.dragY),r=.0075;g.ctrlKey&&(r*=.05);c.setKnobValue(c.knobValue+n*r);c.dragY=g.screenY;c.redraw()}g.preventDefault();k()}function l(g){null===g.toElement&&null===g.relatedTarget&&q()}function q(){document.removeEventListener("mousemove",
e);document.removeEventListener("mouseout",l);document.removeEventListener("mouseup",q);c.emit("release",c);m=!1;c.mouse_over||p()}a.addEventListener("mousedown",function(g){var n=c.translateMouseEvent(g);c.contains(n.x,n.y)&&(m=!0,c.dragY=g.screenY,k(),document.addEventListener("mousemove",e),document.addEventListener("mouseout",l),document.addEventListener("mouseup",q))});a.addEventListener("keydown",function(g){38==g.keyCode?(c.setValue(c.value+c.step),k()):40==g.keyCode&&(c.setValue(c.value-c.step),
k())})})();c.canvas.addEventListener("mousemove",function(e){e=c.translateMouseEvent(e);c.contains(e.x,e.y)?(c.mouse_over=!0,k()):(c.mouse_over=!1,m||p())});c.canvas.addEventListener("mouseout",function(e){c.mouse_over=!1;m||p()});this.redraw()};mixin(Knob.prototype,EventEmitter.prototype);
Knob.prototype.redraw=function(){var a=.28*this.canvas.width,b=.03*this.canvas.width;this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.ctx.drawImage(this.baseImage,0,0);var d=this.knobValue;d*=1.6*Math.PI;d+=Math.PI/2;d+=.2*Math.PI;var f=this.canvas.width/2,h=Math.cos(d)*a+f;a=Math.sin(d)*a+f;this.ctx.fillStyle="#fff";this.ctx.beginPath();this.ctx.arc(h,a,b,0,2*Math.PI);this.ctx.fill()};
Knob.prototype.setKnobValue=function(a){0>a?a=0:1<a&&(a=1);this.knobValue=a;this.setValue(a*(this.max-this.min)+this.min)};Knob.prototype.setValue=function(a){a=round(a,this.step,this.min);a<this.min?a=this.min:a>this.max&&(a=this.max);this.value!==a&&(this.value=a,this.knobValue=(a-this.min)/(this.max-this.min),this.redraw(),this.emit("change",this))};Knob.prototype.valueString=function(){return this.value.toFixed(this.fixedPoint)};
Knob.prototype.contains=function(a,b){a-=this.canvas.width/2;b-=this.canvas.height/2;return Math.sqrt(Math.pow(a,2)+Math.pow(b,2))<this.radius};Knob.prototype.translateMouseEvent=function(a){var b=a.target;return{x:a.clientX-b.getBoundingClientRect().left-b.clientLeft+b.scrollLeft,y:a.clientY-(b.getBoundingClientRect().top-b.clientTop+b.scrollTop)}};