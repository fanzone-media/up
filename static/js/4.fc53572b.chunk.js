/*! For license information please see 4.fc53572b.chunk.js.LICENSE.txt */
(this.webpackJsonpprofiles=this.webpackJsonpprofiles||[]).push([[4],{1039:function(n,e,t){"use strict";e.a=t.p+"static/media/polygon.9f8343d5.svg"},1040:function(n,e,t){"use strict";t.d(e,"e",(function(){return g})),t.d(e,"g",(function(){return O})),t.d(e,"b",(function(){return v})),t.d(e,"a",(function(){return w})),t.d(e,"c",(function(){return A})),t.d(e,"f",(function(){return C})),t.d(e,"j",(function(){return k})),t.d(e,"k",(function(){return z})),t.d(e,"i",(function(){return _})),t.d(e,"d",(function(){return y})),t.d(e,"h",(function(){return B}));var i,r,o,s,a,d,c,f,u,h,l,b=t(26),p=t(111),x=t(27),j=t(110),m=t(34),g=Object(x.b)(p.b)(i||(i=Object(b.a)(["\n  width: ",";\n  border-radius: 10px;\n  position: relative;\n  transition: transform 0.2s ease-in-out;\n  border: 1px solid rgba(255, 255, 255, 0.25);\n\n  &:hover {\n    transform: scale(1.05);\n  }\n\n  @media "," {\n    width: ",";\n  }\n"])),(function(n){return n.demo?"165px":"117px"}),m.e,(function(n){return n.demo?"212px":"117px"})),O=x.b.div(r||(r=Object(b.a)(["\n  display: flex;\n  flex-direction: column;\n  height: ",";\n  background-color: #212121;\n  border-radius: 0 0 10px 10px;\n  padding: 5px 10px 5px 10px;\n"])),(function(n){return n.demo?"68px":"53px"})),v=x.b.div(o||(o=Object(b.a)(["\n  display: flex;\n  width: ",";\n  position: absolute;\n  right: 0;\n  z-index: 10;\n  margin-top: ",";\n  margin-right: ",";\n"])),(function(n){return n.demo?"30px":"19px"}),(function(n){return n.demo?"18px":"14px"}),(function(n){return n.demo?"10px":"8px"})),w=x.b.p(s||(s=Object(b.a)(["\n  font-size: ",";\n  font-weight: 400;\n  margin: auto;\n"])),(function(n){return n.demo?"12px":"8px"})),A=x.b.img(a||(a=Object(b.a)(["\n  position: absolute;\n  right: 0;\n  margin-top: ",";\n  margin-right: ",";\n  width: ",";\n  z-index: 10;\n"])),(function(n){return n.demo?"10px":"8px"}),(function(n){return n.demo?"10px":"8px"}),(function(n){return n.demo?"30px":"19px"})),C=x.b.div(d||(d=Object(b.a)(["\n  margin-top: auto;\n  margin-bottom: auto;\n"]))),k=x.b.h3(c||(c=Object(b.a)(["\n  font-size: ",";\n  font-weight: 700;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n"])),(function(n){return n.demo?"18px":"13px"})),z=x.b.p(f||(f=Object(b.a)(["\n  font-size: 13px;\n  color: #bcbcbc;\n"]))),_=x.b.div(u||(u=Object(b.a)(["\n  background: url(",");\n  background-position: center;\n  background-repeat: no-repeat;\n  background-size: cover;\n  position: relative;\n  display: flex;\n  z-index: 0;\n  height: ",";\n  border-radius: 10px 10px 0 0;\n"])),j.d,(function(n){return n.demo?"213px":"121px"})),y=x.b.img(h||(h=Object(b.a)(["\n  width: ",";\n  height: ",";\n  border-radius: 100%;\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate3d(-50%, -50%, 0);\n  z-index: -1;\n\n  @media "," {\n    height: ",";\n    width: ",";\n  }\n"])),(function(n){return n.demo?"141px":"89px"}),(function(n){return n.demo?"141px":"89px"}),m.e,(function(n){return n.demo?"154px":"89px"}),(function(n){return n.demo?"154px":"89px"})),B=x.b.img(l||(l=Object(b.a)(["\n  height: ",";\n  width: ",";\n  margin: auto;\n  border-radius: 100%;\n  object-fit: cover;\n\n  @media "," {\n    width: ",";\n    height: ",";\n  }\n"])),(function(n){return n.demo?"121px":"80px"}),(function(n){return n.demo?"121px":"80px"}),m.e,(function(n){return n.demo?"132px":"80px"}),(function(n){return n.demo?"132px":"80px"}))},1042:function(n,e,t){var i,r=t(308);i=function(){return function(n){var e={};function t(i){if(e[i])return e[i].exports;var r=e[i]={exports:{},id:i,loaded:!1};return n[i].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}return t.m=n,t.c=e,t.p="",t(0)}([function(n,e,t){var i=t(1),o=t(2),s=new Array(4);function a(){var n=s[0]^s[0]<<11;return s[0]=s[1],s[1]=s[2],s[2]=s[3],s[3]=s[3]^s[3]>>19^n^n>>8,(s[3]>>>0)/(1<<31>>>0)}function d(){return[Math.floor(360*a())/360,(60*a()+40)/100,25*(a()+a()+a()+a())/100]}function c(n,e,t,i,r,o){for(var s=0;s<i;s++)for(var a=0;a<r;a++)n.buffer[n.index(e+s,t+a)]=o}function f(n){if(!n.seed)throw new Error("No seed provided");return function(n){for(var e=0;e<s.length;e++)s[e]=0;for(var t=0;t<n.length;t++)s[t%4]=(s[t%4]<<5)-s[t%4]+n.charCodeAt(t)}(n.seed),Object.assign({size:8,scale:16,color:d(),bgcolor:d(),spotcolor:d()},n)}n.exports=function(n){for(var e=f({seed:n.toLowerCase()}),t=function(n){for(var e=n,t=n,i=Math.ceil(e/2),r=e-i,o=[],s=0;s<t;s++){for(var d=[],c=0;c<i;c++)d[c]=Math.floor(2.3*a());var f=d.slice(0,r).reverse();d=d.concat(f);for(var u=0;u<d.length;u++)o.push(d[u])}return o}(e.size),s=Math.sqrt(t.length),d=new i(e.size*e.scale,e.size*e.scale,3),u=(d.color.apply(d,r(o.apply(void 0,r(e.bgcolor)))),d.color.apply(d,r(o.apply(void 0,r(e.color))))),h=d.color.apply(d,r(o.apply(void 0,r(e.spotcolor)))),l=0;l<t.length;l++){var b=Math.floor(l/s),p=l%s;if(t[l]){var x=1==t[l]?u:h;c(d,p*e.scale,b*e.scale,e.scale,e.scale,x)}}return"data:image/png;base64,".concat(d.getBase64())}},function(n,e){n.exports=function(n,e,t){function i(n,e){for(var t=2;t<arguments.length;t++)for(var i=0;i<arguments[t].length;i++)n[e++]=arguments[t].charAt(i)}function r(n){return String.fromCharCode(n>>24&255,n>>16&255,n>>8&255,255&n)}function o(n){return String.fromCharCode(255&n,n>>8&255)}this.width=n,this.height=e,this.depth=t,this.pix_size=e*(n+1),this.data_size=2+this.pix_size+5*Math.floor((65534+this.pix_size)/65535)+4,this.ihdr_offs=0,this.ihdr_size=25,this.plte_offs=this.ihdr_offs+this.ihdr_size,this.plte_size=8+3*t+4,this.trns_offs=this.plte_offs+this.plte_size,this.trns_size=8+t+4,this.idat_offs=this.trns_offs+this.trns_size,this.idat_size=8+this.data_size+4,this.iend_offs=this.idat_offs+this.idat_size,this.iend_size=12,this.buffer_size=this.iend_offs+this.iend_size,this.buffer=new Array,this.palette=new Object,this.pindex=0;for(var s=new Array,a=0;a<this.buffer_size;a++)this.buffer[a]="\0";i(this.buffer,this.ihdr_offs,r(this.ihdr_size-12),"IHDR",r(n),r(e),"\b\x03"),i(this.buffer,this.plte_offs,r(this.plte_size-12),"PLTE"),i(this.buffer,this.trns_offs,r(this.trns_size-12),"tRNS"),i(this.buffer,this.idat_offs,r(this.idat_size-12),"IDAT"),i(this.buffer,this.iend_offs,r(this.iend_size-12),"IEND");var d,c=30912;for(c+=31-c%31,i(this.buffer,this.idat_offs+8,(d=c,String.fromCharCode(d>>8&255,255&d))),a=0;(a<<16)-1<this.pix_size;a++){var f,u;a+65535<this.pix_size?(f=65535,u="\0"):(f=this.pix_size-(a<<16)-a,u="\x01"),i(this.buffer,this.idat_offs+8+2+(a<<16)+(a<<2),u,o(f),o(~f))}for(a=0;a<256;a++){for(var h=a,l=0;l<8;l++)h=1&h?-306674912^h>>1&2147483647:h>>1&2147483647;s[a]=h}this.index=function(n,e){var t=e*(this.width+1)+n+1;return this.idat_offs+8+2+5*Math.floor(t/65535+1)+t},this.color=function(n,e,t,i){var r=(((i=i>=0?i:255)<<8|n)<<8|e)<<8|t;if("undefined"==typeof this.palette[r]){if(this.pindex==this.depth)return"\0";var o=this.plte_offs+8+3*this.pindex;this.buffer[o+0]=String.fromCharCode(n),this.buffer[o+1]=String.fromCharCode(e),this.buffer[o+2]=String.fromCharCode(t),this.buffer[this.trns_offs+8+this.pindex]=String.fromCharCode(i),this.palette[r]=String.fromCharCode(this.pindex++)}return this.palette[r]},this.getBase64=function(){var n,e,t,i,r,o,s,a=this.getDump(),d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",c=a.length,f=0,u="";do{i=(n=a.charCodeAt(f))>>2,r=(3&n)<<4|(e=a.charCodeAt(f+1))>>4,t=a.charCodeAt(f+2),o=c<f+2?64:(15&e)<<2|t>>6,s=c<f+3?64:63&t,u+=d.charAt(i)+d.charAt(r)+d.charAt(o)+d.charAt(s)}while((f+=3)<c);return u},this.getDump=function(){for(var n=65521,e=1,t=0,o=5552,a=0;a<this.height;a++)for(var d=-1;d<this.width;d++)t+=e+=this.buffer[this.index(d,a)].charCodeAt(0),0==(o-=1)&&(e%=n,t%=n,o=5552);function c(n,e,t){for(var o=-1,a=4;a<t-4;a+=1)o=s[255&(o^n[e+a].charCodeAt(0))]^o>>8&16777215;i(n,e+t-4,r(-1^o))}return e%=n,t%=n,i(this.buffer,this.idat_offs+this.idat_size-8,r(t<<16|e)),c(this.buffer,this.ihdr_offs,this.ihdr_size),c(this.buffer,this.plte_offs,this.plte_size),c(this.buffer,this.trns_offs,this.trns_size),c(this.buffer,this.idat_offs,this.idat_size),c(this.buffer,this.iend_offs,this.iend_size),"\x89PNG\r\n\x1a\n"+this.buffer.join("")}}},function(n,e){function t(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+6*(e-n)*t:t<.5?e:t<2/3?n+(e-n)*(2/3-t)*6:n}n.exports=function(n,e,i){var r,o,s;if(0==e)r=o=s=i;else{var a=i<.5?i*(1+e):i+e-i*e,d=2*i-a;r=t(d,a,n+1/3),o=t(d,a,n),s=t(d,a,n-1/3)}return[Math.round(255*r),Math.round(255*o),Math.round(255*s),255]}}])},n.exports=i()},1043:function(n,e,t){"use strict";t.d(e,"k",(function(){return m})),t.d(e,"e",(function(){return g})),t.d(e,"f",(function(){return O})),t.d(e,"g",(function(){return v})),t.d(e,"b",(function(){return w})),t.d(e,"d",(function(){return A})),t.d(e,"c",(function(){return C})),t.d(e,"a",(function(){return k})),t.d(e,"j",(function(){return z})),t.d(e,"h",(function(){return _})),t.d(e,"i",(function(){return y}));var i,r,o,s,a,d,c,f,u,h,l,b=t(26),p=t(27),x=t(110),j=t(34),m=Object(p.c)(i||(i=Object(b.a)(["\n    0%, 100% {\n        transform: scale(1);\n    }\n    50% {\n        transform: scale(1.2);\n    }\n"]))),g=p.b.div(r||(r=Object(b.a)(["\n  position: relative;\n  width: 165px;\n  border: 1px solid rgba(255, 255, 255, 0.25);\n  border-radius: 10px;\n\n  @media "," {\n    width: 212px;\n  }\n"])),j.e),O=p.b.div(o||(o=Object(b.a)(["\n  width: 100%;\n  height: 211px;\n  display: flex;\n  background-image: url(",");\n  background-size: cover;\n  background-position: center;\n  border-radius: 10px 10px 0 0;\n\n  @media "," {\n    height: 257px;\n  }\n"])),x.c,j.e),v=p.b.img(s||(s=Object(b.a)(["\n  width: 115px;\n  height: 171px;\n  margin: auto;\n\n  @media "," {\n    width: 137px;\n    height: 203px;\n  }\n"])),j.e),w=p.b.div(a||(a=Object(b.a)(["\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  height: 100px;\n  background-color: rgba(37, 37, 37, 1);\n  border-radius: 0 0 10px 10px;\n  padding: 5px 10px 10px 10px;\n  row-gap: 5px;\n"]))),A=p.b.h3(d||(d=Object(b.a)(["\n  font-size: 15px;\n  font-weight: 700;\n\n  @media "," {\n    font-size: 18px;\n  }\n"])),j.e),C=p.b.p(c||(c=Object(b.a)(["\n  font-size: 14px;\n  font-weight: 400;\n  line-height: 17.5px;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  text-overflow: ellipsis;\n"]))),k=p.b.img(f||(f=Object(b.a)(["\n  position: absolute;\n  right: 0;\n  top: 170px;\n  margin-right: 8px;\n  height: 40px;\n  animation: "," 2s ease-in-out infinite;\n\n  @media "," {\n    top: 205px;\n    height: 45px;\n    margin-right: 15px;\n  }\n"])),m,j.e),z=p.b.img(u||(u=Object(b.a)(["\n  position: absolute;\n  left: 0;\n  height: 34px;\n  top: 170px;\n  margin-left: 8px;\n  animation: "," 2s ease-in-out infinite;\n\n  @media "," {\n    top: 205px;\n    margin-left: 15px;\n    height: 40px;\n  }\n"])),m,j.e),_=p.b.button(h||(h=Object(b.a)(["\n  position: absolute;\n  left: 0;\n  height: 34px;\n  width: 34px;\n  top: 170px;\n  margin-left: 8px;\n  animation: "," 2s ease-in-out infinite;\n  background-color: white;\n  border-radius: 100%;\n\n  @media "," {\n    top: 205px;\n    margin-left: 15px;\n    height: 40px;\n    width: 40px;\n  }\n"])),m,j.e),y=p.b.img(l||(l=Object(b.a)(["\n  margin: 0 auto;\n"])))},1044:function(n,e,t){"use strict";t.d(e,"a",(function(){return b}));t(11);var i,r,o,s=t(26),a=t(27),d=t(34),c=a.b.input(i||(i=Object(s.a)(["\n  background: rgba(255, 255, 255, 0.05);\n  height: 32px;\n  width: 165px;\n  border: 0.5px solid #979797;\n  border-radius: 5px;\n  padding: 0 10px 0 30px;\n\n  @media "," {\n    width: 353px;\n  }\n"])),d.e),f=a.b.div(r||(r=Object(s.a)(["\n  position: relative;\n"]))),u=a.b.img(o||(o=Object(s.a)(["\n  position: absolute;\n  top: 50%;\n  margin-left: 10px;\n  transform: translate3d(0, -55%, 0);\n"]))),h=t(110),l=t(18),b=function(n){var e=n.onChange;return Object(l.jsxs)(f,{children:[Object(l.jsx)(u,{src:h.q}),Object(l.jsx)(c,{placeholder:"Search",onChange:e})]})}},1045:function(n,e,t){"use strict";var i,r,o,s,a,d,c,f,u,h,l=t(31),b=t(11),p=t(68),x=t(111),j=t(307),m=t(1039),g=t(1043),O=t(34),v=t(1040),w=t(18),A=function(n){var e=n.digitalCard,t=n.type,i=n.balance,r=n.openTransferCardModal,o=n.transferPermission,s=Object(p.f)(),a=Object(O.b)(s.network);return Object(w.jsxs)(g.e,{children:["l14"===s.network&&Object(w.jsx)("a",{href:"https://universalprofile.cloud/asset/"+e.address,target:"_blank",rel:"noreferrer",children:Object(w.jsx)(g.j,{src:j.a,alt:""})}),"owned"===t&&Object(w.jsxs)(w.Fragment,{children:[Object(w.jsx)(v.b,{demo:!0,children:Object(w.jsx)(v.a,{demo:!0,children:i})}),Object(w.jsx)(v.c,{src:m.a,alt:"",demo:!0})]}),!0===o&&r&&Object(w.jsx)(g.h,{onClick:function(){return r(e.address)},children:Object(w.jsx)(g.i,{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHdSURBVFiF1dexaxRBFMfxj4cQgl4shahYCKlSGEmRQjSof0CaQKy00MZOWxMrJU0KRf+BVNoc/g8G/wRBIY1aiIlFCCEEMVmL2SPDurO3SW7v8MHAzb335vfdmXtv9vjPbBZvMDYM8TnsIcs/D9QW8DsXzzA/SPGH2I/EBwrwCAcF8b4CnK7wPcXzhG+mxto/8QPrAvSRbNm/T33c8Q2vcKmu+EofxeOxiyW0egH8agigO95jpArgDnYahljttQvXsdUwxL2u2EeslUBMSx9H3TI8gyksYqOwxneMir5olywwKZRSP/rAGDqFdRZigKuJxAmhlOoAzCp/kK61ChBvYTufLFUkXnbYUFIAt3PfJ4xXrHXO4XF8hi/5ZEP1NTueL57hVol/PgJcz6FT9iyP24Z3UWJHdaNo40bCFwNkwrFNJGKnojh3C4kdYZuOakWATPgBT5bEtmOAUaEk4sRNYZuu4ewJADKhlKdL4tfwoTu5n0ju19gSmlulrTYMsSO0+aSNCBdFkxCbvXahJfSD3YYAVnoBdO0iXuJrH8WXy4RO1YC5ggs43yNuBk8SvkW8qKF1IisrwwM8blo4BbCPB4MSLwL8Eb1wDMrmcvE9Q/jrRrhJX+PmMMSPbX8BpqlvT1UmYJ0AAAAASUVORK5CYII=",alt:""})}),Object(w.jsx)("a",{href:a&&a.exploreUrl+e.address,target:"_blank",rel:"noreferrer",children:Object(w.jsx)(g.a,{src:null===a||void 0===a?void 0:a.icon,alt:""})}),Object(w.jsxs)(x.b,{to:"/".concat(s.network,"/asset/")+e.address,children:[Object(w.jsx)(g.f,{children:Object(w.jsx)(g.g,{src:e.ls8MetaData.image,alt:""})}),Object(w.jsxs)(g.b,{children:[Object(w.jsx)(g.d,{children:e.name.split("\u2022")[0]}),Object(w.jsx)(g.c,{children:e.name})]})]})]})},C=t(110),k=t(26),z=t(27),_=z.b.div(i||(i=Object(k.a)(["\n  display: flex;\n  flex-direction: column;\n"]))),y=z.b.div(r||(r=Object(k.a)(["\n  padding-top: 20px;\n  display: flex;\n  text-transform: capitalize;\n"]))),B=z.b.h1(o||(o=Object(k.a)(["\n  font-size: 24px;\n  font-weight: 700;\n  margin-right: auto;\n"]))),S=z.b.div(s||(s=Object(k.a)(["\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  width: 100%;\n  padding: 20px 0 20px 0;\n  column-gap: 20px;\n  row-gap: 20px;\n  grid-auto-flow: unset;\n  justify-items: center;\n\n  @media "," {\n    grid-template-columns: repeat(3, 1fr);\n  }\n  @media "," {\n    grid-template-columns: repeat(4, 1fr);\n  }\n  @media "," {\n    grid-template-columns: repeat(5, 1fr);\n  }\n"])),O.d,O.c,O.f),M=z.b.div(a||(a=Object(k.a)(["\n  display: flex;\n  column-gap: 30px;\n  margin-right: auto;\n  margin-left: auto;\n  margin-top: 20px;\n"]))),D=z.b.button(d||(d=Object(k.a)(["\n  padding: 0 8px 0 8px;\n"]))),F=Object(z.b)(D)(c||(c=Object(k.a)([""]))),E=z.b.img(f||(f=Object(k.a)([""]))),P=z.b.img(u||(u=Object(k.a)([""]))),N=z.b.button(h||(h=Object(k.a)(["\n  padding: 2px 8px 2px 8px;\n  background: ",";\n  border-radius: 3px;\n"])),(function(n){return n.active?"#BCBCBC":""})),L=t(1044),I=t(306),T=t(309),R=t(204);e.a=function(n){var e=n.type,t=n.profile,i=n.openTransferCardModal,r=n.transferPermission,o=n.collectionAddresses,s=Object(p.f)(),a=Object(I.b)(),d=Object(b.useState)([]),c=Object(l.a)(d,2),f=c[0],u=c[1],h=Object(R.c)(T.f).filter((function(n){return f.some((function(e){return e===n.address}))})),x=Object(R.c)((function(n){return n.cards.ownedStatus})),j=Object(R.c)((function(n){return n.cards.issuedStatus})),m=Object(R.c)((function(n){return n.cards.status})),g=Object(b.useState)(""),v=Object(l.a)(g,1)[0],k=function(){var n=Object(b.useState)(window.innerWidth),e=Object(l.a)(n,2),t=e[0],i=e[1];return Object(b.useEffect)((function(){var n=function(){i(window.innerWidth)};return window.addEventListener("resize",n),function(){return window.removeEventListener("resize",n)}}),[]),{screenWidth:t}}().screenWidth,z=Object(b.useState)(1),Y=Object(l.a)(z,2),U=Y[0],K=Y[1],X=Object(b.useState)(4),J=Object(l.a)(X,2),W=J[0],G=J[1],H=Object(b.useState)(1),Q=Object(l.a)(H,2),Z=Q[0],V=Q[1],q=function(n,e){for(var t=[],i=n;i<=e;)t.push(i),i++;return t},$=function(n){var e=Number(n.currentTarget.textContent);K(e)};Object(b.useMemo)((function(){k<769&&(V(Math.ceil(o.length/4)),G(4)),k>768&&(V(Math.ceil(o.length/6)),G(6)),k>1024&&(V(Math.ceil(o.length/8)),G(8)),k>1280&&(V(Math.ceil(o.length/10)),G(10))}),[o.length,k]),Object(b.useMemo)((function(){var n=U*W-W,t=n+W;u(o.slice(n,t)),"owned"===e&&x!==O.a.LOADING&&h.length!==f.length&&a(Object(T.e)({network:s.network,addresses:o.slice(n,t)})),"issued"===e&&j!==O.a.LOADING&&h.length!==f.length&&a(Object(T.d)({network:s.network,addresses:o.slice(n,t)})),"demo"===e&&m!==O.a.LOADING&&h.length!==f.length&&a(Object(T.b)({network:s.network,addresses:o.slice(n,t)}))}),[h.length,m,o,U,f.length,a,j,W,x,s.network,e]);var nn=Object(b.useMemo)((function(){return h.map((function(n){if("owned"===e||"issued"===e){var o=null===t||void 0===t?void 0:t.ownedAssets.find((function(e){return e.assetAddress.toLowerCase()===n.address.toLowerCase()}));return Object(w.jsx)(A,{digitalCard:n,type:e,balance:null===o||void 0===o?void 0:o.balance,openTransferCardModal:i,transferPermission:r},n.address)}return"demo"===e?Object(w.jsx)(A,{digitalCard:n,type:e},n.address):""}))}),[h,f,e,null===t||void 0===t?void 0:t.ownedAssets,i,r]);return Object(w.jsxs)(_,{children:[Object(w.jsxs)(y,{className:"flex",children:[Object(w.jsx)(B,{children:"demo"===e?"Assets":"".concat(e," Assets")}),Object(w.jsx)(L.a,{onChange:function(n){}})]}),Object(w.jsx)(S,{children:nn}),Z>1&&""===v&&Object(w.jsxs)(M,{children:[Object(w.jsx)(F,{onClick:function(){K((function(n){return 1===n?n:n-1}))},disabled:1===U,children:Object(w.jsx)(P,{src:C.o,alt:""})}),U>=3&&Z>3&&Object(w.jsxs)(w.Fragment,{children:[Object(w.jsx)(N,{onClick:$,children:"1"}),Object(w.jsx)("p",{children:"..."})]}),function(){if(2===Z)return q(1,2);switch(U){case 1:return q(U,U+2);case Z:return q(U-2,U);default:return q(U-1,U+1)}}().map((function(n){return Object(w.jsx)(N,{active:U===n,onClick:$,children:n},n)})),U<=Z-2&&Z>3&&Object(w.jsxs)(w.Fragment,{children:[Object(w.jsx)("p",{children:"..."}),Object(w.jsx)(N,{onClick:$,children:Z})]}),Object(w.jsx)(D,{onClick:function(){K((function(n){return n===Z?n:n+1}))},disabled:U===Z,children:Object(w.jsx)(E,{src:C.m,alt:""})})]})]})}},1046:function(n,e,t){"use strict";t.d(e,"a",(function(){return h}));var i=t(11),r=t(1039),o=t(1042),s=t.n(o),a=t(1040),d=t(68),c=t(312),f=t.n(c),u=t(18),h=function(n){var e=n.userProfile,t=n.balance,o=n.type,c=n.tooltipId,h=Object(d.f)(),l=Object(i.useMemo)((function(){return"demo"!==o&&e.ownedAssets.find((function(n){return n.assetAddress.toLowerCase()===h.add.toLowerCase()}))}),[h.add,o,e.ownedAssets]);return Object(u.jsxs)(a.e,{to:"/".concat(h.network,"/profile/")+f.a.utils.toChecksumAddress(e.address),className:"animate-cardrender",demo:"demo"===o,"data-tip":"demo"!==o&&l&&l.tokenIds,"data-for":c,children:[Object(u.jsx)(a.b,{demo:"demo"===o,children:Object(u.jsx)(a.a,{demo:"demo"===o,children:"demo"===o?e.ownedAssets.length:t})}),Object(u.jsx)(a.c,{src:r.a,alt:"",demo:"demo"===o}),Object(u.jsxs)(a.i,{demo:"demo"===o,children:[Object(u.jsx)(a.d,{src:s()(e.address),alt:"",demo:"demo"===o}),Object(u.jsx)(a.h,{src:e.profileImage,alt:"",demo:"demo"===o})]}),Object(u.jsx)(a.g,{demo:"demo"===o,children:Object(u.jsxs)(a.f,{children:[Object(u.jsxs)(a.j,{demo:"demo"===o,children:[" ","@",e.name," "]}),Object(u.jsx)(a.k,{children:"FANZONE user"})]})})]})}},1054:function(n,e,t){"use strict";t.r(e);var i,r,o,s,a,d,c,f,u,h,l,b,p,x=t(11),j=t(204),m=t(1046),g=t(310),O=t(1045),v=t(26),w=t(27),A=t(110),C=t(34),k=w.b.div(i||(i=Object(v.a)(["\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  color: white;\n"]))),z=w.b.div(r||(r=Object(v.a)(["\n  height: 243px;\n  width: 100%;\n  background: url(",");\n  background-position: center;\n  background-repeat: repeat;\n  background-size: cover;\n"])),A.b),_=w.b.div(o||(o=Object(v.a)(["\n  width: 100%;\n  padding: 0px 8px 0 8px;\n  margin-left: auto;\n  margin-right: auto;\n  display: flex;\n  flex-direction: column;\n\n  @media "," {\n    padding: 0 40px 0 40px;\n    max-width: 1440px;\n  }\n"])),C.d),y=w.b.div(s||(s=Object(v.a)(["\n  padding-top: 20px;\n"]))),B=w.b.h1(a||(a=Object(v.a)(["\n  font-size: 24px;\n  font-weight: 700;\n"]))),S=w.b.p(d||(d=Object(v.a)(["\n  font-size: 18px;\n  font-weight: 400;\n"]))),M=w.b.span(c||(c=Object(v.a)(["\n  border-bottom: 1px solid #dfdfdf;\n  width: 100%;\n  margin-top: 20px;\n"]))),D=w.b.div(f||(f=Object(v.a)(["\n  padding-top: 20px;\n  display: flex;\n"]))),F=w.b.h1(u||(u=Object(v.a)(["\n  font-size: 24px;\n  font-weight: 700;\n  margin-right: auto;\n"]))),E=w.b.div(h||(h=Object(v.a)(["\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  width: 100%;\n  padding: 20px 0 20px 0;\n  justify-items: center;\n\n  @media "," {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n  @media "," {\n    grid-template-columns: repeat(4, minmax(0, 1fr));\n  }\n  @media "," {\n    grid-template-columns: repeat(5, minmax(0, 1fr));\n  }\n"])),C.d,C.c,C.f),P=(w.b.div(l||(l=Object(v.a)(["\n  display: flex;\n  flex-direction: column;\n  margin: 40px auto 0 auto;\n  row-gap: 10px;\n"]))),w.b.h1(b||(b=Object(v.a)(["\n  font-size: 24px;\n"]))),w.b.button(p||(p=Object(v.a)(["\n  background: black;\n  padding: 8px 16px 8px 16px;\n  border-radius: 6px;\n  margin-right: auto;\n  margin-left: auto;\n"]))),t(1044)),N=t(306),L=t(68),I=t(18);e.default=function(){var n,e=Object(L.f)(),t=Object(N.b)(),i={l14:["",""],mumbai:["0x0044FA45A42b78A8cbAF6764D770864CBC94214C","0x77de7a8c94789263Ba24D41D9D799190C73D3Acc"],polygon:["0x775e1dA80Bbe4C507D7009AB8D3a45c87b7f9D8A","0x5e3Aa02aEE55c64a1253BFbe267CF9df94B8Cdbf"],ethereum:["",""]},r=null===(n=Object(j.c)((function(n){return Object(g.e)(n.userData[e.network])})))||void 0===n?void 0:n.filter((function(n){if(i)return i[e.network].some((function(t){return t===n.address&&n.network===e.network}))}));Object(x.useEffect)((function(){0===(null===r||void 0===r?void 0:r.length)&&t(Object(g.a)({addresses:i[e.network],network:e.network}))}),[e.network]);var o=Object(x.useMemo)((function(){return null===r||void 0===r?void 0:r.map((function(n){return Object(I.jsx)(m.a,{userProfile:n,type:"demo"},n.address)}))}),[r]);return Object(I.jsxs)(k,{children:[Object(I.jsx)(z,{}),Object(I.jsxs)(_,{children:[Object(I.jsxs)(y,{children:[Object(I.jsx)(B,{children:"Welcome on Fanzone Profiles"}),Object(I.jsx)(S,{children:"Fanzone Profiles displays any data from the Blockchain which follows the standards of ERC725, LUKSO LSP1-3 and NFTs."})]}),Object(I.jsx)(M,{}),Object(I.jsxs)(I.Fragment,{children:[Object(I.jsxs)(D,{children:[Object(I.jsx)(F,{children:"Profiles"}),Object(I.jsx)(P.a,{})]}),Object(I.jsx)(E,{children:o}),Object(I.jsx)(O.a,{type:"demo",collectionAddresses:{l14:["",""],mumbai:["0x8839E144Bd2EddfDBC53B5b6323008bb3CE3eb7F","0x9c7072122178107bf66571c1f3e379368e0e47a3"],polygon:["0xd83Bc6fB61fD75beDe9d3999d7345b5C1cB8b393","0x90ada08949d5B32C9bF8d4DeCD27BE483bc5B0e2"],ethereum:["",""]}[e.network]})]})]})]})}}}]);
//# sourceMappingURL=4.fc53572b.chunk.js.map