if(!self.define){let e,s={};const t=(t,c)=>(t=new URL(t+".js",c).href,s[t]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=t,e.onload=s,document.head.appendChild(e)}else e=t,importScripts(t),s()})).then((()=>{let e=s[t];if(!e)throw new Error(`Module ${t} didn’t register its module`);return e})));self.define=(c,n)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let i={};const r=e=>t(e,a),o={module:{uri:a},exports:i,require:r};s[a]=Promise.all(c.map((e=>o[e]||r(e)))).then((e=>(n(...e),i)))}}define(["./workbox-07a7b4f2"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"6de561b142d8276aa3c361f7c02891c0"},{url:"/_next/static/P4mTOugRdcXqOZ2DEstw6/_buildManifest.js",revision:"a1b7599199e2e8c82f2c6bcf8d8aca61"},{url:"/_next/static/P4mTOugRdcXqOZ2DEstw6/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/140-cb6788af3bdfc672.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/938-eeb892b762843b23.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/app/_not-found-6816c8f124368b86.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/app/admin/page-3fa68d557c58343b.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/app/layout-3ef2cc4958c673c6.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/app/page-ed458ff36a43609a.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/app/tests/transformAdminPasswd/page-93abac790f147bed.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/fd9d1056-ab060d69a64451a1.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/framework-8883d1e9be70c3da.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/main-40dcc6a8f0d96a5c.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/main-app-738e067d7348524a.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/pages/_app-98cb51ec6f9f135f.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/pages/_error-e87e5963ec1b8011.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-30c22bd6b74a0c03.js",revision:"P4mTOugRdcXqOZ2DEstw6"},{url:"/_next/static/css/1844850413a333f0.css",revision:"1844850413a333f0"},{url:"/_next/static/css/fe69d077cd9ab57c.css",revision:"fe69d077cd9ab57c"},{url:"/_next/static/media/05a31a2ca4975f99-s.woff2",revision:"f1b44860c66554b91f3b1c81556f73ca"},{url:"/_next/static/media/513657b02c5c193f-s.woff2",revision:"c4eb7f37bc4206c901ab08601f21f0f2"},{url:"/_next/static/media/51ed15f9841b9f9d-s.woff2",revision:"bb9d99fb9bbc695be80777ca2c1c2bee"},{url:"/_next/static/media/c9a5bc6a7c948fb0-s.p.woff2",revision:"74c3556b9dad12fb76f84af53ba69410"},{url:"/_next/static/media/d6b16ce4a6175f26-s.woff2",revision:"dd930bafc6297347be3213f22cc53d3e"},{url:"/_next/static/media/ec159349637c90ad-s.woff2",revision:"0e89df9522084290e01e4127495fae99"},{url:"/_next/static/media/fd4db3eb5472fc27-s.woff2",revision:"71f3fcaf22131c3368d9ec28ef839831"},{url:"/icon.png",revision:"af652270e7ed3c767c5a29822e69397e"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"61c6b19abff40ea7acd577be818f3976"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:t,state:c})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
