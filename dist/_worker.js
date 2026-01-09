var xt=Object.defineProperty;var Ue=e=>{throw TypeError(e)};var vt=(e,t,a)=>t in e?xt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var h=(e,t,a)=>vt(e,typeof t!="symbol"?t+"":t,a),Be=(e,t,a)=>t.has(e)||Ue("Cannot "+a);var i=(e,t,a)=>(Be(e,t,"read from private field"),a?a.call(e):t.get(e)),m=(e,t,a)=>t.has(e)?Ue("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,a),f=(e,t,a,r)=>(Be(e,t,"write to private field"),r?r.call(e,a):t.set(e,a),a),b=(e,t,a)=>(Be(e,t,"access private method"),a);var $e=(e,t,a,r)=>({set _(n){f(e,t,n,a)},get _(){return i(e,t,r)}});var Ge=(e,t,a)=>(r,n)=>{let o=-1;return s(0);async function s(c){if(c<=o)throw new Error("next() called multiple times");o=c;let l,d=!1,u;if(e[c]?(u=e[c][0][0],r.req.routeIndex=c):u=c===e.length&&n||void 0,u)try{l=await u(r,()=>s(c+1))}catch(g){if(g instanceof Error&&t)r.error=g,l=await t(g,r),d=!0;else throw g}else r.finalized===!1&&a&&(l=await a(r));return l&&(r.finalized===!1||d)&&(r.res=l),r}},yt=Symbol(),wt=async(e,t=Object.create(null))=>{const{all:a=!1,dot:r=!1}=t,o=(e instanceof nt?e.raw.headers:e.headers).get("Content-Type");return o!=null&&o.startsWith("multipart/form-data")||o!=null&&o.startsWith("application/x-www-form-urlencoded")?It(e,{all:a,dot:r}):{}};async function It(e,t){const a=await e.formData();return a?Tt(a,t):{}}function Tt(e,t){const a=Object.create(null);return e.forEach((r,n)=>{t.all||n.endsWith("[]")?St(a,n,r):a[n]=r}),t.dot&&Object.entries(a).forEach(([r,n])=>{r.includes(".")&&(Et(a,r,n),delete a[r])}),a}var St=(e,t,a)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(a):e[t]=[e[t],a]:t.endsWith("[]")?e[t]=[a]:e[t]=a},Et=(e,t,a)=>{let r=e;const n=t.split(".");n.forEach((o,s)=>{s===n.length-1?r[o]=a:((!r[o]||typeof r[o]!="object"||Array.isArray(r[o])||r[o]instanceof File)&&(r[o]=Object.create(null)),r=r[o])})},Qe=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},kt=e=>{const{groups:t,path:a}=Ct(e),r=Qe(a);return Rt(r,t)},Ct=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(a,r)=>{const n=`@${r}`;return t.push([n,a]),n}),{groups:t,path:e}},Rt=(e,t)=>{for(let a=t.length-1;a>=0;a--){const[r]=t[a];for(let n=e.length-1;n>=0;n--)if(e[n].includes(r)){e[n]=e[n].replace(r,t[a][1]);break}}return e},Ee={},Lt=(e,t)=>{if(e==="*")return"*";const a=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(a){const r=`${e}#${t}`;return Ee[r]||(a[2]?Ee[r]=t&&t[0]!==":"&&t[0]!=="*"?[r,a[1],new RegExp(`^${a[2]}(?=/${t})`)]:[e,a[1],new RegExp(`^${a[2]}$`)]:Ee[r]=[e,a[1],!0]),Ee[r]}return null},ze=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,a=>{try{return t(a)}catch{return a}})}},At=e=>ze(e,decodeURI),et=e=>{const t=e.url,a=t.indexOf("/",t.indexOf(":")+4);let r=a;for(;r<t.length;r++){const n=t.charCodeAt(r);if(n===37){const o=t.indexOf("?",r),s=t.slice(a,o===-1?void 0:o);return At(s.includes("%25")?s.replace(/%25/g,"%2525"):s)}else if(n===63)break}return t.slice(a,r)},Dt=e=>{const t=et(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},re=(e,t,...a)=>(a.length&&(t=re(t,...a)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),tt=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),a=[];let r="";return t.forEach(n=>{if(n!==""&&!/\:/.test(n))r+="/"+n;else if(/\:/.test(n))if(/\?/.test(n)){a.length===0&&r===""?a.push("/"):a.push(r);const o=n.replace("?","");r+="/"+o,a.push(r)}else r+="/"+n}),a.filter((n,o,s)=>s.indexOf(n)===o)},Oe=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?ze(e,rt):e):e,at=(e,t,a)=>{let r;if(!a&&t&&!/[%+]/.test(t)){let s=e.indexOf("?",8);if(s===-1)return;for(e.startsWith(t,s+1)||(s=e.indexOf(`&${t}`,s+1));s!==-1;){const c=e.charCodeAt(s+t.length+1);if(c===61){const l=s+t.length+2,d=e.indexOf("&",l);return Oe(e.slice(l,d===-1?void 0:d))}else if(c==38||isNaN(c))return"";s=e.indexOf(`&${t}`,s+1)}if(r=/[%+]/.test(e),!r)return}const n={};r??(r=/[%+]/.test(e));let o=e.indexOf("?",8);for(;o!==-1;){const s=e.indexOf("&",o+1);let c=e.indexOf("=",o);c>s&&s!==-1&&(c=-1);let l=e.slice(o+1,c===-1?s===-1?void 0:s:c);if(r&&(l=Oe(l)),o=s,l==="")continue;let d;c===-1?d="":(d=e.slice(c+1,s===-1?void 0:s),r&&(d=Oe(d))),a?(n[l]&&Array.isArray(n[l])||(n[l]=[]),n[l].push(d)):n[l]??(n[l]=d)}return t?n[t]:n},Ht=at,Bt=(e,t)=>at(e,t,!0),rt=decodeURIComponent,_e=e=>ze(e,rt),se,R,z,ot,st,je,$,We,nt=(We=class{constructor(e,t="/",a=[[]]){m(this,z);h(this,"raw");m(this,se);m(this,R);h(this,"routeIndex",0);h(this,"path");h(this,"bodyCache",{});m(this,$,e=>{const{bodyCache:t,raw:a}=this,r=t[e];if(r)return r;const n=Object.keys(t)[0];return n?t[n].then(o=>(n==="json"&&(o=JSON.stringify(o)),new Response(o)[e]())):t[e]=a[e]()});this.raw=e,this.path=t,f(this,R,a),f(this,se,{})}param(e){return e?b(this,z,ot).call(this,e):b(this,z,st).call(this)}query(e){return Ht(this.url,e)}queries(e){return Bt(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((a,r)=>{t[r]=a}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await wt(this,e))}json(){return i(this,$).call(this,"text").then(e=>JSON.parse(e))}text(){return i(this,$).call(this,"text")}arrayBuffer(){return i(this,$).call(this,"arrayBuffer")}blob(){return i(this,$).call(this,"blob")}formData(){return i(this,$).call(this,"formData")}addValidatedData(e,t){i(this,se)[e]=t}valid(e){return i(this,se)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[yt](){return i(this,R)}get matchedRoutes(){return i(this,R)[0].map(([[,e]])=>e)}get routePath(){return i(this,R)[0].map(([[,e]])=>e)[this.routeIndex].path}},se=new WeakMap,R=new WeakMap,z=new WeakSet,ot=function(e){const t=i(this,R)[0][this.routeIndex][1][e],a=b(this,z,je).call(this,t);return a&&/\%/.test(a)?_e(a):a},st=function(){const e={},t=Object.keys(i(this,R)[0][this.routeIndex][1]);for(const a of t){const r=b(this,z,je).call(this,i(this,R)[0][this.routeIndex][1][a]);r!==void 0&&(e[a]=/\%/.test(r)?_e(r):r)}return e},je=function(e){return i(this,R)[1]?i(this,R)[1][e]:e},$=new WeakMap,We),Ot={Stringify:1},it=async(e,t,a,r,n)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const o=e.callbacks;return o!=null&&o.length?(n?n[0]+=e:n=[e],Promise.all(o.map(c=>c({phase:t,buffer:n,context:r}))).then(c=>Promise.all(c.filter(Boolean).map(l=>it(l,t,!1,r,n))).then(()=>n[0]))):Promise.resolve(e)},Ft="text/plain; charset=UTF-8",Fe=(e,t)=>({"Content-Type":e,...t}),be,xe,O,ie,F,E,ve,le,de,J,ye,we,G,ne,Ye,Pt=(Ye=class{constructor(e,t){m(this,G);m(this,be);m(this,xe);h(this,"env",{});m(this,O);h(this,"finalized",!1);h(this,"error");m(this,ie);m(this,F);m(this,E);m(this,ve);m(this,le);m(this,de);m(this,J);m(this,ye);m(this,we);h(this,"render",(...e)=>(i(this,le)??f(this,le,t=>this.html(t)),i(this,le).call(this,...e)));h(this,"setLayout",e=>f(this,ve,e));h(this,"getLayout",()=>i(this,ve));h(this,"setRenderer",e=>{f(this,le,e)});h(this,"header",(e,t,a)=>{this.finalized&&f(this,E,new Response(i(this,E).body,i(this,E)));const r=i(this,E)?i(this,E).headers:i(this,J)??f(this,J,new Headers);t===void 0?r.delete(e):a!=null&&a.append?r.append(e,t):r.set(e,t)});h(this,"status",e=>{f(this,ie,e)});h(this,"set",(e,t)=>{i(this,O)??f(this,O,new Map),i(this,O).set(e,t)});h(this,"get",e=>i(this,O)?i(this,O).get(e):void 0);h(this,"newResponse",(...e)=>b(this,G,ne).call(this,...e));h(this,"body",(e,t,a)=>b(this,G,ne).call(this,e,t,a));h(this,"text",(e,t,a)=>!i(this,J)&&!i(this,ie)&&!t&&!a&&!this.finalized?new Response(e):b(this,G,ne).call(this,e,t,Fe(Ft,a)));h(this,"json",(e,t,a)=>b(this,G,ne).call(this,JSON.stringify(e),t,Fe("application/json",a)));h(this,"html",(e,t,a)=>{const r=n=>b(this,G,ne).call(this,n,t,Fe("text/html; charset=UTF-8",a));return typeof e=="object"?it(e,Ot.Stringify,!1,{}).then(r):r(e)});h(this,"redirect",(e,t)=>{const a=String(e);return this.header("Location",/[^\x00-\xFF]/.test(a)?encodeURI(a):a),this.newResponse(null,t??302)});h(this,"notFound",()=>(i(this,de)??f(this,de,()=>new Response),i(this,de).call(this,this)));f(this,be,e),t&&(f(this,F,t.executionCtx),this.env=t.env,f(this,de,t.notFoundHandler),f(this,we,t.path),f(this,ye,t.matchResult))}get req(){return i(this,xe)??f(this,xe,new nt(i(this,be),i(this,we),i(this,ye))),i(this,xe)}get event(){if(i(this,F)&&"respondWith"in i(this,F))return i(this,F);throw Error("This context has no FetchEvent")}get executionCtx(){if(i(this,F))return i(this,F);throw Error("This context has no ExecutionContext")}get res(){return i(this,E)||f(this,E,new Response(null,{headers:i(this,J)??f(this,J,new Headers)}))}set res(e){if(i(this,E)&&e){e=new Response(e.body,e);for(const[t,a]of i(this,E).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const r=i(this,E).headers.getSetCookie();e.headers.delete("set-cookie");for(const n of r)e.headers.append("set-cookie",n)}else e.headers.set(t,a)}f(this,E,e),this.finalized=!0}get var(){return i(this,O)?Object.fromEntries(i(this,O)):{}}},be=new WeakMap,xe=new WeakMap,O=new WeakMap,ie=new WeakMap,F=new WeakMap,E=new WeakMap,ve=new WeakMap,le=new WeakMap,de=new WeakMap,J=new WeakMap,ye=new WeakMap,we=new WeakMap,G=new WeakSet,ne=function(e,t,a){const r=i(this,E)?new Headers(i(this,E).headers):i(this,J)??new Headers;if(typeof t=="object"&&"headers"in t){const o=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[s,c]of o)s.toLowerCase()==="set-cookie"?r.append(s,c):r.set(s,c)}if(a)for(const[o,s]of Object.entries(a))if(typeof s=="string")r.set(o,s);else{r.delete(o);for(const c of s)r.append(o,c)}const n=typeof t=="number"?t:(t==null?void 0:t.status)??i(this,ie);return new Response(e,{status:n,headers:r})},Ye),y="ALL",jt="all",zt=["get","post","put","delete","options","patch"],lt="Can not add a route since the matcher is already built.",dt=class extends Error{},Mt="__COMPOSED_HANDLER",Nt=e=>e.text("404 Not Found",404),qe=(e,t)=>{if("getResponse"in e){const a=e.getResponse();return t.newResponse(a.body,a)}return console.error(e),t.text("Internal Server Error",500)},L,w,ct,A,Y,ke,Ce,ce,Ut=(ce=class{constructor(t={}){m(this,w);h(this,"get");h(this,"post");h(this,"put");h(this,"delete");h(this,"options");h(this,"patch");h(this,"all");h(this,"on");h(this,"use");h(this,"router");h(this,"getPath");h(this,"_basePath","/");m(this,L,"/");h(this,"routes",[]);m(this,A,Nt);h(this,"errorHandler",qe);h(this,"onError",t=>(this.errorHandler=t,this));h(this,"notFound",t=>(f(this,A,t),this));h(this,"fetch",(t,...a)=>b(this,w,Ce).call(this,t,a[1],a[0],t.method));h(this,"request",(t,a,r,n)=>t instanceof Request?this.fetch(a?new Request(t,a):t,r,n):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${re("/",t)}`,a),r,n)));h(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(b(this,w,Ce).call(this,t.request,t,void 0,t.request.method))})});[...zt,jt].forEach(o=>{this[o]=(s,...c)=>(typeof s=="string"?f(this,L,s):b(this,w,Y).call(this,o,i(this,L),s),c.forEach(l=>{b(this,w,Y).call(this,o,i(this,L),l)}),this)}),this.on=(o,s,...c)=>{for(const l of[s].flat()){f(this,L,l);for(const d of[o].flat())c.map(u=>{b(this,w,Y).call(this,d.toUpperCase(),i(this,L),u)})}return this},this.use=(o,...s)=>(typeof o=="string"?f(this,L,o):(f(this,L,"*"),s.unshift(o)),s.forEach(c=>{b(this,w,Y).call(this,y,i(this,L),c)}),this);const{strict:r,...n}=t;Object.assign(this,n),this.getPath=r??!0?t.getPath??et:Dt}route(t,a){const r=this.basePath(t);return a.routes.map(n=>{var s;let o;a.errorHandler===qe?o=n.handler:(o=async(c,l)=>(await Ge([],a.errorHandler)(c,()=>n.handler(c,l))).res,o[Mt]=n.handler),b(s=r,w,Y).call(s,n.method,n.path,o)}),this}basePath(t){const a=b(this,w,ct).call(this);return a._basePath=re(this._basePath,t),a}mount(t,a,r){let n,o;r&&(typeof r=="function"?o=r:(o=r.optionHandler,r.replaceRequest===!1?n=l=>l:n=r.replaceRequest));const s=o?l=>{const d=o(l);return Array.isArray(d)?d:[d]}:l=>{let d;try{d=l.executionCtx}catch{}return[l.env,d]};n||(n=(()=>{const l=re(this._basePath,t),d=l==="/"?0:l.length;return u=>{const g=new URL(u.url);return g.pathname=g.pathname.slice(d)||"/",new Request(g,u)}})());const c=async(l,d)=>{const u=await a(n(l.req.raw),...s(l));if(u)return u;await d()};return b(this,w,Y).call(this,y,re(t,"*"),c),this}},L=new WeakMap,w=new WeakSet,ct=function(){const t=new ce({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,f(t,A,i(this,A)),t.routes=this.routes,t},A=new WeakMap,Y=function(t,a,r){t=t.toUpperCase(),a=re(this._basePath,a);const n={basePath:this._basePath,path:a,method:t,handler:r};this.router.add(t,a,[r,n]),this.routes.push(n)},ke=function(t,a){if(t instanceof Error)return this.errorHandler(t,a);throw t},Ce=function(t,a,r,n){if(n==="HEAD")return(async()=>new Response(null,await b(this,w,Ce).call(this,t,a,r,"GET")))();const o=this.getPath(t,{env:r}),s=this.router.match(n,o),c=new Pt(t,{path:o,matchResult:s,env:r,executionCtx:a,notFoundHandler:i(this,A)});if(s[0].length===1){let d;try{d=s[0][0][0][0](c,async()=>{c.res=await i(this,A).call(this,c)})}catch(u){return b(this,w,ke).call(this,u,c)}return d instanceof Promise?d.then(u=>u||(c.finalized?c.res:i(this,A).call(this,c))).catch(u=>b(this,w,ke).call(this,u,c)):d??i(this,A).call(this,c)}const l=Ge(s[0],this.errorHandler,i(this,A));return(async()=>{try{const d=await l(c);if(!d.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return d.res}catch(d){return b(this,w,ke).call(this,d,c)}})()},ce),ut=[];function $t(e,t){const a=this.buildAllMatchers(),r=(n,o)=>{const s=a[n]||a[y],c=s[2][o];if(c)return c;const l=o.match(s[0]);if(!l)return[[],ut];const d=l.indexOf("",1);return[s[1][d],l]};return this.match=r,r(e,t)}var Le="[^/]+",me=".*",pe="(?:|/.*)",oe=Symbol(),Gt=new Set(".\\+*[^]$()");function _t(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===me||e===pe?1:t===me||t===pe?-1:e===Le?1:t===Le?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var X,K,D,te,qt=(te=class{constructor(){m(this,X);m(this,K);m(this,D,Object.create(null))}insert(t,a,r,n,o){if(t.length===0){if(i(this,X)!==void 0)throw oe;if(o)return;f(this,X,a);return}const[s,...c]=t,l=s==="*"?c.length===0?["","",me]:["","",Le]:s==="/*"?["","",pe]:s.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let d;if(l){const u=l[1];let g=l[2]||Le;if(u&&l[2]&&(g===".*"||(g=g.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(g))))throw oe;if(d=i(this,D)[g],!d){if(Object.keys(i(this,D)).some(p=>p!==me&&p!==pe))throw oe;if(o)return;d=i(this,D)[g]=new te,u!==""&&f(d,K,n.varIndex++)}!o&&u!==""&&r.push([u,i(d,K)])}else if(d=i(this,D)[s],!d){if(Object.keys(i(this,D)).some(u=>u.length>1&&u!==me&&u!==pe))throw oe;if(o)return;d=i(this,D)[s]=new te}d.insert(c,a,r,n,o)}buildRegExpStr(){const a=Object.keys(i(this,D)).sort(_t).map(r=>{const n=i(this,D)[r];return(typeof i(n,K)=="number"?`(${r})@${i(n,K)}`:Gt.has(r)?`\\${r}`:r)+n.buildRegExpStr()});return typeof i(this,X)=="number"&&a.unshift(`#${i(this,X)}`),a.length===0?"":a.length===1?a[0]:"(?:"+a.join("|")+")"}},X=new WeakMap,K=new WeakMap,D=new WeakMap,te),Ae,Ie,Ve,Zt=(Ve=class{constructor(){m(this,Ae,{varIndex:0});m(this,Ie,new qt)}insert(e,t,a){const r=[],n=[];for(let s=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,l=>{const d=`@\\${s}`;return n[s]=[d,l],s++,c=!0,d}),!c)break}const o=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let s=n.length-1;s>=0;s--){const[c]=n[s];for(let l=o.length-1;l>=0;l--)if(o[l].indexOf(c)!==-1){o[l]=o[l].replace(c,n[s][1]);break}}return i(this,Ie).insert(o,t,r,i(this,Ae),a),r}buildRegExp(){let e=i(this,Ie).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const a=[],r=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(n,o,s)=>o!==void 0?(a[++t]=Number(o),"$()"):(s!==void 0&&(r[Number(s)]=++t),"")),[new RegExp(`^${e}`),a,r]}},Ae=new WeakMap,Ie=new WeakMap,Ve),Wt=[/^$/,[],Object.create(null)],Re=Object.create(null);function gt(e){return Re[e]??(Re[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,a)=>a?`\\${a}`:"(?:|/.*)")}$`))}function Yt(){Re=Object.create(null)}function Vt(e){var d;const t=new Zt,a=[];if(e.length===0)return Wt;const r=e.map(u=>[!/\*|\/:/.test(u[0]),...u]).sort(([u,g],[p,v])=>u?1:p?-1:g.length-v.length),n=Object.create(null);for(let u=0,g=-1,p=r.length;u<p;u++){const[v,k,M]=r[u];v?n[k]=[M.map(([S])=>[S,Object.create(null)]),ut]:g++;let x;try{x=t.insert(k,g,v)}catch(S){throw S===oe?new dt(k):S}v||(a[g]=M.map(([S,N])=>{const Te=Object.create(null);for(N-=1;N>=0;N--){const[Se,H]=x[N];Te[Se]=H}return[S,Te]}))}const[o,s,c]=t.buildRegExp();for(let u=0,g=a.length;u<g;u++)for(let p=0,v=a[u].length;p<v;p++){const k=(d=a[u][p])==null?void 0:d[1];if(!k)continue;const M=Object.keys(k);for(let x=0,S=M.length;x<S;x++)k[M[x]]=c[k[M[x]]]}const l=[];for(const u in s)l[u]=a[s[u]];return[o,l,n]}function ae(e,t){if(e){for(const a of Object.keys(e).sort((r,n)=>n.length-r.length))if(gt(a).test(t))return[...e[a]]}}var _,q,De,ft,Je,Jt=(Je=class{constructor(){m(this,De);h(this,"name","RegExpRouter");m(this,_);m(this,q);h(this,"match",$t);f(this,_,{[y]:Object.create(null)}),f(this,q,{[y]:Object.create(null)})}add(e,t,a){var c;const r=i(this,_),n=i(this,q);if(!r||!n)throw new Error(lt);r[e]||[r,n].forEach(l=>{l[e]=Object.create(null),Object.keys(l[y]).forEach(d=>{l[e][d]=[...l[y][d]]})}),t==="/*"&&(t="*");const o=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const l=gt(t);e===y?Object.keys(r).forEach(d=>{var u;(u=r[d])[t]||(u[t]=ae(r[d],t)||ae(r[y],t)||[])}):(c=r[e])[t]||(c[t]=ae(r[e],t)||ae(r[y],t)||[]),Object.keys(r).forEach(d=>{(e===y||e===d)&&Object.keys(r[d]).forEach(u=>{l.test(u)&&r[d][u].push([a,o])})}),Object.keys(n).forEach(d=>{(e===y||e===d)&&Object.keys(n[d]).forEach(u=>l.test(u)&&n[d][u].push([a,o]))});return}const s=tt(t)||[t];for(let l=0,d=s.length;l<d;l++){const u=s[l];Object.keys(n).forEach(g=>{var p;(e===y||e===g)&&((p=n[g])[u]||(p[u]=[...ae(r[g],u)||ae(r[y],u)||[]]),n[g][u].push([a,o-d+l+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(i(this,q)).concat(Object.keys(i(this,_))).forEach(t=>{e[t]||(e[t]=b(this,De,ft).call(this,t))}),f(this,_,f(this,q,void 0)),Yt(),e}},_=new WeakMap,q=new WeakMap,De=new WeakSet,ft=function(e){const t=[];let a=e===y;return[i(this,_),i(this,q)].forEach(r=>{const n=r[e]?Object.keys(r[e]).map(o=>[o,r[e][o]]):[];n.length!==0?(a||(a=!0),t.push(...n)):e!==y&&t.push(...Object.keys(r[y]).map(o=>[o,r[y][o]]))}),a?Vt(t):null},Je),Z,P,Xe,Xt=(Xe=class{constructor(e){h(this,"name","SmartRouter");m(this,Z,[]);m(this,P,[]);f(this,Z,e.routers)}add(e,t,a){if(!i(this,P))throw new Error(lt);i(this,P).push([e,t,a])}match(e,t){if(!i(this,P))throw new Error("Fatal error");const a=i(this,Z),r=i(this,P),n=a.length;let o=0,s;for(;o<n;o++){const c=a[o];try{for(let l=0,d=r.length;l<d;l++)c.add(...r[l]);s=c.match(e,t)}catch(l){if(l instanceof dt)continue;throw l}this.match=c.match.bind(c),f(this,Z,[c]),f(this,P,void 0);break}if(o===n)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,s}get activeRouter(){if(i(this,P)||i(this,Z).length!==1)throw new Error("No active router has been determined yet.");return i(this,Z)[0]}},Z=new WeakMap,P=new WeakMap,Xe),he=Object.create(null),W,T,Q,ue,I,j,V,ge,Kt=(ge=class{constructor(t,a,r){m(this,j);m(this,W);m(this,T);m(this,Q);m(this,ue,0);m(this,I,he);if(f(this,T,r||Object.create(null)),f(this,W,[]),t&&a){const n=Object.create(null);n[t]={handler:a,possibleKeys:[],score:0},f(this,W,[n])}f(this,Q,[])}insert(t,a,r){f(this,ue,++$e(this,ue)._);let n=this;const o=kt(a),s=[];for(let c=0,l=o.length;c<l;c++){const d=o[c],u=o[c+1],g=Lt(d,u),p=Array.isArray(g)?g[0]:d;if(p in i(n,T)){n=i(n,T)[p],g&&s.push(g[1]);continue}i(n,T)[p]=new ge,g&&(i(n,Q).push(g),s.push(g[1])),n=i(n,T)[p]}return i(n,W).push({[t]:{handler:r,possibleKeys:s.filter((c,l,d)=>d.indexOf(c)===l),score:i(this,ue)}}),n}search(t,a){var l;const r=[];f(this,I,he);let o=[this];const s=Qe(a),c=[];for(let d=0,u=s.length;d<u;d++){const g=s[d],p=d===u-1,v=[];for(let k=0,M=o.length;k<M;k++){const x=o[k],S=i(x,T)[g];S&&(f(S,I,i(x,I)),p?(i(S,T)["*"]&&r.push(...b(this,j,V).call(this,i(S,T)["*"],t,i(x,I))),r.push(...b(this,j,V).call(this,S,t,i(x,I)))):v.push(S));for(let N=0,Te=i(x,Q).length;N<Te;N++){const Se=i(x,Q)[N],H=i(x,I)===he?{}:{...i(x,I)};if(Se==="*"){const U=i(x,T)["*"];U&&(r.push(...b(this,j,V).call(this,U,t,i(x,I))),f(U,I,H),v.push(U));continue}const[pt,Ne,fe]=Se;if(!g&&!(fe instanceof RegExp))continue;const B=i(x,T)[pt],bt=s.slice(d).join("/");if(fe instanceof RegExp){const U=fe.exec(bt);if(U){if(H[Ne]=U[0],r.push(...b(this,j,V).call(this,B,t,i(x,I),H)),Object.keys(i(B,T)).length){f(B,I,H);const He=((l=U[0].match(/\//))==null?void 0:l.length)??0;(c[He]||(c[He]=[])).push(B)}continue}}(fe===!0||fe.test(g))&&(H[Ne]=g,p?(r.push(...b(this,j,V).call(this,B,t,H,i(x,I))),i(B,T)["*"]&&r.push(...b(this,j,V).call(this,i(B,T)["*"],t,H,i(x,I)))):(f(B,I,H),v.push(B)))}}o=v.concat(c.shift()??[])}return r.length>1&&r.sort((d,u)=>d.score-u.score),[r.map(({handler:d,params:u})=>[d,u])]}},W=new WeakMap,T=new WeakMap,Q=new WeakMap,ue=new WeakMap,I=new WeakMap,j=new WeakSet,V=function(t,a,r,n){const o=[];for(let s=0,c=i(t,W).length;s<c;s++){const l=i(t,W)[s],d=l[a]||l[y],u={};if(d!==void 0&&(d.params=Object.create(null),o.push(d),r!==he||n&&n!==he))for(let g=0,p=d.possibleKeys.length;g<p;g++){const v=d.possibleKeys[g],k=u[d.score];d.params[v]=n!=null&&n[v]&&!k?n[v]:r[v]??(n==null?void 0:n[v]),u[d.score]=!0}}return o},ge),ee,Ke,Qt=(Ke=class{constructor(){h(this,"name","TrieRouter");m(this,ee);f(this,ee,new Kt)}add(e,t,a){const r=tt(t);if(r){for(let n=0,o=r.length;n<o;n++)i(this,ee).insert(e,r[n],a);return}i(this,ee).insert(e,t,a)}match(e,t){return i(this,ee).search(e,t)}},ee=new WeakMap,Ke),ht=class extends Ut{constructor(e={}){super(e),this.router=e.router??new Xt({routers:[new Jt,new Qt]})}},ea=e=>{const a={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},r=(o=>typeof o=="string"?o==="*"?()=>o:s=>o===s?s:null:typeof o=="function"?o:s=>o.includes(s)?s:null)(a.origin),n=(o=>typeof o=="function"?o:Array.isArray(o)?()=>o:()=>[])(a.allowMethods);return async function(s,c){var u;function l(g,p){s.res.headers.set(g,p)}const d=await r(s.req.header("origin")||"",s);if(d&&l("Access-Control-Allow-Origin",d),a.credentials&&l("Access-Control-Allow-Credentials","true"),(u=a.exposeHeaders)!=null&&u.length&&l("Access-Control-Expose-Headers",a.exposeHeaders.join(",")),s.req.method==="OPTIONS"){a.origin!=="*"&&l("Vary","Origin"),a.maxAge!=null&&l("Access-Control-Max-Age",a.maxAge.toString());const g=await n(s.req.header("origin")||"",s);g.length&&l("Access-Control-Allow-Methods",g.join(","));let p=a.allowHeaders;if(!(p!=null&&p.length)){const v=s.req.header("Access-Control-Request-Headers");v&&(p=v.split(/\s*,\s*/))}return p!=null&&p.length&&(l("Access-Control-Allow-Headers",p.join(",")),s.res.headers.append("Vary","Access-Control-Request-Headers")),s.res.headers.delete("Content-Length"),s.res.headers.delete("Content-Type"),new Response(null,{headers:s.res.headers,status:204,statusText:"No Content"})}await c(),a.origin!=="*"&&s.header("Vary","Origin",{append:!0})}};const C=new ht;C.use("/api/*",ea());const Me="cf2a50987a92a698e89d5efeb80cde82",Pe={face:"https://iili.io/fM9hV6B.png",outfit:"https://iili.io/fM99P3l.png",logo:"https://iili.io/fEiEfUB.png"};C.get("/api/bases",async e=>{const t=e.req.header("X-Airtable-Token");if(!t)return e.json({error:"Missing Airtable token"},401);const a=await fetch("https://api.airtable.com/v0/meta/bases",{headers:{Authorization:`Bearer ${t}`}});return e.json(await a.json())});C.get("/api/bases/:baseId/tables",async e=>{const t=e.req.header("X-Airtable-Token");if(!t)return e.json({error:"Missing Airtable token"},401);const a=e.req.param("baseId"),r=await fetch(`https://api.airtable.com/v0/meta/bases/${a}/tables`,{headers:{Authorization:`Bearer ${t}`}});return e.json(await r.json())});C.get("/api/records",async e=>{const t=e.req.header("X-Airtable-Token");if(!t)return e.json({error:"Missing Airtable token"},401);const a=e.req.query("baseId"),r=e.req.query("tableId"),n=e.req.query("filter")||"";if(!a||!r)return e.json({error:"Missing baseId or tableId"},400);let o=`https://api.airtable.com/v0/${a}/${r}?pageSize=50`;n&&n!=="all"&&(o+=`&filterByFormula={Status}='${n}'`);const s=await fetch(o,{headers:{Authorization:`Bearer ${t}`}});return e.json(await s.json())});C.get("/api/records/:id",async e=>{const t=e.req.header("X-Airtable-Token");if(!t)return e.json({error:"Missing Airtable token"},401);const a=e.req.query("baseId"),r=e.req.query("tableId"),n=e.req.param("id");if(!a||!r)return e.json({error:"Missing baseId or tableId"},400);const o=await fetch(`https://api.airtable.com/v0/${a}/${r}/${n}`,{headers:{Authorization:`Bearer ${t}`}});return e.json(await o.json())});C.patch("/api/records/:id",async e=>{const t=e.req.header("X-Airtable-Token");if(!t)return e.json({error:"Missing Airtable token"},401);const a=e.req.query("baseId"),r=e.req.query("tableId"),n=e.req.param("id"),o=await e.req.json();if(!a||!r)return e.json({error:"Missing baseId or tableId"},400);const s=await fetch(`https://api.airtable.com/v0/${a}/${r}/${n}`,{method:"PATCH",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify({fields:o})});return e.json(await s.json())});C.post("/api/generate-image",async e=>{const{prompt:t,imageUrls:a,aspectRatio:r}=await e.req.json(),n={model:"google/nano-banana",input:{prompt:t,image_urls:a||[Pe.face,Pe.outfit,Pe.logo],aspect_ratio:r||"16:9",aspectRatio:r||"16:9",ratio:r||"16:9",resolution:"1K",output_format:"png"},aspect_ratio:r||"16:9",aspectRatio:r||"16:9"};console.log("KieAI Request:",JSON.stringify(n,null,2));const o=await fetch("https://api.kie.ai/api/v1/jobs/createTask",{method:"POST",headers:{Authorization:`Bearer ${Me}`,"Content-Type":"application/json"},body:JSON.stringify(n)});return e.json(await o.json())});C.post("/api/generate-image-ideogram",async e=>{const{prompt:t,imageUrl:a,aspectRatio:r}=await e.req.json();let n="landscape_16_9";r==="9:16"?n="portrait_9_16":r==="1:1"&&(n="square_hd");const o={model:"ideogram/character-remix",input:{prompt:t,image_url:a,image_size:n,rendering_speed:"BALANCED",style:"REALISTIC",expand_prompt:!1,num_images:"1",strength:.3}};console.log("Ideogram V3 Remix Request (text overlay):",JSON.stringify(o,null,2));const s=await fetch("https://api.kie.ai/api/v1/jobs/createTask",{method:"POST",headers:{Authorization:`Bearer ${Me}`,"Content-Type":"application/json"},body:JSON.stringify(o)});return e.json(await s.json())});C.get("/api/task-status/:taskId",async e=>{const t=e.req.param("taskId"),a=await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${t}`,{headers:{Authorization:`Bearer ${Me}`}});return e.json(await a.json())});C.post("/api/upload-image",async e=>{const{base64Image:t}=await e.req.json(),a=new FormData;a.append("key","6d207e02198a847aa98d0a2a901485a5"),a.append("action","upload"),a.append("source",t),a.append("format","json");const r=await fetch("https://freeimage.host/api/1/upload",{method:"POST",body:a});return e.json(await r.json())});C.post("/api/proxy-image",async e=>{try{const{imageUrl:t}=await e.req.json();if(!t)return e.json({error:"Missing imageUrl"},400);const a=await fetch(t);if(!a.ok)return e.json({error:"Failed to fetch image: "+a.status},500);const r=await a.arrayBuffer(),n=new Uint8Array(r);let o="";for(let l=0;l<n.length;l++)o+=String.fromCharCode(n[l]);const s=btoa(o),c=a.headers.get("content-type")||"image/png";return e.json({success:!0,base64:s,contentType:c,dataUrl:"data:"+c+";base64,"+s})}catch(t){return e.json({error:"Proxy error: "+t.message},500)}});C.get("/",e=>e.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>5th Ave Content Hub</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { 
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
      min-height: 100vh;
    }
    .glass {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .glass-hover:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    /* Reference Slots */
    .ref-slot {
      width: 100%;
      aspect-ratio: 1;
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .ref-slot:hover { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
    .ref-slot.has-image { border-style: solid; border-color: rgba(255, 255, 255, 0.3); }
    .ref-slot.active { border-color: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
    .ref-slot.drag-over { border-color: #f59e0b; background: rgba(245, 158, 11, 0.2); transform: scale(1.02); }
    .ref-slot img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
    
    .toggle-btn {
      position: absolute; top: 4px; right: 4px; width: 24px; height: 24px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 10; transition: all 0.2s;
    }
    .toggle-btn.enabled { background: #10b981; color: white; }
    .toggle-btn.disabled { background: rgba(255, 255, 255, 0.2); color: rgba(255, 255, 255, 0.5); }
    
    .clear-btn {
      position: absolute; top: 4px; left: 4px; width: 24px; height: 24px;
      border-radius: 50%; background: rgba(239, 68, 68, 0.8); color: white;
      display: none; align-items: center; justify-content: center;
      cursor: pointer; z-index: 10; font-size: 10px;
    }
    .ref-slot:hover .clear-btn { display: flex; }
    
    .order-badge {
      position: absolute; bottom: 4px; left: 4px;
      background: rgba(0, 0, 0, 0.7); color: #f59e0b;
      font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600;
    }
    
    /* History Items - Large 200px */
    .history-item {
      width: 200px; height: 200px; border-radius: 12px; overflow: hidden;
      cursor: grab; transition: all 0.2s; border: 3px solid transparent;
      flex-shrink: 0;
    }
    .history-item:hover { border-color: #f59e0b; transform: scale(1.02); box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3); }
    .history-item img { width: 100%; height: 100%; object-fit: cover; }
    
    /* History Row Container */
    .history-row {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding: 8px 0;
      scrollbar-width: thin;
      scrollbar-color: #f59e0b rgba(255, 255, 255, 0.1);
    }
    .history-row::-webkit-scrollbar { height: 6px; }
    .history-row::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
    .history-row::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 3px; }
    
    /* Aspect Buttons */
    .aspect-btn {
      padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.2);
      background: transparent; color: rgba(255, 255, 255, 0.7); cursor: pointer; transition: all 0.2s;
    }
    .aspect-btn:hover { border-color: rgba(255, 255, 255, 0.4); color: white; }
    .aspect-btn.active { background: #f59e0b; border-color: #f59e0b; color: black; font-weight: 600; }
    
    /* Generate Button */
    .generate-btn {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: black; font-weight: 600; padding: 12px 32px; border-radius: 12px;
      border: none; cursor: pointer; transition: all 0.3s; font-size: 16px;
    }
    .generate-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3); }
    .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    
    /* Preview Area - MAXIMIZED */
    .preview-area {
      min-height: 400px; border: 2px dashed rgba(255, 255, 255, 0.1);
      border-radius: 16px; display: flex; align-items: center; justify-content: center;
    }
    .preview-area img { max-width: 100%; max-height: 600px; border-radius: 12px; cursor: grab; }
    
    /* Generation History - Single Row, Large Images */
    .history-row {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding: 8px 0;
      scrollbar-width: thin;
      scrollbar-color: #f59e0b rgba(255, 255, 255, 0.1);
    }
    .history-row::-webkit-scrollbar { height: 8px; }
    .history-row::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
    .history-row::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 4px; }
    
    .history-item {
      flex-shrink: 0;
      width: 200px;
      height: 200px;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s;
      background: rgba(0, 0, 0, 0.3);
    }
    .history-item:hover {
      border-color: #f59e0b;
      transform: scale(1.05);
      box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
    }
    .history-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .preview-area.drag-source img { opacity: 0.5; }
    
    /* Content Review Section */
    .section-divider {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin: 24px 0;
      position: relative;
    }
    .section-divider::after {
      content: 'CONTENT REVIEW';
      position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
      background: #1a1a2e; padding: 0 16px; font-size: 12px; color: #f59e0b;
      letter-spacing: 2px; font-weight: 600;
    }
    
    .sidebar { max-height: 400px; overflow-y: auto; }
    .record-item { transition: all 0.2s; }
    .record-item:hover { background: rgba(255, 255, 255, 0.05); }
    .record-item.active { background: rgba(245, 158, 11, 0.1); border-left: 3px solid #F59E0B; }
    
    /* Record cards for horizontal scroll */
    .record-card { transition: all 0.2s; }
    .record-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    
    .status-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; }
    .status-needs-approval { background: #F59E0B; color: #000; }
    .status-approved { background: #10B981; color: #fff; }
    .status-declined { background: #EF4444; color: #fff; }
    .status-posted { background: #3B82F6; color: #fff; }
    .status-ready { background: #8B5CF6; color: #fff; }
    .status-draft { background: #6B7280; color: #fff; }
    .status-done { background: #10B981; color: #fff; }
    .status-pending { background: #F59E0B; color: #000; }
    
    .copy-box { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; }
    
    /* Image Drop Zones - Larger */
    .image-drop-zone {
      min-height: 200px; border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px; transition: all 0.3s; display: flex;
      align-items: center; justify-content: center; position: relative;
    }
    .image-drop-zone:hover { border-color: rgba(255, 255, 255, 0.4); }
    .image-drop-zone.drag-over { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); transform: scale(1.02); }
    .image-drop-zone.has-image { border-style: solid; border-color: rgba(255, 255, 255, 0.2); cursor: pointer; }
    .image-drop-zone.has-image:hover { border-color: #f59e0b; box-shadow: 0 0 20px rgba(245, 158, 11, 0.2); }
    .image-drop-zone.has-image::after {
      content: '🔍 Click to view';
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .image-drop-zone.has-image:hover::after { opacity: 1; }
    .image-drop-zone img { max-width: 100%; max-height: 200px; border-radius: 8px; }
    
    /* Tabs - Larger for Social Content */
    .tab-btn { 
      padding: 12px 20px; 
      transition: all 0.2s; 
      border-bottom: 3px solid transparent;
      border-radius: 8px 8px 0 0;
      background: rgba(255, 255, 255, 0.02);
    }
    .tab-btn:hover { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
    .tab-btn.tab-active { 
      border-bottom-color: #f59e0b; 
      color: #f59e0b; 
      background: rgba(245, 158, 11, 0.15);
      font-weight: 600;
    }
    
    /* Auto-save indicator */
    .save-indicator {
      position: fixed; top: 80px; right: 20px; background: #10b981;
      color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px;
      opacity: 0; transition: opacity 0.3s; z-index: 100;
    }
    .save-indicator.show { opacity: 1; }
    
    /* Selectors */
    .base-selector {
      background: #000000;
      border: 1px solid #8b5cf6;
      color: #ffffff;
    }
    .base-selector option {
      background: #000000;
      color: #ffffff;
    }
    .base-selector:focus {
      border-color: #a78bfa;
      outline: none;
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
    }
    .table-selector {
      background: #000000;
      border: 1px solid #f59e0b;
      color: #ffffff;
    }
    .table-selector option {
      background: #000000;
      color: #ffffff;
    }
    .table-selector:focus {
      border-color: #fbbf24;
      outline: none;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3);
    }
    
    /* Calendar Styles */
    .calendar-day {
      min-height: 100px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 4px;
      transition: all 0.2s;
      cursor: pointer;
      position: relative;
    }
    .calendar-day:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
    .calendar-day.other-month {
      opacity: 0.4;
    }
    .calendar-day.today {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
    }
    .calendar-day.drag-over {
      border-color: #a855f7;
      background: rgba(168, 85, 247, 0.2);
      transform: scale(1.02);
    }
    .calendar-day-number {
      font-size: 12px;
      font-weight: 600;
      color: #9ca3af;
      padding: 2px 6px;
    }
    .calendar-day.today .calendar-day-number {
      color: #f59e0b;
    }
    .calendar-day-posts {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      padding: 2px;
      max-height: 70px;
      overflow: hidden;
    }
    .calendar-post-thumb {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.2s;
    }
    .calendar-post-thumb:hover {
      transform: scale(1.1);
      border-color: #f59e0b;
      z-index: 10;
    }
    .calendar-post-more {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #9ca3af;
    }
    
    /* Ready to Schedule Queue Items */
    .schedule-queue-item {
      flex-shrink: 0;
      width: 120px;
      background: rgba(168, 85, 247, 0.1);
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 8px;
      padding: 8px;
      cursor: grab;
      transition: all 0.2s;
    }
    .schedule-queue-item:hover {
      border-color: #a855f7;
      transform: translateY(-2px);
    }
    .schedule-queue-item.dragging {
      opacity: 0.5;
      cursor: grabbing;
    }
    .schedule-queue-item img {
      width: 100%;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 4px;
    }
    .schedule-queue-item-title {
      font-size: 10px;
      color: #d1d5db;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    /* Dynamic field container */
    .dynamic-field {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .dynamic-field label {
      display: block;
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 6px;
      font-weight: 500;
    }
    .dynamic-field input, .dynamic-field textarea {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 8px;
      color: white;
      font-size: 14px;
    }
    .dynamic-field input:focus, .dynamic-field textarea:focus {
      outline: none;
      border-color: #f59e0b;
    }
    
    /* Loading spinner */
    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #f59e0b;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Image Lightbox Modal - FULL SCREEN */
    .lightbox-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      padding: 20px;
    }
    .lightbox-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .lightbox-content {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .lightbox-content img {
      max-width: 98vw;
      max-height: calc(100vh - 100px);
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 4px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    }
    .lightbox-close {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 20px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
    }
    .lightbox-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    .lightbox-actions {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      padding: 12px 20px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }
    .lightbox-actions button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .lightbox-actions button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .lightbox-actions button.primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-color: #10b981;
    }
    .lightbox-actions button.primary:hover {
      background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    }
    
    /* Lightbox Zoom Container */
    .lightbox-zoom-container {
      width: 100%;
      height: calc(100vh - 160px);
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: zoom-in;
      position: relative;
    }
    .lightbox-zoom-container.zoomed {
      cursor: grab;
      align-items: flex-start;
      justify-content: flex-start;
    }
    .lightbox-zoom-container.zoomed:active {
      cursor: grabbing;
    }
    .lightbox-zoom-container img {
      transition: transform 0.2s ease;
      transform-origin: center center;
    }
    
    /* Zoom Controls */
    .lightbox-zoom-controls {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.8);
      padding: 8px 16px;
      border-radius: 30px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 1001;
    }
    .lightbox-zoom-controls button {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lightbox-zoom-controls button:hover {
      background: rgba(255, 255, 255, 0.25);
    }
    .lightbox-zoom-controls span {
      color: #f59e0b;
      font-weight: 600;
      font-size: 14px;
      min-width: 50px;
      text-align: center;
    }
    
    /* Zoom Hint */
    .lightbox-hint {
      position: fixed;
      top: 75px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
      z-index: 1001;
    }
  </style>
</head>
<body class="text-gray-100">
  <!-- Header -->
  <header class="glass px-6 py-3 flex items-center justify-between sticky top-0 z-50">
    <div class="flex items-center gap-4">
      <img src="https://iili.io/fEiEfUB.png" alt="Logo" class="w-10 h-10">
      <h1 class="text-xl font-bold">5th Ave Content Hub</h1>
    </div>
    <div class="flex items-center gap-4">
      <span id="connectionStatus" class="text-sm text-green-400">
        <i class="fas fa-check-circle mr-1"></i>Connected
      </span>
    </div>
  </header>

  <!-- Image Lightbox Modal with Zoom -->
  <div id="lightboxOverlay" class="lightbox-overlay" onclick="closeLightbox(event)">
    <div class="lightbox-content" onclick="event.stopPropagation()">
      <button class="lightbox-close" onclick="closeLightbox()">
        <i class="fas fa-times"></i>
      </button>
      
      <!-- Zoom Container -->
      <div id="lightboxZoomContainer" class="lightbox-zoom-container" 
           onclick="toggleLightboxZoom(event)"
           onwheel="handleLightboxWheel(event)">
        <img id="lightboxImage" src="" alt="Full size image" draggable="false">
      </div>
      
      <!-- Zoom Controls -->
      <div class="lightbox-zoom-controls">
        <button onclick="event.stopPropagation(); lightboxZoomOut()" title="Zoom Out">
          <i class="fas fa-search-minus"></i>
        </button>
        <span id="lightboxZoomLevel">100%</span>
        <button onclick="event.stopPropagation(); lightboxZoomIn()" title="Zoom In">
          <i class="fas fa-search-plus"></i>
        </button>
        <button onclick="event.stopPropagation(); lightboxZoomReset()" title="Reset Zoom">
          <i class="fas fa-expand"></i>
        </button>
      </div>
      
      <div class="lightbox-hint">
        <i class="fas fa-mouse-pointer mr-1"></i>Click to zoom • Scroll to zoom • Drag to pan
      </div>
      
      <div class="lightbox-actions">
        <button onclick="lightboxSaveToArticle()" class="primary" style="background: linear-gradient(135deg, #3b82f6, #06b6d4);">
          <i class="fas fa-cloud-upload-alt mr-2"></i>Save to Article
        </button>
        <button onclick="lightboxUseImage()">
          <i class="fas fa-check-circle mr-2"></i>Use in Content
        </button>
        <button onclick="lightboxDownload()">
          <i class="fas fa-download mr-2"></i>Download
        </button>
        <button onclick="lightboxCopyUrl()">
          <i class="fas fa-link mr-2"></i>Copy URL
        </button>
      </div>
    </div>
  </div>

  <div id="saveIndicator" class="save-indicator">
    <i class="fas fa-check mr-2"></i>Saved
  </div>

  <div class="p-4 max-w-[1400px] mx-auto">
    
    <!-- ============================================ -->
    <!-- SINGLE COLUMN STACKED LAYOUT -->
    <!-- ============================================ -->
    
    <!-- 1. Reference Library (Collapsible) -->
    <div class="glass rounded-2xl p-4 mb-4">
      <div class="flex items-center justify-between cursor-pointer" onclick="toggleReferenceLibrary()">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <i class="fas fa-layer-group text-amber-500"></i>
          Reference Library
          <span id="refLibraryCount" class="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">0 active</span>
        </h2>
        <div class="flex items-center gap-3">
          <div id="processingOrder" class="text-xs text-amber-500 font-mono hidden md:block"></div>
          <i id="refLibraryToggle" class="fas fa-chevron-down text-gray-400 transition-transform"></i>
        </div>
      </div>
      <div id="referenceLibraryContent" class="hidden mt-4">
        <p class="text-xs text-gray-400 mb-4">Each reference type has 3 size variants (16:9, 9:16, 1:1) for aspect-ratio-specific generation.</p>
        <div id="referenceGridExpanded" class="space-y-4"></div>
      </div>
    </div>

    <!-- 2. Generated Image Preview (LARGE - Full Width) -->
    <div class="glass rounded-2xl p-6 mb-4">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <i class="fas fa-image text-amber-500"></i>
        Generated Image
        <span class="text-xs text-gray-400 ml-2">(drag to content images below)</span>
      </h3>
      <div id="previewArea" class="preview-area"
           style="min-height: 500px;"
           draggable="false"
           ondragstart="handlePreviewDragStart(event)"
           ondragend="handlePreviewDragEnd(event)">
        <div class="text-center text-gray-500">
          <i class="fas fa-image text-6xl mb-4"></i>
          <p class="text-lg">Your generated image will appear here</p>
        </div>
      </div>
      <div id="previewActions" class="mt-4 hidden">
        <div class="grid grid-cols-4 gap-3 mb-3">
          <button onclick="useImageInContent()" class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg py-3 text-sm font-semibold transition-all">
            <i class="fas fa-check-circle mr-2"></i>Use This
            <span id="useImageRatio" class="text-xs opacity-75 ml-1">(16:9)</span>
          </button>
          <button id="createAllSizesBtn" onclick="createAllSizes()" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg py-3 text-sm font-semibold transition-all">
            <i class="fas fa-clone mr-2"></i>All Sizes
          </button>
          <button onclick="downloadImage()" class="glass glass-hover rounded-lg py-3 text-sm">
            <i class="fas fa-download mr-2"></i>Download
          </button>
          <button onclick="copyImageUrl()" class="glass glass-hover rounded-lg py-3 text-sm">
            <i class="fas fa-link mr-2"></i>Copy URL
          </button>
        </div>
        <div id="createAllSizesStatus" class="hidden p-3 rounded-lg bg-purple-900/30 border border-purple-500/30">
          <div class="flex items-center gap-2 text-sm text-purple-300">
            <i class="fas fa-spinner fa-spin"></i>
            <span id="createAllSizesText">Creating sizes...</span>
          </div>
          <div class="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div id="size16x9Status" class="text-gray-500"><i class="fas fa-clock mr-1"></i>16:9</div>
            <div id="size9x16Status" class="text-gray-500"><i class="fas fa-clock mr-1"></i>9:16</div>
            <div id="size1x1Status" class="text-gray-500"><i class="fas fa-clock mr-1"></i>1:1</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Image Prompt + Aspect Ratio + Generate (Side by Side) -->
    <div class="grid grid-cols-12 gap-4 mb-4">
      <!-- Image Prompt -->
      <div class="col-span-8">
        <div class="glass rounded-2xl p-4 h-full">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <i class="fas fa-wand-magic-sparkles text-amber-500"></i>
              Image Prompt
            </h2>
            <span id="charCount" class="text-xs text-gray-400">0 chars</span>
          </div>
          <textarea 
            id="promptInput" 
            rows="3" 
            placeholder="Describe the image you want to generate..."
            class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-amber-500 transition-colors"
          ></textarea>
          
          <!-- Add Headline Text Toggle (Inline) -->
          <div class="mt-3 flex items-center justify-between p-3 rounded-lg bg-blue-900/20 border border-blue-500/20">
            <label class="text-sm text-blue-300 flex items-center gap-2">
              <i class="fas fa-font"></i>
              Add Headline Text
            </label>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="addHeadlineText" class="sr-only peer" onchange="onHeadlineToggleChange()">
              <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div id="headlineInputContainer" class="hidden mt-2">
            <input type="text" id="shortHeadline" 
                   class="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition text-white"
                   placeholder="e.g., Bitcoin Dominance Strengthens"
                   oninput="updatePromptWithHeadline()">
          </div>
        </div>
      </div>
      
      <!-- Aspect Ratio & Generate -->
      <div class="col-span-4">
        <div class="glass rounded-2xl p-4 h-full flex flex-col">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <i class="fas fa-crop text-amber-500"></i>
            Aspect Ratio
          </h3>
          <div class="flex gap-2 mb-4">
            <button class="aspect-btn active flex-1 text-center" data-ratio="16:9" onclick="setAspectRatio('16:9')">
              <i class="fas fa-desktop mr-1"></i>16:9
            </button>
            <button class="aspect-btn flex-1 text-center" data-ratio="9:16" onclick="setAspectRatio('9:16')">
              <i class="fas fa-mobile-alt mr-1"></i>9:16
            </button>
            <button class="aspect-btn flex-1 text-center" data-ratio="1:1" onclick="setAspectRatio('1:1')">
              <i class="fas fa-square mr-1"></i>1:1
            </button>
          </div>
          <button id="generateBtn" onclick="generateImage()" class="generate-btn w-full mt-auto">
            <i class="fas fa-sparkles mr-2"></i>Generate Image
          </button>
          <div id="generationStatus" class="mt-3 text-center text-sm text-gray-400 hidden">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            <span id="statusText">Generating...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Content Images (Full Width) -->
    <div id="contentImagesSection" class="glass rounded-2xl p-4 mb-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <i class="fas fa-images text-amber-500"></i>
          Content Images
          <span class="text-xs text-gray-400 ml-2">(click to view • drop to add)</span>
        </h3>
        <div class="flex items-center gap-3">
          <button onclick="createAllSizes()" 
                  class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  title="Uses your approved image as reference to generate 9:16 and 1:1 versions">
            <i class="fas fa-magic"></i>
            Generate 9:16 & 1:1
          </button>
          <button id="saveImagesToAirtableBtn" onclick="saveImagesToAirtable()" 
                  class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
            <i class="fas fa-cloud-upload-alt"></i>
            Save to Airtable
          </button>
        </div>
      </div>
      <div id="saveImagesStatus" class="hidden mb-4 p-3 rounded-lg bg-blue-900/30 border border-blue-500/30">
        <div class="flex items-center gap-2 text-sm text-blue-300">
          <i class="fas fa-spinner fa-spin"></i>
          <span id="saveImagesText">Saving images...</span>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-6">
        <div>
          <p class="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-amber-500"></span>
            16:9 <span class="text-xs text-gray-500">(YouTube/Twitter)</span>
          </p>
          <div id="image16x9" class="image-drop-zone content-image-clickable"
               style="min-height: 220px;"
               ondragover="handleImageDragOver(event)"
               ondragleave="handleImageDragLeave(event)"
               ondrop="handleImageDrop(event, '16:9')"
               onclick="openContentImage('16:9')">
            <span class="text-gray-500 text-sm">Drop image here</span>
          </div>
        </div>
        <div>
          <p class="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-purple-500"></span>
            9:16 <span class="text-xs text-gray-500">(TikTok/Reels)</span>
          </p>
          <div id="image9x16" class="image-drop-zone content-image-clickable"
               style="min-height: 220px;"
               ondragover="handleImageDragOver(event)"
               ondragleave="handleImageDragLeave(event)"
               ondrop="handleImageDrop(event, '9:16')"
               onclick="openContentImage('9:16')">
            <span class="text-gray-500 text-sm">Drop image here</span>
          </div>
        </div>
        <div>
          <p class="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500"></span>
            1:1 <span class="text-xs text-gray-500">(Instagram/FB)</span>
          </p>
          <div id="image1x1" class="image-drop-zone content-image-clickable"
               style="min-height: 220px;"
               ondragover="handleImageDragOver(event)"
               ondragleave="handleImageDragLeave(event)"
               ondrop="handleImageDrop(event, '1:1')"
               onclick="openContentImage('1:1')">
            <span class="text-gray-500 text-sm">Drop image here</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Generation History (Full Width, Single Row, Large Images) -->
    <div class="glass rounded-2xl p-4 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <i class="fas fa-history text-amber-500"></i>
          Generation History
        </h2>
        <button id="saveAllHistoryBtn" onclick="saveAllHistoryToArticle()" 
                class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
          <i class="fas fa-cloud-upload-alt"></i>
          Save All to Article
        </button>
      </div>
      <p class="text-xs text-gray-400 mb-3">Click to view full size • Drag to content images</p>
      <div id="historyGrid" class="history-row">
        <div class="text-center text-gray-500 w-full py-12">
          <i class="fas fa-clock text-4xl mb-3"></i>
          <p class="text-sm">No images generated yet</p>
        </div>
      </div>
    </div>

    <!-- 6. Airtable Records (Full Width) -->
    <div class="glass rounded-2xl p-4 mb-4">
      <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <i class="fas fa-database text-amber-500"></i>
        Airtable Records
      </h2>
      
      <!-- Selectors Row -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <!-- Base Selector -->
        <div>
          <label class="text-xs text-gray-400 mb-1 block">
            <i class="fas fa-server mr-1"></i>Base
          </label>
          <select id="baseSelector" onchange="onBaseChange()" 
            class="w-full base-selector rounded-lg px-3 py-2 text-sm font-medium">
            <option value="">Loading bases...</option>
          </select>
        </div>
        
        <!-- Table Selector -->
        <div>
          <label class="text-xs text-gray-400 mb-1 block">
            <i class="fas fa-table mr-1"></i>Table
          </label>
          <select id="tableSelector" onchange="onTableChange()" 
            class="w-full table-selector rounded-lg px-3 py-2 text-sm font-medium">
            <option value="">Select a base first</option>
          </select>
        </div>
        
        <!-- Status Filter -->
        <div id="statusFilterContainer">
          <label class="text-xs text-gray-400 mb-1 block">
            <i class="fas fa-filter mr-1"></i>Filter
          </label>
          <select id="statusFilter" onchange="loadRecords()" 
            class="w-full bg-black border border-green-500 rounded-lg px-3 py-2 text-sm text-white">
            <option value="all" class="bg-black text-white">All Records</option>
          </select>
        </div>
      </div>
      
      <!-- Records Grid (Horizontal scroll, larger cards) -->
      <div id="recordsList" class="flex gap-4 overflow-x-auto pb-4" style="scrollbar-width: thin; scrollbar-color: #f59e0b rgba(255, 255, 255, 0.1);">
        <p class="text-gray-500 text-sm p-4 text-center w-full">Select a base and table</p>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- CONTENT CALENDAR SECTION -->
    <!-- ============================================ -->
    <div class="glass rounded-2xl p-4 mb-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <i class="fas fa-calendar-alt text-amber-500"></i>
          Content Calendar
        </h2>
        <div class="flex items-center gap-2">
          <button onclick="prevMonth()" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span id="calendarMonthYear" class="text-lg font-semibold min-w-[160px] text-center">January 2026</span>
          <button onclick="nextMonth()" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <i class="fas fa-chevron-right"></i>
          </button>
          <button onclick="goToToday()" class="ml-2 px-3 py-1 text-sm bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
            Today
          </button>
        </div>
      </div>
      
      <!-- Calendar Grid -->
      <div class="calendar-container">
        <!-- Day Headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div class="text-center text-xs text-gray-500 font-semibold py-2">SUN</div>
          <div class="text-center text-xs text-gray-500 font-semibold py-2">MON</div>
          <div class="text-center text-xs text-gray-500 font-semibold py-2">TUE</div>
          <div class="text-center text-xs text-gray-500 font-semibold py-2">WED</div>
          <div class="text-center text-xs text-gray-500 font-semibold py-2">THU</div>
          <div class="text-center text-xs text-gray-500 font-semibold py-2">FRI</div>
          <div class="text-center text-xs text-gray-500 font-semibold py-2">SAT</div>
        </div>
        <!-- Calendar Days -->
        <div id="calendarGrid" class="grid grid-cols-7 gap-1">
          <!-- Days will be rendered here -->
        </div>
      </div>
      
      <!-- Ready to Schedule Queue -->
      <div class="mt-4 pt-4 border-t border-white/10">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold flex items-center gap-2">
            <i class="fas fa-clock text-purple-400"></i>
            Ready to Schedule
            <span id="readyToScheduleCount" class="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">0</span>
          </h3>
          <span class="text-xs text-gray-500">Drag to calendar to schedule</span>
        </div>
        <div id="readyToScheduleQueue" class="flex gap-3 overflow-x-auto pb-2" style="scrollbar-width: thin; scrollbar-color: #a855f7 rgba(255, 255, 255, 0.1);">
          <p class="text-gray-500 text-sm p-4 text-center w-full">No posts ready to schedule</p>
        </div>
      </div>
    </div>
    
    <!-- Schedule Modal -->
    <div id="scheduleModal" class="fixed inset-0 bg-black/80 z-50 hidden flex items-center justify-center p-4">
      <div class="glass rounded-2xl p-6 max-w-md w-full">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Schedule Post</h3>
          <button onclick="closeScheduleModal()" class="text-gray-400 hover:text-white">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div id="scheduleModalContent">
          <!-- Content will be rendered here -->
        </div>
      </div>
    </div>
    
    <!-- ============================================ -->
    <!-- SECTION DIVIDER -->
    <!-- ============================================ -->
    <div class="section-divider mt-6"></div>

    <!-- ============================================ -->
    <!-- CONTENT REVIEW SECTION -->
    <!-- ============================================ -->
    <div class="mt-6">
      <div id="noSelection" class="glass rounded-2xl p-12 flex items-center justify-center">
        <div class="text-center text-gray-500">
          <i class="fas fa-inbox text-5xl mb-4"></i>
          <p>Select a record from the sidebar to review</p>
        </div>
      </div>

      <div id="recordDetail" class="hidden">
        
        <!-- COLLAPSIBLE: Record Details (Header + Dynamic Fields) -->
        <div class="glass rounded-2xl mb-4 overflow-hidden">
          <div class="p-4 cursor-pointer flex items-center justify-between border-b border-white/10" onclick="toggleRecordDetails()">
            <div class="flex items-center gap-3">
              <i class="fas fa-file-alt text-amber-500"></i>
              <h3 class="font-semibold">Record Details</h3>
              <span id="detailStatus" class="status-badge status-needs-approval hidden">Status</span>
            </div>
            <div class="flex items-center gap-3">
              <span id="detailTitlePreview" class="text-sm text-gray-400 truncate max-w-md"></span>
              <i id="recordDetailsToggle" class="fas fa-chevron-down text-gray-400 transition-transform"></i>
            </div>
          </div>
          <div id="recordDetailsContent" class="hidden">
            <!-- Record Header -->
            <div class="p-4 border-b border-white/10">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h2 id="detailTitle" class="text-xl font-bold mb-2">Title</h2>
                  <p id="detailSubtitle" class="text-amber-500 text-sm hidden"></p>
                </div>
                <div id="actionButtons" class="flex gap-2 hidden">
                  <button onclick="approveRecord()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium text-sm">
                    <i class="fas fa-check mr-1"></i>Approve
                  </button>
                  <button onclick="declineRecord()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium text-sm">
                    <i class="fas fa-times mr-1"></i>Decline
                  </button>
                </div>
              </div>
            </div>
            <!-- Dynamic Fields -->
            <div id="dynamicFieldsContainer" class="p-4">
              <!-- Fields will be rendered here based on table schema -->
            </div>
          </div>
        </div>

        <!-- SOCIAL CONTENT SECTION - LARGE, PRIMARY FOCUS -->
        <div id="socialContentSection" class="glass rounded-2xl p-6 hidden">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold flex items-center gap-2">
              <i class="fas fa-share-alt text-amber-500"></i>
              Social Media Content
            </h3>
            <span class="text-xs text-gray-500">Auto-saves on edit</span>
          </div>
          
          <!-- Tabs - Larger -->
          <div class="flex border-b border-white/10 mb-6 overflow-x-auto gap-1">
            <button onclick="showTab('twitter')" class="tab-btn tab-active px-4 py-3 text-base whitespace-nowrap" data-tab="twitter">
              <i class="fab fa-twitter mr-2"></i>Twitter/X
            </button>
            <button onclick="showTab('threads')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="threads">
              <i class="fab fa-threads mr-2"></i>Threads
            </button>
            <button onclick="showTab('bluesky')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="bluesky">
              <i class="fas fa-cloud mr-2"></i>Bluesky
            </button>
            <button onclick="showTab('linkedin')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="linkedin">
              <i class="fab fa-linkedin mr-2"></i>LinkedIn
            </button>
            <button onclick="showTab('facebook')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="facebook">
              <i class="fab fa-facebook mr-2"></i>Facebook
            </button>
            <button onclick="showTab('instagram')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="instagram">
              <i class="fab fa-instagram mr-2"></i>Instagram
            </button>
            <button onclick="showTab('blog')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="blog">
              <i class="fas fa-blog mr-2"></i>Blog
            </button>
            <button onclick="showTab('script')" class="tab-btn px-4 py-3 text-base whitespace-nowrap" data-tab="script">
              <i class="fas fa-video mr-2"></i>Script
            </button>
          </div>
          
          <div id="tabContent">
            <div id="tab-twitter" class="tab-panel">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">Max 280 characters | <span id="twitterCount" class="text-amber-500 font-semibold">0</span>/280</span>
                <button onclick="copyContent('twitter')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentTwitter" data-field="twitterCopy" rows="8" maxlength="280"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 200px;"
                oninput="document.getElementById('twitterCount').textContent = this.value.length"></textarea>
            </div>
            <div id="tab-threads" class="tab-panel hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">100-150 words recommended</span>
                <button onclick="copyContent('threads')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentThreads" data-field="threadsCopy" rows="12"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 300px;"></textarea>
            </div>
            <div id="tab-bluesky" class="tab-panel hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">Max 300 characters | <span id="blueskyCount" class="text-amber-500 font-semibold">0</span>/300</span>
                <button onclick="copyContent('bluesky')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentBluesky" data-field="blueskyCopy" rows="8" maxlength="300"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 200px;"
                oninput="document.getElementById('blueskyCount').textContent = this.value.length"></textarea>
            </div>
            <div id="tab-linkedin" class="tab-panel hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">150-200 words, professional tone</span>
                <button onclick="copyContent('linkedin')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentLinkedin" data-field="linkedinCopy" rows="15"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 350px;"></textarea>
            </div>
            <div id="tab-facebook" class="tab-panel hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">100-150 words</span>
                <button onclick="copyContent('facebook')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentFacebook" data-field="facebookCopy" rows="12"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 300px;"></textarea>
            </div>
            <div id="tab-instagram" class="tab-panel hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">80-125 words with hashtags</span>
                <button onclick="copyContent('instagram')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentInstagram" data-field="instagramCopy" rows="12"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 300px;"></textarea>
            </div>
            <div id="tab-blog" class="tab-panel hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">400-600 words</span>
                <button onclick="copyContent('blog')" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-all">
                  <i class="fas fa-copy mr-2"></i>Copy
                </button>
              </div>
              <textarea id="contentBlog" data-field="blogCopy" rows="20"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base resize-y editable-field focus:border-amber-500 focus:outline-none transition-colors"
                style="min-height: 450px;"></textarea>
            </div>
            <div id="tab-script" class="tab-panel hidden">
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs text-gray-500">30-45 second video script</span>
                <button onclick="copyContent('script')" class="text-xs text-amber-500 hover:text-amber-400">
                  <i class="fas fa-copy mr-1"></i>Copy
                </button>
              </div>
              <textarea id="contentScript" data-field="shortScript" rows="5"
                class="w-full bg-white/5 border border-white/10 rounded p-2 text-sm resize-y editable-field"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <input type="file" id="fileInput" accept="image/*" class="hidden" onchange="handleFileUpload(event)">
  <!-- ratioFileInput removed - now using unified fileInput for all reference uploads -->

  <script>
    // ========================================
    // CONFIGURATION
    // ========================================
    const AIRTABLE_TOKEN = 'patuhJllpfFdYQYCr.880a18b1310ed5b987a1461fa8a1056857ab65c0b021834d29a21d520647e5b0';
    
    const referenceCategories = [
      { id: 'face', name: 'Face', icon: 'fa-user-circle', default: 'https://iili.io/fM9hV6B.png', order: 1 },
      { id: 'custom', name: 'Custom', icon: 'fa-magic', default: '', order: 2 },
      { id: 'pose', name: 'Pose', icon: 'fa-walking', default: '', order: 3 },
      { id: 'outfit', name: 'Outfit', icon: 'fa-tshirt', default: '', order: 4 },
      { id: 'background', name: 'Background', icon: 'fa-image', default: '', order: 5 },
      { id: 'props', name: 'Props', icon: 'fa-cube', default: '', order: 6 },
      { id: 'mood', name: 'Mood', icon: 'fa-palette', default: '', order: 7 },
      { id: 'logo', name: 'Logo', icon: 'fa-crown', default: 'https://iili.io/fEiEfUB.png', order: 8 }
    ];

    // Fields to skip/handle specially
    const SKIP_FIELDS = ['Status', 'ID', 'Record ID', 'Generate Image', 'goToArticle', 'Start date', 'Date Posted', 'Date Created', 'datePosted', 'Calculation', 'Created', 'Last Modified'];
    const SOCIAL_FIELDS = ['twitterCopy', 'threadsCopy', 'blueskyCopy', 'linkedinCopy', 'facebookCopy', 'instagramCopy', 'blogCopy', 'shortScript'];
    const IMAGE_FIELD_TYPES = ['multipleAttachments', 'singleAttachment'];

    // Category-based image prompt settings for Angel
    const CATEGORY_SETTINGS = {
      'crypto_regulation': {
        setting: 'standing confidently outside a courthouse or government building with classical columns',
        mood: 'professional and authoritative',
        outfit: 'tailored navy blue power suit with subtle gold accessories',
        lighting: 'bright daylight with dramatic shadows from the columns'
      },
      'bitcoin_adoption': {
        setting: 'in a modern retail environment with Bitcoin ATM or crypto payment terminal visible',
        mood: 'approachable and optimistic',
        outfit: 'smart casual blazer over a stylish top with designer jeans',
        lighting: 'warm inviting retail lighting'
      },
      'macro_market': {
        setting: 'at a sleek trading desk with multiple monitors showing charts and market data',
        mood: 'analytical and focused',
        outfit: 'sophisticated business attire with a modern edge',
        lighting: 'cool blue ambient light from monitors mixed with soft office lighting'
      },
      'self_banking': {
        setting: 'in a cozy but modern home office with laptop and smartphone showing crypto apps',
        mood: 'empowering and relatable',
        outfit: 'elevated casual wear - cashmere sweater or elegant loungewear',
        lighting: 'warm natural light from a window'
      },
      'infra_dev': {
        setting: 'in an elegant executive office with floor-to-ceiling windows overlooking a city skyline, subtle tech elements like a sleek laptop and tablet on a mahogany desk',
        mood: 'sophisticated and visionary',
        outfit: 'Ralph Lauren classic business attire - tailored blazer in navy or camel, crisp white blouse, elegant gold jewelry, polished and timeless American luxury style',
        lighting: 'warm golden hour sunlight streaming through windows with soft ambient office lighting'
      },
      'default': {
        setting: 'in a professional studio setting with subtle crypto-themed background elements',
        mood: 'confident and educational',
        outfit: 'stylish professional attire that commands attention',
        lighting: 'professional studio lighting with subtle amber accents'
      }
    };

    // Generate image prompt based on headline and category
    function generateImagePrompt(headline, category) {
      const settings = CATEGORY_SETTINGS[category] || CATEGORY_SETTINGS['default'];
      const ratio = currentAspectRatio;
      
      // Check if outfit reference is set for current ratio - but NEVER copy exact outfit
      const outfitRefs = references['outfit'];
      const hasOutfitRef = outfitRefs && (outfitRefs[ratio]?.url && outfitRefs[ratio]?.enabled);
      const outfitDescription = hasOutfitRef ? 
        'wearing a DIFFERENT outfit in the same style/aesthetic as the reference (NOT the exact same clothes - similar vibe but different garments and colors)' : 
        settings.outfit;
      
      // Check if custom reference is set for current ratio for additional context
      const customRefs = references['custom'];
      const hasCustomRef = customRefs && (customRefs[ratio]?.url && customRefs[ratio]?.enabled);
      const customContext = hasCustomRef ? ' incorporating elements from the custom reference image,' : '';
      
      // Extract key concepts from headline for visual context (not text)
      const headlineContext = extractVisualContext(headline);
      
      // Check if headline text toggle is on
      const addHeadlineText = document.getElementById('addHeadlineText')?.checked;
      const shortHeadline = document.getElementById('shortHeadline')?.value?.trim();
      
      // Get current aspect ratio for composition guidance
      const aspectRatio = currentAspectRatio;
      let compositionGuide = '';
      if (aspectRatio === '16:9') {
        compositionGuide = 'COMPOSITION: Wide horizontal landscape format (16:9). Frame Angel with space on sides, suitable for YouTube thumbnails and Twitter posts. ';
      } else if (aspectRatio === '9:16') {
        compositionGuide = 'COMPOSITION: Tall vertical portrait format (9:16). Frame Angel centered with space above and below, suitable for Instagram Stories and TikTok. ';
      } else if (aspectRatio === '1:1') {
        compositionGuide = 'COMPOSITION: Square format (1:1). Frame Angel centered, suitable for Instagram feed posts. ';
      }
      
      // Always generate clean images without text - text will be added via canvas overlay
      const textInstructions = '\\n\\nIMPORTANT: Absolutely NO text anywhere in the image. No words, no letters, no signs, no screens with text, no logos, no watermarks, no headlines, no captions. Clean visual only - text overlay will be added programmatically later.';
      
      const prompt = compositionGuide + 'Professional crypto news image featuring Angel, the 5th Ave Crypto educator and mentor - an elegant, confident woman ' + settings.setting + '.\\n\\n' +
        'OUTFIT: ' + outfitDescription + '. She is looking directly at the camera with an approachable yet authoritative expression.' + customContext + '\\n\\n' +
        'IMPORTANT: Use the face reference for her face ONLY. Do NOT copy the exact clothing from any reference image - create a fresh, different outfit each time.\\n\\n' +
        'Visual context: ' + headlineContext + '\\n\\n' +
        'Mood: ' + settings.mood + '\\n' +
        'Lighting: ' + settings.lighting + '\\n\\n' +
        'Style: High-quality editorial photography, modern and polished. Angel should appear as a real person - relatable yet aspirational.' + textInstructions;

      return prompt;
    }
    
    // Toggle headline input visibility and regenerate prompt
    function onHeadlineToggleChange() {
      const isChecked = document.getElementById('addHeadlineText').checked;
      const container = document.getElementById('headlineInputContainer');
      container.classList.toggle('hidden', !isChecked);
      
      // Auto-enable logo reference for current ratio when headline is on
      if (isChecked && references['logo']) {
        const ratio = currentAspectRatio;
        if (references['logo'][ratio]) {
          references['logo'][ratio].enabled = true;
        }
        saveReferences();
        renderReferenceGridExpanded();
        updateActiveCount();
      }
      
      // Regenerate prompt if we have a current record
      if (currentRecord) {
        const f = currentRecord.fields || {};
        const headline = f.sourceHeadline || f.Title || f.Headline || '';
        const category = f.category || 'default';
        if (headline) {
          const autoPrompt = generateImagePrompt(headline, category);
          document.getElementById('promptInput').value = autoPrompt;
          document.getElementById('charCount').textContent = autoPrompt.length + ' characters';
        }
      }
    }
    
    // Update prompt when headline text is edited
    function updatePromptWithHeadline() {
      if (currentRecord) {
        const f = currentRecord.fields || {};
        const headline = f.sourceHeadline || f.Title || f.Headline || '';
        const category = f.category || 'default';
        if (headline) {
          const autoPrompt = generateImagePrompt(headline, category);
          document.getElementById('promptInput').value = autoPrompt;
          document.getElementById('charCount').textContent = autoPrompt.length + ' characters';
        }
      }
    }
    
    // Create shortened headline from full headline
    function createShortHeadline(fullHeadline) {
      if (!fullHeadline) return '';
      // Cut at common break words to create shorter version
      const shortened = fullHeadline.split(/\\s+(as|after|while|amid|following|despite|because|when|where|how|why)\\s+/i)[0].trim();
      // Limit length
      if (shortened.length > 60) {
        return shortened.substring(0, 57) + '...';
      }
      return shortened;
    }
    
    // Format headline text for different aspect ratios
    function formatHeadlineForRatio(headline, ratio) {
      if (!headline) return '';
      
      const words = headline.trim().split(/s+/);
      
      if (ratio === '16:9') {
        // Wide format - can fit more words per line (8-10 words)
        // If short enough, keep as single line
        if (words.length <= 8) {
          return headline;
        }
        // Otherwise split into 2 lines
        const midpoint = Math.ceil(words.length / 2);
        const line1 = words.slice(0, midpoint).join(' ');
        const line2 = words.slice(midpoint).join(' ');
        return line1 + '\\n' + line2;
        
      } else if (ratio === '9:16') {
        // Narrow vertical format - only 3-4 words per line
        const lines = [];
        const wordsPerLine = 3;
        for (let i = 0; i < words.length; i += wordsPerLine) {
          lines.push(words.slice(i, i + wordsPerLine).join(' '));
        }
        return lines.join('\\n');
        
      } else if (ratio === '1:1') {
        // Square format - 4-5 words per line
        const lines = [];
        const wordsPerLine = 4;
        for (let i = 0; i < words.length; i += wordsPerLine) {
          lines.push(words.slice(i, i + wordsPerLine).join(' '));
        }
        return lines.join('\\n');
      }
      
      return headline;
    }
    
    // Extract visual concepts from headline (no text rendering)
    function extractVisualContext(headline) {
      const h = headline.toLowerCase();
      let context = [];
      
      // Bitcoin/crypto related
      if (h.includes('bitcoin') || h.includes('btc')) context.push('Bitcoin imagery like gold coins or subtle orange accents');
      if (h.includes('ethereum') || h.includes('eth')) context.push('Ethereum-inspired purple/blue color accents');
      if (h.includes('crypto')) context.push('cryptocurrency visual elements');
      
      // Market/financial
      if (h.includes('price') || h.includes('market') || h.includes('surge') || h.includes('rally')) context.push('upward trending visual energy');
      if (h.includes('crash') || h.includes('drop') || h.includes('fall')) context.push('dramatic serious mood');
      if (h.includes('bull') || h.includes('bullish')) context.push('confident optimistic energy');
      if (h.includes('bear') || h.includes('bearish')) context.push('cautious analytical mood');
      
      // Regulation/government
      if (h.includes('regulation') || h.includes('sec') || h.includes('government') || h.includes('law')) context.push('formal authoritative setting');
      if (h.includes('ban') || h.includes('restrict')) context.push('serious concerned expression');
      if (h.includes('approve') || h.includes('legal')) context.push('positive professional atmosphere');
      
      // Adoption/mainstream
      if (h.includes('adopt') || h.includes('accept') || h.includes('payment')) context.push('mainstream everyday setting');
      if (h.includes('bank') || h.includes('institution')) context.push('corporate financial environment');
      
      // Technology
      if (h.includes('network') || h.includes('upgrade') || h.includes('launch')) context.push('tech-forward innovative feel');
      if (h.includes('hack') || h.includes('security') || h.includes('breach')) context.push('serious cybersecurity atmosphere');
      
      // Return combined context or default
      return context.length > 0 ? context.join(', ') : 'general cryptocurrency and financial education theme';
    }

    // ========================================
    // STATE
    // ========================================
    let bases = [];
    let currentBase = null;
    let tables = [];
    let currentTable = null;
    let tableFields = [];
    // Each category now has per-size images: { face: { '16:9': {url, enabled}, '9:16': {url, enabled}, '1:1': {url, enabled} }, ... }
    let references = {};
    let currentAspectRatio = '16:9';
    let generationHistory = [];
    let currentUploadSlot = null; // Format: 'categoryId-ratio' e.g., 'face-16:9'
    let lastGeneratedUrl = null;
    let lastGeneratedRatio = '16:9';
    let currentRecordId = null;
    let currentRecord = null;
    let saveTimeout = null;
    let contentImages = { '16:9': null, '9:16': null, '1:1': null };
    let expandedCategories = {}; // Track which categories are expanded

    // ========================================
    // INITIALIZATION
    // ========================================
    async function init() {
      // Load bases
      await loadBases();
      
      // Load saved references (new per-size format)
      const saved = localStorage.getItem('imageGenReferencesV2');
      if (saved) {
        references = JSON.parse(saved);
      } else {
        // Try to migrate from old format
        const oldSaved = localStorage.getItem('imageGenReferences');
        if (oldSaved) {
          const oldRefs = JSON.parse(oldSaved);
          // Migrate old single-image format to new per-size format
          referenceCategories.forEach(cat => {
            const oldRef = oldRefs[cat.id];
            references[cat.id] = {
              '16:9': { url: oldRef?.url || cat.default || '', enabled: oldRef?.enabled || (cat.default ? true : false) },
              '9:16': { url: '', enabled: false },
              '1:1': { url: '', enabled: false }
            };
          });
        } else {
          // Initialize with defaults
          referenceCategories.forEach(cat => {
            references[cat.id] = {
              '16:9': { url: cat.default || '', enabled: cat.default ? true : false },
              '9:16': { url: '', enabled: false },
              '1:1': { url: '', enabled: false }
            };
          });
        }
        saveReferences(); // Save in new format
      }

      // Load history
      const savedHistory = localStorage.getItem('imageGenHistory');
      if (savedHistory) {
        generationHistory = JSON.parse(savedHistory);
      }
      
      // Initialize expanded state
      referenceCategories.forEach(cat => {
        expandedCategories[cat.id] = false;
      });

      renderReferenceGridExpanded();
      renderHistory();
      updateActiveCount();
      setupPromptCounter();
      
      // Initialize calendar with empty state
      renderCalendar();
    }

    // ========================================
    // BASE & TABLE LOADING
    // ========================================
    async function loadBases() {
      const selector = document.getElementById('baseSelector');
      selector.innerHTML = '<option value="">Loading bases...</option>';
      
      try {
        const res = await fetch('/api/bases', {
          headers: { 'X-Airtable-Token': AIRTABLE_TOKEN }
        });
        const data = await res.json();
        bases = data.bases || [];
        
        // Sort alphabetically
        bases.sort((a, b) => a.name.localeCompare(b.name));
        
        selector.innerHTML = '<option value="">-- Select a Base --</option>' + 
          bases.map(b => \`<option value="\${b.id}">\${b.name}</option>\`).join('');
        
        // Default to Fifth Ave Content Hub if available
        const defaultBase = bases.find(b => b.name === 'Fifth Ave Content Hub');
        if (defaultBase) {
          selector.value = defaultBase.id;
          await onBaseChange();
        }
      } catch (err) {
        selector.innerHTML = '<option value="">Error loading bases</option>';
        console.error('Failed to load bases:', err);
      }
    }

    async function onBaseChange() {
      const baseId = document.getElementById('baseSelector').value;
      const tableSelector = document.getElementById('tableSelector');
      
      if (!baseId) {
        currentBase = null;
        tables = [];
        tableSelector.innerHTML = '<option value="">Select a base first</option>';
        document.getElementById('recordsList').innerHTML = '<p class="text-gray-500 text-sm p-4 text-center">Select a base and table</p>';
        return;
      }
      
      currentBase = bases.find(b => b.id === baseId);
      tableSelector.innerHTML = '<option value="">Loading tables...</option>';
      
      try {
        const res = await fetch(\`/api/bases/\${baseId}/tables\`, {
          headers: { 'X-Airtable-Token': AIRTABLE_TOKEN }
        });
        const data = await res.json();
        tables = data.tables || [];
        
        tableSelector.innerHTML = '<option value="">-- Select a Table --</option>' + 
          tables.map(t => \`<option value="\${t.id}">\${t.name}</option>\`).join('');
        
        // Auto-select first table
        if (tables.length > 0) {
          tableSelector.value = tables[0].id;
          await onTableChange();
        }
      } catch (err) {
        tableSelector.innerHTML = '<option value="">Error loading tables</option>';
        console.error('Failed to load tables:', err);
      }
    }

    async function onTableChange() {
      const tableId = document.getElementById('tableSelector').value;
      
      if (!tableId) {
        currentTable = null;
        tableFields = [];
        document.getElementById('recordsList').innerHTML = '<p class="text-gray-500 text-sm p-4 text-center">Select a table</p>';
        return;
      }
      
      currentTable = tables.find(t => t.id === tableId);
      tableFields = currentTable?.fields || [];
      
      currentRecordId = null;
      currentRecord = null;
      
      // Reset detail view
      document.getElementById('noSelection').classList.remove('hidden');
      document.getElementById('recordDetail').classList.add('hidden');
      
      updateUIForTable();
      await loadRecords();
    }

    function updateUIForTable() {
      if (!currentTable) return;
      
      // Check if table has Status field
      const hasStatus = tableFields.some(f => f.name === 'Status');
      const statusContainer = document.getElementById('statusFilterContainer');
      const actionButtons = document.getElementById('actionButtons');
      
      if (hasStatus) {
        statusContainer.classList.remove('hidden');
        actionButtons.classList.remove('hidden');
        
        // Populate status filter with actual options
        const statusField = tableFields.find(f => f.name === 'Status');
        const statusSelect = document.getElementById('statusFilter');
        let options = '<option value="all" class="bg-black text-white">All Records</option>';
        
        if (statusField?.options?.choices) {
          statusField.options.choices.forEach(choice => {
            options += \`<option value="\${choice.name}" class="bg-black text-white">\${choice.name}</option>\`;
          });
        } else {
          // Default options
          options += \`
            <option value="Needs Approval" class="bg-black text-white">Needs Approval</option>
            <option value="Approved" class="bg-black text-white">Approved</option>
            <option value="Declined" class="bg-black text-white">Declined</option>
            <option value="Posted" class="bg-black text-white">Posted</option>
          \`;
        }
        statusSelect.innerHTML = options;
      } else {
        statusContainer.classList.add('hidden');
        actionButtons.classList.add('hidden');
      }
      
      // Check for social content fields
      const hasSocialFields = tableFields.some(f => SOCIAL_FIELDS.includes(f.name));
      const socialSection = document.getElementById('socialContentSection');
      socialSection.classList.toggle('hidden', !hasSocialFields);
    }

    // ========================================
    // RECORDS
    // ========================================
    async function loadRecords() {
      if (!currentBase || !currentTable) return;
      
      const recordsList = document.getElementById('recordsList');
      recordsList.innerHTML = '<div class="p-4 text-center"><div class="loading-spinner mx-auto"></div></div>';
      
      const hasStatus = tableFields.some(f => f.name === 'Status');
      const filter = hasStatus ? document.getElementById('statusFilter').value : 'all';
      
      try {
        const res = await fetch(\`/api/records?baseId=\${currentBase.id}&tableId=\${currentTable.id}&filter=\${encodeURIComponent(filter)}\`, {
          headers: { 'X-Airtable-Token': AIRTABLE_TOKEN }
        });
        const data = await res.json();
        
        if (data.error) {
          recordsList.innerHTML = '<p class="text-red-500 text-sm p-4">' + (data.error.message || 'Error loading records') + '</p>';
          return;
        }
        
        const records = data.records || [];
        
        // Find title field - prioritize headline/title fields over generic text fields
        const titleFieldPriority = ['sourceHeadline', 'Title', 'Name', 'Headline', 'Topic', 'Keyword', 'Subject'];
        let titleField = null;
        for (const fieldName of titleFieldPriority) {
          if (tableFields.find(f => f.name === fieldName)) {
            titleField = fieldName;
            break;
          }
        }
        // Fallback to first non-URL text field
        if (!titleField) {
          const textField = tableFields.find(f => 
            (f.type === 'singleLineText' || f.type === 'multilineText') && 
            !f.name.toLowerCase().includes('url') &&
            !f.name.toLowerCase().includes('link')
          );
          titleField = textField?.name || tableFields[0]?.name;
        }
        
        // Find image field
        const imageField = tableFields.find(f => IMAGE_FIELD_TYPES.includes(f.type))?.name;
        
        const html = records.map(r => {
          const status = r.fields.Status || '';
          const statusClass = status.replace(/\\s+/g, '-').toLowerCase();
          const title = r.fields[titleField] || 'Untitled';
          const displayTitle = typeof title === 'string' ? title : JSON.stringify(title);
          
          let thumbUrl = '';
          if (imageField && r.fields[imageField] && Array.isArray(r.fields[imageField]) && r.fields[imageField].length > 0) {
            // Use large thumbnail or full URL for better quality (not small/blurry)
            const img = r.fields[imageField][0];
            thumbUrl = img.thumbnails?.large?.url || img.thumbnails?.full?.url || img.url || '';
          }
          
          return \`
            <div class="record-card flex-shrink-0 w-64 p-3 rounded-xl cursor-pointer border border-white/10 hover:border-amber-500 transition-all \${currentRecordId === r.id ? 'border-amber-500 bg-amber-500/10' : 'bg-white/5'}" 
                 onclick="selectRecord('\${r.id}', event)">
              <div class="flex flex-col gap-2">
                \${thumbUrl ? \`<img src="\${thumbUrl}" class="w-full h-36 object-cover rounded-lg">\` : 
                  '<div class="w-full h-36 bg-white/5 rounded-lg flex items-center justify-center"><i class="fas fa-image text-gray-500 text-2xl"></i></div>'}
                <div class="min-w-0">
                  <p class="text-sm font-medium line-clamp-2 mb-1">\${escapeHtml(displayTitle.substring(0, 80))}</p>
                  \${status ? \`<span class="status-badge status-\${statusClass}">\${status}</span>\` : ''}
                </div>
              </div>
            </div>
          \`;
        }).join('');
        
        recordsList.innerHTML = html || '<p class="text-gray-500 text-sm p-4 text-center">No records found</p>';
        
        // Also load calendar posts
        loadCalendarPosts();
      } catch (err) {
        recordsList.innerHTML = '<p class="text-red-500 text-sm p-4">Failed to load records</p>';
        console.error('Failed to load records:', err);
      }
    }

    async function selectRecord(id, event) {
      currentRecordId = id;
      
      document.querySelectorAll('.record-item').forEach(el => el.classList.remove('active'));
      if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
      }
      
      try {
        const res = await fetch(\`/api/records/\${id}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
          headers: { 'X-Airtable-Token': AIRTABLE_TOKEN }
        });
        currentRecord = await res.json();
        const f = currentRecord.fields || {};
        
        document.getElementById('noSelection').classList.add('hidden');
        document.getElementById('recordDetail').classList.remove('hidden');
        
        // Status
        const status = f.Status || '';
        const statusEl = document.getElementById('detailStatus');
        if (status) {
          statusEl.textContent = status;
          statusEl.className = 'status-badge status-' + status.replace(/\\s+/g, '-').toLowerCase() + ' mb-2 inline-block';
          statusEl.classList.remove('hidden');
        } else {
          statusEl.classList.add('hidden');
        }
        
        // Title - prioritize headline/title fields
        const titleFieldPriority = ['sourceHeadline', 'Title', 'Name', 'Headline', 'Topic', 'Keyword', 'Subject'];
        let titleField = null;
        for (const fieldName of titleFieldPriority) {
          if (tableFields.find(tf => tf.name === fieldName)) {
            titleField = fieldName;
            break;
          }
        }
        if (!titleField) {
          const textField = tableFields.find(tf => 
            (tf.type === 'singleLineText' || tf.type === 'multilineText') && 
            !tf.name.toLowerCase().includes('url') &&
            !tf.name.toLowerCase().includes('link')
          );
          titleField = textField?.name || tableFields[0]?.name;
        }
        const titleValue = f[titleField] || 'Untitled';
        const titleText = typeof titleValue === 'string' ? titleValue : JSON.stringify(titleValue);
        document.getElementById('detailTitle').textContent = titleText;
        // Also update the collapsed preview
        document.getElementById('detailTitlePreview').textContent = titleText.length > 60 ? titleText.substring(0, 60) + '...' : titleText;
        
        // Subtitle
        const subtitleEl = document.getElementById('detailSubtitle');
        if (f.category) {
          subtitleEl.innerHTML = '<i class="fas fa-tag mr-1"></i>' + f.category;
          subtitleEl.classList.remove('hidden');
        } else {
          subtitleEl.classList.add('hidden');
        }
        
        // Render dynamic fields
        renderDynamicFields(f);
        
        // Social content
        const hasSocialFields = tableFields.some(tf => SOCIAL_FIELDS.includes(tf.name));
        if (hasSocialFields) {
          document.getElementById('contentTwitter').value = f.twitterCopy || '';
          document.getElementById('contentThreads').value = f.threadsCopy || '';
          document.getElementById('contentBluesky').value = f.blueskyCopy || '';
          document.getElementById('contentLinkedin').value = f.linkedinCopy || '';
          document.getElementById('contentFacebook').value = f.facebookCopy || '';
          document.getElementById('contentInstagram').value = f.instagramCopy || '';
          document.getElementById('contentBlog').value = f.blogCopy || '';
          document.getElementById('contentScript').value = f.shortScript || '';
          
          document.getElementById('twitterCount').textContent = (f.twitterCopy || '').length;
          document.getElementById('blueskyCount').textContent = (f.blueskyCopy || '').length;
        }
        
        // Images
        const imageField = tableFields.find(tf => IMAGE_FIELD_TYPES.includes(tf.type))?.name;
        const img16x9 = document.getElementById('image16x9');
        
        if (imageField && f[imageField] && f[imageField].length > 0) {
          img16x9.innerHTML = \`<img src="\${f[imageField][0].url}" alt="Image">\`;
          img16x9.classList.add('has-image');
          contentImages['16:9'] = f[imageField][0].url;
        } else {
          img16x9.innerHTML = '<span class="text-gray-500 text-sm">Drop image here</span>';
          img16x9.classList.remove('has-image');
          contentImages['16:9'] = null;
        }
        
        // Reset other image slots
        ['image9x16', 'image1x1'].forEach(id => {
          const el = document.getElementById(id);
          el.innerHTML = '<span class="text-gray-500 text-sm">Drop image here</span>';
          el.classList.remove('has-image');
        });
        contentImages['9:16'] = null;
        contentImages['1:1'] = null;
        
        // Auto-generate image prompt based on headline and category
        const headline = f.sourceHeadline || f.Title || f.Headline || titleValue || '';
        const category = f.category || 'default';
        
        // Auto-fill the short headline field
        const shortHeadlineInput = document.getElementById('shortHeadline');
        if (shortHeadlineInput) {
          shortHeadlineInput.value = createShortHeadline(headline);
        }
        
        if (headline && headline !== 'Untitled') {
          const autoPrompt = generateImagePrompt(headline, category);
          document.getElementById('promptInput').value = autoPrompt;
          document.getElementById('charCount').textContent = autoPrompt.length + ' characters';
        }
        
        setupAutoSave();
      } catch (err) {
        console.error('Failed to select record:', err);
      }
    }

    function renderDynamicFields(fields) {
      const container = document.getElementById('dynamicFieldsContainer');
      
      // Get fields to render (excluding special ones)
      const fieldsToRender = tableFields.filter(f => 
        !SKIP_FIELDS.includes(f.name) && 
        !SOCIAL_FIELDS.includes(f.name) &&
        !IMAGE_FIELD_TYPES.includes(f.type)
      );
      
      let html = '<div class="grid grid-cols-2 gap-4">';
      
      fieldsToRender.forEach(field => {
        const value = fields[field.name];
        const displayValue = value === undefined || value === null ? '' : 
                            typeof value === 'object' ? JSON.stringify(value) : value;
        const isLongText = field.type === 'multilineText' || (typeof displayValue === 'string' && displayValue.length > 100);
        const isUrl = field.type === 'url' || field.name.toLowerCase().includes('url');
        
        html += \`
          <div class="dynamic-field \${isLongText ? 'col-span-2' : ''}">
            <label>\${field.name}</label>
            \${isLongText ? 
              \`<textarea data-field="\${field.name}" rows="4" class="editable-field">\${escapeHtml(String(displayValue))}</textarea>\` :
              isUrl ?
              \`<div class="flex gap-2">
                <input type="text" data-field="\${field.name}" value="\${escapeHtml(String(displayValue))}" class="editable-field flex-1">
                \${displayValue ? \`<a href="\${displayValue}" target="_blank" class="px-3 py-2 bg-amber-500/20 rounded text-amber-500 hover:bg-amber-500/30"><i class="fas fa-external-link-alt"></i></a>\` : ''}
              </div>\` :
              \`<input type="text" data-field="\${field.name}" value="\${escapeHtml(String(displayValue))}" class="editable-field">\`
            }
          </div>
        \`;
      });
      
      html += '</div>';
      container.innerHTML = html;
    }

    function escapeHtml(str) {
      if (typeof str !== 'string') return str;
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ========================================
    // REFERENCE LIBRARY WITH PER-SIZE IMAGES
    // ========================================
    function renderReferenceGridExpanded() {
      const container = document.getElementById('referenceGridExpanded');
      const ratios = ['16:9', '9:16', '1:1'];
      const ratioColors = {
        '16:9': { border: 'amber', bg: 'amber', text: 'amber' },
        '9:16': { border: 'purple', bg: 'purple', text: 'purple' },
        '1:1': { border: 'green', bg: 'green', text: 'green' }
      };
      
      container.innerHTML = referenceCategories.map(cat => {
        const catRefs = references[cat.id] || {};
        const isExpanded = expandedCategories[cat.id];
        
        // Count how many sizes have images
        const imageCount = ratios.filter(r => catRefs[r]?.url).length;
        const activeCount = ratios.filter(r => catRefs[r]?.url && catRefs[r]?.enabled).length;
        
        return \`
          <div class="category-section rounded-xl border border-white/10 overflow-hidden">
            <!-- Category Header -->
            <div 
              class="flex items-center justify-between p-3 bg-white/5 cursor-pointer hover:bg-white/10 transition-all"
              onclick="toggleCategoryExpand('\${cat.id}')"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <i class="fas \${cat.icon} text-amber-500"></i>
                </div>
                <div>
                  <span class="font-medium text-sm">\${cat.name}</span>
                  <p class="text-xs text-gray-500">\${imageCount}/3 sizes • \${activeCount} active</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  \${ratios.map(r => {
                    const ref = catRefs[r];
                    const hasImg = ref?.url;
                    const isActive = hasImg && ref?.enabled;
                    const colors = ratioColors[r];
                    return \`<div class="w-2 h-2 rounded-full \${isActive ? 'bg-' + colors.bg + '-500' : hasImg ? 'bg-' + colors.bg + '-500/30' : 'bg-gray-600'}"></div>\`;
                  }).join('')}
                </div>
                <i class="fas fa-chevron-\${isExpanded ? 'up' : 'down'} text-gray-500 text-xs ml-2"></i>
              </div>
            </div>
            
            <!-- Per-Size Subsections (Collapsible) -->
            <div class="size-subsections \${isExpanded ? '' : 'hidden'} p-3 bg-black/20 border-t border-white/5">
              <div class="grid grid-cols-3 gap-2">
                \${ratios.map(ratio => {
                  const ref = catRefs[ratio] || { url: '', enabled: false };
                  const hasImage = ref.url && ref.url.length > 0;
                  const isEnabled = ref.enabled && hasImage;
                  const colors = ratioColors[ratio];
                  const slotId = cat.id + '-' + ratio;
                  
                  return \`
                    <div class="size-slot-container">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-medium text-\${colors.text}-400">\${ratio}</span>
                        \${hasImage ? \`
                          <button 
                            class="w-4 h-4 rounded text-xs flex items-center justify-center transition-all \${isEnabled ? 'bg-green-500/30 text-green-400' : 'bg-gray-600/30 text-gray-500'}"
                            onclick="event.stopPropagation(); toggleSizeReference('\${cat.id}', '\${ratio}')"
                            title="\${isEnabled ? 'Disable' : 'Enable'} this reference"
                          >
                            <i class="fas fa-\${isEnabled ? 'check' : 'times'} text-[8px]"></i>
                          </button>
                        \` : ''}
                      </div>
                      <div 
                        class="size-ref-slot rounded-lg border-2 border-dashed border-\${colors.border}-500/30 bg-\${colors.bg}-500/5 hover:border-\${colors.border}-500/50 hover:bg-\${colors.bg}-500/10 transition-all cursor-pointer flex items-center justify-center relative overflow-hidden \${hasImage ? 'has-image' : ''}"
                        style="aspect-ratio: \${ratio === '16:9' ? '16/9' : ratio === '9:16' ? '9/16' : '1/1'}; min-height: \${ratio === '9:16' ? '80px' : '50px'}; max-height: \${ratio === '9:16' ? '100px' : '70px'};"
                        id="slot-\${slotId}"
                        onclick="handleSizeSlotClick('\${cat.id}', '\${ratio}')"
                        ondragover="handleSizeRefDragOver(event)"
                        ondragleave="handleSizeRefDragLeave(event)"
                        ondrop="handleSizeRefDrop(event, '\${cat.id}', '\${ratio}')"
                      >
                        \${hasImage ? \`
                          <img src="\${ref.url}" alt="\${cat.name} \${ratio}" class="w-full h-full object-cover rounded-md">
                          <button class="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center transition-all" 
                                  onclick="event.stopPropagation(); clearSizeSlot('\${cat.id}', '\${ratio}')">
                            <i class="fas fa-times"></i>
                          </button>
                        \` : \`
                          <div class="text-center text-gray-500">
                            <i class="fas fa-plus text-xs"></i>
                          </div>
                        \`}
                      </div>
                    </div>
                  \`;
                }).join('')}
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }
    
    function toggleCategoryExpand(categoryId) {
      expandedCategories[categoryId] = !expandedCategories[categoryId];
      renderReferenceGridExpanded();
    }

    function handleSizeSlotClick(categoryId, ratio) {
      currentUploadSlot = categoryId + '-' + ratio;
      document.getElementById('fileInput').click();
    }

    async function handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file || !currentUploadSlot) return;
      
      // Parse the slot ID: 'categoryId-ratio'
      const parts = currentUploadSlot.split('-');
      const ratio = parts.pop(); // Get the ratio (last part after splitting)
      const categoryId = parts.join('-'); // Rejoin in case category has dashes

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];
        const slot = document.getElementById('slot-' + currentUploadSlot);
        slot.innerHTML = '<div class="flex items-center justify-center h-full"><i class="fas fa-spinner fa-spin text-lg text-amber-500"></i></div>';
        
        try {
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image: base64 })
          });
          const data = await res.json();
          
          if (data.image && data.image.url) {
            if (!references[categoryId]) {
              references[categoryId] = { '16:9': { url: '', enabled: false }, '9:16': { url: '', enabled: false }, '1:1': { url: '', enabled: false } };
            }
            references[categoryId][ratio] = { url: data.image.url, enabled: true };
            saveReferences();
            renderReferenceGridExpanded();
            updateActiveCount();
          } else {
            throw new Error('Upload failed');
          }
        } catch (err) {
          alert('Failed to upload: ' + err.message);
          renderReferenceGridExpanded();
        }
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }

    function toggleSizeReference(categoryId, ratio) {
      if (references[categoryId]?.[ratio]?.url) {
        references[categoryId][ratio].enabled = !references[categoryId][ratio].enabled;
        saveReferences();
        renderReferenceGridExpanded();
        updateActiveCount();
      }
    }

    function clearSizeSlot(categoryId, ratio) {
      if (references[categoryId]) {
        references[categoryId][ratio] = { url: '', enabled: false };
        saveReferences();
        renderReferenceGridExpanded();
        updateActiveCount();
      }
    }

    function handleSizeRefDragOver(event) {
      event.preventDefault();
      event.currentTarget.classList.add('border-white', 'bg-white/20');
    }

    function handleSizeRefDragLeave(event) {
      event.currentTarget.classList.remove('border-white', 'bg-white/20');
    }

    function handleSizeRefDrop(event, categoryId, ratio) {
      event.preventDefault();
      event.currentTarget.classList.remove('border-white', 'bg-white/20');
      const imageUrl = event.dataTransfer.getData('text/plain');
      if (imageUrl) {
        if (!references[categoryId]) {
          references[categoryId] = { '16:9': { url: '', enabled: false }, '9:16': { url: '', enabled: false }, '1:1': { url: '', enabled: false } };
        }
        references[categoryId][ratio] = { url: imageUrl, enabled: true };
        saveReferences();
        renderReferenceGridExpanded();
        updateActiveCount();
      }
    }

    function saveReferences() {
      localStorage.setItem('imageGenReferencesV2', JSON.stringify(references));
    }

    function updateActiveCount() {
      const activeRefs = [];
      referenceCategories.forEach(cat => {
        const catRefs = references[cat.id];
        if (catRefs) {
          ['16:9', '9:16', '1:1'].forEach(ratio => {
            if (catRefs[ratio]?.url && catRefs[ratio]?.enabled) {
              activeRefs.push(cat.name + ' (' + ratio + ')');
            }
          });
        }
      });
      
      document.getElementById('processingOrder').textContent = 
        activeRefs.length > 0 ? activeRefs.join(', ') : 'No references active';
      
      // Update the count badge in header
      const countEl = document.getElementById('refLibraryCount');
      if (countEl) {
        countEl.textContent = activeRefs.length + ' active';
      }
    }

    // Legacy function for backward compatibility
    function renderReferenceGrid() {
      renderReferenceGridExpanded();
    }
    
    // Legacy ratio reference functions (kept for backward compatibility)
    function renderRatioReferences() {
      // No longer needed - integrated into renderReferenceGridExpanded
    }

    // ========================================
    // IMAGE GENERATION
    // ========================================
    function setAspectRatio(ratio) {
      currentAspectRatio = ratio;
      document.querySelectorAll('.aspect-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.ratio === ratio);
      });
    }

    function setupPromptCounter() {
      const textarea = document.getElementById('promptInput');
      const counter = document.getElementById('charCount');
      const updateCount = () => { counter.textContent = textarea.value.length + ' characters'; };
      textarea.addEventListener('input', updateCount);
      updateCount();
    }

    function clearPrompt() {
      document.getElementById('promptInput').value = '';
      document.getElementById('charCount').textContent = '0 characters';
    }

    async function generateImage() {
      const prompt = document.getElementById('promptInput').value.trim();
      if (!prompt) { alert('Please enter a prompt'); return; }

      const ratioToGenerate = currentAspectRatio;
      let activeRefs = [];
      
      // NEW: Collect all enabled references for the CURRENT aspect ratio
      // Each category can have a per-size image, so we gather all enabled ones for this ratio
      referenceCategories.forEach(cat => {
        const catRefs = references[cat.id];
        if (catRefs && catRefs[ratioToGenerate]?.url && catRefs[ratioToGenerate]?.enabled) {
          activeRefs.push(catRefs[ratioToGenerate].url);
        }
      });
      
      console.log(ratioToGenerate + ' MODE: Found ' + activeRefs.length + ' active references for this size');
      
      // If no references for this ratio, try to use a fallback
      if (activeRefs.length === 0) {
        // Try to find ANY enabled reference (prefer Face category first)
        const priorityOrder = ['face', 'custom', 'pose', 'outfit', 'background', 'props', 'mood', 'logo'];
        for (const catId of priorityOrder) {
          const catRefs = references[catId];
          if (catRefs) {
            // First check if there's a reference for the current ratio
            if (catRefs[ratioToGenerate]?.url) {
              activeRefs.push(catRefs[ratioToGenerate].url);
              console.log('Using ' + catId + ' reference for ' + ratioToGenerate);
              break;
            }
            // Then try any available ratio as fallback
            for (const r of ['16:9', '9:16', '1:1']) {
              if (catRefs[r]?.url && catRefs[r]?.enabled) {
                activeRefs.push(catRefs[r].url);
                console.log('FALLBACK: Using ' + catId + ' (' + r + ') reference for ' + ratioToGenerate + ' output');
                break;
              }
            }
            if (activeRefs.length > 0) break;
          }
        }
      }
      
      // If still no references, prompt user
      if (activeRefs.length === 0) {
        alert('No reference images found for ' + ratioToGenerate + '. Please expand a category in the Reference Library and upload a reference image for this size.');
        return;
      }
      
      console.log('Active references for ' + ratioToGenerate + ':', activeRefs.length, activeRefs);

      const btn = document.getElementById('generateBtn');
      const status = document.getElementById('generationStatus');
      
      // Check if we're doing two-step generation (with headline)
      const addHeadlineText = document.getElementById('addHeadlineText')?.checked;
      const shortHeadline = document.getElementById('shortHeadline')?.value?.trim();
      const isTwoStep = addHeadlineText && shortHeadline;
      
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating ' + ratioToGenerate + '...';
      status.classList.remove('hidden');
      
      if (isTwoStep) {
        document.getElementById('statusText').textContent = 'Step 1: Creating base image with Nano Banana...';
      } else {
        document.getElementById('statusText').textContent = 'Creating ' + ratioToGenerate + ' image...';
      }

      console.log('Generating image with aspect ratio:', ratioToGenerate);
      console.log('Two-step mode (with headline):', isTwoStep);

      try {
        const createRes = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, imageUrls: activeRefs, aspectRatio: ratioToGenerate })
        });
        const createData = await createRes.json();

        console.log('Create response:', createData);

        if (createData.code !== 200) throw new Error(createData.msg || 'Failed to create task');

        const taskId = createData.data.taskId;
        if (isTwoStep) {
          document.getElementById('statusText').textContent = 'Step 1: Processing base image...';
        } else {
          document.getElementById('statusText').textContent = 'Processing ' + ratioToGenerate + '...';
        }

        let attempts = 0;
        while (attempts < 60) {
          await new Promise(r => setTimeout(r, 2000));
          const statusRes = await fetch('/api/task-status/' + taskId);
          const statusData = await statusRes.json();

          if (statusData.data?.state === 'success') {
            const resultJson = JSON.parse(statusData.data.resultJson);
            const imageUrl = resultJson.resultUrls[0];
            await showGeneratedImage(imageUrl, ratioToGenerate);
            addToHistory(lastGeneratedUrl, prompt); // Use lastGeneratedUrl which may have text overlay
            // Auto-save to Airtable (newest first, append to existing)
            await autoSaveImageToAirtable(imageUrl);
            break;
          } else if (statusData.data?.state === 'failed') {
            throw new Error(statusData.data.failMsg || 'Generation failed');
          }
          attempts++;
          if (isTwoStep) {
            document.getElementById('statusText').textContent = \`Step 1: Processing base image... (\${attempts * 2}s)\`;
          } else {
            document.getElementById('statusText').textContent = \`Processing \${ratioToGenerate}... (\${attempts * 2}s)\`;
          }
        }
        if (attempts >= 60) throw new Error('Generation timed out');
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sparkles mr-2"></i>Generate Image';
        status.classList.add('hidden');
      }
    }

    async function showGeneratedImage(url, ratio) {
      const finalRatio = ratio || currentAspectRatio;
      
      // Check if we need to add text overlay
      const addHeadlineText = document.getElementById('addHeadlineText')?.checked;
      const shortHeadline = document.getElementById('shortHeadline')?.value?.trim();
      
      let finalUrl = url;
      
      if (addHeadlineText && shortHeadline) {
        // Step 2: Add text overlay using Ideogram V3 (best text rendering)
        document.getElementById('statusText').textContent = 'Step 2: Adding headline with Ideogram V3...';
        try {
          finalUrl = await addTextOverlayWithZImage(url, shortHeadline, finalRatio);
        } catch (err) {
          console.error('Error adding text overlay:', err);
          // Fall back to original image if overlay fails
          finalUrl = url;
        }
      }
      
      lastGeneratedUrl = finalUrl;
      lastGeneratedRatio = finalRatio;
      const previewArea = document.getElementById('previewArea');
      previewArea.innerHTML = \`<img src="\${finalUrl}" alt="Generated" draggable="true" 
        ondragstart="handleGeneratedDragStart(event, '\${finalUrl}')">\`;
      document.getElementById('previewActions').classList.remove('hidden');
      document.getElementById('useImageRatio').textContent = '(' + lastGeneratedRatio + ')';
    }
    
    // Use the generated image in the Content Images section
    function useImageInContent() {
      if (!lastGeneratedUrl) {
        alert('No image to use. Generate an image first.');
        return;
      }
      
      const ratio = lastGeneratedRatio;
      const containerId = 'image' + ratio.replace(':', 'x');
      const container = document.getElementById(containerId);
      
      if (container) {
        container.innerHTML = \`<img src="\${lastGeneratedUrl}" alt="\${ratio}">\`;
        container.classList.add('has-image');
        contentImages[ratio] = lastGeneratedUrl;
        
        // Show confirmation
        showSaveIndicator();
        
        // Scroll to the content images section
        document.getElementById('contentImagesSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    // ========================================
    // CREATE ALL SIZES - Use approved image as reference to regenerate for other aspect ratios
    // ========================================
    async function createAllSizes() {
      if (!lastGeneratedUrl) {
        alert('No image to use as reference. Generate and approve a 16:9 image first.');
        return;
      }
      
      const btn = document.getElementById('createAllSizesBtn');
      const statusDiv = document.getElementById('createAllSizesStatus');
      const statusText = document.getElementById('createAllSizesText');
      
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating All Sizes...';
      statusDiv.classList.remove('hidden');
      
      // Reset status indicators
      document.getElementById('size16x9Status').innerHTML = '<i class="fas fa-check mr-1"></i>16:9';
      document.getElementById('size16x9Status').className = 'text-green-400';
      document.getElementById('size9x16Status').innerHTML = '<i class="fas fa-clock mr-1"></i>9:16';
      document.getElementById('size9x16Status').className = 'text-gray-500';
      document.getElementById('size1x1Status').innerHTML = '<i class="fas fa-clock mr-1"></i>1:1';
      document.getElementById('size1x1Status').className = 'text-gray-500';
      
      try {
        // Use the approved 16:9 image for the 16:9 slot
        const container16x9 = document.getElementById('image16x9');
        if (container16x9) {
          container16x9.innerHTML = '<img src="' + lastGeneratedUrl + '" alt="16:9">';
          container16x9.classList.add('has-image');
          contentImages['16:9'] = lastGeneratedUrl;
        }
        
        // Build a recomposition prompt using the approved image as reference
        const basePrompt = 'Recreate this exact same scene, person, outfit, and lighting in a different aspect ratio. Keep EVERYTHING identical - same woman, same pose, same expression, same clothing, same background, same mood. Only adjust the framing/composition to fit the new aspect ratio. Do NOT change any details.';
        
        // Generate 9:16 and 1:1 using the approved image as reference
        const sizesToGenerate = [
          { ratio: '9:16', statusId: 'size9x16Status' },
          { ratio: '1:1', statusId: 'size1x1Status' }
        ];
        
        for (const size of sizesToGenerate) {
          // Update status
          document.getElementById(size.statusId).innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>' + size.ratio;
          document.getElementById(size.statusId).className = 'text-amber-400';
          statusText.textContent = 'Generating ' + size.ratio + ' version...';
          
          // Generate image with approved image as reference
          const generatedUrl = await generateImageForRatio(lastGeneratedUrl, basePrompt, size.ratio);
          
          // Check if headline text should be added
          const addHeadlineText = document.getElementById('addHeadlineText')?.checked;
          const shortHeadline = document.getElementById('shortHeadline')?.value?.trim();
          
          let finalUrl = generatedUrl;
          if (addHeadlineText && shortHeadline) {
            statusText.textContent = 'Adding text to ' + size.ratio + '...';
            try {
              finalUrl = await addTextOverlayWithZImage(generatedUrl, shortHeadline, size.ratio);
            } catch (err) {
              console.error('Error adding text overlay:', err);
              finalUrl = generatedUrl;
            }
          }
          
          // Set in content images
          const containerId = 'image' + size.ratio.replace(':', 'x');
          const container = document.getElementById(containerId);
          if (container) {
            container.innerHTML = '<img src="' + finalUrl + '" alt="' + size.ratio + '">';
            container.classList.add('has-image');
            contentImages[size.ratio] = finalUrl;
          }
          
          // Add to history
          addToHistory(finalUrl, 'Recomposed from 16:9 to ' + size.ratio);
          
          // Mark as done
          document.getElementById(size.statusId).innerHTML = '<i class="fas fa-check mr-1"></i>' + size.ratio;
          document.getElementById(size.statusId).className = 'text-green-400';
        }
        
        statusText.textContent = 'All sizes generated! Saving to Airtable...';
        
        // Auto-save to Airtable if a record is selected
        if (currentRecordId && currentBase && currentTable) {
          await saveImagesToAirtable();
        }
        
        showSaveIndicator();
        
        // Scroll to content images
        document.getElementById('contentImagesSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide status after a moment
        setTimeout(() => {
          statusDiv.classList.add('hidden');
        }, 3000);
        
      } catch (err) {
        console.error('Error creating sizes:', err);
        alert('Error creating sizes: ' + err.message);
        statusText.textContent = 'Error: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-clone mr-2"></i>Generate All Sizes';
      }
    }
    
    // Generate image for a specific ratio using a reference image
    async function generateImageForRatio(referenceImageUrl, prompt, targetRatio) {
      // Create the generation request
      const createRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt,
          imageUrls: [referenceImageUrl], // Use approved image as the reference
          aspectRatio: targetRatio 
        })
      });
      const createData = await createRes.json();
      
      if (createData.code !== 200) {
        throw new Error(createData.msg || 'Failed to create task for ' + targetRatio);
      }
      
      const taskId = createData.data.taskId;
      
      // Poll for completion
      let attempts = 0;
      while (attempts < 60) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch('/api/task-status/' + taskId);
        const statusData = await statusRes.json();
        
        if (statusData.data?.state === 'success') {
          const resultJson = JSON.parse(statusData.data.resultJson);
          return resultJson.resultUrls[0];
        } else if (statusData.data?.state === 'failed') {
          throw new Error(statusData.data.failMsg || 'Generation failed for ' + targetRatio);
        }
        attempts++;
      }
      
      throw new Error('Generation timed out for ' + targetRatio);
    }
    
    // Load image from URL (uses server-side proxy to avoid CORS)
    async function loadImage(url) {
      // Use server-side proxy to fetch image and convert to base64
      const proxyRes = await fetch('/api/proxy-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url })
      });
      
      const proxyData = await proxyRes.json();
      
      if (proxyData.error) {
        throw new Error(proxyData.error);
      }
      
      // Create image from data URL (no CORS issues with data URLs)
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to decode image'));
        img.src = proxyData.dataUrl;
      });
    }
    
    // Add text overlay to image using Ideogram V3 (best text rendering in the industry)
    async function addTextOverlayWithZImage(imageUrl, headline, ratio) {
      // Format the headline for the aspect ratio
      const formattedHeadline = formatHeadlineForRatio(headline, ratio);
      
      // Get ratio-specific text layout instructions
      let ratioInstructions = '';
      let bannerHeight = '';
      let textSize = '';
      let lineBreakHint = '';
      
      if (ratio === '16:9') {
        // Wide landscape - plenty of horizontal space
        bannerHeight = '12-15% of image height';
        textSize = 'LARGE bold text (about 5% of image height)';
        lineBreakHint = 'Text should fit on 1-2 lines maximum across the wide banner';
        ratioInstructions = 'This is a WIDE 16:9 landscape image. The banner spans a wide area so text can be larger and fit on fewer lines.';
      } else if (ratio === '9:16') {
        // Tall portrait - narrow horizontal space
        bannerHeight = '10-12% of image height';
        textSize = 'MEDIUM text (about 4% of image WIDTH since it is narrow)';
        lineBreakHint = 'Text MUST wrap to 3-4 shorter lines to fit the NARROW width. Each line should be only 3-4 words.';
        ratioInstructions = 'This is a TALL NARROW 9:16 portrait image (like Instagram Stories). The banner is NARROW so text must be SMALLER and wrap to MULTIPLE LINES to fit.';
      } else if (ratio === '1:1') {
        // Square - moderate space
        bannerHeight = '12-14% of image height';
        textSize = 'MEDIUM-LARGE text (about 4.5% of image width)';
        lineBreakHint = 'Text should wrap to 2-3 lines of moderate length (4-5 words per line)';
        ratioInstructions = 'This is a SQUARE 1:1 image. The banner has moderate width so text should be medium sized and wrap to 2-3 lines.';
      }
      
      // Create a specific prompt for Ideogram to add text overlay
      // Ideogram excels at text rendering - be very specific about what we want
      const textPrompt = \`Keep this exact image but add a professional news headline banner at the bottom.

ASPECT RATIO CONTEXT:
\${ratioInstructions}

BANNER SPECIFICATIONS:
- Position: Bottom \${bannerHeight}
- Background: Dark semi-transparent black banner (85% opacity) spanning full width
- Text content: "\${formattedHeadline}"
- Text style: Bold white Helvetica/sans-serif font, left-aligned with padding
- Text size: \${textSize}
- Line breaks: \${lineBreakHint}
- Logo: Small golden crown icon labeled "5th Ave Crypto" in bottom-right corner of banner

CRITICAL: 
- Do NOT change the main image content AT ALL
- Only ADD the text banner overlay at the bottom
- The headline text must be EXACTLY as written above - letter perfect
- Text must be crisp, clear, and professional
- TEXT MUST FIT WITHIN THE BANNER - adjust size and line breaks as needed for this aspect ratio\`;

      console.log('Ideogram V3 text overlay prompt:', textPrompt);
      
      try {
        // Call Ideogram API
        const createRes = await fetch('/api/generate-image-ideogram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: textPrompt, 
            imageUrl: imageUrl,
            aspectRatio: ratio 
          })
        });
        const createData = await createRes.json();

        console.log('Ideogram V3 create response:', createData);

        if (createData.code !== 200) {
          throw new Error(createData.msg || 'Failed to create Ideogram task');
        }

        const taskId = createData.data.taskId;

        // Poll for completion
        let attempts = 0;
        while (attempts < 90) { // Ideogram may take longer
          await new Promise(r => setTimeout(r, 2000));
          const statusRes = await fetch('/api/task-status/' + taskId);
          const statusData = await statusRes.json();

          if (statusData.data?.state === 'success') {
            const resultJson = JSON.parse(statusData.data.resultJson);
            const finalImageUrl = resultJson.resultUrls[0];
            console.log('Ideogram V3 text overlay complete:', finalImageUrl);
            return finalImageUrl;
          } else if (statusData.data?.state === 'failed') {
            throw new Error(statusData.data.failMsg || 'Ideogram text overlay failed');
          }
          attempts++;
        }
        throw new Error('Ideogram text overlay timed out');
      } catch (err) {
        console.error('Ideogram text overlay error:', err);
        // Fall back to canvas overlay if Ideogram fails
        console.log('Falling back to canvas text overlay...');
        return await addTextOverlayWithCanvas(imageUrl, headline, ratio);
      }
    }
    
    // Add text overlay to image using canvas (fallback method)
    async function addTextOverlayWithCanvas(imageUrl, headline, ratio) {
      // Load the original image
      const img = await loadImage(imageUrl);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Calculate banner dimensions based on aspect ratio
      let bannerHeightPercent, maxWordsPerLine, fontSize, lineHeight, padding;
      
      if (ratio === '16:9') {
        bannerHeightPercent = 0.15; // 15% of image height
        maxWordsPerLine = 10;
        fontSize = Math.floor(canvas.height * 0.055); // ~5.5% of height
        lineHeight = fontSize * 1.3;
        padding = canvas.width * 0.03;
      } else if (ratio === '9:16') {
        bannerHeightPercent = 0.12; // 12% for tall images
        maxWordsPerLine = 4;
        fontSize = Math.floor(canvas.width * 0.065); // ~6.5% of width (narrower)
        lineHeight = fontSize * 1.25;
        padding = canvas.width * 0.05;
      } else { // 1:1
        bannerHeightPercent = 0.15;
        maxWordsPerLine = 6;
        fontSize = Math.floor(canvas.width * 0.05); // ~5% of width
        lineHeight = fontSize * 1.3;
        padding = canvas.width * 0.04;
      }
      
      // Word wrap the headline
      const words = headline.split(/s+/);
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        ctx.font = 'bold ' + fontSize + 'px "Helvetica Neue", Helvetica, Arial, sans-serif';
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth > canvas.width - (padding * 2) - 60) { // 60px reserved for logo
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            lines.push(word);
          }
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Calculate banner height based on number of lines
      const minBannerHeight = canvas.height * bannerHeightPercent;
      const textHeight = lines.length * lineHeight + (padding * 2);
      const bannerHeight = Math.max(minBannerHeight, textHeight);
      const bannerY = canvas.height - bannerHeight;
      
      // Draw semi-transparent dark banner
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, bannerY, canvas.width, bannerHeight);
      
      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold ' + fontSize + 'px "Helvetica Neue", Helvetica, Arial, sans-serif';
      ctx.textBaseline = 'middle';
      
      const totalTextHeight = lines.length * lineHeight;
      const startY = bannerY + (bannerHeight - totalTextHeight) / 2 + lineHeight / 2;
      
      lines.forEach((line, index) => {
        const y = startY + (index * lineHeight);
        ctx.fillText(line, padding, y);
      });
      
      // Load and draw logo
      try {
        const logoUrl = 'https://iili.io/fEiEfUB.png';
        const logoImg = await loadImage(logoUrl);
        const logoSize = fontSize * 1.2; // Logo slightly larger than text
        const logoX = canvas.width - padding - logoSize;
        const logoY = bannerY + (bannerHeight - logoSize) / 2;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      } catch (err) {
        console.warn('Could not load logo:', err);
      }
      
      // Convert canvas to blob and upload
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          try {
            const uploadedUrl = await uploadCroppedImage(blob);
            resolve(uploadedUrl);
          } catch (err) {
            reject(err);
          }
        }, 'image/png', 0.95);
      });
    }
    
    // Crop image to target aspect ratio (center crop)
    function cropToAspectRatio(img, targetWidth, targetHeight) {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const sourceRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;
        
        let sourceX, sourceY, sourceWidth, sourceHeight;
        
        if (sourceRatio > targetRatio) {
          // Source is wider - crop sides
          sourceHeight = img.height;
          sourceWidth = img.height * targetRatio;
          sourceX = (img.width - sourceWidth) / 2;
          sourceY = 0;
        } else {
          // Source is taller - crop top/bottom
          sourceWidth = img.width;
          sourceHeight = img.width / targetRatio;
          sourceX = 0;
          sourceY = (img.height - sourceHeight) / 2;
        }
        
        // Draw cropped and resized image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, targetWidth, targetHeight
        );
        
        // Convert to blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 0.95);
      });
    }
    
    // Upload cropped image to get a URL
    async function uploadCroppedImage(blob) {
      // Convert blob to base64
      const base64 = await blobToBase64(blob);
      
      // Upload using existing API
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: base64 })
      });
      
      const data = await res.json();
      
      if (data.image && data.image.url) {
        return data.image.url;
      } else {
        throw new Error('Upload failed');
      }
    }
    
    // Convert blob to base64 (without data URL prefix)
    function blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    
    // Open content image in lightbox
    function openContentImage(ratio) {
      const url = contentImages[ratio];
      if (url) {
        openLightbox(url);
      }
    }

    function handleGeneratedDragStart(event, url) {
      event.dataTransfer.setData('text/plain', url);
      event.currentTarget.parentElement.classList.add('drag-source');
    }

    function handlePreviewDragEnd(event) {
      document.getElementById('previewArea').classList.remove('drag-source');
    }

    function addToHistory(url, prompt) {
      // Store the record ID, base ID, and table ID with each image
      generationHistory.unshift({ 
        url, 
        prompt, 
        timestamp: Date.now(),
        recordId: currentRecordId || null,
        baseId: currentBase?.id || null,
        tableId: currentTable?.id || null,
        articleTitle: currentRecord?.fields?.sourceHeadline || currentRecord?.fields?.Title || 'Unknown'
      });
      if (generationHistory.length > 20) generationHistory.pop();
      localStorage.setItem('imageGenHistory', JSON.stringify(generationHistory));
      renderHistory();
    }
    
    // ========================================
    // AUTO-SAVE IMAGE TO AIRTABLE
    // ========================================
    async function autoSaveImageToAirtable(imageUrl) {
      // Only save if we have a current record selected
      if (!currentRecordId || !currentBase || !currentTable) {
        console.log('No record selected - skipping auto-save to Airtable');
        return;
      }
      
      try {
        // Find the postImage field (or similar attachment field)
        const imageFields = tableFields.filter(f => IMAGE_FIELD_TYPES.includes(f.type));
        if (imageFields.length === 0) {
          console.log('No image attachment field found in table');
          return;
        }
        
        const targetField = imageFields.find(f => 
          ['postimage', 'image', 'images', 'attachment', 'attachments', 'photo', 'media'].includes(f.name.toLowerCase())
        ) || imageFields[0];
        
        // Get existing attachments from the current record
        const existingAttachments = currentRecord?.fields?.[targetField.name] || [];
        
        // Prepend new image (newest first) to existing attachments
        const newAttachment = { url: imageUrl };
        const updatedAttachments = [newAttachment, ...existingAttachments];
        
        console.log('Auto-saving image to Airtable field:', targetField.name);
        console.log('Total attachments:', updatedAttachments.length);
        
        // Save to Airtable
        const res = await fetch('/api/records/' + currentRecordId + '?baseId=' + currentBase.id + '&tableId=' + currentTable.id, {
          method: 'PATCH',
          headers: {
            'X-Airtable-Token': AIRTABLE_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ [targetField.name]: updatedAttachments })
        });
        
        const result = await res.json();
        
        if (result.error) {
          console.error('Airtable save error:', result.error);
          return;
        }
        
        // Update local record cache with new attachments
        if (currentRecord && currentRecord.fields) {
          currentRecord.fields[targetField.name] = updatedAttachments;
        }
        
        console.log('✓ Image auto-saved to Airtable');
        showSaveIndicator();
        
      } catch (err) {
        console.error('Auto-save to Airtable failed:', err);
      }
    }
    
    // Save a specific image from history to current Airtable record
    async function saveHistoryImageToAirtable(imageUrl) {
      if (!currentRecordId || !currentBase || !currentTable) {
        alert('Please select an article first before saving images.');
        return;
      }
      
      await autoSaveImageToAirtable(imageUrl);
      alert('Image saved to current article!');
    }
    
    // Save ALL history images to their CORRECT articles (based on stored record IDs)
    async function saveAllHistoryToArticle() {
      if (generationHistory.length === 0) {
        alert('No images in history to save.');
        return;
      }
      
      const btn = document.getElementById('saveAllHistoryBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      
      try {
        // Group images by their record ID
        const imagesByRecord = {};
        let unassignedCount = 0;
        
        generationHistory.forEach(item => {
          if (item.recordId && item.baseId && item.tableId) {
            const key = item.recordId;
            if (!imagesByRecord[key]) {
              imagesByRecord[key] = {
                recordId: item.recordId,
                baseId: item.baseId,
                tableId: item.tableId,
                articleTitle: item.articleTitle,
                images: []
              };
            }
            imagesByRecord[key].images.push({ url: item.url });
          } else {
            unassignedCount++;
          }
        });
        
        const recordKeys = Object.keys(imagesByRecord);
        
        if (recordKeys.length === 0) {
          alert('No images have article assignments. Images generated before this update don\\'t have article tracking. Please generate new images with an article selected.');
          return;
        }
        
        console.log('Saving images to ' + recordKeys.length + ' different articles');
        
        let savedCount = 0;
        let errorCount = 0;
        
        // Save to each article
        for (const key of recordKeys) {
          const record = imagesByRecord[key];
          
          try {
            // First, get current attachments for this record
            const getRes = await fetch('/api/records/' + record.recordId + '?baseId=' + record.baseId + '&tableId=' + record.tableId, {
              headers: { 'X-Airtable-Token': AIRTABLE_TOKEN }
            });
            const currentData = await getRes.json();
            
            // Find the postImage field name (assume it's consistent)
            const existingAttachments = currentData.fields?.postImage || [];
            
            // Prepend new images (newest first)
            const allAttachments = [...record.images, ...existingAttachments];
            
            // Save to Airtable
            const res = await fetch('/api/records/' + record.recordId + '?baseId=' + record.baseId + '&tableId=' + record.tableId, {
              method: 'PATCH',
              headers: {
                'X-Airtable-Token': AIRTABLE_TOKEN,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ postImage: allAttachments })
            });
            
            const result = await res.json();
            
            if (result.error) {
              console.error('Error saving to ' + record.articleTitle + ':', result.error);
              errorCount++;
            } else {
              console.log('✓ Saved ' + record.images.length + ' images to: ' + record.articleTitle);
              savedCount += record.images.length;
            }
          } catch (err) {
            console.error('Error saving to ' + record.articleTitle + ':', err);
            errorCount++;
          }
        }
        
        showSaveIndicator();
        
        let message = '✓ Saved ' + savedCount + ' images to ' + recordKeys.length + ' articles!';
        if (unassignedCount > 0) {
          message += '\\n\\n' + unassignedCount + ' images had no article assignment (generated before tracking was added).';
        }
        if (errorCount > 0) {
          message += '\\n\\n' + errorCount + ' articles had errors.';
        }
        alert(message);
        
      } catch (err) {
        console.error('Save all history failed:', err);
        alert('Error saving images: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save All';
      }
    }

    function renderHistory() {
      const grid = document.getElementById('historyGrid');
      if (generationHistory.length === 0) {
        grid.innerHTML = '<div class="text-center text-gray-500 w-full py-12"><i class="fas fa-clock text-3xl mb-2"></i><p class="text-sm">No images yet</p></div>';
        return;
      }
      // Show only the 4 most recent images in a single row
      const recentItems = generationHistory.slice(0, 4);
      grid.innerHTML = recentItems.map((item, i) => {
        const hasArticle = item.recordId;
        const shortTitle = item.articleTitle ? (item.articleTitle.length > 15 ? item.articleTitle.substring(0, 15) + '...' : item.articleTitle) : '';
        return \`
          <div class="history-item relative" draggable="true" 
            ondragstart="handleHistoryDragStart(event, '\${item.url}')" 
            onclick="openLightbox('\${item.url}')"
            title="\${item.articleTitle || 'No article assigned'}">
            <img src="\${item.url}" alt="History \${i + 1}">
            \${hasArticle ? '<div class="absolute bottom-0 left-0 right-0 bg-black/80 text-xs text-green-400 px-2 py-1.5 truncate"><i class="fas fa-link mr-1"></i>' + shortTitle + '</div>' : '<div class="absolute bottom-0 left-0 right-0 bg-red-900/80 text-xs text-red-300 px-2 py-1.5"><i class="fas fa-unlink mr-1"></i>No article</div>'}
          </div>
        \`;
      }).join('');
    }
    
    // Toggle Reference Library visibility
    function toggleReferenceLibrary() {
      const content = document.getElementById('referenceLibraryContent');
      const toggle = document.getElementById('refLibraryToggle');
      const isHidden = content.classList.contains('hidden');
      
      if (isHidden) {
        content.classList.remove('hidden');
        toggle.style.transform = 'rotate(180deg)';
      } else {
        content.classList.add('hidden');
        toggle.style.transform = 'rotate(0deg)';
      }
    }
    
    // Toggle Record Details (collapsible section)
    function toggleRecordDetails() {
      const content = document.getElementById('recordDetailsContent');
      const toggle = document.getElementById('recordDetailsToggle');
      const isHidden = content.classList.contains('hidden');
      
      if (isHidden) {
        content.classList.remove('hidden');
        toggle.style.transform = 'rotate(180deg)';
      } else {
        content.classList.add('hidden');
        toggle.style.transform = 'rotate(0deg)';
      }
    }

    function handleHistoryDragStart(event, url) {
      event.dataTransfer.setData('text/plain', url);
    }
    
    // ========================================
    // LIGHTBOX FUNCTIONS WITH ZOOM
    // ========================================
    let currentLightboxUrl = null;
    let lightboxZoom = 1;
    let lightboxIsDragging = false;
    let lightboxDragStart = { x: 0, y: 0 };
    let lightboxScrollStart = { x: 0, y: 0 };
    
    function openLightbox(url) {
      currentLightboxUrl = url;
      lightboxZoom = 1;
      document.getElementById('lightboxImage').src = url;
      document.getElementById('lightboxOverlay').classList.add('active');
      document.body.style.overflow = 'hidden';
      updateLightboxZoom();
      
      // Reset container scroll
      const container = document.getElementById('lightboxZoomContainer');
      container.scrollTop = 0;
      container.scrollLeft = 0;
      container.classList.remove('zoomed');
    }
    
    function closeLightbox(event) {
      if (event && event.target !== event.currentTarget) return;
      document.getElementById('lightboxOverlay').classList.remove('active');
      document.body.style.overflow = '';
      currentLightboxUrl = null;
      lightboxZoom = 1;
    }
    
    function updateLightboxZoom() {
      const img = document.getElementById('lightboxImage');
      const container = document.getElementById('lightboxZoomContainer');
      const zoomLabel = document.getElementById('lightboxZoomLevel');
      
      img.style.transform = 'scale(' + lightboxZoom + ')';
      zoomLabel.textContent = Math.round(lightboxZoom * 100) + '%';
      
      if (lightboxZoom > 1) {
        container.classList.add('zoomed');
        img.style.transformOrigin = 'top left';
      } else {
        container.classList.remove('zoomed');
        img.style.transformOrigin = 'center center';
      }
    }
    
    function lightboxZoomIn() {
      lightboxZoom = Math.min(lightboxZoom + 0.5, 5);
      updateLightboxZoom();
    }
    
    function lightboxZoomOut() {
      lightboxZoom = Math.max(lightboxZoom - 0.5, 0.5);
      updateLightboxZoom();
    }
    
    function lightboxZoomReset() {
      lightboxZoom = 1;
      updateLightboxZoom();
      const container = document.getElementById('lightboxZoomContainer');
      container.scrollTop = 0;
      container.scrollLeft = 0;
    }
    
    function toggleLightboxZoom(event) {
      event.stopPropagation();
      
      // If zoomed in, zoom out. If zoomed out, zoom in to 2x
      if (lightboxZoom > 1) {
        lightboxZoom = 1;
      } else {
        lightboxZoom = 2.5;
      }
      updateLightboxZoom();
      
      // If zooming in, try to center on click position
      if (lightboxZoom > 1) {
        const container = document.getElementById('lightboxZoomContainer');
        const rect = container.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Scroll to center the clicked area
        setTimeout(() => {
          container.scrollLeft = (clickX * lightboxZoom) - (rect.width / 2);
          container.scrollTop = (clickY * lightboxZoom) - (rect.height / 2);
        }, 50);
      }
    }
    
    function handleLightboxWheel(event) {
      event.preventDefault();
      event.stopPropagation();
      
      const delta = event.deltaY > 0 ? -0.25 : 0.25;
      lightboxZoom = Math.max(0.5, Math.min(5, lightboxZoom + delta));
      updateLightboxZoom();
    }
    
    // Drag to pan when zoomed
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('lightboxZoomContainer');
      if (!container) return;
      
      container.addEventListener('mousedown', (e) => {
        if (lightboxZoom <= 1) return;
        lightboxIsDragging = true;
        lightboxDragStart = { x: e.clientX, y: e.clientY };
        lightboxScrollStart = { x: container.scrollLeft, y: container.scrollTop };
        container.style.cursor = 'grabbing';
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!lightboxIsDragging) return;
        const dx = e.clientX - lightboxDragStart.x;
        const dy = e.clientY - lightboxDragStart.y;
        container.scrollLeft = lightboxScrollStart.x - dx;
        container.scrollTop = lightboxScrollStart.y - dy;
      });
      
      document.addEventListener('mouseup', () => {
        lightboxIsDragging = false;
        const container = document.getElementById('lightboxZoomContainer');
        if (container && lightboxZoom > 1) {
          container.style.cursor = 'grab';
        }
      });
    });
    
    async function lightboxUseImage() {
      if (!currentLightboxUrl) return;
      
      // Set as the current generated image
      lastGeneratedUrl = currentLightboxUrl;
      await showGeneratedImage(currentLightboxUrl, currentAspectRatio);
      
      // Also put it in the content images
      useImageInContent();
      
      closeLightbox();
    }
    
    function lightboxDownload() {
      if (!currentLightboxUrl) return;
      window.open(currentLightboxUrl, '_blank');
    }
    
    function lightboxCopyUrl() {
      if (!currentLightboxUrl) return;
      navigator.clipboard.writeText(currentLightboxUrl);
      alert('URL copied to clipboard!');
    }
    
    async function lightboxSaveToArticle() {
      if (!currentLightboxUrl) return;
      if (!currentRecordId || !currentBase || !currentTable) {
        alert('Please select an article first before saving images.');
        return;
      }
      await autoSaveImageToAirtable(currentLightboxUrl);
      closeLightbox();
    }
    
    // Close lightbox on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });

    function downloadImage() {
      if (!lastGeneratedUrl) return;
      window.open(lastGeneratedUrl, '_blank');
    }

    function copyImageUrl() {
      if (!lastGeneratedUrl) return;
      navigator.clipboard.writeText(lastGeneratedUrl);
      const btn = event.currentTarget;
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
      setTimeout(() => btn.innerHTML = original, 1500);
    }

    // ========================================
    // IMAGE DROP ZONES
    // ========================================
    function handleImageDragOver(event) {
      event.preventDefault();
      event.currentTarget.classList.add('drag-over');
    }

    function handleImageDragLeave(event) {
      event.currentTarget.classList.remove('drag-over');
    }

    async function handleImageDrop(event, aspectRatio) {
      event.preventDefault();
      event.currentTarget.classList.remove('drag-over');
      
      const imageUrl = event.dataTransfer.getData('text/plain');
      if (!imageUrl) return;

      const containerId = 'image' + aspectRatio.replace(':', 'x');
      const container = document.getElementById(containerId);
      container.innerHTML = \`<img src="\${imageUrl}" alt="\${aspectRatio}">\`;
      container.classList.add('has-image');
      
      contentImages[aspectRatio] = imageUrl;

      if (currentRecordId && aspectRatio === '16:9') {
        showSaveIndicator();
      }
    }

    // ========================================
    // AUTO-SAVE
    // ========================================
    function setupAutoSave() {
      document.querySelectorAll('.editable-field').forEach(field => {
        field.removeEventListener('input', handleFieldInput);
        field.addEventListener('input', handleFieldInput);
      });
    }

    function handleFieldInput(e) {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => autoSave(e.target), 1000);
    }

    async function autoSave(field) {
      if (!currentRecordId || !currentBase || !currentTable) return;
      
      const airtableField = field.dataset.field;
      if (!airtableField) return;
      
      try {
        const res = await fetch(\`/api/records/\${currentRecordId}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
          method: 'PATCH',
          headers: {
            'X-Airtable-Token': AIRTABLE_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ [airtableField]: field.value })
        });
        
        if (res.ok) {
          showSaveIndicator();
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }

    function showSaveIndicator() {
      const indicator = document.getElementById('saveIndicator');
      indicator.classList.add('show');
      setTimeout(() => indicator.classList.remove('show'), 1500);
    }

    // ========================================
    // TABS
    // ========================================
    function showTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('tab-active'));
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
      
      document.querySelector(\`[data-tab="\${tab}"]\`).classList.add('tab-active');
      document.getElementById('tab-' + tab).classList.remove('hidden');
    }

    function copyContent(type) {
      const contentMap = {
        twitter: 'contentTwitter', threads: 'contentThreads', bluesky: 'contentBluesky',
        linkedin: 'contentLinkedin', facebook: 'contentFacebook', instagram: 'contentInstagram',
        blog: 'contentBlog', script: 'contentScript'
      };
      const text = document.getElementById(contentMap[type]).value;
      navigator.clipboard.writeText(text);
      
      const btn = event.currentTarget;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
      setTimeout(() => btn.innerHTML = originalHtml, 1500);
    }

    // ========================================
    // RECORD ACTIONS
    // ========================================
    async function approveRecord() {
      if (!currentRecordId || !currentBase || !currentTable) return;
      await fetch(\`/api/records/\${currentRecordId}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
        method: 'PATCH',
        headers: { 'X-Airtable-Token': AIRTABLE_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Approved' })
      });
      loadRecords();
      selectRecord(currentRecordId);
    }

    async function declineRecord() {
      if (!currentRecordId || !currentBase || !currentTable) return;
      await fetch(\`/api/records/\${currentRecordId}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
        method: 'PATCH',
        headers: { 'X-Airtable-Token': AIRTABLE_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Declined' })
      });
      loadRecords();
      selectRecord(currentRecordId);
    }

    // ========================================
    // SAVE IMAGES TO AIRTABLE
    // ========================================
    async function saveImagesToAirtable() {
      if (!currentRecordId || !currentBase || !currentTable) {
        alert('Please select a record first before saving images.');
        return;
      }
      
      // Check if we have any images to save
      const hasImages = contentImages['16:9'] || contentImages['9:16'] || contentImages['1:1'];
      if (!hasImages) {
        alert('No images to save. Generate or drop images first.');
        return;
      }
      
      const btn = document.getElementById('saveImagesToAirtableBtn');
      const statusDiv = document.getElementById('saveImagesStatus');
      const statusText = document.getElementById('saveImagesText');
      
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
      statusDiv.classList.remove('hidden');
      
      try {
        // Find image attachment fields in the table
        const imageFields = tableFields.filter(f => IMAGE_FIELD_TYPES.includes(f.type));
        
        if (imageFields.length === 0) {
          throw new Error('No image attachment fields found in this table. Please add an attachment field in Airtable.');
        }
        
        // Check for specific fields for each size
        const field16x9 = imageFields.find(f => ['image16x9', 'image_16x9', 'landscapeimage'].includes(f.name.toLowerCase()));
        const field9x16 = imageFields.find(f => ['image9x16', 'image_9x16', 'portraitimage', 'tiktokimage', 'reelsimage'].includes(f.name.toLowerCase()));
        const field1x1 = imageFields.find(f => ['image1x1', 'image_1x1', 'squareimage', 'instagramimage'].includes(f.name.toLowerCase()));
        
        // Find the main image field (postImage or similar)
        const mainImageField = imageFields.find(f => ['postimage', 'image', 'images', 'attachment', 'attachments', 'photo', 'media'].includes(f.name.toLowerCase()));
        const fallbackField = imageFields[0]; // Use first available if no match
        
        const updates = {};
        let savedCount = 0;
        
        // If we have separate fields for each size, use them
        if (field16x9 && contentImages['16:9']) {
          updates[field16x9.name] = [{ url: contentImages['16:9'] }];
          savedCount++;
        }
        if (field9x16 && contentImages['9:16']) {
          updates[field9x16.name] = [{ url: contentImages['9:16'] }];
          savedCount++;
        }
        if (field1x1 && contentImages['1:1']) {
          updates[field1x1.name] = [{ url: contentImages['1:1'] }];
          savedCount++;
        }
        
        // If no separate fields found, save ALL images to the main image field
        if (savedCount === 0) {
          const targetField = mainImageField || fallbackField;
          const allImages = [];
          
          // Add all available images to the array
          if (contentImages['16:9']) {
            allImages.push({ url: contentImages['16:9'], filename: 'image_16x9.png' });
          }
          if (contentImages['9:16']) {
            allImages.push({ url: contentImages['9:16'], filename: 'image_9x16.png' });
          }
          if (contentImages['1:1']) {
            allImages.push({ url: contentImages['1:1'], filename: 'image_1x1.png' });
          }
          
          if (allImages.length > 0) {
            updates[targetField.name] = allImages;
            savedCount = allImages.length;
            statusText.textContent = 'Saving ' + savedCount + ' images to ' + targetField.name + '...';
          }
        }
        
        if (Object.keys(updates).length === 0 || savedCount === 0) {
          throw new Error('No images to save. Add images to Content Images first.');
        }
        
        console.log('Saving to Airtable:', updates);
        
        // Save to Airtable
        statusText.textContent = 'Uploading ' + savedCount + ' image(s) to Airtable...';
        const res = await fetch(\`/api/records/\${currentRecordId}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
          method: 'PATCH',
          headers: {
            'X-Airtable-Token': AIRTABLE_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });
        
        const result = await res.json();
        
        if (result.error) {
          throw new Error(result.error.message || 'Airtable error');
        }
        
        statusText.textContent = '✓ Saved ' + savedCount + ' image(s) to Airtable!';
        statusDiv.classList.remove('border-blue-500/30', 'bg-blue-900/30');
        statusDiv.classList.add('border-green-500/30', 'bg-green-900/30');
        statusText.classList.remove('text-blue-300');
        statusText.classList.add('text-green-300');
        
        showSaveIndicator();
        
        // Hide status after a moment
        setTimeout(() => {
          statusDiv.classList.add('hidden');
          statusDiv.classList.remove('border-green-500/30', 'bg-green-900/30');
          statusDiv.classList.add('border-blue-500/30', 'bg-blue-900/30');
          statusText.classList.remove('text-green-300');
          statusText.classList.add('text-blue-300');
        }, 3000);
        
      } catch (err) {
        console.error('Error saving images:', err);
        statusText.textContent = '✗ Error: ' + err.message;
        statusDiv.classList.remove('border-blue-500/30', 'bg-blue-900/30');
        statusDiv.classList.add('border-red-500/30', 'bg-red-900/30');
        statusText.classList.remove('text-blue-300');
        statusText.classList.add('text-red-300');
        
        setTimeout(() => {
          statusDiv.classList.add('hidden');
          statusDiv.classList.remove('border-red-500/30', 'bg-red-900/30');
          statusDiv.classList.add('border-blue-500/30', 'bg-blue-900/30');
          statusText.classList.remove('text-red-300');
          statusText.classList.add('text-blue-300');
        }, 5000);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-2"></i>Save to Airtable';
      }
    }

    // ========================================
    // CONTENT CALENDAR
    // ========================================
    let calendarDate = new Date();
    let calendarPosts = []; // Posts with scheduled dates
    let unscheduledPosts = []; // Posts ready to schedule (approved but no date)
    let draggedPost = null;
    
    function renderCalendar() {
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();
      
      // Update header
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
      document.getElementById('calendarMonthYear').textContent = monthNames[month] + ' ' + year;
      
      // Get first day and last day of month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDay = firstDay.getDay(); // 0 = Sunday
      const daysInMonth = lastDay.getDate();
      
      // Get days from previous month to fill first row
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      
      // Build calendar grid
      let html = '';
      let dayCount = 1;
      let nextMonthDay = 1;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // 6 rows max
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
          const cellIndex = row * 7 + col;
          let dateStr = '';
          let dayNumber = '';
          let isOtherMonth = false;
          let isToday = false;
          
          if (cellIndex < startDay) {
            // Previous month
            dayNumber = prevMonthLastDay - startDay + cellIndex + 1;
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevYear = month === 0 ? year - 1 : year;
            dateStr = prevYear + '-' + String(prevMonth + 1).padStart(2, '0') + '-' + String(dayNumber).padStart(2, '0');
            isOtherMonth = true;
          } else if (dayCount <= daysInMonth) {
            // Current month
            dayNumber = dayCount;
            dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(dayNumber).padStart(2, '0');
            isToday = dateStr === todayStr;
            dayCount++;
          } else {
            // Next month
            dayNumber = nextMonthDay;
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            dateStr = nextYear + '-' + String(nextMonth + 1).padStart(2, '0') + '-' + String(dayNumber).padStart(2, '0');
            isOtherMonth = true;
            nextMonthDay++;
          }
          
          // Get posts for this date
          const dayPosts = calendarPosts.filter(p => p.scheduledDate === dateStr);
          
          html += '<div class="calendar-day' + (isOtherMonth ? ' other-month' : '') + (isToday ? ' today' : '') + '" ' +
                  'data-date="' + dateStr + '" ' +
                  'ondragover="handleCalendarDragOver(event)" ' +
                  'ondragleave="handleCalendarDragLeave(event)" ' +
                  'ondrop="handleCalendarDrop(event)" ' +
                  'onclick="openDayDetail(\\'' + dateStr + '\\')">' +
                  '<div class="calendar-day-number">' + dayNumber + '</div>' +
                  '<div class="calendar-day-posts">' + renderDayPosts(dayPosts) + '</div>' +
                  '</div>';
        }
        
        // Stop if we've gone past the current month
        if (dayCount > daysInMonth && row >= 4) break;
      }
      
      document.getElementById('calendarGrid').innerHTML = html;
    }
    
    function renderDayPosts(posts) {
      if (posts.length === 0) return '';
      
      const maxShow = 3;
      let html = posts.slice(0, maxShow).map(p => 
        '<img src="' + p.thumbnail + '" class="calendar-post-thumb" title="' + escapeHtml(p.title) + '" onclick="event.stopPropagation(); selectRecord(\\'' + p.id + '\\', event)">'
      ).join('');
      
      if (posts.length > maxShow) {
        html += '<div class="calendar-post-more">+' + (posts.length - maxShow) + '</div>';
      }
      
      return html;
    }
    
    function prevMonth() {
      calendarDate.setMonth(calendarDate.getMonth() - 1);
      renderCalendar();
    }
    
    function nextMonth() {
      calendarDate.setMonth(calendarDate.getMonth() + 1);
      renderCalendar();
    }
    
    function goToToday() {
      calendarDate = new Date();
      renderCalendar();
    }
    
    // Load posts for calendar
    async function loadCalendarPosts() {
      if (!currentBase || !currentTable) return;
      
      try {
        // Fetch all records to find scheduled and unscheduled posts
        const res = await fetch('/api/records?baseId=' + currentBase.id + '&tableId=' + currentTable.id + '&pageSize=100', {
          headers: { 'X-Airtable-Token': AIRTABLE_TOKEN }
        });
        const data = await res.json();
        
        if (data.error) return;
        
        const records = data.records || [];
        
        // Find date field and image field
        const dateField = tableFields.find(f => f.type === 'date')?.name || 'Start date';
        const imageField = tableFields.find(f => IMAGE_FIELD_TYPES.includes(f.type))?.name;
        const titleFieldPriority = ['sourceHeadline', 'Title', 'Name', 'Headline'];
        let titleField = titleFieldPriority.find(f => tableFields.find(tf => tf.name === f)) || tableFields[0]?.name;
        
        calendarPosts = [];
        unscheduledPosts = [];
        
        records.forEach(r => {
          const scheduledDate = r.fields[dateField];
          const status = (r.fields.Status || '').toLowerCase();
          const title = r.fields[titleField] || 'Untitled';
          
          // Get thumbnail
          let thumbnail = '';
          if (imageField && r.fields[imageField] && Array.isArray(r.fields[imageField]) && r.fields[imageField].length > 0) {
            const img = r.fields[imageField][0];
            thumbnail = img.thumbnails?.large?.url || img.thumbnails?.small?.url || img.url || '';
          }
          
          const postObj = {
            id: r.id,
            title: typeof title === 'string' ? title : JSON.stringify(title),
            thumbnail: thumbnail,
            scheduledDate: scheduledDate || null,
            status: status
          };
          
          if (scheduledDate) {
            calendarPosts.push(postObj);
          } else if (status === 'approved' || status === 'ready' || thumbnail) {
            // Posts that are ready but not scheduled
            unscheduledPosts.push(postObj);
          }
        });
        
        renderCalendar();
        renderUnscheduledQueue();
        
      } catch (err) {
        console.error('Error loading calendar posts:', err);
      }
    }
    
    function renderUnscheduledQueue() {
      const queue = document.getElementById('readyToScheduleQueue');
      const count = document.getElementById('readyToScheduleCount');
      
      count.textContent = unscheduledPosts.length;
      
      if (unscheduledPosts.length === 0) {
        queue.innerHTML = '<p class="text-gray-500 text-sm p-4 text-center w-full">No posts ready to schedule</p>';
        return;
      }
      
      queue.innerHTML = unscheduledPosts.map(p => 
        '<div class="schedule-queue-item" draggable="true" ' +
        'ondragstart="handleQueueDragStart(event, \\'' + p.id + '\\')" ' +
        'ondragend="handleQueueDragEnd(event)" ' +
        'onclick="selectRecord(\\'' + p.id + '\\', event)">' +
        (p.thumbnail ? '<img src="' + p.thumbnail + '" alt="">' : '<div class="w-full h-[60px] bg-white/5 rounded flex items-center justify-center"><i class="fas fa-image text-gray-500"></i></div>') +
        '<div class="schedule-queue-item-title">' + escapeHtml(p.title) + '</div>' +
        '</div>'
      ).join('');
    }
    
    // Drag and drop handlers
    function handleQueueDragStart(event, postId) {
      draggedPost = unscheduledPosts.find(p => p.id === postId) || calendarPosts.find(p => p.id === postId);
      event.currentTarget.classList.add('dragging');
      event.dataTransfer.setData('text/plain', postId);
    }
    
    function handleQueueDragEnd(event) {
      event.currentTarget.classList.remove('dragging');
      draggedPost = null;
    }
    
    function handleCalendarDragOver(event) {
      event.preventDefault();
      event.currentTarget.classList.add('drag-over');
    }
    
    function handleCalendarDragLeave(event) {
      event.currentTarget.classList.remove('drag-over');
    }
    
    async function handleCalendarDrop(event) {
      event.preventDefault();
      event.currentTarget.classList.remove('drag-over');
      
      const date = event.currentTarget.dataset.date;
      const postId = event.dataTransfer.getData('text/plain');
      
      if (!postId || !date) return;
      
      // Open schedule modal to confirm time
      openScheduleModal(postId, date);
    }
    
    function openDayDetail(dateStr) {
      const dayPosts = calendarPosts.filter(p => p.scheduledDate === dateStr);
      
      if (dayPosts.length === 0) {
        // No posts - could open modal to schedule something
        return;
      }
      
      // If only one post, select it
      if (dayPosts.length === 1) {
        selectRecord(dayPosts[0].id, null);
        return;
      }
      
      // Multiple posts - show in modal
      const modal = document.getElementById('scheduleModal');
      const content = document.getElementById('scheduleModalContent');
      
      const dateObj = new Date(dateStr + 'T12:00:00');
      const dateFormatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      
      content.innerHTML = 
        '<p class="text-sm text-gray-400 mb-4">' + dateFormatted + '</p>' +
        '<div class="space-y-3">' +
        dayPosts.map(p => 
          '<div class="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors" onclick="selectRecord(\\'' + p.id + '\\', null); closeScheduleModal();">' +
          (p.thumbnail ? '<img src="' + p.thumbnail + '" class="w-16 h-16 object-cover rounded">' : '<div class="w-16 h-16 bg-white/10 rounded flex items-center justify-center"><i class="fas fa-image text-gray-500"></i></div>') +
          '<div class="flex-1 min-w-0">' +
          '<p class="text-sm font-medium truncate">' + escapeHtml(p.title) + '</p>' +
          '<p class="text-xs text-gray-500">' + (p.status || 'No status') + '</p>' +
          '</div>' +
          '</div>'
        ).join('') +
        '</div>';
      
      modal.classList.remove('hidden');
    }
    
    function openScheduleModal(postId, date) {
      const post = unscheduledPosts.find(p => p.id === postId) || calendarPosts.find(p => p.id === postId);
      if (!post) return;
      
      const modal = document.getElementById('scheduleModal');
      const content = document.getElementById('scheduleModalContent');
      
      const dateObj = new Date(date + 'T12:00:00');
      const dateFormatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      
      content.innerHTML = 
        '<div class="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/5">' +
        (post.thumbnail ? '<img src="' + post.thumbnail + '" class="w-20 h-20 object-cover rounded">' : '<div class="w-20 h-20 bg-white/10 rounded flex items-center justify-center"><i class="fas fa-image text-gray-500 text-2xl"></i></div>') +
        '<div class="flex-1 min-w-0">' +
        '<p class="text-sm font-medium line-clamp-2">' + escapeHtml(post.title) + '</p>' +
        '</div>' +
        '</div>' +
        '<div class="mb-4">' +
        '<label class="text-sm text-gray-400 mb-2 block">Schedule for:</label>' +
        '<div class="flex items-center gap-2">' +
        '<input type="date" id="scheduleDate" value="' + date + '" class="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">' +
        '<input type="time" id="scheduleTime" value="09:00" class="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">' +
        '</div>' +
        '</div>' +
        '<div class="flex gap-3">' +
        '<button onclick="confirmSchedule(\\'' + postId + '\\')" class="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold py-2 rounded-lg transition-all">' +
        '<i class="fas fa-calendar-check mr-2"></i>Schedule' +
        '</button>' +
        '<button onclick="closeScheduleModal()" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">' +
        'Cancel' +
        '</button>' +
        '</div>';
      
      modal.classList.remove('hidden');
    }
    
    function closeScheduleModal() {
      document.getElementById('scheduleModal').classList.add('hidden');
    }
    
    async function confirmSchedule(postId) {
      const date = document.getElementById('scheduleDate').value;
      const time = document.getElementById('scheduleTime').value;
      
      if (!date) {
        alert('Please select a date');
        return;
      }
      
      if (!currentBase || !currentTable) {
        alert('Please select a base and table first');
        return;
      }
      
      try {
        // Find the date field name
        const dateField = tableFields.find(f => f.type === 'date')?.name || 'Start date';
        
        // Update Airtable record
        const res = await fetch('/api/records/' + postId + '?baseId=' + currentBase.id + '&tableId=' + currentTable.id, {
          method: 'PATCH',
          headers: {
            'X-Airtable-Token': AIRTABLE_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ [dateField]: date })
        });
        
        if (res.ok) {
          closeScheduleModal();
          showSaveIndicator();
          // Reload calendar
          await loadCalendarPosts();
        } else {
          throw new Error('Failed to update record');
        }
      } catch (err) {
        console.error('Error scheduling post:', err);
        alert('Failed to schedule post: ' + err.message);
      }
    }

    // ========================================
    // START
    // ========================================
    init();
  <\/script>
</body>
</html>
  `));const Ze=new ht,ta=Object.assign({"/src/index.tsx":C});let mt=!1;for(const[,e]of Object.entries(ta))e&&(Ze.route("/",e),Ze.notFound(e.notFoundHandler),mt=!0);if(!mt)throw new Error("Can't import modules from ['/src/index.tsx','/app/server.ts']");export{Ze as default};
