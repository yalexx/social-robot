// Click&Clean for Google Chrome - HOTCLEANER.COM - Copyright (c) 2018 Vlad & Serge Strukoff. All Rights Reserved.
(function(){var a=self.window,k=a.JSON,l=a.Object,z=a.Audio,d=a.chrome,m=d.runtime;chrome_windows=d.windows;var r=m.sendMessage,A=chrome_windows.getAll,B=chrome_windows.update,t=chrome_windows.remove,C=chrome_windows.getCurrent,u=Navigator.prototype,D=XMLHttpRequest.prototype,v=DocumentFragment.prototype,b=Document.prototype,w=DOMImplementation.prototype,f=EventTarget.prototype,n=Event.prototype,e=Node.prototype,c=Element.prototype,g=HTMLElement.prototype,E=f.addEventListener,F=HTMLMediaElement.prototype.play,
x=k.stringify,G=a.setTimeout;try{var h=l.getOwnPropertyDescriptor(Function.prototype,"call");h&&(h.configurable=!1,h.writable=!1,l.defineProperty(Function.prototype,"call",h))}catch(y){}try{v.querySelector=v.querySelectorAll=b.adoptNode=b.append=b.captureEvents=b.getElementById=b.getElementsByClassName=b.getElementsByName=b.getElementsByTagName=b.getElementsByTagNameNS=b.createDocumentFragment=b.createTextNode=b.createElement=b.createElementNS=b.evaluate=b.createEvent=b.createCDATASection=b.execCommand=
b.querySelector=b.querySelectorAll=b.open=b.write=b.writeln=b.prepend=b.importNode=b.registerElement=w.createHTMLDocument=w.createDocument=f.addEventListener=f.removeEventListener=f.dispatchEvent=n.preventDefault=n.stopPropagation=n.stopImmediatePropagation=e.appendChild=e.cloneNode=e.getRootNode=e.insertBefore=e.removeChild=e.replaceChild=c.attachShadow=c.createShadowRoot=c.getElementsByClassName=c.getElementsByTagName=c.getElementsByTagNameNS=c.append=c.remove=c.before=c.after=c.prepend=c.querySelector=
c.querySelectorAll=c.requestPointerLock=c.setAttribute=c.removeAttribute=c.removeAttributeNS=c.removeAttributeNode=c.replaceWith=c.insertAdjacentElement=c.insertAdjacentText=c.insertAdjacentHTML=g.focus=g.click=u.sendBeacon=D.open=function(){}}catch(y){}delete a.AnimationWorklet;delete a.AudioContext;delete a.Audio;delete a.Blob;delete a.CSS;delete a.CustomElementRegistry;delete a.CustomEvent;delete a.DOMImplementation;delete a.DOMParser;delete a.Event;delete a.FormData;delete a.Image;delete a.JSON;
delete a.LayoutWorklet;delete a.MutationObserver;delete a.Navigator;delete a.PaintWorklet;delete a.Proxy;delete a.Range;delete a.Request;delete a.Response;delete a.ServiceWorker;delete a.SharedWorker;delete a.Storage;delete a.URL;delete a.WebAssembly;delete a.WebSocket;delete a.Worker;delete a.XMLHttpRequest;delete a.XMLHttpRequestUpload;delete a.XMLSerializer;delete a.XSLTProcessor;delete a.fetch;delete a.close;delete a.open;delete a.alert;delete a.confirm;delete a.eval;delete a.localStorage;delete a.postMessage;
delete a.prompt;delete a.stop;delete a.customElements;delete a.navigator;delete e.textContent;delete b.cookie;delete b.body;delete u.serviceWorker;delete c.innerHTML;delete c.outerHTML;delete g.innerText;delete g.outerText;delete d.Event;for(var p in d)if("runtime"==p)for(var q in d.runtime)"function"===typeof d.runtime[q]&&"connect"!==q&&(d.runtime[q]=function(){});else if("object"===typeof d[p])try{l.defineProperty(d,p,{configurable:!1,enumerable:!1,writable:!1,value:{}})}catch(y){}E.call(a,"DOMContentLoaded",
function(){function b(b){f=b.id;B.call(chrome_windows,f,{width:300+(a.outerWidth-a.innerWidth),height:8+(a.outerHeight-a.innerHeight),focused:!0},function(){A.call(chrome_windows,{},c)})}function c(a){for(var b=0,c;c=a[b];++b)c.id!=f&&t.call(chrome_windows,c.id);r.call(m,x.call(k,{id:18}),g.p28?d:e)}function d(){try{var b=new z("bSWDj/erased.ogg");F.call(b)}catch(H){}G.call(a,e,1100)}function e(){t.call(chrome_windows,f)}var f,g;r.call(m,x.call(k,{id:3}),function(a){g=a;C.call(chrome_windows,b)})},
!0)})();