/*! For license information please see 1.ce93ddfb.chunk.js.LICENSE.txt */
(this.webpackJsonpprofiles=this.webpackJsonpprofiles||[]).push([[1],{880:function(e,n,t){var r,i=t(487);r=function(){return function(e){var n={};function t(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}return t.m=e,t.c=n,t.p="",t(0)}([function(e,n,t){var r=t(1),a=t(2),s=new Array(4);function o(){var e=s[0]^s[0]<<11;return s[0]=s[1],s[1]=s[2],s[2]=s[3],s[3]=s[3]^s[3]>>19^e^e>>8,(s[3]>>>0)/(1<<31>>>0)}function d(){return[Math.floor(360*o())/360,(60*o()+40)/100,25*(o()+o()+o()+o())/100]}function c(e,n,t,r,i,a){for(var s=0;s<r;s++)for(var o=0;o<i;o++)e.buffer[e.index(n+s,t+o)]=a}function f(e){if(!e.seed)throw new Error("No seed provided");return function(e){for(var n=0;n<s.length;n++)s[n]=0;for(var t=0;t<e.length;t++)s[t%4]=(s[t%4]<<5)-s[t%4]+e.charCodeAt(t)}(e.seed),Object.assign({size:8,scale:16,color:d(),bgcolor:d(),spotcolor:d()},e)}e.exports=function(e){for(var n=f({seed:e.toLowerCase()}),t=function(e){for(var n=e,t=e,r=Math.ceil(n/2),i=n-r,a=[],s=0;s<t;s++){for(var d=[],c=0;c<r;c++)d[c]=Math.floor(2.3*o());var f=d.slice(0,i).reverse();d=d.concat(f);for(var u=0;u<d.length;u++)a.push(d[u])}return a}(n.size),s=Math.sqrt(t.length),d=new r(n.size*n.scale,n.size*n.scale,3),u=(d.color.apply(d,i(a.apply(void 0,i(n.bgcolor)))),d.color.apply(d,i(a.apply(void 0,i(n.color))))),h=d.color.apply(d,i(a.apply(void 0,i(n.spotcolor)))),l=0;l<t.length;l++){var p=Math.floor(l/s),m=l%s;if(t[l]){var x=1==t[l]?u:h;c(d,m*n.scale,p*n.scale,n.scale,n.scale,x)}}return"data:image/png;base64,".concat(d.getBase64())}},function(e,n){e.exports=function(e,n,t){function r(e,n){for(var t=2;t<arguments.length;t++)for(var r=0;r<arguments[t].length;r++)e[n++]=arguments[t].charAt(r)}function i(e){return String.fromCharCode(e>>24&255,e>>16&255,e>>8&255,255&e)}function a(e){return String.fromCharCode(255&e,e>>8&255)}this.width=e,this.height=n,this.depth=t,this.pix_size=n*(e+1),this.data_size=2+this.pix_size+5*Math.floor((65534+this.pix_size)/65535)+4,this.ihdr_offs=0,this.ihdr_size=25,this.plte_offs=this.ihdr_offs+this.ihdr_size,this.plte_size=8+3*t+4,this.trns_offs=this.plte_offs+this.plte_size,this.trns_size=8+t+4,this.idat_offs=this.trns_offs+this.trns_size,this.idat_size=8+this.data_size+4,this.iend_offs=this.idat_offs+this.idat_size,this.iend_size=12,this.buffer_size=this.iend_offs+this.iend_size,this.buffer=new Array,this.palette=new Object,this.pindex=0;for(var s=new Array,o=0;o<this.buffer_size;o++)this.buffer[o]="\0";r(this.buffer,this.ihdr_offs,i(this.ihdr_size-12),"IHDR",i(e),i(n),"\b\x03"),r(this.buffer,this.plte_offs,i(this.plte_size-12),"PLTE"),r(this.buffer,this.trns_offs,i(this.trns_size-12),"tRNS"),r(this.buffer,this.idat_offs,i(this.idat_size-12),"IDAT"),r(this.buffer,this.iend_offs,i(this.iend_size-12),"IEND");var d,c=30912;for(c+=31-c%31,r(this.buffer,this.idat_offs+8,(d=c,String.fromCharCode(d>>8&255,255&d))),o=0;(o<<16)-1<this.pix_size;o++){var f,u;o+65535<this.pix_size?(f=65535,u="\0"):(f=this.pix_size-(o<<16)-o,u="\x01"),r(this.buffer,this.idat_offs+8+2+(o<<16)+(o<<2),u,a(f),a(~f))}for(o=0;o<256;o++){for(var h=o,l=0;l<8;l++)h=1&h?-306674912^h>>1&2147483647:h>>1&2147483647;s[o]=h}this.index=function(e,n){var t=n*(this.width+1)+e+1;return this.idat_offs+8+2+5*Math.floor(t/65535+1)+t},this.color=function(e,n,t,r){var i=(((r=r>=0?r:255)<<8|e)<<8|n)<<8|t;if("undefined"==typeof this.palette[i]){if(this.pindex==this.depth)return"\0";var a=this.plte_offs+8+3*this.pindex;this.buffer[a+0]=String.fromCharCode(e),this.buffer[a+1]=String.fromCharCode(n),this.buffer[a+2]=String.fromCharCode(t),this.buffer[this.trns_offs+8+this.pindex]=String.fromCharCode(r),this.palette[i]=String.fromCharCode(this.pindex++)}return this.palette[i]},this.getBase64=function(){var e,n,t,r,i,a,s,o=this.getDump(),d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",c=o.length,f=0,u="";do{r=(e=o.charCodeAt(f))>>2,i=(3&e)<<4|(n=o.charCodeAt(f+1))>>4,t=o.charCodeAt(f+2),a=c<f+2?64:(15&n)<<2|t>>6,s=c<f+3?64:63&t,u+=d.charAt(r)+d.charAt(i)+d.charAt(a)+d.charAt(s)}while((f+=3)<c);return u},this.getDump=function(){for(var e=65521,n=1,t=0,a=5552,o=0;o<this.height;o++)for(var d=-1;d<this.width;d++)t+=n+=this.buffer[this.index(d,o)].charCodeAt(0),0==(a-=1)&&(n%=e,t%=e,a=5552);function c(e,n,t){for(var a=-1,o=4;o<t-4;o+=1)a=s[255&(a^e[n+o].charCodeAt(0))]^a>>8&16777215;r(e,n+t-4,i(-1^a))}return n%=e,t%=e,r(this.buffer,this.idat_offs+this.idat_size-8,i(t<<16|n)),c(this.buffer,this.ihdr_offs,this.ihdr_size),c(this.buffer,this.plte_offs,this.plte_size),c(this.buffer,this.trns_offs,this.trns_size),c(this.buffer,this.idat_offs,this.idat_size),c(this.buffer,this.iend_offs,this.iend_size),"\x89PNG\r\n\x1a\n"+this.buffer.join("")}}},function(e,n){function t(e,n,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?e+6*(n-e)*t:t<.5?n:t<2/3?e+(n-e)*(2/3-t)*6:e}e.exports=function(e,n,r){var i,a,s;if(0==n)i=a=s=r;else{var o=r<.5?r*(1+n):r+n-r*n,d=2*r-o;i=t(d,o,e+1/3),a=t(d,o,e),s=t(d,o,e-1/3)}return[Math.round(255*i),Math.round(255*a),Math.round(255*s),255]}}])},e.exports=r()},915:function(e,n,t){"use strict";t.d(n,"p",(function(){return I})),t.d(n,"g",(function(){return P})),t.d(n,"h",(function(){return D})),t.d(n,"f",(function(){return N})),t.d(n,"l",(function(){return R})),t.d(n,"s",(function(){return K})),t.d(n,"k",(function(){return U})),t.d(n,"i",(function(){return Y})),t.d(n,"c",(function(){return E})),t.d(n,"e",(function(){return F})),t.d(n,"b",(function(){return L})),t.d(n,"v",(function(){return X})),t.d(n,"u",(function(){return J})),t.d(n,"d",(function(){return H})),t.d(n,"n",(function(){return Q})),t.d(n,"m",(function(){return V})),t.d(n,"o",(function(){return Z})),t.d(n,"j",(function(){return G})),t.d(n,"a",(function(){return W})),t.d(n,"r",(function(){return q})),t.d(n,"t",(function(){return $})),t.d(n,"q",(function(){return ee}));var r,i,a,s,o,d,c,f,u,h,l,p,m,x,b,g,j,v,O,A,w,_,z,C,y,k,S,M=t(8),T=t(7),B=t(53),I=T.c.div(r||(r=Object(M.a)(["\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  color: white;\n  background: url(",");\n"])),B.f),P=T.c.div(i||(i=Object(M.a)(["\n  display: flex;\n  flex-flow: column;\n  justify-content: space-between;\n  width: 100%;\n  padding: 40px 15px 70px;\n  background: linear-gradient(\n      0deg,\n      rgba(33, 33, 33, 0.7),\n      rgba(33, 33, 33, 0.7)\n    ),\n    url(",");\n  background-size: cover;\n\n  @media "," {\n    flex-flow: row;\n    padding: 70px 20px;\n  }\n\n  @media "," {\n    padding: 90px 120px;\n  }\n"])),B.t,(function(e){return e.theme.screen.md}),(function(e){return e.theme.screen.lg})),D=T.c.h1(a||(a=Object(M.a)(["\n  font-size: 25px;\n  padding: 15px 0;\n  text-align: center;\n  text-transform: uppercase;\n\n  @media "," {\n    font-size: 45px;\n    text-align: left;\n  }\n"])),(function(e){return e.theme.screen.md})),N=T.c.div(s||(s=Object(M.a)(["\n  @media "," {\n    max-width: 550px;\n  }\n"])),(function(e){return e.theme.screen.md})),R=T.c.div(o||(o=Object(M.a)(["\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-flow: column;\n  padding: 45px 15px 0 15px;\n\n  @media "," {\n    flex-flow: row;\n    padding: 40px 30px;\n  }\n\n  @media "," {\n    flex-flow: row;\n    padding: 40px 30px;\n    align-items: start;\n  }\n\n  @media "," {\n    flex-flow: row;\n    padding: 90px 120px;\n  }\n"])),(function(e){return e.theme.screen.md}),(function(e){return e.theme.screen.lg}),(function(e){return e.theme.screen.xl})),K=Object(T.c)(R)(d||(d=Object(M.a)(["\n  align-items: start;\n  @media "," {\n    flex-flow: row;\n    flex-wrap: wrap;\n    justify-content: space-between;\n  }\n"])),(function(e){return e.theme.screen.md})),U=Object(T.c)(D)(c||(c=Object(M.a)(["\n  @media "," {\n    font-size: 40px;\n  }\n"])),(function(e){return e.theme.screen.md})),Y=T.c.img(f||(f=Object(M.a)(["\n  height: 100%;\n  width: 100%;\n  object-fit: cover;\n"]))),E=T.c.div(u||(u=Object(M.a)(["\n  width: 100%;\n  margin-left: auto;\n  padding: 0 15px 0 15px;\n  margin-right: auto;\n  display: flex;\n  flex-direction: column;\n\n  @media "," {\n    max-width: 1440px;\n  }\n"])),(function(e){return e.theme.screen.md})),F=T.c.span(h||(h=Object(M.a)(["\n  height: 1px;\n  width: 100%;\n  margin-top: 20px;\n  background: radial-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0)),\n    rgba(33, 33, 33, 0.6);\n"]))),L=T.c.h1(l||(l=Object(M.a)(["\n  font-size: 24px;\n  font-weight: ",";\n  margin: auto;\n"])),(function(e){return e.theme.font.weight.bolder})),X=T.c.div(p||(p=Object(M.a)(["\n  padding-top: 30px;\n  display: flex;\n"]))),J=T.c.h1(m||(m=Object(M.a)(["\n  font-size: 24px;\n  font-weight: ",";\n  margin-right: auto;\n"])),(function(e){return e.theme.font.weight.bolder})),H=(T.c.div(x||(x=Object(M.a)(["\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  width: 100%;\n  padding: 20px 0 20px 0;\n  justify-items: center;\n\n  @media "," {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n  @media "," {\n    grid-template-columns: repeat(4, minmax(0, 1fr));\n  }\n  @media "," {\n    grid-template-columns: repeat(5, minmax(0, 1fr));\n  }\n"])),(function(e){return e.theme.screen.md}),(function(e){return e.theme.screen.lg}),(function(e){return e.theme.screen.xl})),T.c.div(b||(b=Object(M.a)(["\n  display: flex;\n  flex-direction: column;\n  margin: 40px auto 0 auto;\n  row-gap: 10px;\n"]))),T.c.h1(g||(g=Object(M.a)(["\n  font-size: 24px;\n"]))),T.c.button(j||(j=Object(M.a)(["\n  background: black;\n  padding: 8px 16px 8px 16px;\n  border-radius: 6px;\n  margin-right: auto;\n  margin-left: auto;\n"]))),T.c.p(v||(v=Object(M.a)(["\n  font-size: 16px;\n  color: #ffffff;\n  text-align: center;\n  opacity: 0.4;\n  margin: 1.5em 0;\n\n  @media "," {\n    margin: 1.5em 0;\n    font-size: 20px;\n    text-align: left;\n  }\n"])),(function(e){return e.theme.screen.md}))),Q=(T.c.div(O||(O=Object(M.a)([""]))),T.c.div(A||(A=Object(M.a)(["\n  width: 90px;\n  height: 15px;\n  margin: auto;\n"])))),V=T.c.div(w||(w=Object(M.a)(["\n  width: 225px;\n  height: 225px;\n  margin: 0 auto 25px auto;\n"]))),Z=T.c.div(_||(_=Object(M.a)(["\n  margin-bottom: 15px;\n\n  @media "," {\n    margin: auto 0;\n  }\n"])),(function(e){return e.theme.screen.md})),G=T.c.div(z||(z=Object(M.a)(["\n  @media "," {\n    max-width: 850px;\n  }\n"])),(function(e){return e.theme.screen.md})),W=T.c.div(C||(C=Object(M.a)(["\n  height: 396px;\n  background: linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)),\n    url(",");\n  background-size: cover;\n\n  @media "," {\n    width: 520px;\n    height: 295px;\n    margin-left: 50px;\n    border: 1px solid white;\n    border-radius: 5px;\n  }\n"])),B.s,(function(e){return e.theme.screen.md})),q=T.c.div(y||(y=Object(M.a)(["\n  width: 72px;\n  height: 72px;\n  margin-right: 22px;\n  flex-shrink: 0;\n"]))),$=T.c.p(k||(k=Object(M.a)(["\n  font-size: 19px;\n  color: #ffffffcc;\n\n  @media "," {\n    max-width: 240px;\n  }\n"])),(function(e){return e.theme.screen.md})),ee=T.c.div(S||(S=Object(M.a)(["\n  display: flex;\n  margin: 30px 0;\n\n  @media "," {\n    margin: 50px 10px;\n  }\n\n  @media "," {\n    margin: 50px 20px;\n  }\n"])),(function(e){return e.theme.screen.md}),(function(e){return e.theme.screen.lg}))},916:function(e,n,t){"use strict";t.d(n,"b",(function(){return o})),t.d(n,"a",(function(){return d}));var r,i,a=t(8),s=t(7),o=s.c.div(r||(r=Object(a.a)(["\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n"]))),d=s.c.select(i||(i=Object(a.a)(["\n  color: black;\n  width: 200px;\n"])))},976:function(e,n,t){"use strict";t.d(n,"a",(function(){return _}));var r=t(1),i=t(81),a=t(330),s=t(312),o=t(17),d=t(116),c=t(31),f=t(6),u=t(18),h=t(326),l=t(38),p=t(325),m=t(916),x=t(84),b=t(218),g=t(217),j=t(4),v=function(e){var n=e.profile,t=e.asset,i=(e.onDismiss,e.network),a=Object(r.useState)({toAddress:"",cardAddress:t.address,tokenId:null}),s=Object(u.a)(a,2),o=s[0],d=s[1],v=Object(b.a)(o.cardAddress,o.toAddress,o.tokenId,n,i),O=v.transferCard,A=(v.transferState,v.error,Object(g.a)()),w=Object(u.a)(A,4),_=w[0],z=w[1],C=w[2],y=w[3],k=function(e){var n;"cardAddress"===e.currentTarget.name&&e.currentTarget.value!==o.cardAddress?d(Object(f.a)(Object(f.a)({},o),{},(n={},Object(c.a)(n,e.currentTarget.name,e.currentTarget.value),Object(c.a)(n,"tokenId",null),n))):("toAddress"===e.currentTarget.name&&C(e.currentTarget.value,i),d(Object(f.a)(Object(f.a)({},o),{},Object(c.a)({},e.currentTarget.name,e.currentTarget.value))))};return Object(j.jsxs)(m.b,{children:[Object(j.jsx)(h.a,{profile:_,profileError:z,isProfileLoading:y}),[{name:"toAddress",label:"To",type:"text"},{name:"cardName",label:"Card Name",type:"select"},{name:"cardAddress",label:"Card Address",type:"select"},{name:"tokenId",label:"Token Id",type:"select"}].map((function(e,r){var i;return Object(j.jsxs)(p.j,{children:[Object(j.jsx)(p.k,{htmlFor:e.name,children:e.label}),"text"===e.type&&Object(j.jsx)(p.i,{id:e.name,name:e.name,type:e.type,onChange:k}),"select"===e.type&&"cardName"===e.name&&Object(j.jsx)("p",{children:t.name}),"select"===e.type&&"cardAddress"===e.name&&Object(j.jsx)("p",{children:Object(x.e)(t.address)}),"select"===e.type&&"tokenId"===e.name&&Object(j.jsxs)(m.a,{name:e.name,onChange:k,children:[Object(j.jsx)("option",{children:"Select token id"}),null===(i=n.ownedAssets.find((function(e){return e.assetAddress===t.address})))||void 0===i?void 0:i.tokenIds.map((function(e,n){return Object(j.jsx)("option",{value:e,defaultValue:e,children:e},n)}))]})]},r)})),Object(j.jsx)(l.f,{children:Object(j.jsx)(l.e,{onClick:O,children:"Transfer Card"})})]})},O=t(161),A=t(327),w=t(55),_=function(e){var n=e.digitalCard,t=e.type,r=e.profile,c=e.canTransfer,f=Object(w.a)().network,u=Object(o.e)(f),h=Object(A.a)(r?r.address:"",n.address).ownedTokenIds,l=Object(d.a)(Object(j.jsx)(v,{profile:{address:(null===r||void 0===r?void 0:r.address)?r.address:"",owner:(null===r||void 0===r?void 0:r.owner)?r.owner:"",isOwnerKeyManager:!!(null===r||void 0===r?void 0:r.isOwnerKeyManager)&&r.isOwnerKeyManager,ownedAssets:(null===r||void 0===r?void 0:r.ownedAssets)?r.ownedAssets:[]},asset:n,onDismiss:function(){return m()},network:f}),"Card Transfer Modal","Transfer Card"),p=l.handlePresent,m=l.onDismiss;return Object(j.jsxs)(s.e,{children:["l14"===f&&Object(j.jsx)("a",{href:"https://universalprofile.cloud/asset/"+n.address,target:"_blank",rel:"noreferrer",children:Object(j.jsx)(s.j,{src:a.a,alt:""})}),!0===c&&Object(j.jsx)(s.h,{onClick:p,children:Object(j.jsx)(s.i,{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHdSURBVFiF1dexaxRBFMfxj4cQgl4shahYCKlSGEmRQjSof0CaQKy00MZOWxMrJU0KRf+BVNoc/g8G/wRBIY1aiIlFCCEEMVmL2SPDurO3SW7v8MHAzb335vfdmXtv9vjPbBZvMDYM8TnsIcs/D9QW8DsXzzA/SPGH2I/EBwrwCAcF8b4CnK7wPcXzhG+mxto/8QPrAvSRbNm/T33c8Q2vcKmu+EofxeOxiyW0egH8agigO95jpArgDnYahljttQvXsdUwxL2u2EeslUBMSx9H3TI8gyksYqOwxneMir5olywwKZRSP/rAGDqFdRZigKuJxAmhlOoAzCp/kK61ChBvYTufLFUkXnbYUFIAt3PfJ4xXrHXO4XF8hi/5ZEP1NTueL57hVol/PgJcz6FT9iyP24Z3UWJHdaNo40bCFwNkwrFNJGKnojh3C4kdYZuOakWATPgBT5bEtmOAUaEk4sRNYZuu4ewJADKhlKdL4tfwoTu5n0ju19gSmlulrTYMsSO0+aSNCBdFkxCbvXahJfSD3YYAVnoBdO0iXuJrH8WXy4RO1YC5ggs43yNuBk8SvkW8qKF1IisrwwM8blo4BbCPB4MSLwL8Eb1wDMrmcvE9Q/jrRrhJX+PmMMSPbX8BpqlvT1UmYJ0AAAAASUVORK5CYII=",alt:""})}),Object(j.jsx)("a",{href:u&&u.exploreUrl+n.address,target:"_blank",rel:"noreferrer",children:Object(j.jsx)(s.a,{src:null===u||void 0===u?void 0:u.icon,alt:""})}),Object(j.jsxs)(i.b,{to:"owned"===t?"/up/".concat(f,"/asset/").concat(n.address,"/").concat(h?h[0]:""):"/up/".concat(f,"/asset/")+n.address,children:[Object(j.jsx)(s.f,{children:Object(j.jsx)(s.g,{src:function(){if("erc721"===n.supportedInterface){var e,t=null===(e=n.lsp8MetaData[0])||void 0===e?void 0:e.image;return t&&O.a.convertURL(t)}var r,i=null===n||void 0===n||null===(r=n.lsp8MetaData[0])||void 0===r?void 0:r.LSP4Metadata.images[0][0].url;return i&&O.a.convertURL(i)}(),alt:""})}),Object(j.jsxs)(s.b,{children:[Object(j.jsx)(s.d,{children:n.name.split("\u2022")[0]}),Object(j.jsx)(s.c,{children:n.name})]})]})]})}}}]);
//# sourceMappingURL=1.ce93ddfb.chunk.js.map