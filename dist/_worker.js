var Lt=Object.defineProperty;var We=e=>{throw TypeError(e)};var Dt=(e,t,a)=>t in e?Lt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var h=(e,t,a)=>Dt(e,typeof t!="symbol"?t+"":t,a),He=(e,t,a)=>t.has(e)||We("Cannot "+a);var l=(e,t,a)=>(He(e,t,"read from private field"),a?a.call(e):t.get(e)),m=(e,t,a)=>t.has(e)?We("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,a),f=(e,t,a,r)=>(He(e,t,"write to private field"),r?r.call(e,a):t.set(e,a),a),v=(e,t,a)=>(He(e,t,"access private method"),a);var Ze=(e,t,a,r)=>({set _(o){f(e,t,o,a)},get _(){return l(e,t,r)}});var Ke=(e,t,a)=>(r,o)=>{let n=-1;return s(0);async function s(c){if(c<=n)throw new Error("next() called multiple times");n=c;let i,d=!1,u;if(e[c]?(u=e[c][0][0],r.req.routeIndex=c):u=c===e.length&&o||void 0,u)try{i=await u(r,()=>s(c+1))}catch(g){if(g instanceof Error&&t)r.error=g,i=await t(g,r),d=!0;else throw g}else r.finalized===!1&&a&&(i=await a(r));return i&&(r.finalized===!1||d)&&(r.res=i),r}},Bt=Symbol(),At=async(e,t=Object.create(null))=>{const{all:a=!1,dot:r=!1}=t,n=(e instanceof ut?e.raw.headers:e.headers).get("Content-Type");return n!=null&&n.startsWith("multipart/form-data")||n!=null&&n.startsWith("application/x-www-form-urlencoded")?Ot(e,{all:a,dot:r}):{}};async function Ot(e,t){const a=await e.formData();return a?Ht(a,t):{}}function Ht(e,t){const a=Object.create(null);return e.forEach((r,o)=>{t.all||o.endsWith("[]")?Nt(a,o,r):a[o]=r}),t.dot&&Object.entries(a).forEach(([r,o])=>{r.includes(".")&&(Ut(a,r,o),delete a[r])}),a}var Nt=(e,t,a)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(a):e[t]=[e[t],a]:t.endsWith("[]")?e[t]=[a]:e[t]=a},Ut=(e,t,a)=>{let r=e;const o=t.split(".");o.forEach((n,s)=>{s===o.length-1?r[n]=a:((!r[n]||typeof r[n]!="object"||Array.isArray(r[n])||r[n]instanceof File)&&(r[n]=Object.create(null)),r=r[n])})},st=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},Pt=e=>{const{groups:t,path:a}=jt(e),r=st(a);return zt(r,t)},jt=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(a,r)=>{const o=`@${r}`;return t.push([o,a]),o}),{groups:t,path:e}},zt=(e,t)=>{for(let a=t.length-1;a>=0;a--){const[r]=t[a];for(let o=e.length-1;o>=0;o--)if(e[o].includes(r)){e[o]=e[o].replace(r,t[a][1]);break}}return e},Se={},Mt=(e,t)=>{if(e==="*")return"*";const a=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(a){const r=`${e}#${t}`;return Se[r]||(a[2]?Se[r]=t&&t[0]!==":"&&t[0]!=="*"?[r,a[1],new RegExp(`^${a[2]}(?=/${t})`)]:[e,a[1],new RegExp(`^${a[2]}$`)]:Se[r]=[e,a[1],!0]),Se[r]}return null},Me=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,a=>{try{return t(a)}catch{return a}})}},Ft=e=>Me(e,decodeURI),it=e=>{const t=e.url,a=t.indexOf("/",t.indexOf(":")+4);let r=a;for(;r<t.length;r++){const o=t.charCodeAt(r);if(o===37){const n=t.indexOf("?",r),s=t.slice(a,n===-1?void 0:n);return Ft(s.includes("%25")?s.replace(/%25/g,"%2525"):s)}else if(o===63)break}return t.slice(a,r)},$t=e=>{const t=it(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},re=(e,t,...a)=>(a.length&&(t=re(t,...a)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),lt=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),a=[];let r="";return t.forEach(o=>{if(o!==""&&!/\:/.test(o))r+="/"+o;else if(/\:/.test(o))if(/\?/.test(o)){a.length===0&&r===""?a.push("/"):a.push(r);const n=o.replace("?","");r+="/"+n,a.push(r)}else r+="/"+o}),a.filter((o,n,s)=>s.indexOf(o)===n)},Ne=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?Me(e,dt):e):e,ct=(e,t,a)=>{let r;if(!a&&t&&!/[%+]/.test(t)){let s=e.indexOf("?",8);if(s===-1)return;for(e.startsWith(t,s+1)||(s=e.indexOf(`&${t}`,s+1));s!==-1;){const c=e.charCodeAt(s+t.length+1);if(c===61){const i=s+t.length+2,d=e.indexOf("&",i);return Ne(e.slice(i,d===-1?void 0:d))}else if(c==38||isNaN(c))return"";s=e.indexOf(`&${t}`,s+1)}if(r=/[%+]/.test(e),!r)return}const o={};r??(r=/[%+]/.test(e));let n=e.indexOf("?",8);for(;n!==-1;){const s=e.indexOf("&",n+1);let c=e.indexOf("=",n);c>s&&s!==-1&&(c=-1);let i=e.slice(n+1,c===-1?s===-1?void 0:s:c);if(r&&(i=Ne(i)),n=s,i==="")continue;let d;c===-1?d="":(d=e.slice(c+1,s===-1?void 0:s),r&&(d=Ne(d))),a?(o[i]&&Array.isArray(o[i])||(o[i]=[]),o[i].push(d)):o[i]??(o[i]=d)}return t?o[t]:o},Gt=ct,_t=(e,t)=>ct(e,t,!0),dt=decodeURIComponent,Ye=e=>Me(e,dt),se,R,z,gt,ft,ze,$,et,ut=(et=class{constructor(e,t="/",a=[[]]){m(this,z);h(this,"raw");m(this,se);m(this,R);h(this,"routeIndex",0);h(this,"path");h(this,"bodyCache",{});m(this,$,e=>{const{bodyCache:t,raw:a}=this,r=t[e];if(r)return r;const o=Object.keys(t)[0];return o?t[o].then(n=>(o==="json"&&(n=JSON.stringify(n)),new Response(n)[e]())):t[e]=a[e]()});this.raw=e,this.path=t,f(this,R,a),f(this,se,{})}param(e){return e?v(this,z,gt).call(this,e):v(this,z,ft).call(this)}query(e){return Gt(this.url,e)}queries(e){return _t(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((a,r)=>{t[r]=a}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await At(this,e))}json(){return l(this,$).call(this,"text").then(e=>JSON.parse(e))}text(){return l(this,$).call(this,"text")}arrayBuffer(){return l(this,$).call(this,"arrayBuffer")}blob(){return l(this,$).call(this,"blob")}formData(){return l(this,$).call(this,"formData")}addValidatedData(e,t){l(this,se)[e]=t}valid(e){return l(this,se)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Bt](){return l(this,R)}get matchedRoutes(){return l(this,R)[0].map(([[,e]])=>e)}get routePath(){return l(this,R)[0].map(([[,e]])=>e)[this.routeIndex].path}},se=new WeakMap,R=new WeakMap,z=new WeakSet,gt=function(e){const t=l(this,R)[0][this.routeIndex][1][e],a=v(this,z,ze).call(this,t);return a&&/\%/.test(a)?Ye(a):a},ft=function(){const e={},t=Object.keys(l(this,R)[0][this.routeIndex][1]);for(const a of t){const r=v(this,z,ze).call(this,l(this,R)[0][this.routeIndex][1][a]);r!==void 0&&(e[a]=/\%/.test(r)?Ye(r):r)}return e},ze=function(e){return l(this,R)[1]?l(this,R)[1][e]:e},$=new WeakMap,et),qt={Stringify:1},ht=async(e,t,a,r,o)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const n=e.callbacks;return n!=null&&n.length?(o?o[0]+=e:o=[e],Promise.all(n.map(c=>c({phase:t,buffer:o,context:r}))).then(c=>Promise.all(c.filter(Boolean).map(i=>ht(i,t,!1,r,o))).then(()=>o[0]))):Promise.resolve(e)},Wt="text/plain; charset=UTF-8",Ue=(e,t)=>({"Content-Type":e,...t}),be,xe,N,ie,U,E,ve,le,ce,V,ye,we,G,oe,tt,Zt=(tt=class{constructor(e,t){m(this,G);m(this,be);m(this,xe);h(this,"env",{});m(this,N);h(this,"finalized",!1);h(this,"error");m(this,ie);m(this,U);m(this,E);m(this,ve);m(this,le);m(this,ce);m(this,V);m(this,ye);m(this,we);h(this,"render",(...e)=>(l(this,le)??f(this,le,t=>this.html(t)),l(this,le).call(this,...e)));h(this,"setLayout",e=>f(this,ve,e));h(this,"getLayout",()=>l(this,ve));h(this,"setRenderer",e=>{f(this,le,e)});h(this,"header",(e,t,a)=>{this.finalized&&f(this,E,new Response(l(this,E).body,l(this,E)));const r=l(this,E)?l(this,E).headers:l(this,V)??f(this,V,new Headers);t===void 0?r.delete(e):a!=null&&a.append?r.append(e,t):r.set(e,t)});h(this,"status",e=>{f(this,ie,e)});h(this,"set",(e,t)=>{l(this,N)??f(this,N,new Map),l(this,N).set(e,t)});h(this,"get",e=>l(this,N)?l(this,N).get(e):void 0);h(this,"newResponse",(...e)=>v(this,G,oe).call(this,...e));h(this,"body",(e,t,a)=>v(this,G,oe).call(this,e,t,a));h(this,"text",(e,t,a)=>!l(this,V)&&!l(this,ie)&&!t&&!a&&!this.finalized?new Response(e):v(this,G,oe).call(this,e,t,Ue(Wt,a)));h(this,"json",(e,t,a)=>v(this,G,oe).call(this,JSON.stringify(e),t,Ue("application/json",a)));h(this,"html",(e,t,a)=>{const r=o=>v(this,G,oe).call(this,o,t,Ue("text/html; charset=UTF-8",a));return typeof e=="object"?ht(e,qt.Stringify,!1,{}).then(r):r(e)});h(this,"redirect",(e,t)=>{const a=String(e);return this.header("Location",/[^\x00-\xFF]/.test(a)?encodeURI(a):a),this.newResponse(null,t??302)});h(this,"notFound",()=>(l(this,ce)??f(this,ce,()=>new Response),l(this,ce).call(this,this)));f(this,be,e),t&&(f(this,U,t.executionCtx),this.env=t.env,f(this,ce,t.notFoundHandler),f(this,we,t.path),f(this,ye,t.matchResult))}get req(){return l(this,xe)??f(this,xe,new ut(l(this,be),l(this,we),l(this,ye))),l(this,xe)}get event(){if(l(this,U)&&"respondWith"in l(this,U))return l(this,U);throw Error("This context has no FetchEvent")}get executionCtx(){if(l(this,U))return l(this,U);throw Error("This context has no ExecutionContext")}get res(){return l(this,E)||f(this,E,new Response(null,{headers:l(this,V)??f(this,V,new Headers)}))}set res(e){if(l(this,E)&&e){e=new Response(e.body,e);for(const[t,a]of l(this,E).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const r=l(this,E).headers.getSetCookie();e.headers.delete("set-cookie");for(const o of r)e.headers.append("set-cookie",o)}else e.headers.set(t,a)}f(this,E,e),this.finalized=!0}get var(){return l(this,N)?Object.fromEntries(l(this,N)):{}}},be=new WeakMap,xe=new WeakMap,N=new WeakMap,ie=new WeakMap,U=new WeakMap,E=new WeakMap,ve=new WeakMap,le=new WeakMap,ce=new WeakMap,V=new WeakMap,ye=new WeakMap,we=new WeakMap,G=new WeakSet,oe=function(e,t,a){const r=l(this,E)?new Headers(l(this,E).headers):l(this,V)??new Headers;if(typeof t=="object"&&"headers"in t){const n=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[s,c]of n)s.toLowerCase()==="set-cookie"?r.append(s,c):r.set(s,c)}if(a)for(const[n,s]of Object.entries(a))if(typeof s=="string")r.set(n,s);else{r.delete(n);for(const c of s)r.append(n,c)}const o=typeof t=="number"?t:(t==null?void 0:t.status)??l(this,ie);return new Response(e,{status:o,headers:r})},tt),w="ALL",Kt="all",Yt=["get","post","put","delete","options","patch"],pt="Can not add a route since the matcher is already built.",mt=class extends Error{},Vt="__COMPOSED_HANDLER",Jt=e=>e.text("404 Not Found",404),Ve=(e,t)=>{if("getResponse"in e){const a=e.getResponse();return t.newResponse(a.body,a)}return console.error(e),t.text("Internal Server Error",500)},D,I,bt,B,K,ke,Ee,de,Xt=(de=class{constructor(t={}){m(this,I);h(this,"get");h(this,"post");h(this,"put");h(this,"delete");h(this,"options");h(this,"patch");h(this,"all");h(this,"on");h(this,"use");h(this,"router");h(this,"getPath");h(this,"_basePath","/");m(this,D,"/");h(this,"routes",[]);m(this,B,Jt);h(this,"errorHandler",Ve);h(this,"onError",t=>(this.errorHandler=t,this));h(this,"notFound",t=>(f(this,B,t),this));h(this,"fetch",(t,...a)=>v(this,I,Ee).call(this,t,a[1],a[0],t.method));h(this,"request",(t,a,r,o)=>t instanceof Request?this.fetch(a?new Request(t,a):t,r,o):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${re("/",t)}`,a),r,o)));h(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(v(this,I,Ee).call(this,t.request,t,void 0,t.request.method))})});[...Yt,Kt].forEach(n=>{this[n]=(s,...c)=>(typeof s=="string"?f(this,D,s):v(this,I,K).call(this,n,l(this,D),s),c.forEach(i=>{v(this,I,K).call(this,n,l(this,D),i)}),this)}),this.on=(n,s,...c)=>{for(const i of[s].flat()){f(this,D,i);for(const d of[n].flat())c.map(u=>{v(this,I,K).call(this,d.toUpperCase(),l(this,D),u)})}return this},this.use=(n,...s)=>(typeof n=="string"?f(this,D,n):(f(this,D,"*"),s.unshift(n)),s.forEach(c=>{v(this,I,K).call(this,w,l(this,D),c)}),this);const{strict:r,...o}=t;Object.assign(this,o),this.getPath=r??!0?t.getPath??it:$t}route(t,a){const r=this.basePath(t);return a.routes.map(o=>{var s;let n;a.errorHandler===Ve?n=o.handler:(n=async(c,i)=>(await Ke([],a.errorHandler)(c,()=>o.handler(c,i))).res,n[Vt]=o.handler),v(s=r,I,K).call(s,o.method,o.path,n)}),this}basePath(t){const a=v(this,I,bt).call(this);return a._basePath=re(this._basePath,t),a}mount(t,a,r){let o,n;r&&(typeof r=="function"?n=r:(n=r.optionHandler,r.replaceRequest===!1?o=i=>i:o=r.replaceRequest));const s=n?i=>{const d=n(i);return Array.isArray(d)?d:[d]}:i=>{let d;try{d=i.executionCtx}catch{}return[i.env,d]};o||(o=(()=>{const i=re(this._basePath,t),d=i==="/"?0:i.length;return u=>{const g=new URL(u.url);return g.pathname=g.pathname.slice(d)||"/",new Request(g,u)}})());const c=async(i,d)=>{const u=await a(o(i.req.raw),...s(i));if(u)return u;await d()};return v(this,I,K).call(this,w,re(t,"*"),c),this}},D=new WeakMap,I=new WeakSet,bt=function(){const t=new de({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,f(t,B,l(this,B)),t.routes=this.routes,t},B=new WeakMap,K=function(t,a,r){t=t.toUpperCase(),a=re(this._basePath,a);const o={basePath:this._basePath,path:a,method:t,handler:r};this.router.add(t,a,[r,o]),this.routes.push(o)},ke=function(t,a){if(t instanceof Error)return this.errorHandler(t,a);throw t},Ee=function(t,a,r,o){if(o==="HEAD")return(async()=>new Response(null,await v(this,I,Ee).call(this,t,a,r,"GET")))();const n=this.getPath(t,{env:r}),s=this.router.match(o,n),c=new Zt(t,{path:n,matchResult:s,env:r,executionCtx:a,notFoundHandler:l(this,B)});if(s[0].length===1){let d;try{d=s[0][0][0][0](c,async()=>{c.res=await l(this,B).call(this,c)})}catch(u){return v(this,I,ke).call(this,u,c)}return d instanceof Promise?d.then(u=>u||(c.finalized?c.res:l(this,B).call(this,c))).catch(u=>v(this,I,ke).call(this,u,c)):d??l(this,B).call(this,c)}const i=Ke(s[0],this.errorHandler,l(this,B));return(async()=>{try{const d=await i(c);if(!d.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return d.res}catch(d){return v(this,I,ke).call(this,d,c)}})()},de),xt=[];function Qt(e,t){const a=this.buildAllMatchers(),r=(o,n)=>{const s=a[o]||a[w],c=s[2][n];if(c)return c;const i=n.match(s[0]);if(!i)return[[],xt];const d=i.indexOf("",1);return[s[1][d],i]};return this.match=r,r(e,t)}var Le="[^/]+",pe=".*",me="(?:|/.*)",ne=Symbol(),ea=new Set(".\\+*[^]$()");function ta(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===pe||e===me?1:t===pe||t===me?-1:e===Le?1:t===Le?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var J,X,A,te,aa=(te=class{constructor(){m(this,J);m(this,X);m(this,A,Object.create(null))}insert(t,a,r,o,n){if(t.length===0){if(l(this,J)!==void 0)throw ne;if(n)return;f(this,J,a);return}const[s,...c]=t,i=s==="*"?c.length===0?["","",pe]:["","",Le]:s==="/*"?["","",me]:s.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let d;if(i){const u=i[1];let g=i[2]||Le;if(u&&i[2]&&(g===".*"||(g=g.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(g))))throw ne;if(d=l(this,A)[g],!d){if(Object.keys(l(this,A)).some(p=>p!==pe&&p!==me))throw ne;if(n)return;d=l(this,A)[g]=new te,u!==""&&f(d,X,o.varIndex++)}!n&&u!==""&&r.push([u,l(d,X)])}else if(d=l(this,A)[s],!d){if(Object.keys(l(this,A)).some(u=>u.length>1&&u!==pe&&u!==me))throw ne;if(n)return;d=l(this,A)[s]=new te}d.insert(c,a,r,o,n)}buildRegExpStr(){const a=Object.keys(l(this,A)).sort(ta).map(r=>{const o=l(this,A)[r];return(typeof l(o,X)=="number"?`(${r})@${l(o,X)}`:ea.has(r)?`\\${r}`:r)+o.buildRegExpStr()});return typeof l(this,J)=="number"&&a.unshift(`#${l(this,J)}`),a.length===0?"":a.length===1?a[0]:"(?:"+a.join("|")+")"}},J=new WeakMap,X=new WeakMap,A=new WeakMap,te),Be,Ie,at,ra=(at=class{constructor(){m(this,Be,{varIndex:0});m(this,Ie,new aa)}insert(e,t,a){const r=[],o=[];for(let s=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,i=>{const d=`@\\${s}`;return o[s]=[d,i],s++,c=!0,d}),!c)break}const n=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let s=o.length-1;s>=0;s--){const[c]=o[s];for(let i=n.length-1;i>=0;i--)if(n[i].indexOf(c)!==-1){n[i]=n[i].replace(c,o[s][1]);break}}return l(this,Ie).insert(n,t,r,l(this,Be),a),r}buildRegExp(){let e=l(this,Ie).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const a=[],r=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(o,n,s)=>n!==void 0?(a[++t]=Number(n),"$()"):(s!==void 0&&(r[Number(s)]=++t),"")),[new RegExp(`^${e}`),a,r]}},Be=new WeakMap,Ie=new WeakMap,at),oa=[/^$/,[],Object.create(null)],Re=Object.create(null);function vt(e){return Re[e]??(Re[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,a)=>a?`\\${a}`:"(?:|/.*)")}$`))}function na(){Re=Object.create(null)}function sa(e){var d;const t=new ra,a=[];if(e.length===0)return oa;const r=e.map(u=>[!/\*|\/:/.test(u[0]),...u]).sort(([u,g],[p,b])=>u?1:p?-1:g.length-b.length),o=Object.create(null);for(let u=0,g=-1,p=r.length;u<p;u++){const[b,S,L]=r[u];b?o[S]=[L.map(([y])=>[y,Object.create(null)]),xt]:g++;let x;try{x=t.insert(S,g,b)}catch(y){throw y===ne?new mt(S):y}b||(a[g]=L.map(([y,M])=>{const Te=Object.create(null);for(M-=1;M>=0;M--){const[Ce,O]=x[M];Te[Ce]=O}return[y,Te]}))}const[n,s,c]=t.buildRegExp();for(let u=0,g=a.length;u<g;u++)for(let p=0,b=a[u].length;p<b;p++){const S=(d=a[u][p])==null?void 0:d[1];if(!S)continue;const L=Object.keys(S);for(let x=0,y=L.length;x<y;x++)S[L[x]]=c[S[L[x]]]}const i=[];for(const u in s)i[u]=a[s[u]];return[n,i,o]}function ae(e,t){if(e){for(const a of Object.keys(e).sort((r,o)=>o.length-r.length))if(vt(a).test(t))return[...e[a]]}}var _,q,Ae,yt,rt,ia=(rt=class{constructor(){m(this,Ae);h(this,"name","RegExpRouter");m(this,_);m(this,q);h(this,"match",Qt);f(this,_,{[w]:Object.create(null)}),f(this,q,{[w]:Object.create(null)})}add(e,t,a){var c;const r=l(this,_),o=l(this,q);if(!r||!o)throw new Error(pt);r[e]||[r,o].forEach(i=>{i[e]=Object.create(null),Object.keys(i[w]).forEach(d=>{i[e][d]=[...i[w][d]]})}),t==="/*"&&(t="*");const n=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const i=vt(t);e===w?Object.keys(r).forEach(d=>{var u;(u=r[d])[t]||(u[t]=ae(r[d],t)||ae(r[w],t)||[])}):(c=r[e])[t]||(c[t]=ae(r[e],t)||ae(r[w],t)||[]),Object.keys(r).forEach(d=>{(e===w||e===d)&&Object.keys(r[d]).forEach(u=>{i.test(u)&&r[d][u].push([a,n])})}),Object.keys(o).forEach(d=>{(e===w||e===d)&&Object.keys(o[d]).forEach(u=>i.test(u)&&o[d][u].push([a,n]))});return}const s=lt(t)||[t];for(let i=0,d=s.length;i<d;i++){const u=s[i];Object.keys(o).forEach(g=>{var p;(e===w||e===g)&&((p=o[g])[u]||(p[u]=[...ae(r[g],u)||ae(r[w],u)||[]]),o[g][u].push([a,n-d+i+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(l(this,q)).concat(Object.keys(l(this,_))).forEach(t=>{e[t]||(e[t]=v(this,Ae,yt).call(this,t))}),f(this,_,f(this,q,void 0)),na(),e}},_=new WeakMap,q=new WeakMap,Ae=new WeakSet,yt=function(e){const t=[];let a=e===w;return[l(this,_),l(this,q)].forEach(r=>{const o=r[e]?Object.keys(r[e]).map(n=>[n,r[e][n]]):[];o.length!==0?(a||(a=!0),t.push(...o)):e!==w&&t.push(...Object.keys(r[w]).map(n=>[n,r[w][n]]))}),a?sa(t):null},rt),W,P,ot,la=(ot=class{constructor(e){h(this,"name","SmartRouter");m(this,W,[]);m(this,P,[]);f(this,W,e.routers)}add(e,t,a){if(!l(this,P))throw new Error(pt);l(this,P).push([e,t,a])}match(e,t){if(!l(this,P))throw new Error("Fatal error");const a=l(this,W),r=l(this,P),o=a.length;let n=0,s;for(;n<o;n++){const c=a[n];try{for(let i=0,d=r.length;i<d;i++)c.add(...r[i]);s=c.match(e,t)}catch(i){if(i instanceof mt)continue;throw i}this.match=c.match.bind(c),f(this,W,[c]),f(this,P,void 0);break}if(n===o)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,s}get activeRouter(){if(l(this,P)||l(this,W).length!==1)throw new Error("No active router has been determined yet.");return l(this,W)[0]}},W=new WeakMap,P=new WeakMap,ot),he=Object.create(null),Z,k,Q,ue,T,j,Y,ge,ca=(ge=class{constructor(t,a,r){m(this,j);m(this,Z);m(this,k);m(this,Q);m(this,ue,0);m(this,T,he);if(f(this,k,r||Object.create(null)),f(this,Z,[]),t&&a){const o=Object.create(null);o[t]={handler:a,possibleKeys:[],score:0},f(this,Z,[o])}f(this,Q,[])}insert(t,a,r){f(this,ue,++Ze(this,ue)._);let o=this;const n=Pt(a),s=[];for(let c=0,i=n.length;c<i;c++){const d=n[c],u=n[c+1],g=Mt(d,u),p=Array.isArray(g)?g[0]:d;if(p in l(o,k)){o=l(o,k)[p],g&&s.push(g[1]);continue}l(o,k)[p]=new ge,g&&(l(o,Q).push(g),s.push(g[1])),o=l(o,k)[p]}return l(o,Z).push({[t]:{handler:r,possibleKeys:s.filter((c,i,d)=>d.indexOf(c)===i),score:l(this,ue)}}),o}search(t,a){var i;const r=[];f(this,T,he);let n=[this];const s=st(a),c=[];for(let d=0,u=s.length;d<u;d++){const g=s[d],p=d===u-1,b=[];for(let S=0,L=n.length;S<L;S++){const x=n[S],y=l(x,k)[g];y&&(f(y,T,l(x,T)),p?(l(y,k)["*"]&&r.push(...v(this,j,Y).call(this,l(y,k)["*"],t,l(x,T))),r.push(...v(this,j,Y).call(this,y,t,l(x,T)))):b.push(y));for(let M=0,Te=l(x,Q).length;M<Te;M++){const Ce=l(x,Q)[M],O=l(x,T)===he?{}:{...l(x,T)};if(Ce==="*"){const F=l(x,k)["*"];F&&(r.push(...v(this,j,Y).call(this,F,t,l(x,T))),f(F,T,O),b.push(F));continue}const[Et,qe,fe]=Ce;if(!g&&!(fe instanceof RegExp))continue;const H=l(x,k)[Et],Rt=s.slice(d).join("/");if(fe instanceof RegExp){const F=fe.exec(Rt);if(F){if(O[qe]=F[0],r.push(...v(this,j,Y).call(this,H,t,l(x,T),O)),Object.keys(l(H,k)).length){f(H,T,O);const Oe=((i=F[0].match(/\//))==null?void 0:i.length)??0;(c[Oe]||(c[Oe]=[])).push(H)}continue}}(fe===!0||fe.test(g))&&(O[qe]=g,p?(r.push(...v(this,j,Y).call(this,H,t,O,l(x,T))),l(H,k)["*"]&&r.push(...v(this,j,Y).call(this,l(H,k)["*"],t,O,l(x,T)))):(f(H,T,O),b.push(H)))}}n=b.concat(c.shift()??[])}return r.length>1&&r.sort((d,u)=>d.score-u.score),[r.map(({handler:d,params:u})=>[d,u])]}},Z=new WeakMap,k=new WeakMap,Q=new WeakMap,ue=new WeakMap,T=new WeakMap,j=new WeakSet,Y=function(t,a,r,o){const n=[];for(let s=0,c=l(t,Z).length;s<c;s++){const i=l(t,Z)[s],d=i[a]||i[w],u={};if(d!==void 0&&(d.params=Object.create(null),n.push(d),r!==he||o&&o!==he))for(let g=0,p=d.possibleKeys.length;g<p;g++){const b=d.possibleKeys[g],S=u[d.score];d.params[b]=o!=null&&o[b]&&!S?o[b]:r[b]??(o==null?void 0:o[b]),u[d.score]=!0}}return n},ge),ee,nt,da=(nt=class{constructor(){h(this,"name","TrieRouter");m(this,ee);f(this,ee,new ca)}add(e,t,a){const r=lt(t);if(r){for(let o=0,n=r.length;o<n;o++)l(this,ee).insert(e,r[o],a);return}l(this,ee).insert(e,t,a)}match(e,t){return l(this,ee).search(e,t)}},ee=new WeakMap,nt),wt=class extends Xt{constructor(e={}){super(e),this.router=e.router??new la({routers:[new ia,new da]})}},ua=e=>{const a={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},r=(n=>typeof n=="string"?n==="*"?()=>n:s=>n===s?s:null:typeof n=="function"?n:s=>n.includes(s)?s:null)(a.origin),o=(n=>typeof n=="function"?n:Array.isArray(n)?()=>n:()=>[])(a.allowMethods);return async function(s,c){var u;function i(g,p){s.res.headers.set(g,p)}const d=await r(s.req.header("origin")||"",s);if(d&&i("Access-Control-Allow-Origin",d),a.credentials&&i("Access-Control-Allow-Credentials","true"),(u=a.exposeHeaders)!=null&&u.length&&i("Access-Control-Expose-Headers",a.exposeHeaders.join(",")),s.req.method==="OPTIONS"){a.origin!=="*"&&i("Vary","Origin"),a.maxAge!=null&&i("Access-Control-Max-Age",a.maxAge.toString());const g=await o(s.req.header("origin")||"",s);g.length&&i("Access-Control-Allow-Methods",g.join(","));let p=a.allowHeaders;if(!(p!=null&&p.length)){const b=s.req.header("Access-Control-Request-Headers");b&&(p=b.split(/\s*,\s*/))}return p!=null&&p.length&&(i("Access-Control-Allow-Headers",p.join(",")),s.res.headers.append("Vary","Access-Control-Request-Headers")),s.res.headers.delete("Content-Length"),s.res.headers.delete("Content-Type"),new Response(null,{headers:s.res.headers,status:204,statusText:"No Content"})}await c(),a.origin!=="*"&&s.header("Vary","Origin",{append:!0})}};const C=new wt,ga=5*60*1e3,Fe=new Map;function It(e){const t=Fe.get(e);return t?t.data:null}function Tt(e,t,a){Fe.set(e,{data:t,timestamp:Date.now(),etag:a})}function Ct(e){const t=Fe.get(e);return t?Date.now()-t.timestamp<ga:!1}const Pe=3,Je=1e3;async function De(e,t,a=Pe){try{const r=await fetch(e,t);if(r.status===429&&a>0){const o=Je*(Pe-a+1);return console.log(`Rate limited (429). Retrying in ${o}ms... (${a} retries left)`),await new Promise(n=>setTimeout(n,o)),De(e,t,a-1)}return r}catch(r){if(a>0){const o=Je*(Pe-a+1);return console.log(`Fetch failed. Retrying in ${o}ms... (${a} retries left)`),await new Promise(n=>setTimeout(n,o)),De(e,t,a-1)}throw r}}C.use("/api/*",ua());const $e="cf2a50987a92a698e89d5efeb80cde82",je={face:"https://iili.io/fM9hV6B.png",outfit:"https://iili.io/fM99P3l.png",logo:"https://iili.io/fEiEfUB.png"};C.get("/api/bases",async e=>{const t=e.req.header("xc-token")||e.env.NOCODB_TOKEN;if(!t)return e.json({error:"Missing NocoDB token"},401);const a=`bases:${t.substring(0,10)}`,r=It(a),o=Ct(a);if(r&&o)return console.log("Returning cached bases data"),e.json(r);try{const s=await De("https://open-buckets-study.loca.lt/api/v2/meta/bases",{headers:{"xc-token":t,"bypass-tunnel-reminder":"true"}});if(!s.ok){const u=await s.text();if(console.error("NocoDB API error:",s.status,u),r)return console.log("Returning stale cached data due to API error"),e.json({...r,_cached:!0,_cacheStale:!0,_error:`NocoDB API error: ${s.status}. Showing cached data.`});let g=`NocoDB API error: ${s.status}`;return s.status===429?g="NocoDB rate limit exceeded. Please wait a moment and try again.":(s.status===401||s.status===403)&&(g="Invalid or expired NocoDB token. Please check your token and try again."),e.json({error:g,details:u},s.status)}const c=await s.json();let i=c.bases||c||[];Array.isArray(i)||(i=[]);const d={bases:i};return Tt(a,d),console.log(`Total bases fetched and cached: ${i.length}`),e.json(d)}catch(n){return console.error("Error fetching bases:",n),r?(console.log("Returning stale cached data due to error"),e.json({...r,_cached:!0,_cacheStale:!0,_error:`Network error: ${n.message}. Showing cached data.`})):e.json({error:n.message||"Failed to fetch bases"},500)}});C.get("/api/bases/:baseId/tables",async e=>{var s;const t=e.req.header("xc-token")||e.env.NOCODB_TOKEN;if(!t)return e.json({error:"Missing NocoDB token"},401);const a=e.req.param("baseId"),r=`tables:${a}:${t.substring(0,10)}`,o=It(r),n=Ct(r);if(o&&n)return console.log(`Returning cached tables for base ${a}`),e.json(o);console.log(`Fetching tables for base: ${a}, token present: ${t?"yes":"no"}, token prefix: ${t.substring(0,10)}...`);try{const c=await De(`https://open-buckets-study.loca.lt/api/v2/meta/bases/${a}/tables`,{headers:{"xc-token":t,"bypass-tunnel-reminder":"true"}});if(!c.ok){const d=await c.text();if(console.error("NocoDB tables API error:",c.status,d),o)return console.log("Returning stale cached tables due to API error"),e.json({...o,_cached:!0,_cacheStale:!0,_error:`NocoDB API error: ${c.status}. Showing cached data.`});let u=`NocoDB API error: ${c.status}`;return c.status===429?u="NocoDB rate limit exceeded. Please wait a moment and try again.":c.status===401||c.status===403?u="Invalid or expired NocoDB token. Please check your token and try again.":c.status===404&&(u="Base not found. Please check if you have access to this base."),e.json({error:u,details:d},c.status)}const i=await c.json();return Tt(r,i),console.log(`Fetched and cached ${((s=i.tables)==null?void 0:s.length)||0} tables for base ${a}`),e.json(i)}catch(c){return console.error("Error fetching tables:",c),o?(console.log("Returning stale cached tables due to error"),e.json({...o,_cached:!0,_cacheStale:!0,_error:`Network error: ${c.message}. Showing cached data.`})):e.json({error:c.message||"Failed to fetch tables"},500)}});C.get("/api/records",async e=>{var s,c;const t=e.req.header("xc-token")||e.env.NOCODB_TOKEN;if(!t)return e.json({error:"Missing NocoDB token"},401);const a=e.req.query("tableId");if(e.req.query("filter"),!a)return e.json({error:"Missing tableId"},400);let r=`https://open-buckets-study.loca.lt/api/v2/tables/${a}/records`;const n=await(await fetch(r,{headers:{"xc-token":t,"bypass-tunnel-reminder":"true"}})).json();return n.list&&Array.isArray(n.list)?e.json({records:n.list.map(i=>({id:i.Id||i.id,fields:i})),offset:(s=n.pageInfo)!=null&&s.isLastPage?null:((c=n.pageInfo)==null?void 0:c.page)+1}):e.json(n)});C.get("/api/records/:id",async e=>{const t=e.req.header("xc-token")||e.env.NOCODB_TOKEN;if(!t)return e.json({error:"Missing NocoDB token"},401);const a=e.req.query("tableId"),r=e.req.param("id");if(!a)return e.json({error:"Missing tableId"},400);const n=await(await fetch(`https://open-buckets-study.loca.lt/api/v2/tables/${a}/records/${r}`,{headers:{"xc-token":t,"bypass-tunnel-reminder":"true"}})).json();return n&&!n.error?e.json({id:n.Id||n.id,fields:n}):e.json(n)});C.patch("/api/records/:id",async e=>{const t=e.req.header("xc-token")||e.env.NOCODB_TOKEN;if(!t)return e.json({error:"Missing NocoDB token"},401);const a=e.req.query("tableId"),r=e.req.param("id"),o=await e.req.json();if(!a)return e.json({error:"Missing tableId"},400);const n={Id:r,...o},c=await(await fetch(`https://open-buckets-study.loca.lt/api/v2/tables/${a}/records`,{method:"PATCH",headers:{"xc-token":t,"Content-Type":"application/json","bypass-tunnel-reminder":"true"},body:JSON.stringify(n)})).json();return c&&!c.error?e.json({id:c.Id||r,fields:c}):e.json(c)});C.post("/api/generate-image",async e=>{const{prompt:t,imageUrls:a,aspectRatio:r}=await e.req.json(),o={model:"google/nano-banana",input:{prompt:t,image_urls:a||[je.face,je.outfit,je.logo],image_size:r||"16:9",output_format:"png"}};console.log("KieAI Nano Banana Request:",JSON.stringify(o,null,2));const n=await fetch("https://api.kie.ai/api/v1/jobs/createTask",{method:"POST",headers:{Authorization:`Bearer ${$e}`,"Content-Type":"application/json"},body:JSON.stringify(o)});return e.json(await n.json())});const Xe={"16:9":"https://iili.io/fk9ypqB.png","9:16":"https://iili.io/fk9yy0P.png","1:1":"https://iili.io/fkH99g1.png"};C.post("/api/generate-image-ideogram",async e=>{const{prompt:t,imageUrl:a,aspectRatio:r}=await e.req.json(),o=Xe[r]||Xe["16:9"],n={model:"ideogram/character-edit",input:{prompt:t,image_url:a,mask_url:o,rendering_speed:"BALANCED",style:"AUTO",expand_prompt:!1,num_images:"1"}};console.log("Ideogram character-edit Request (text overlay):",JSON.stringify(n,null,2));const s=await fetch("https://api.kie.ai/api/v1/jobs/createTask",{method:"POST",headers:{Authorization:`Bearer ${$e}`,"Content-Type":"application/json"},body:JSON.stringify(n)});return e.json(await s.json())});C.get("/api/task-status/:taskId",async e=>{const t=e.req.param("taskId"),a=await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${t}`,{headers:{Authorization:`Bearer ${$e}`}});return e.json(await a.json())});C.post("/api/upload-image",async e=>{const{base64Image:t}=await e.req.json(),a=new FormData;a.append("key","6d207e02198a847aa98d0a2a901485a5"),a.append("action","upload"),a.append("source",t),a.append("format","json");const r=await fetch("https://freeimage.host/api/1/upload",{method:"POST",body:a});return e.json(await r.json())});C.post("/api/proxy-image",async e=>{try{const{imageUrl:t}=await e.req.json();if(!t)return e.json({error:"Missing imageUrl"},400);const a=await fetch(t);if(!a.ok)return e.json({error:"Failed to fetch image: "+a.status},500);const r=await a.arrayBuffer(),o=new Uint8Array(r);let n="";for(let i=0;i<o.length;i++)n+=String.fromCharCode(o[i]);const s=btoa(n),c=a.headers.get("content-type")||"image/png";return e.json({success:!0,base64:s,contentType:c,dataUrl:"data:"+c+";base64,"+s})}catch(t){return e.json({error:"Proxy error: "+t.message},500)}});const Ge={crypto:{baseId:"p5v5ffrepsxc7g5",tableId:"m9m6gh688zrhkb4",fieldMap:{url:"sourceURL",title:"sourceHeadline",notes:"sourceSummary",platforms:"socialChannels",status:"Status",statusValue:"Needs Approval"}},ai:{baseId:"p5v5ffrepsxc7g5",tableId:"mi0xcrv7gp5inbh",fieldMap:{url:"sourceURL",title:"sourceHeadline",notes:"sourceSummary",platforms:"socialChannels",status:"Status",statusValue:"Needs Approval"}},general:{baseId:"p5v5ffrepsxc7g5",tableId:"m48lt8phy1o2y04",fieldMap:{url:"Video URL",title:"Video Title",notes:"Notes",platforms:"Platforms",status:"Status",statusValue:"Pending Review"}}},fa=["Twitter","LinkedIn","Blog","Instagram","Facebook","Avatar"],_e="PzPjLnn3qdo8jhG048mWgZUx30tpHJ_J4JCqvQ5z",ha={crypto:"https://fifthaveai.app.n8n.cloud/webhook/crypto-pickup",ai:"https://fifthaveai.app.n8n.cloud/webhook/ai-pickup"};async function St(e,t,a){const r=ha[e];if(r)try{await new Promise(n=>setTimeout(n,2e3)),console.log(`[Instant Pickup] Triggering ${e} webhook for record ${t}`);const o=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({recordId:t,sourceURL:a.sourceURL,sourceHeadline:a.sourceHeadline,sourceSummary:a.sourceSummary,topic:e,triggeredAt:new Date().toISOString()})});console.log(`[Instant Pickup] Webhook response: ${o.status}`)}catch(o){console.error("[Instant Pickup] Webhook error:",o.message)}}C.post("/api/save",async e=>{var t;try{const{url:a,title:r,notes:o,platforms:n,topic:s}=await e.req.json();if(!a)return e.json({success:!1,error:"URL is required"},400);const c=((t=e.env)==null?void 0:t.NOCODB_TOKEN)||_e,i=s||"general",d=Ge[i];if(!d)return e.json({success:!1,error:"Invalid topic. Use: crypto, ai, or general"},400);const u=d.fieldMap,g={};if(g[u.url]=a,g[u.title]=r||"",g[u.status]=u.statusValue,o&&(g[u.notes]=o),n&&n.length>0)if(i==="crypto"||i==="ai"){const x=n.filter(y=>fa.includes(y));x.length>0&&(g[u.platforms]=x)}else g[u.platforms]=n;i==="general"&&(g["Created Date"]=new Date().toISOString());const b=await(await fetch(`${NOCODB_BASE_URL}/api/v2/tables/${d.tableId}/records`,{method:"POST",headers:{"xc-token":c,"Content-Type":"application/json"},body:JSON.stringify(g)})).json();if(b.error){console.error("NocoDB error:",b.error);const x=typeof b.error=="string"?b.error:b.error.message||"NocoDB error";return e.json({success:!1,error:x},500)}const S={id:b.Id,fields:b};let L=!1;if((i==="crypto"||i==="ai")&&b.id){L=!0;const x=St(i,b.id,{sourceURL:a,sourceHeadline:r||"",sourceSummary:o||""});e.executionCtx&&typeof e.executionCtx.waitUntil=="function"?e.executionCtx.waitUntil(x):x.catch(y=>console.error("[Instant Pickup] Background error:",y))}return e.json({success:!0,record:S,topic:i,table:i==="general"?"Content Pipeline":i==="crypto"?"Social Posts":"Social Posts - AI",processing:L?"started":"not_applicable"})}catch(a){return console.error("Save error:",a),e.json({success:!1,error:a.message||"Server error"},500)}});C.get("/api/process-status/:recordId",async e=>{var t;try{const a=e.req.param("recordId"),r=e.req.query("topic")||"crypto",o=Ge[r];if(!o)return e.json({error:"Invalid topic"},400);const n=((t=e.env)==null?void 0:t.NOCODB_TOKEN)||_e,i=await(await fetch(`${NOCODB_BASE_URL}/api/v2/tables/${o.tableId}/records/${a}`,{headers:{"xc-token":n}})).json()||{},d=!!(i.sourceSummary&&i.sourceSummary.length>50),u=!!(i.imagePrompt&&i.imagePrompt.length>10),g=!!(i.twitterCopy&&i.twitterCopy.length>5);let p="processing";return d&&u&&g?p="complete":d&&(p="generating_content"),e.json({recordId:a,status:p,fields:{hasResearch:d,hasImagePrompt:u,hasSocialContent:g,rewrittenHeadline:i.rewrittenHeadline||null}})}catch(a){return e.json({error:a.message},500)}});C.post("/api/process",async e=>{var t;try{const{recordId:a,topic:r}=await e.req.json();if(!a||!r)return e.json({error:"recordId and topic are required"},400);if(r==="general")return e.json({error:"Processing only available for crypto/ai topics"},400);const o=Ge[r];if(!o)return e.json({error:"Invalid topic"},400);const n=((t=e.env)==null?void 0:t.NOCODB_TOKEN)||_e,i=await(await fetch(`${NOCODB_BASE_URL}/api/v2/tables/${o.tableId}/records/${a}`,{headers:{"xc-token":n}})).json()||{};return await St(r,a,{sourceURL:i.sourceURL||"",sourceHeadline:i.sourceHeadline||"",sourceSummary:i.sourceSummary||""}),e.json({success:!0,status:"processing_started",recordId:a})}catch(a){return e.json({error:a.message},500)}});C.get("/api/topics",e=>e.json({topics:[{id:"crypto",label:"🪙 Crypto News",description:"Save to 5th Ave Crypto pipeline"},{id:"ai",label:"🤖 AI News",description:"Save to 5th Ave AI pipeline"},{id:"general",label:"📋 General Pipeline",description:"Save to Content Pipeline"}]}));C.get("/",e=>{var t;return e.html(`
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
    
    /* Remove image button */
    .remove-image-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 28px;
      height: 28px;
      background: rgba(239, 68, 68, 0.9);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s, transform 0.2s, background 0.2s;
      z-index: 10;
    }
    .remove-image-btn:hover {
      background: rgba(220, 38, 38, 1);
      transform: scale(1.1);
    }
    .image-drop-zone.has-image:hover .remove-image-btn {
      opacity: 1;
    }
    
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
      <span id="topicIndicator" class="text-sm px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-medium">
        <i class="fab fa-bitcoin mr-1"></i>Crypto Mode
      </span>
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
          <i id="refLibraryToggle" class="fas fa-chevron-down text-gray-400 transition-transform" style="transform: rotate(180deg)"></i>
        </div>
      </div>
      <div id="referenceLibraryContent" class="mt-4">
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
          <span class="text-xs text-gray-400 ml-2">(drag files, URLs, or history images • click to view)</span>
        </h3>
        <div class="flex items-center gap-3">
          <!-- Resize dropdown -->
          <div class="relative">
            <button id="resizeDropdownBtn" onclick="toggleResizeDropdown()" 
                    class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
              <i class="fas fa-expand-arrows-alt"></i>
              Resize to All
              <i class="fas fa-chevron-down text-xs"></i>
            </button>
            <div id="resizeDropdown" class="hidden absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
              <div class="p-2">
                <p class="text-xs text-gray-400 px-3 py-2">Choose resize method:</p>
                <button onclick="resizeToAllSizes('ai')" class="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm">
                  <i class="fas fa-magic text-purple-400"></i>
                  <div>
                    <div class="font-medium">AI Regenerate</div>
                    <div class="text-xs text-gray-400">Best quality, uses Nano Banana (~$0.09/image)</div>
                  </div>
                </button>
                <button onclick="resizeToAllSizes('crop')" class="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm">
                  <i class="fas fa-crop-alt text-green-400"></i>
                  <div>
                    <div class="font-medium">Smart Crop</div>
                    <div class="text-xs text-gray-400">Fast, free, center-crops to fit ratio</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <button id="saveImagesToNocoDBBtn" onclick="saveImagesToNocoDB()" 
                  class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
            <i class="fas fa-cloud-upload-alt"></i>
            Save to NocoDB
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
            <button onclick="event.stopPropagation(); document.getElementById('fileInput16x9').click()" class="ml-auto text-xs text-gray-500 hover:text-amber-400" title="Upload from computer">
              <i class="fas fa-upload"></i>
            </button>
          </p>
          <input type="file" id="fileInput16x9" accept="image/*" class="hidden" onchange="handleContentFileUpload(event, '16:9')">
          <div id="image16x9" class="image-drop-zone content-image-clickable"
               style="min-height: 220px;"
               ondragover="handleImageDragOver(event)"
               ondragleave="handleImageDragLeave(event)"
               ondrop="handleContentImageDrop(event, '16:9')"
               onclick="openContentImage('16:9')">
            <span class="text-gray-500 text-sm">Drop image or click <i class="fas fa-upload"></i> to upload</span>
          </div>
        </div>
        <div>
          <p class="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-purple-500"></span>
            9:16 <span class="text-xs text-gray-500">(TikTok/Reels)</span>
            <button onclick="event.stopPropagation(); document.getElementById('fileInput9x16').click()" class="ml-auto text-xs text-gray-500 hover:text-purple-400" title="Upload from computer">
              <i class="fas fa-upload"></i>
            </button>
          </p>
          <input type="file" id="fileInput9x16" accept="image/*" class="hidden" onchange="handleContentFileUpload(event, '9:16')">
          <div id="image9x16" class="image-drop-zone content-image-clickable"
               style="min-height: 220px;"
               ondragover="handleImageDragOver(event)"
               ondragleave="handleImageDragLeave(event)"
               ondrop="handleContentImageDrop(event, '9:16')"
               onclick="openContentImage('9:16')">
            <span class="text-gray-500 text-sm">Drop image or click <i class="fas fa-upload"></i> to upload</span>
          </div>
        </div>
        <div>
          <p class="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500"></span>
            1:1 <span class="text-xs text-gray-500">(Instagram/FB)</span>
            <button onclick="event.stopPropagation(); document.getElementById('fileInput1x1').click()" class="ml-auto text-xs text-gray-500 hover:text-green-400" title="Upload from computer">
              <i class="fas fa-upload"></i>
            </button>
          </p>
          <input type="file" id="fileInput1x1" accept="image/*" class="hidden" onchange="handleContentFileUpload(event, '1:1')">
          <div id="image1x1" class="image-drop-zone content-image-clickable"
               style="min-height: 220px;"
               ondragover="handleImageDragOver(event)"
               ondragleave="handleImageDragLeave(event)"
               ondrop="handleContentImageDrop(event, '1:1')"
               onclick="openContentImage('1:1')">
            <span class="text-gray-500 text-sm">Drop image or click <i class="fas fa-upload"></i> to upload</span>
          </div>
        </div>
      </div>
      
      <!-- Resize status -->
      <div id="resizeStatus" class="hidden mt-4 p-3 rounded-lg bg-purple-900/30 border border-purple-500/30">
        <div class="flex items-center gap-2 text-sm text-purple-300">
          <i class="fas fa-spinner fa-spin"></i>
          <span id="resizeStatusText">Resizing images...</span>
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

    <!-- 6. NocoDB Records (Full Width) -->
    <div class="glass rounded-2xl p-4 mb-4">
      <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <i class="fas fa-database text-amber-500"></i>
        NocoDB Records
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
      
      <!-- Debug Panel (hidden by default, toggle with button) -->
      <div class="mb-4">
        <button onclick="toggleDebugPanel()" class="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
          <i class="fas fa-bug"></i> Toggle Debug Info
        </button>
        <div id="debugPanel" class="hidden mt-2 p-3 bg-gray-900 rounded-lg text-xs font-mono text-gray-400 overflow-auto max-h-48">
          <div id="debugContent">Debug info will appear here...</div>
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

        <!-- SOCIAL CONTENT SECTION - COLLAPSIBLE, EXPANDABLE -->
        <div id="socialContentSection" class="glass rounded-2xl hidden overflow-hidden">
          <!-- Collapsible Header -->
          <div class="p-4 cursor-pointer flex items-center justify-between border-b border-white/10" onclick="toggleSocialContent()">
            <div class="flex items-center gap-3">
              <i class="fas fa-share-alt text-amber-500"></i>
              <h3 class="font-semibold">Social Media Content</h3>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-500">Auto-saves on edit</span>
              <button onclick="event.stopPropagation(); expandSocialContent()" title="Expand to full screen" class="text-gray-400 hover:text-amber-500 transition-colors">
                <i class="fas fa-expand"></i>
              </button>
              <i id="socialContentToggle" class="fas fa-chevron-up text-gray-400 transition-transform"></i>
            </div>
          </div>
          
          <!-- Collapsible Content -->
          <div id="socialContentBody" class="p-6">
          
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
          </div><!-- End socialContentBody -->
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
    const NOCODB_TOKEN = '${((t=e.env)==null?void 0:t.NOCODB_TOKEN)||"PzPjLnn3qdo8jhG048mWgZUx30tpHJ_J4JCqvQ5z"}';
    
    const referenceCategories = [
      { id: 'face', name: 'Face', icon: 'fa-user-circle', default: 'https://iili.io/fM9hV6B.png', order: 1 },
      { id: 'outfit', name: 'Outfit', icon: 'fa-tshirt', default: '', order: 2 },
      { id: 'background', name: 'Background', icon: 'fa-image', default: '', order: 3 },
      { id: 'logo', name: 'Logo', icon: 'fa-crown', default: 'https://iili.io/fEiEfUB.png', order: 4 },
      { id: 'props', name: 'Props', icon: 'fa-cube', default: '', order: 5 },
      { id: 'custom', name: 'Custom', icon: 'fa-magic', default: '', order: 6 },
      { id: 'pose', name: 'Pose', icon: 'fa-walking', default: '', order: 7 },
      { id: 'mood', name: 'Mood', icon: 'fa-palette', default: '', order: 8 }
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

    // AI-specific category settings for image generation
    const CATEGORY_SETTINGS_AI = {
      'ai_models': {
        setting: 'in a sleek, futuristic tech lab with holographic AI model visualizations and neural network diagrams floating around her',
        mood: 'innovative and cutting-edge',
        outfit: 'modern tech-chic blazer with clean lines, paired with a minimalist smart watch and subtle LED-accent accessories',
        lighting: 'cool blue and purple ambient lighting with holographic reflections'
      },
      'ai_regulation': {
        setting: 'in a sophisticated government hearing room or policy think tank with AI ethics guidelines displayed on screens behind her',
        mood: 'authoritative and thoughtful',
        outfit: 'tailored power suit in deep charcoal with a statement brooch, projecting authority and intelligence',
        lighting: 'formal bright lighting with warm accents from wooden paneling'
      },
      'ai_workplace': {
        setting: 'in a modern open-plan office where humans and AI assistants collaborate, with productivity dashboards and AI tools visible on screens',
        mood: 'empowering and forward-thinking',
        outfit: 'smart business casual - elegant knit top with tailored pants, balancing approachability and professionalism',
        lighting: 'natural daylight from large windows mixed with modern office LED lighting'
      },
      'ai_research': {
        setting: 'in a cutting-edge research facility with whiteboards full of equations, brain-computer interface prototypes, and scientific visualization screens',
        mood: 'intellectually curious and pioneering',
        outfit: 'stylish lab coat over a designer turtleneck, with smart glasses perched elegantly',
        lighting: 'clean white lab lighting with occasional blue laser accents'
      },
      'ai_products': {
        setting: 'at a sleek product launch event or demo stage with the latest AI-powered devices and apps displayed around her',
        mood: 'excited and consumer-friendly',
        outfit: 'trendy tech founder look - elevated casual with statement sneakers and a designer crossbody',
        lighting: 'dramatic stage lighting with spotlights and warm product display glow'
      },
      'ai_ethics': {
        setting: 'in a contemplative setting balancing nature and technology - perhaps a glass-walled meditation room overlooking a city with subtle digital elements',
        mood: 'reflective and balanced',
        outfit: 'flowing elegant blouse with structured pants, balancing softness with strength',
        lighting: 'golden hour natural light mixed with soft digital screen ambiance'
      },
      'ai_robotics': {
        setting: 'in an advanced robotics lab with humanoid robots and robotic arms, standing confidently among the machines as a human guide',
        mood: 'bold and futuristic',
        outfit: 'sleek futuristic athleisure with metallic accents, projecting a sci-fi editorial vibe',
        lighting: 'industrial lighting with neon accents and metallic reflections from robot surfaces'
      },
      'default': {
        setting: 'in a professional studio setting with subtle AI and technology-themed background elements like circuit patterns and neural network visualizations',
        mood: 'confident and educational',
        outfit: 'stylish professional attire that commands attention with modern tech-inspired accessories',
        lighting: 'professional studio lighting with cool blue and purple accents'
      }
    };

    // Get category settings based on current topic
    function getCategorySettings(category) {
      if (currentTopic === 'ai') {
        return CATEGORY_SETTINGS_AI[category] || CATEGORY_SETTINGS_AI['default'];
      }
      return CATEGORY_SETTINGS[category] || CATEGORY_SETTINGS['default'];
    }

    // Generate image prompt based on headline and category
    function generateImagePrompt(headline, category) {
      const settings = getCategorySettings(category);
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
      
      // Check if logo reference is enabled for current ratio
      const logoRefs = references['logo'];
      const hasLogoRef = logoRefs && (logoRefs[ratio]?.url && logoRefs[ratio]?.enabled);
      
      // Include logo watermark instruction if logo reference is enabled
      const logoInstruction = hasLogoRef ? 
        '\\n\\nLOGO WATERMARK: Place the 5th Ave Crypto logo from the logo reference image in the TOP-RIGHT corner as a small, subtle watermark. The logo should be semi-transparent and unobtrusive, about 5-8% of the image width.' : 
        '';
      
      // Text will be added via canvas overlay - no text in base image
      const textInstructions = '\\n\\nIMPORTANT: No text anywhere in the image except the logo watermark if specified. No words, no letters, no signs, no screens with text, no headlines, no captions. Clean visual only - text overlay will be added programmatically later.';
      
      const topicLabel = currentTopic === 'ai' ? 'AI and technology' : 'crypto';
      const brandLabel = currentTopic === 'ai' ? '5th Ave AI' : '5th Ave Crypto';
      const prompt = compositionGuide + 'Professional ' + topicLabel + ' news image featuring Angel, the ' + brandLabel + ' educator and mentor - an elegant, confident woman ' + settings.setting + '.\\n\\n' +
        'OUTFIT: ' + outfitDescription + '. She is looking directly at the camera with an approachable yet authoritative expression.' + customContext + '\\n\\n' +
        'IMPORTANT: Use the face reference for her face ONLY. Do NOT copy the exact clothing from any reference image - create a fresh, different outfit each time.\\n\\n' +
        'Visual context: ' + headlineContext + '\\n\\n' +
        'Mood: ' + settings.mood + '\\n' +
        'Lighting: ' + settings.lighting + '\\n\\n' +
        'Style: High-quality editorial photography, modern and polished. Angel should appear as a real person - relatable yet aspirational.' + logoInstruction + textInstructions;

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
      
      if (currentTopic === 'ai') {
        // AI-specific visual context
        if (h.includes('gpt') || h.includes('chatgpt') || h.includes('openai')) context.push('conversational AI interface elements with chat bubbles');
        if (h.includes('claude') || h.includes('anthropic')) context.push('clean, thoughtful AI interface design');
        if (h.includes('gemini') || h.includes('google')) context.push('colorful AI visualization with Google-inspired palette');
        if (h.includes('llm') || h.includes('language model') || h.includes('foundation model')) context.push('neural network visualization with interconnected nodes');
        if (h.includes('robot') || h.includes('humanoid')) context.push('sleek robotic elements and mechanical components');
        if (h.includes('autonomous') || h.includes('self-driving')) context.push('futuristic autonomous vehicle or drone imagery');
        if (h.includes('image') || h.includes('video') || h.includes('generat')) context.push('creative AI-generated visual art elements');
        if (h.includes('chip') || h.includes('nvidia') || h.includes('gpu') || h.includes('hardware')) context.push('advanced computing hardware with glowing circuits');
        if (h.includes('regulation') || h.includes('govern') || h.includes('policy') || h.includes('law') || h.includes('ban')) context.push('formal policy/government setting with tech elements');
        if (h.includes('safety') || h.includes('alignment') || h.includes('ethics') || h.includes('bias')) context.push('balanced harmony between technology and human values');
        if (h.includes('job') || h.includes('work') || h.includes('employ') || h.includes('replac')) context.push('workplace transformation with human-AI collaboration');
        if (h.includes('education') || h.includes('learn') || h.includes('school') || h.includes('student')) context.push('modern classroom with AI-enhanced learning tools');
        if (h.includes('healthcare') || h.includes('medical') || h.includes('drug') || h.includes('diagnos')) context.push('medical AI interface with health data visualizations');
        if (h.includes('agent') || h.includes('automat')) context.push('AI agent workflow with interconnected automated processes');
        if (h.includes('open source') || h.includes('meta') || h.includes('llama')) context.push('community-driven open technology collaboration');
        if (h.includes('startup') || h.includes('funding') || h.includes('billion') || h.includes('invest')) context.push('dynamic tech startup energy with growth indicators');
        if (h.includes('breakthrough') || h.includes('discover') || h.includes('research')) context.push('scientific discovery atmosphere with eureka moment energy');
        
        return context.length > 0 ? context.join(', ') : 'general artificial intelligence and technology innovation theme';
      }
      
      // Crypto-specific visual context (original)
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
    let currentTopic = 'crypto'; // 'crypto' or 'ai' - auto-detected from table name

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
      
      // Initialize expanded state - Face, Outfit, Background, Logo expanded by default
      const defaultExpanded = ['face', 'outfit', 'background', 'logo'];
      referenceCategories.forEach(cat => {
        expandedCategories[cat.id] = defaultExpanded.includes(cat.id);
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
          headers: { 'xc-token': NOCODB_TOKEN }
        });
        const data = await res.json();
        
        if (data.error) {
          throw new Error(typeof data.error === 'string' ? data.error : (data.error.message || 'API error'));
        }
        
        // Check if we're using cached data
        const isCached = data._cached;
        const cacheStale = data._cacheStale;
        const cacheError = data._error;
        
        bases = data.bases || [];
        console.log('Loaded ' + bases.length + ' bases' + (isCached ? ' (from cache)' : '') + ':', bases.map(b => b.name));
        
        // Show subtle indicator if using cached/stale data
        if (isCached && cacheStale) {
          console.warn('Using stale cached bases data:', cacheError);
          updateDebugPanel({ warning: 'Using cached data (API temporarily unavailable)', bases: bases.length });
        }
        
        if (bases.length === 0) {
          selector.innerHTML = '<option value="">No bases found</option>';
          return;
        }
        
        // Sort alphabetically
        bases.sort((a, b) => a.name.localeCompare(b.name));
        
        // Build dropdown with all bases
        const optionsHtml = bases.map(b => \`<option value="\${b.id}">\${b.name}</option>\`).join('');
        selector.innerHTML = '<option value="">-- Select a Base --</option>' + optionsHtml;
        
        // Default to "Getting Started" base if available, otherwise leave as "-- Select a Base --"
        const defaultBase = bases.find(b => b.id === 'p5v5ffrepsxc7g5');
        if (defaultBase) {
          console.log('Defaulting to Getting Started base:', defaultBase.id);
          selector.value = defaultBase.id;
          await onBaseChange();
        }
      } catch (err) {
        selector.innerHTML = '<option value="">Unable to load bases</option>';
        console.error('Failed to load bases:', err);
        updateDebugPanel('Error: ' + err.message);
        
        // Elegant inline error for bases too
        const errorDiv = document.createElement('div');
        errorDiv.id = 'baseLoadError';
        errorDiv.className = 'mt-3 p-4 rounded-xl border border-amber-500/30 bg-amber-900/20 backdrop-blur-sm';
        const isRateLimit = err.message && err.message.includes('429');
        const messageText = isRateLimit ? 'Allow a brief pause, then refresh the page.' : 'Please refresh to reconnect.';
        errorDiv.innerHTML = '<div style="display:flex;align-items:flex-start;gap:12px"><div style="width:32px;height:32px;border-radius:50%;background:rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-crown" style="color:#fbbf24;font-size:14px"></i></div><div><p style="font-size:14px;font-weight:500;color:#fcd34d;margin-bottom:4px">Connection Interrupted</p><p style="font-size:12px;color:rgba(252,211,77,0.8);line-height:1.5">The NocoDB connection is momentarily crowded. ' + messageText + '</p></div></div>';
        
        const container = selector.closest('.glass') || selector.parentElement;
        const existingError = document.getElementById('baseLoadError');
        if (existingError) existingError.remove();
        container?.insertBefore(errorDiv, container.firstChild);
        
        setTimeout(() => {
          errorDiv.style.opacity = '0';
          errorDiv.style.transition = 'opacity 0.5s ease';
          setTimeout(() => errorDiv.remove(), 500);
        }, 8000);
      }
    }
    
    // Debug panel functions
    function toggleDebugPanel() {
      const panel = document.getElementById('debugPanel');
      panel.classList.toggle('hidden');
    }
    
    function updateDebugPanel(content) {
      const debugContent = document.getElementById('debugContent');
      if (typeof content === 'object') {
        debugContent.innerHTML = '<pre>' + JSON.stringify(content, null, 2) + '</pre>';
      } else {
        debugContent.innerHTML = content;
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
      console.log('Base changed to:', currentBase?.name || 'Unknown', 'ID:', baseId);
      
      tableSelector.innerHTML = '<option value="">Loading tables...</option>';
      
      try {
        const res = await fetch(\`/api/bases/\${baseId}/tables\`, {
          headers: { 'xc-token': NOCODB_TOKEN }
        });
        const data = await res.json();
        
        if (data.error) {
          throw new Error(typeof data.error === 'string' ? data.error : (data.error.message || 'API error loading tables'));
        }
        
        // Check if we're using cached data
        const tablesCached = data._cached;
        const tablesCacheStale = data._cacheStale;
        
        tables = data.tables || [];
        console.log('Loaded ' + tables.length + ' tables' + (tablesCached ? ' (from cache)' : '') + ' for base ' + (currentBase?.name || 'Unknown') + ':', tables.map(t => t.name));
        
        // Show debug info if using cached/stale data
        if (tablesCached && tablesCacheStale) {
          console.warn('Using stale cached tables data:', data._error);
        }
        
        if (tables.length === 0) {
          tableSelector.innerHTML = '<option value="">No tables found</option>';
          return;
        }
        
        tableSelector.innerHTML = '<option value="">-- Select a Table --</option>' +
          tables.map(t => '<option value="' + t.id + '">' + t.name + '</option>').join('');

        // Auto-select "APR" table if available, otherwise select first table
        const aprTable = tables.find(t => t.name === 'APR');
        if (aprTable) {
          console.log('Auto-selecting APR table:', aprTable.id);
          tableSelector.value = aprTable.id;
        } else {
          console.log('APR table not found, selecting first table:', tables[0].name);
          tableSelector.value = tables[0].id;
        }
        await onTableChange();
      } catch (err) {
        tableSelector.innerHTML = '<option value="">Unable to load tables</option>';
        console.error('Failed to load tables:', err);
        
        // Elegant inline error instead of ugly alert
        const errorDiv = document.createElement('div');
        errorDiv.id = 'tableLoadError';
        errorDiv.className = 'mt-3 p-4 rounded-xl border border-red-500/30 bg-red-900/20 backdrop-blur-sm';
        const isRateLimit = err.message && err.message.includes('429');
        const messageText = isRateLimit ? 'Please wait a moment, then select your base again.' : 'Please refresh and try again.';
        errorDiv.innerHTML = '<div style="display:flex;align-items:flex-start;gap:12px"><div style="width:32px;height:32px;border-radius:50%;background:rgba(239,68,68,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-gem" style="color:#f87171;font-size:14px"></i></div><div><p style="font-size:14px;font-weight:500;color:#fca5a5;margin-bottom:4px">A Momentary Pause</p><p style="font-size:12px;color:rgba(252,165,165,0.8);line-height:1.5">The NocoDB rate limit has been reached. ' + messageText + '</p></div></div>';
        
        // Insert after the table selector container
        const container = tableSelector.closest('.glass') || tableSelector.parentElement;
        const existingError = document.getElementById('tableLoadError');
        if (existingError) existingError.remove();
        container?.insertBefore(errorDiv, container.firstChild);
        
        // Auto-dismiss after 8 seconds
        setTimeout(() => {
          errorDiv.style.opacity = '0';
          errorDiv.style.transition = 'opacity 0.5s ease';
          setTimeout(() => errorDiv.remove(), 500);
        }, 8000);
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
      
      // Auto-detect topic from table name
      const tableName = (currentTable?.name || '').toLowerCase();
      if (tableName.includes('ai') || tableName.includes('artificial intelligence')) {
        currentTopic = 'ai';
      } else {
        currentTopic = 'crypto';
      }
      
      // Update topic indicator in header
      const topicIndicator = document.getElementById('topicIndicator');
      if (topicIndicator) {
        if (currentTopic === 'ai') {
          topicIndicator.innerHTML = '<i class="fas fa-robot mr-1"></i>AI Mode';
          topicIndicator.className = 'text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 font-medium';
        } else {
          topicIndicator.innerHTML = '<i class="fab fa-bitcoin mr-1"></i>Crypto Mode';
          topicIndicator.className = 'text-sm px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-medium';
        }
      }
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
          headers: { 'xc-token': NOCODB_TOKEN }
        });
        const data = await res.json();
        
        if (data.error) {
          const errorMsg = typeof data.error === 'string' ? data.error : (data.error.message || 'Error loading records');
          recordsList.innerHTML = '<p class="text-red-500 text-sm p-4">' + errorMsg + '</p>';
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
          // Check imageURL text field first (new method), fallback to attachment field (old method)
          if (r.fields.imageURL) {
            thumbUrl = r.fields.imageURL;
          } else if (imageField && r.fields[imageField] && Array.isArray(r.fields[imageField]) && r.fields[imageField].length > 0) {
            // Fallback: Use large thumbnail or full URL for better quality (not small/blurry)
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
          headers: { 'xc-token': NOCODB_TOKEN }
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
        
        // Images - load from NocoDB with X button to remove
        // Check imageURL text field first (new method), fallback to attachment field (old method)
        const imageField = tableFields.find(tf => IMAGE_FIELD_TYPES.includes(tf.type))?.name;
        
        if (f.imageURL) {
          // New method: use imageURL text field
          setContentImage('16:9', f.imageURL);
        } else if (imageField && f[imageField] && f[imageField].length > 0) {
          // Fallback: use attachment field
          setContentImage('16:9', f[imageField][0].url);
        } else {
          clearContentImage('16:9');
        }
        
        // Reset other image slots
        clearContentImage('9:16');
        clearContentImage('1:1');
        
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
            // Auto-save to NocoDB (newest first, append to existing)
            await autoSaveImageToNocoDB(imageUrl);
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
        // Step 2: Add text banner overlay using canvas (reliable, template-based)
        // Logo watermark is already in the image from Nano Banana (top-right)
        document.getElementById('statusText').textContent = 'Step 2: Adding headline banner...';
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
      setContentImage(ratio, lastGeneratedUrl);
      
      // Scroll to the content images section
      document.getElementById('contentImagesSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        setContentImage('16:9', lastGeneratedUrl);
        
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
          statusText.textContent = 'Cropping to ' + size.ratio + '...';
          
          // Crop the 16:9 image to the target ratio (Nano Banana ignores aspect ratio with references)
          const generatedUrl = await cropImageToRatio(referenceUrl, size.ratio);
          
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
          
          // Set in content images (with X button)
          setContentImage(size.ratio, finalUrl);
          
          // Add to history
          addToHistory(finalUrl, 'Recomposed from 16:9 to ' + size.ratio);
          
          // Mark as done
          document.getElementById(size.statusId).innerHTML = '<i class="fas fa-check mr-1"></i>' + size.ratio;
          document.getElementById(size.statusId).className = 'text-green-400';
        }
        
        statusText.textContent = 'All sizes generated! Saving to NocoDB...';
        
        // Auto-save to NocoDB if a record is selected
        if (currentRecordId && currentBase && currentTable) {
          await saveImagesToNocoDB();
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
    
    // Crop image to a specific aspect ratio and upload
    async function cropImageToRatio(imageUrl, targetRatio) {
      console.log('Cropping image to ratio:', targetRatio);
      
      // Load the source image
      const img = await loadImage(imageUrl);
      
      // Calculate target dimensions based on ratio
      // Keep the shorter dimension and crop the longer one
      let targetWidth, targetHeight;
      
      if (targetRatio === '9:16') {
        // Portrait - vertical (9:16)
        // From 16:9 source, we need to crop significantly
        // Use the full height and calculate width
        targetHeight = img.height;
        targetWidth = Math.floor(targetHeight * (9/16));
      } else if (targetRatio === '1:1') {
        // Square (1:1)
        // Use the smaller dimension for both
        const minDim = Math.min(img.width, img.height);
        targetWidth = minDim;
        targetHeight = minDim;
      } else {
        // Default to 16:9 (landscape)
        targetWidth = img.width;
        targetHeight = Math.floor(img.width * (9/16));
      }
      
      console.log('Crop dimensions:', { sourceW: img.width, sourceH: img.height, targetW: targetWidth, targetH: targetHeight });
      
      // Crop the image
      const blob = await cropToAspectRatio(img, targetWidth, targetHeight);
      
      // Upload and return the URL
      const uploadedUrl = await uploadCroppedImage(blob);
      console.log('Cropped image uploaded:', uploadedUrl);
      
      return uploadedUrl;
    }
    
    // Add text overlay to image using canvas (reliable text rendering with template-based sizing)
    // Logo is now added in the Nano Banana step as a reference image watermark
    async function addTextOverlayWithZImage(imageUrl, headline, ratio) {
      console.log('Adding text overlay via canvas template system for ratio:', ratio);
      // Use the improved canvas overlay directly (Ideogram was unreliable)
      return await addTextOverlayWithCanvas(imageUrl, headline, ratio);
    }
    
    // Add logo to image in bottom-right corner (after GPT adds text)
    async function addLogoToImage(imageUrl, ratio) {
      try {
        const img = await loadImage(imageUrl);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Calculate banner area (bottom 12-15% based on ratio)
        let bannerHeightPercent = 0.15;
        if (ratio === '9:16') bannerHeightPercent = 0.12;
        else if (ratio === '1:1') bannerHeightPercent = 0.14;
        
        const bannerHeight = canvas.height * bannerHeightPercent;
        const bannerY = canvas.height - bannerHeight;
        const padding = canvas.width * 0.03;
        
        // Load and draw logo in bottom-right of banner
        const logoUrl = 'https://iili.io/fEiEfUB.png';
        const logoImg = await loadImage(logoUrl);
        const logoSize = Math.min(bannerHeight * 0.7, canvas.width * 0.08);
        const logoX = canvas.width - padding - logoSize;
        const logoY = bannerY + (bannerHeight - logoSize) / 2;
        
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        
        // Upload the final image
        return new Promise((resolve, reject) => {
          canvas.toBlob(async (blob) => {
            try {
              const uploadedUrl = await uploadCroppedImage(blob);
              resolve(uploadedUrl);
            } catch (err) {
              console.error('Failed to upload logo image:', err);
              resolve(imageUrl); // Return original if upload fails
            }
          }, 'image/png', 0.95);
        });
      } catch (err) {
        console.error('Failed to add logo:', err);
        return imageUrl; // Return original if logo add fails
      }
    }
    
    // Add text overlay to image using canvas with template-based sizing
    // Logo is placed in the TOP-RIGHT via Nano Banana reference image
    // Banner is at the BOTTOM with text only (no logo in banner)
    async function addTextOverlayWithCanvas(imageUrl, headline, ratio) {
      console.log('Canvas text overlay - ratio:', ratio, 'headline:', headline);
      
      // Load the original image
      const img = await loadImage(imageUrl);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the original image (which should already have logo watermark from Nano Banana)
      ctx.drawImage(img, 0, 0);
      
      // TEMPLATE-BASED SIZING for consistent results across all images
      // These values are based on standard output dimensions:
      // 16:9 = 1920x1080, 9:16 = 1080x1920, 1:1 = 1080x1080
      
      let bannerHeightPercent, fontSize, lineHeight, padding, maxTextWidth;
      
      if (ratio === '16:9') {
        // Wide landscape (1920x1080 standard)
        bannerHeightPercent = 0.14; // ~150px on 1080p
        fontSize = Math.max(36, Math.floor(canvas.height * 0.042)); // ~45px on 1080p
        lineHeight = fontSize * 1.35;
        padding = Math.floor(canvas.width * 0.025); // ~48px padding
        maxTextWidth = canvas.width - (padding * 2); // Full width for text
      } else if (ratio === '9:16') {
        // Tall portrait (1080x1920 standard)
        bannerHeightPercent = 0.10; // ~192px on 1920p height
        fontSize = Math.max(28, Math.floor(canvas.width * 0.042)); // ~45px on 1080 width
        lineHeight = fontSize * 1.30;
        padding = Math.floor(canvas.width * 0.04); // ~43px padding
        maxTextWidth = canvas.width - (padding * 2); // Full width for text
      } else { // 1:1
        // Square (1080x1080 standard)
        bannerHeightPercent = 0.13; // ~140px on 1080p
        fontSize = Math.max(32, Math.floor(canvas.width * 0.040)); // ~43px on 1080p
        lineHeight = fontSize * 1.32;
        padding = Math.floor(canvas.width * 0.035); // ~38px padding
        maxTextWidth = canvas.width - (padding * 2); // Full width for text
      }
      
      // Set font for text measurement
      const fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';
      ctx.font = 'bold ' + fontSize + 'px ' + fontFamily;
      
      // Word wrap the headline based on actual measured width
      const words = headline.split(/\\s+/);
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth > maxTextWidth) {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Single word too long - just use it
            lines.push(word);
          }
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      console.log('Text wrapped into', lines.length, 'lines:', lines);
      
      // Calculate banner height - expand if needed for multiple lines
      const minBannerHeight = canvas.height * bannerHeightPercent;
      const textBlockHeight = lines.length * lineHeight;
      const verticalPadding = padding * 1.5; // More padding top/bottom
      const neededHeight = textBlockHeight + (verticalPadding * 2);
      const bannerHeight = Math.max(minBannerHeight, neededHeight);
      const bannerY = canvas.height - bannerHeight;
      
      // Draw semi-transparent dark banner (no gradient, clean look)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
      ctx.fillRect(0, bannerY, canvas.width, bannerHeight);
      
      // Optional: Add subtle top border for polish
      ctx.fillStyle = 'rgba(212, 175, 55, 0.6)'; // Gold accent
      ctx.fillRect(0, bannerY, canvas.width, 3);
      
      // Draw text - centered vertically in banner
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold ' + fontSize + 'px ' + fontFamily;
      ctx.textBaseline = 'middle';
      
      const totalTextHeight = lines.length * lineHeight;
      const textStartY = bannerY + (bannerHeight - totalTextHeight) / 2 + lineHeight / 2;
      
      lines.forEach((line, index) => {
        const y = textStartY + (index * lineHeight);
        ctx.fillText(line, padding, y);
      });
      
      // NO LOGO in banner - logo is in top-right of the main image (from Nano Banana)
      
      // Convert canvas to blob and upload
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          try {
            const uploadedUrl = await uploadCroppedImage(blob);
            console.log('Canvas text overlay uploaded:', uploadedUrl);
            resolve(uploadedUrl);
          } catch (err) {
            console.error('Failed to upload canvas overlay:', err);
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
    // AUTO-SAVE IMAGE TO NOCODB
    // ========================================
    async function autoSaveImageToNocoDB(imageUrl) {
      // Only save if we have a current record selected
      if (!currentRecordId || !currentBase || !currentTable) {
        console.log('No record selected - skipping auto-save to NocoDB');
        return;
      }
      
      try {
        // Save image URL to text field 'imageURL' (NOT attachment field)
        console.log('Auto-saving image URL to NocoDB imageURL field:', imageUrl);
        
        // Save to NocoDB
        const res = await fetch('/api/records/' + currentRecordId + '?baseId=' + currentBase.id + '&tableId=' + currentTable.id, {
          method: 'PATCH',
          headers: {
            'xc-token': NOCODB_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ imageURL: imageUrl })
        });
        
        const result = await res.json();
        
        if (result.error) {
          console.error('NocoDB save error:', result.error);
          return;
        }
        
        // Update local record cache with imageURL
        if (currentRecord && currentRecord.fields) {
          currentRecord.fields.imageURL = imageUrl;
        }
        
        console.log('✓ Image URL auto-saved to NocoDB');
        showSaveIndicator();
        
      } catch (err) {
        console.error('Auto-save to NocoDB failed:', err);
      }
    }
    
    // Save a specific image from history to current NocoDB record
    async function saveHistoryImageToNocoDB(imageUrl) {
      if (!currentRecordId || !currentBase || !currentTable) {
        alert('Please select an article first before saving images.');
        return;
      }
      
      await autoSaveImageToNocoDB(imageUrl);
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
          alert("No images have article assignments. Images generated before this update don't have article tracking. Please generate new images with an article selected.");
          return;
        }
        
        console.log('Saving images to ' + recordKeys.length + ' different articles');
        
        let savedCount = 0;
        let errorCount = 0;
        
        // Save to each article
        for (const key of recordKeys) {
          const record = imagesByRecord[key];
          
          try {
            // Save only the first image URL to the imageURL text field (NOT attachment field)
            // Multiple images per record not supported with text field - use first image only
            const imageUrl = record.images[0]?.url || '';
            if (!imageUrl) {
              console.log('No image URL for record: ' + record.articleTitle);
              continue;
            }
            
            // Save to NocoDB
            const res = await fetch('/api/records/' + record.recordId + '?baseId=' + record.baseId + '&tableId=' + record.tableId, {
              method: 'PATCH',
              headers: {
                'xc-token': NOCODB_TOKEN,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ imageURL: imageUrl })
            });
            
            const result = await res.json();
            
            if (result.error) {
              console.error('Error saving to ' + record.articleTitle + ':', result.error);
              errorCount++;
            } else {
              console.log('✓ Saved image URL to: ' + record.articleTitle);
              savedCount++;
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
    
    // Toggle Social Media Content (collapsible section)
    function toggleSocialContent() {
      const content = document.getElementById('socialContentBody');
      const toggle = document.getElementById('socialContentToggle');
      const isHidden = content.classList.contains('hidden');
      
      if (isHidden) {
        content.classList.remove('hidden');
        toggle.style.transform = 'rotate(0deg)';
      } else {
        content.classList.add('hidden');
        toggle.style.transform = 'rotate(180deg)';
      }
    }
    
    // Expand Social Content to full-screen modal
    function expandSocialContent() {
      const socialSection = document.getElementById('socialContentSection');
      const overlay = document.getElementById('socialExpandOverlay');
      
      if (!overlay) {
        // Create overlay if it doesn't exist
        const newOverlay = document.createElement('div');
        newOverlay.id = 'socialExpandOverlay';
        newOverlay.className = 'fixed inset-0 z-50 bg-black/95 hidden';
        newOverlay.innerHTML = \`
          <div class="h-full flex flex-col p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-2xl font-bold text-amber-500">
                <i class="fas fa-share-alt mr-2"></i>Social Media Content
              </h3>
              <button onclick="collapseSocialContent()" class="text-gray-400 hover:text-white text-2xl">
                <i class="fas fa-compress-alt"></i>
              </button>
            </div>
            <div id="expandedTabsContainer" class="flex border-b border-white/10 mb-4 overflow-x-auto gap-1"></div>
            <div id="expandedTextarea" class="flex-1 flex flex-col">
              <textarea id="expandedContent" 
                class="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-6 text-lg resize-none focus:border-amber-500 focus:outline-none"
                placeholder="Select a tab to edit..."></textarea>
            </div>
          </div>
        \`;
        document.body.appendChild(newOverlay);
      }
      
      // Copy tabs to expanded view
      const expandedTabs = document.getElementById('expandedTabsContainer');
      const activeTab = document.querySelector('.tab-btn.tab-active')?.dataset.tab || 'twitter';
      expandedTabs.innerHTML = ['twitter', 'threads', 'bluesky', 'linkedin', 'facebook', 'instagram', 'blog', 'script']
        .map(tab => \`<button onclick="switchExpandedTab('\${tab}')" class="tab-btn \${tab === activeTab ? 'tab-active' : ''} px-4 py-3 text-base whitespace-nowrap" data-expanded-tab="\${tab}">
          <i class="\${getTabIcon(tab)} mr-2"></i>\${getTabLabel(tab)}
        </button>\`).join('');
      
      // Sync current content
      const currentTextarea = document.getElementById(\`content\${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}\`);
      document.getElementById('expandedContent').value = currentTextarea?.value || '';
      document.getElementById('expandedContent').dataset.currentTab = activeTab;
      
      document.getElementById('socialExpandOverlay').classList.remove('hidden');
    }
    
    function collapseSocialContent() {
      // Save content back to original textarea
      const expandedContent = document.getElementById('expandedContent');
      const currentTab = expandedContent.dataset.currentTab;
      if (currentTab) {
        const originalTextarea = document.getElementById(\`content\${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}\`);
        if (originalTextarea) {
          originalTextarea.value = expandedContent.value;
          // Trigger auto-save
          originalTextarea.dispatchEvent(new Event('change'));
        }
      }
      document.getElementById('socialExpandOverlay').classList.add('hidden');
    }
    
    function switchExpandedTab(tab) {
      const expandedContent = document.getElementById('expandedContent');
      const previousTab = expandedContent.dataset.currentTab;
      
      // Save content from previous tab
      if (previousTab) {
        const prevTextarea = document.getElementById(\`content\${previousTab.charAt(0).toUpperCase() + previousTab.slice(1)}\`);
        if (prevTextarea) {
          prevTextarea.value = expandedContent.value;
        }
      }
      
      // Load new tab content
      const newTextarea = document.getElementById(\`content\${tab.charAt(0).toUpperCase() + tab.slice(1)}\`);
      expandedContent.value = newTextarea?.value || '';
      expandedContent.dataset.currentTab = tab;
      
      // Update tab styling
      document.querySelectorAll('[data-expanded-tab]').forEach(btn => {
        btn.classList.toggle('tab-active', btn.dataset.expandedTab === tab);
      });
    }
    
    function getTabIcon(tab) {
      const icons = {
        twitter: 'fab fa-twitter',
        threads: 'fab fa-threads',
        bluesky: 'fas fa-cloud',
        linkedin: 'fab fa-linkedin',
        facebook: 'fab fa-facebook',
        instagram: 'fab fa-instagram',
        blog: 'fas fa-blog',
        script: 'fas fa-video'
      };
      return icons[tab] || 'fas fa-file';
    }
    
    function getTabLabel(tab) {
      const labels = {
        twitter: 'Twitter/X',
        threads: 'Threads',
        bluesky: 'Bluesky',
        linkedin: 'LinkedIn',
        facebook: 'Facebook',
        instagram: 'Instagram',
        blog: 'Blog',
        script: 'Script'
      };
      return labels[tab] || tab;
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
      await autoSaveImageToNocoDB(currentLightboxUrl);
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

    // Original handler for simple URL drops (from Generation History)
    async function handleImageDrop(event, aspectRatio) {
      event.preventDefault();
      event.currentTarget.classList.remove('drag-over');
      
      const imageUrl = event.dataTransfer.getData('text/plain');
      if (!imageUrl) return;

      setContentImage(aspectRatio, imageUrl);
    }
    
    // Enhanced handler for Content Images - handles files, URLs, and external images
    async function handleContentImageDrop(event, aspectRatio) {
      event.preventDefault();
      event.currentTarget.classList.remove('drag-over');
      
      // Check for files first (dragged from computer)
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          await uploadAndSetImage(file, aspectRatio);
          return;
        }
      }
      
      // Check for URL (dragged from browser or Generation History)
      const imageUrl = event.dataTransfer.getData('text/plain');
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:'))) {
        setContentImage(aspectRatio, imageUrl);
        return;
      }
      
      // Check for HTML with image (dragged from web page)
      const html = event.dataTransfer.getData('text/html');
      if (html) {
        const match = html.match(/src=["']([^"']+)["']/);
        if (match && match[1]) {
          setContentImage(aspectRatio, match[1]);
          return;
        }
      }
    }
    
    // Handle file input upload for content images
    async function handleContentFileUpload(event, aspectRatio) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        await uploadAndSetImage(file, aspectRatio);
      }
      // Reset file input so same file can be selected again
      event.target.value = '';
    }
    
    // Upload file and set as content image
    async function uploadAndSetImage(file, aspectRatio) {
      const containerId = 'image' + aspectRatio.replace(':', 'x');
      const container = document.getElementById(containerId);
      
      // Show loading state
      container.innerHTML = '<div class="flex flex-col items-center gap-2"><i class="fas fa-spinner fa-spin text-2xl text-amber-500"></i><span class="text-xs text-gray-400">Uploading...</span></div>';
      
      try {
        // Convert file to base64
        const base64 = await fileToBase64(file);
        
        // Upload to freeimage.host
        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Image: base64 })
        });
        const uploadData = await uploadRes.json();
        
        if (uploadData.image?.url) {
          setContentImage(aspectRatio, uploadData.image.url);
        } else {
          throw new Error('Upload failed');
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        container.innerHTML = '<span class="text-red-400 text-sm">Upload failed - try again</span>';
        setTimeout(() => {
          container.innerHTML = '<span class="text-gray-500 text-sm">Drop image or click <i class="fas fa-upload"></i> to upload</span>';
        }, 2000);
      }
    }
    
    // Convert file to base64
    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    
    // Set content image with X button to remove
    function setContentImage(aspectRatio, imageUrl) {
      const containerId = 'image' + aspectRatio.replace(':', 'x');
      const container = document.getElementById(containerId);
      container.innerHTML = \`
        <img src="\${imageUrl}" alt="\${aspectRatio}">
        <button class="remove-image-btn" onclick="event.stopPropagation(); clearContentImage('\${aspectRatio}')" title="Remove image">
          <i class="fas fa-times"></i>
        </button>
      \`;
      container.classList.add('has-image');
      
      contentImages[aspectRatio] = imageUrl;

      if (currentRecordId) {
        showSaveIndicator();
      }
    }
    
    // Clear/remove content image
    function clearContentImage(aspectRatio) {
      const containerId = 'image' + aspectRatio.replace(':', 'x');
      const container = document.getElementById(containerId);
      container.innerHTML = '<span class="text-gray-500 text-sm">Drop image or click <i class="fas fa-upload"></i> to upload</span>';
      container.classList.remove('has-image');
      
      contentImages[aspectRatio] = null;
      
      showSaveIndicator();
    }
    
    // ========================================
    // RESIZE TO ALL SIZES
    // ========================================
    function toggleResizeDropdown() {
      const dropdown = document.getElementById('resizeDropdown');
      dropdown.classList.toggle('hidden');
      
      // Close dropdown when clicking outside
      if (!dropdown.classList.contains('hidden')) {
        setTimeout(() => {
          document.addEventListener('click', closeResizeDropdown, { once: true });
        }, 10);
      }
    }
    
    function closeResizeDropdown(event) {
      const dropdown = document.getElementById('resizeDropdown');
      const btn = document.getElementById('resizeDropdownBtn');
      if (!dropdown.contains(event.target) && !btn.contains(event.target)) {
        dropdown.classList.add('hidden');
      }
    }
    
    async function resizeToAllSizes(method) {
      // Close dropdown
      document.getElementById('resizeDropdown').classList.add('hidden');
      
      // Find which image we have to use as source
      // Priority: 16:9 > 9:16 > 1:1
      let sourceUrl = contentImages['16:9'] || contentImages['9:16'] || contentImages['1:1'];
      let sourceRatio = contentImages['16:9'] ? '16:9' : (contentImages['9:16'] ? '9:16' : '1:1');
      
      if (!sourceUrl) {
        alert('Please add an image to any slot first, then resize to other sizes.');
        return;
      }
      
      // Show status
      const statusDiv = document.getElementById('resizeStatus');
      const statusText = document.getElementById('resizeStatusText');
      statusDiv.classList.remove('hidden');
      
      // Determine which sizes to generate
      const allRatios = ['16:9', '9:16', '1:1'];
      const sizesToGenerate = allRatios.filter(r => r !== sourceRatio || !contentImages[r]);
      
      try {
        for (const targetRatio of sizesToGenerate) {
          if (contentImages[targetRatio] && targetRatio === sourceRatio) continue; // Skip source
          
          statusText.textContent = method === 'ai' 
            ? 'AI generating ' + targetRatio + '...' 
            : 'Cropping to ' + targetRatio + '...';
          
          let resultUrl;
          
          if (method === 'ai') {
            // Use Nano Banana to regenerate
            const prompt = 'Recreate this exact same scene, person, outfit, and lighting. Keep EVERYTHING identical - same composition, same pose, same expression, same clothing, same background, same mood. Do NOT change any details.';
            resultUrl = await generateImageForRatio(sourceUrl, prompt, targetRatio);
          } else {
            // Use canvas to crop
            resultUrl = await cropImageToRatio(sourceUrl, targetRatio);
          }
          
          // Check if headline text should be added
          const addHeadlineText = document.getElementById('addHeadlineText')?.checked;
          const shortHeadline = document.getElementById('shortHeadline')?.value?.trim();
          
          if (addHeadlineText && shortHeadline) {
            statusText.textContent = 'Adding text to ' + targetRatio + '...';
            try {
              resultUrl = await addTextOverlayWithZImage(resultUrl, shortHeadline, targetRatio);
            } catch (err) {
              console.error('Error adding text overlay:', err);
            }
          }
          
          setContentImage(targetRatio, resultUrl);
          addToHistory(resultUrl, 'Resized from ' + sourceRatio + ' to ' + targetRatio);
        }
        
        statusText.textContent = 'All sizes created!';
        setTimeout(() => statusDiv.classList.add('hidden'), 2000);
        
        // Auto-save
        if (currentRecordId && currentBase && currentTable) {
          await saveImagesToNocoDB();
        }
        
      } catch (err) {
        console.error('Error resizing:', err);
        statusText.textContent = 'Error: ' + err.message;
        setTimeout(() => statusDiv.classList.add('hidden'), 3000);
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
      
      const nocodbField = field.dataset.field;
      if (!nocodbField) return;
      
      try {
        const res = await fetch(\`/api/records/\${currentRecordId}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
          method: 'PATCH',
          headers: {
            'xc-token': NOCODB_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ [nocodbField]: field.value })
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
        headers: { 'xc-token': NOCODB_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Approved' })
      });
      loadRecords();
      selectRecord(currentRecordId);
    }

    async function declineRecord() {
      if (!currentRecordId || !currentBase || !currentTable) return;
      await fetch(\`/api/records/\${currentRecordId}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
        method: 'PATCH',
        headers: { 'xc-token': NOCODB_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Declined' })
      });
      loadRecords();
      selectRecord(currentRecordId);
    }

    // ========================================
    // SAVE IMAGES TO NOCODB
    // ========================================
    async function saveImagesToNocoDB() {
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
      
      const btn = document.getElementById('saveImagesToNocoDBBtn');
      const statusDiv = document.getElementById('saveImagesStatus');
      const statusText = document.getElementById('saveImagesText');
      
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
      statusDiv.classList.remove('hidden');
      
      try {
        // Get the first available image URL - priority: 16:9 > 1:1 > 9:16
        let imageUrl = '';
        if (contentImages['16:9']) {
          imageUrl = contentImages['16:9'];
        } else if (contentImages['1:1']) {
          imageUrl = contentImages['1:1'];
        } else if (contentImages['9:16']) {
          imageUrl = contentImages['9:16'];
        }
        
        if (!imageUrl) {
          throw new Error('No images to save. Add images to Content Images first.');
        }
        
        // Save image URL to text field 'imageURL' (NOT attachment field)
        const updates = { imageURL: imageUrl };
        const savedCount = 1;
        
        console.log('Saving to NocoDB imageURL field:', imageUrl);
        
        // Save to NocoDB
        statusText.textContent = 'Uploading ' + savedCount + ' image(s) to NocoDB...';
        const res = await fetch(\`/api/records/\${currentRecordId}?baseId=\${currentBase.id}&tableId=\${currentTable.id}\`, {
          method: 'PATCH',
          headers: {
            'xc-token': NOCODB_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });
        
        const result = await res.json();
        
        if (result.error) {
          throw new Error(result.error.message || 'NocoDB error');
        }
        
        statusText.textContent = '✓ Saved ' + savedCount + ' image(s) to NocoDB!';
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
        btn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-2"></i>Save to NocoDB';
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
          headers: { 'xc-token': NOCODB_TOKEN }
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
          // Check imageURL text field first (new method), fallback to attachment field (old method)
          let thumbnail = '';
          if (r.fields.imageURL) {
            thumbnail = r.fields.imageURL;
          } else if (imageField && r.fields[imageField] && Array.isArray(r.fields[imageField]) && r.fields[imageField].length > 0) {
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
        
        // Update NocoDB record
        const res = await fetch('/api/records/' + postId + '?baseId=' + currentBase.id + '&tableId=' + currentTable.id, {
          method: 'PATCH',
          headers: {
            'xc-token': NOCODB_TOKEN,
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
  `)});const Qe=new wt,pa=Object.assign({"/src/index.tsx":C});let kt=!1;for(const[,e]of Object.entries(pa))e&&(Qe.route("/",e),Qe.notFound(e.notFoundHandler),kt=!0);if(!kt)throw new Error("Can't import modules from ['/src/index.tsx','/app/server.ts']");export{Qe as default};
