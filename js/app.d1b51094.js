(function(t){function e(e){for(var n,o,r=e[0],l=e[1],c=e[2],u=0,p=[];u<r.length;u++)o=r[u],Object.prototype.hasOwnProperty.call(a,o)&&a[o]&&p.push(a[o][0]),a[o]=0;for(n in l)Object.prototype.hasOwnProperty.call(l,n)&&(t[n]=l[n]);d&&d(e);while(p.length)p.shift()();return s.push.apply(s,c||[]),i()}function i(){for(var t,e=0;e<s.length;e++){for(var i=s[e],n=!0,o=1;o<i.length;o++){var l=i[o];0!==a[l]&&(n=!1)}n&&(s.splice(e--,1),t=r(r.s=i[0]))}return t}var n={},a={app:0},s=[];function o(t){return r.p+"js/"+({}[t]||t)+"."+{"chunk-2d0e1d75":"a5e6dd93","chunk-7e07bcb6":"a5e0565e"}[t]+".js"}function r(e){if(n[e])return n[e].exports;var i=n[e]={i:e,l:!1,exports:{}};return t[e].call(i.exports,i,i.exports,r),i.l=!0,i.exports}r.e=function(t){var e=[],i=a[t];if(0!==i)if(i)e.push(i[2]);else{var n=new Promise((function(e,n){i=a[t]=[e,n]}));e.push(i[2]=n);var s,l=document.createElement("script");l.charset="utf-8",l.timeout=120,r.nc&&l.setAttribute("nonce",r.nc),l.src=o(t);var c=new Error;s=function(e){l.onerror=l.onload=null,clearTimeout(u);var i=a[t];if(0!==i){if(i){var n=e&&("load"===e.type?"missing":e.type),s=e&&e.target&&e.target.src;c.message="Loading chunk "+t+" failed.\n("+n+": "+s+")",c.name="ChunkLoadError",c.type=n,c.request=s,i[1](c)}a[t]=void 0}};var u=setTimeout((function(){s({type:"timeout",target:l})}),12e4);l.onerror=l.onload=s,document.head.appendChild(l)}return Promise.all(e)},r.m=t,r.c=n,r.d=function(t,e,i){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},r.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(r.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)r.d(i,n,function(e){return t[e]}.bind(null,n));return i},r.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="/adeditor/",r.oe=function(t){throw console.error(t),t};var l=window["webpackJsonp"]=window["webpackJsonp"]||[],c=l.push.bind(l);l.push=e,l=l.slice();for(var u=0;u<l.length;u++)e(l[u]);var d=c;s.push([0,"chunk-vendors"]),i()})({0:function(t,e,i){t.exports=i("56d7")},1:function(t,e){},"17fe":function(t,e,i){},2:function(t,e){},"540a":function(t,e,i){},"56d7":function(t,e,i){"use strict";i.r(e);i("e260"),i("e6cf"),i("cca6"),i("a79d");var n=i("2b0e"),a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"flex flex-row h-screen w-screen items-stretch",attrs:{id:"app"}},[i("div",{staticClass:"flex flex-grow-0 flex-col items-stretch p-2",staticStyle:{width:"16em"}},[i("Card",{staticClass:"flex-grow-0 mb-2",scopedSlots:t._u([{key:"title",fn:function(){return[t._v(" Files ")]},proxy:!0}])},[i("LoadRoute",{attrs:{cansave:!t.mapLoading&&!!t.editor},on:{"loading-status":function(e){t.mapLoading=e},"map-image-change":function(e){t.mapImageURL=e},"map-xml-loaded":t.mapLoaded,"save-map":t.saveMap}}),t.error?i("div",{staticClass:"flex"},[i("span",{staticClass:"text-red-600 font-bold w-full ",domProps:{textContent:t._s(t.error)}})]):t._e()],1),!t.mapLoading&&t.editor?[t.editor.selection.length?i("Card",{staticClass:"flex-grow-0 mb-2",attrs:{collapsable:!1},scopedSlots:t._u([{key:"title",fn:function(){return[t._v(" Selected items ")]},proxy:!0}],null,!1,982736498)},[i("ul",t._l(t.editor.selection.filter((function(t){return t})),(function(e,n){return i("li",{key:n},[e.waypoint?[i("span",[t._v("Waypoint # "+t._s(e.waypoint.index))]),e.waypoint.marker?i("span",{staticClass:"ml-1 font-bold",domProps:{textContent:t._s(e.waypoint.marker.name)}}):t._e()]:t._e(),e.path?[i("span",[t._v("Path # "+t._s(e.path.index)+" ("+t._s(e.path.wpts.length)+" wpts)")])]:t._e()],2)})),0)]):t._e(),i("Card",{staticClass:"flex-grow mb-2",attrs:{collapsable:!1},scopedSlots:t._u([{key:"title",fn:function(){return[t._v(" Tools ")]},proxy:!0}],null,!1,1256915702)},t._l(t.editor.toolsAvailable,(function(e){return i("div",{key:e.action,staticClass:"flex flex-col self-stretch",class:{dropdown:e.options}},[i("button",{staticClass:"inline-flex items-stretch bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded",on:{click:function(i){e.options||t.toolAction(e)}}},[i("span",{staticClass:"material-icons fill-current mr-1",domProps:{textContent:t._s(e.icon)}}),i("span",{domProps:{textContent:t._s(e.label)}}),e.options?i("span",[t._v("🠋")]):t._e()]),e.options?i("ul",{staticClass:"flex flex-col self-stretch dropdown-content absolute hidden text-gray-800 pt-1 mt-8"},t._l(e.options,(function(n){return i("li",{key:n.value,staticClass:"flex block self-stretch"},[i("button",{staticClass:"flex w-full items-stretch bg-gray-300 hover:bg-gray-400 p-1 whitespace-no-wrap",on:{click:function(i){return t.toolAction(e,n)}}},[i("span",{staticClass:"material-icons fill-current mr-1",domProps:{textContent:t._s(n.icon)}}),i("span",{domProps:{textContent:t._s(n.label)}})])])})),0):t._e(),e.description?i("div",{staticClass:"flex italic text-xs",domProps:{textContent:t._s(e.description)}}):t._e()])})),0),t.editor&&(t.editor.actions.length||t.editor.redoables.length)?i("Card",{staticClass:"flex-grow-0",scopedSlots:t._u([{key:"title",fn:function(){return[t._v(" Undo/Redo ")]},proxy:!0}],null,!1,382143710)},[i("div",{staticClass:"flex flex-row"},[i("div",{staticClass:"flex-1 m-1"},[t.editor.actions.length?i("button",{staticClass:"w-full border shadow",attrs:{title:t.editor.actions.slice(-1)[0].label},on:{click:t.undo}},[t._v(" Undo ")]):t._e()]),i("div",{staticClass:"flex-1 m-1"},[t.editor.redoables.length?i("button",{staticClass:"w-full  border shadow",attrs:{title:t.editor.redoables.slice(-1)[0].label},on:{click:t.redo}},[t._v(" Redo ")]):t._e()])])]):t._e(),i("Card",{staticClass:"flex-grow-0",scopedSlots:t._u([{key:"title",fn:function(){return[t._v(" Info ")]},proxy:!0}],null,!1,727986227)},[i("div",{staticClass:"flex flex-col text-sm"},[i("span",{staticClass:"flex text-center"},[i("label",{staticClass:"mr-1",attrs:{for:"mapsize"}},[t._v("Map Size")]),i("input",{directives:[{name:"model",rawName:"v-model",value:t.editor.map.size,expression:"editor.map.size"}],attrs:{type:"number",id:"mapsize",list:"sizes"},domProps:{value:t.editor.map.size},on:{input:function(e){e.target.composing||t.$set(t.editor.map,"size",e.target.value)}}}),i("datalist",{attrs:{id:"sizes"}},t._l(t.defaultMapSizes,(function(e,n){return i("option",{key:n,domProps:{value:n,textContent:t._s(e)}})})),0),t.factor?i("span",{staticClass:"ml-1"},[t._v("("+t._s(t.factor)+")")]):t._e()]),i("span",{staticClass:"flex text-center"},[t._v(" Waypoints: "+t._s(t.editor.map.waypointsArray().length)+" ")]),i("span",{staticClass:"flex text-center"},[t._v(" Paths: "+t._s(t.editor.map.paths.length)+" ")])])])]:t._e()],2),!t.mapLoading&&t.editor?i("Map",{staticClass:"flex flex-grow border border-gray-400 rounded shadow-md m-2 ml-0 p-2",attrs:{mapImageURL:t.mapImageURL,editor:t.editor},on:{"map-click":t.mapClick,"path-click":t.pathClick,"wpt-click":t.wptClick,"wpt-dragged":t.wptDragged}}):t._e()],1)},s=[],o=(i("d81d"),i("96cf"),i("1da1")),r=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"form flex flex-col text-sm"},[i("div",{staticClass:"flex flex-col mb-2"},[!t.loading&&t.cansave?[i("button",{staticClass:"w-full border shadow",on:{click:function(e){return t.$emit("save-map")}}},[t._v(" Save ")])]:[i("span",{staticClass:"flex text-xs"},[t._v("XML")]),i("input",{staticClass:"flex text-xs",attrs:{disabled:t.loading,type:"file"},on:{change:t.getFile}})]],2),i("div",{staticClass:"flex flex-col"},[i("span",{staticClass:"flex text-xs"},[t._v("Image")]),i("input",{staticClass:"flex text-xs",attrs:{type:"file"},on:{change:t.getImage}})])])},l=[],c=(i("b0c0"),i("d3b7"),i("3ca3"),i("ddb0"),i("2b3d"),i("4de4"),i("4160"),i("c975"),i("fb6a"),i("90d7"),i("4fad"),i("ac1f"),i("1276"),i("159b"),i("d4ec")),u=i("bee2"),d=i("ade3"),p=(i("99af"),i("6062"),i("2909")),h=function(){function t(e,i,n,a,s,o,r){Object(c["a"])(this,t),Object(d["a"])(this,"map",void 0),Object(d["a"])(this,"index",void 0),Object(d["a"])(this,"x",void 0),Object(d["a"])(this,"y",void 0),Object(d["a"])(this,"z",void 0),Object(d["a"])(this,"marker",void 0),Object(d["a"])(this,"ins",void 0),Object(d["a"])(this,"outs",void 0),this.map=e,this.index=parseInt(i),this.x=parseFloat(n),this.y=parseFloat(a),this.z=parseFloat(s),this.marker=null,this.ins=o,this.outs=r}return Object(u["a"])(t,[{key:"inFromOuts",value:function(){var t=this;return void 0===this.map.cache["inFromOuts"]&&(this.map.cache["inFromOuts"]={},this.map.waypointsArray().forEach((function(e){t.map.cache["inFromOuts"][e.index]||(t.map.cache["inFromOuts"][e.index]=[]),e.existingOuts().forEach((function(i){t.map.cache["inFromOuts"][i]||(t.map.cache["inFromOuts"][i]=[]),t.map.cache["inFromOuts"][i].push(e.index)}))}))),this.map.cache["inFromOuts"]}},{key:"_cache_check",value:function(){void 0===this.map.cache["wpts"]&&(this.map.cache["wpts"]={}),void 0===this.map.cache["wpts"][this.index]&&(this.map.cache["wpts"][this.index]={})}},{key:"set",value:function(t,e){this._cache_check(),this.map.cache["wpts"][this.index][t]=e}},{key:"get",value:function(t,e){return this._cache_check(),void 0!==this.map.cache["wpts"][this.index][t]?this.map.cache["wpts"][this.index][t]:e}},{key:"linksofType",value:function(t){var e=this,i=this.get("linksofType");return void 0===i&&(i={},["in","out","bidirectional","reverse-in","reverse-out"].forEach((function(t){i[t]=e.linkedWpts().filter((function(i){return e.linkType(i)===t}))})),this.set("linksofType",i)),void 0!==t?i[t]:i}},{key:"existingIns",value:function(){var t=this,e=this.get("existingIns");return void 0===e&&(e=this.ins.filter((function(e){return t.map.waypoints[e]})),this.set("existingIns",e)),e}},{key:"existingOuts",value:function(){var t=this,e=this.get("existingOuts");return void 0===e&&(e=this.outs.filter((function(e){return t.map.waypoints[e]})),this.set("existingOuts",e)),e}},{key:"linkType",value:function(t){var e="linkType-"+t,i=this.get(e);return void 0===i&&(i=null,-1!==this.linkedWpts().indexOf(t)&&(i="in",i=-1!==this.existingOuts().indexOf(t)&&-1!==this.existingIns().indexOf(t)?"bidirectional":-1!==this.existingIns().indexOf(t)&&-1!==this.map.waypoints[t].existingOuts().indexOf(this.index)?"in":-1!==this.existingOuts().indexOf(t)&&-1!==this.map.waypoints[t].existingIns().indexOf(this.index)?"out":-1!==this.existingOuts().indexOf(t)?"reverse-out":"reverse-in"),this.set(e,i)),i}},{key:"isNode",value:function(){var t=this.get("isNode");if(void 0===t){t=!0;var e=this.linkedWpts();2===e.length&&(t=!("in"===this.linkType(e[0])&&"out"===this.linkType(e[1])||"out"===this.linkType(e[0])&&"in"===this.linkType(e[1])||"reverse-out"===this.linkType(e[0])&&"reverse-in"===this.linkType(e[1])||"reverse-in"===this.linkType(e[0])&&"reverse-out"===this.linkType(e[1])||"bidirectional"===this.linkType(e[0])&&"bidirectional"===this.linkType(e[1]))),this.set("isNode",t)}return t}},{key:"linkedWpts",value:function(){var t=this.get("linkedWpts");return void 0===t&&(t=Object(p["a"])(new Set([].concat(Object(p["a"])(this.existingIns()),Object(p["a"])(this.existingOuts()),Object(p["a"])(this.inFromOuts()[this.index])))),this.set("linkedWpts",t)),t}},{key:"paths",value:function(){return this.get("paths",[])}},{key:"addPath",value:function(t){var e=this.get("paths",[]);e.push(t),this.set("paths",e)}}]),t}(),f=function(){function t(e){var i=this;Object(c["a"])(this,t),Object(d["a"])(this,"parser",void 0),Object(d["a"])(this,"cache",void 0),Object(d["a"])(this,"waypoints",void 0),Object(d["a"])(this,"size",void 0),Object(d["a"])(this,"paths",void 0),Object(d["a"])(this,"lastid",void 0),this.parser=e,this.cache={},this.waypoints={},this.lastid=0;for(var n=this.parser.parse(),a=0,s=0;s<n.x.length;s++){Math.abs(n.x[s])>a&&(a=Math.abs(n.x[s])),Math.abs(n.z[s])>a&&(a=Math.abs(n.z[s]));var o=s+1;n.id&&(o=parseInt(n.id[s]));var r=function(t){return t.split(",").map((function(t){return parseInt(t)})).filter((function(t){return t>0}))},l=new h(this,o,parseFloat(n.x[s]),parseFloat(n.y[s]),parseFloat(n.z[s]),r(n.ins[s]),r(n.outs[s]));this.waypoints[o]=l,o>this.lastid&&(this.lastid=o)}var u=2048;a&&(u=2048*Math.pow(2,Math.ceil(Math.log2(Math.ceil(a/1024))))),this.size=u,n.markers.forEach((function(t){i.waypoints[t.index].marker=t})),this.buildPaths()}return Object(u["a"])(t,[{key:"addWaypoint",value:function(t){var e=t.waypoint,i=t.x,a=t.y,s=t.z;if(!e){var o=++this.lastid;e=new h(this,o,parseFloat(i),parseFloat(a),parseFloat(s),[],[])}return n["a"].set(this.waypoints,e.index,e),this.cache["inFromOuts"]&&(this.cache["inFromOuts"][e.index]=[]),e}},{key:"removeWaypoint",value:function(t){n["a"].delete(this.waypoints,t)}},{key:"waypointsArray",value:function(){return Object.entries(this.waypoints).map((function(t){return t[1]}))}},{key:"markers",value:function(){return this.waypointsArray().filter((function(t){return t.marker})).map((function(t){return t.marker.wpt=t,t.marker}))}},{key:"save",value:function(){var t=this.parser.getContentForSave(this.waypointsArray(),this.markers()),e=document.createElement("a");e.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(t)),e.setAttribute("download",this.parser.fileName),e.style.display="none",document.body.appendChild(e),e.click(),document.body.removeChild(e)}},{key:"buildPaths",value:function(){var t=this;if(this.waypointsArray().length){var e=[];this.cache={};var i=[],n=[],a=function(a){-1===n.indexOf(a.index)&&(n.push(a.index),["bidirectional","out","reverse-out"].forEach((function(n){a.linksofType(n).forEach((function(s){if("bidirectional"!==n||-1===i.indexOf(s)){var o=[a],r=t.waypoints[s];if(r){o.push(r);var l=a;while(r&&!r.isNode()&&r.index!==a.index){l=r;var c=r.linkedWpts().filter((function(t){return t!==o.slice(-2,-1)[0].index}))[0];r=t.waypoints[c],r?o.push(r):console.warn("cannot find waypoint #",c)}"bidirectional"===n&&i.push(l.index);var u={index:e.length,bidirectional:"bidirectional"===n,reverse:"reverse-out"===n,wpts:o};o.forEach((function(t){t.addPath(u)})),e.push(u)}else console.warn("cannot find waypoint #",s)}}))})))},s=[];this.waypointsArray().forEach((function(e){if(e.linkedWpts().length&&-1===s.indexOf(e.index)){var i=[],n=null;while(!e.isNode()&&-1===i.indexOf(e.index)){s.push(e.index),i.push(e.index);var o=e.linkedWpts()[0];null!==n&&o===n&&(o=e.linkedWpts()[1]),n=e.index,e=t.waypoints[o]}a(e)}})),this.paths=e}else this.paths=[]}}]),t}();function v(t,e){return m.apply(this,arguments)}function m(){return m=Object(o["a"])(regeneratorRuntime.mark((function t(e,n){var a,s,o,r;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return a={map:null,error:null},s=i("083c").parseStringPromise,t.prev=2,t.next=5,s(e);case 5:o=t.sent,t.next=12;break;case 8:return t.prev=8,t.t0=t["catch"](2),a.error=t.t0,t.abrupt("return",a);case 12:if(!o.AutoDrive){t.next=16;break}return t.next=15,i.e("chunk-7e07bcb6").then(i.bind(null,"6586"));case 15:r=t.sent;case 16:if(!o.routeExport){t.next=20;break}return t.next=19,i.e("chunk-2d0e1d75").then(i.bind(null,"7bc7"));case 19:r=t.sent;case 20:if(r){t.next=23;break}return a.error="File format not recognized",t.abrupt("return",a);case 23:return a.map=new f(new r.default(o,n)),t.abrupt("return",a);case 25:case"end":return t.stop()}}),t,null,[[2,8]])}))),m.apply(this,arguments)}var g,x={name:"LoadRoute",data:function(){return{loading:!1}},props:{cansave:Boolean},methods:{loadingStatus:function(t){t!==this.loading&&(this.loading=t,this.$emit("loading-status",t))},getImage:function(t){if("image/png"===t.target.files[0].type){var e=URL.createObjectURL(t.target.files[0]);e&&this.$emit("map-image-change",e)}},getFile:function(t){var e=this;this.loadingStatus(!0);var i=t.target.files[0],n=new FileReader;n.onload=function(){var t=Object(o["a"])(regeneratorRuntime.mark((function t(n){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return e.loadingStatus(!1),t.t0=e,t.next=4,v(n.target.result,i.name);case 4:t.t1=t.sent,t.t0.$emit.call(t.t0,"map-xml-loaded",t.t1);case 6:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}(),n.readAsText(i)}}},y=x,b=i("2877"),w=Object(b["a"])(y,r,l,!1,null,"4cfcb06d",null),k=w.exports,_=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("svg",{ref:"svgMap",staticClass:"flex flex-grow bg-gray-200",attrs:{id:"svgMap"},on:{mousemove:t.mapMouseMove}},[i("g",{staticClass:"svg-pan-zoom_viewport"},[i("g",{attrs:{"pointer-events":"fill"},on:{mousedown:t.mouseBtn,mouseup:t.mouseBtn,mousemove:t.mouseBtn}},[i("polygon",{staticClass:"mapbounds",attrs:{id:"mapbounds",fill:"transparent",points:t.mapBoundsPoints}}),t.mapImageURL?i("image",{attrs:{x:-t.editor.map.size/2,y:-t.editor.map.size/2,width:t.editor.map.size,height:t.editor.map.size,href:t.mapImageURL}}):t._e()]),i("g",{staticClass:"targets"},t._l(t.editor.map.markers(),(function(e){return i("text",{key:e.index,staticClass:"marker-label",attrs:{"text-anchor":"middle",x:e.wpt.x,y:e.wpt.z-4}},[t._v(" "+t._s(e.name)+" "),e.folder?i("title",{domProps:{textContent:t._s(e.folder)}}):t._e()])})),0),i("g",{staticClass:"paths"},[i("defs",[i("marker",{attrs:{id:"arrow",markerWidth:".5",markerHeight:".5",refX:"-.4",refY:".25",orient:"auto",markerUnits:"strokeWidth"}},[i("path",{attrs:{d:"M0,0 L.5,.25 L0,.5"}})])]),t._l(t.drawnPaths,(function(e,n){return i("g",{key:n},[t.debug?i("title",[t._v("path # "+t._s(n))]):t._e(),i("path",{staticClass:"path",class:e.bidirectional?"bidirectional":e.reverse?"reverse":"unidirectional",attrs:{d:e.d},on:{click:function(i){return t.$emit("path-click",{event:i,path:e.original})}}})])})),t.pathsInEditing?i("g",{staticClass:"editing"},t._l(t.pathsInEditing,(function(t){return i("path",{key:t.sindex,staticClass:"path",attrs:{d:t.d}})})),0):t._e()],2),i("g",{staticClass:"waypoints"},t._l(t.editor.map.waypointsArray(),(function(e){return i("g",{key:e.index},[t.debug||e.marker?i("title",[t._v(" "+t._s(e.marker?(e.marker.folder?e.marker.folder+" / ":"")+e.marker.name+(t.debug?" | ":""):"")+" "+t._s(t.debug?"wpt # "+e.index+" @ "+e.x.toFixed(3)+", "+e.z.toFixed(3)+" ("+e.y.toFixed(3)+")":"")+" ")]):t._e(),i("circle",{class:[e.isNode()?"node":"waypoint",{marker:!!e.marker,draggable:t.wptDragging&&t.wptDragging.dragged&&t.wptDragging.waypoint===e}],attrs:{cx:e.x,cy:e.z,r:e.marker?1.2:e.isNode()?.5:.3},on:{mousedown:function(i){return i.target!==i.currentTarget?null:(i.stopPropagation(),t.wptMouseBtn({event:i,waypoint:e}))},mouseup:function(i){return i.target!==i.currentTarget?null:(i.stopPropagation(),t.wptMouseBtn({event:i,waypoint:e}))},mousemove:function(e){return e.target!==e.currentTarget?null:(e.stopPropagation(),t.mapMouseMove(e))}}})])})),0),i("g",{staticClass:"selection"},[t._l(t.selectedPaths,(function(e,n){return i("path",{key:n,staticClass:"path",attrs:{d:e.d},on:{mouseup:function(e){return t.wptMouseBtn({event:e})}}})})),t._l(t.selectedWpts,(function(e,n){return i("circle",{key:e.index,staticClass:"waypoint",class:{single:1===t.editor.selection.length&&1===t.selectedWpts.length,first:t.editor.selection.length>1&&0===n,last:t.editor.selection.length>1&&n===t.editor.selection.length-1},attrs:{cx:e.x,cy:e.z,r:e.marker?1.4:e.isNode()?.7:.5}})}))],2)])]),i("div",{staticClass:"absolute object-left-top text-xs"},[i("div",{staticClass:"m-2 p-1 bg-gray-200 border border-gray-700 border-solid rounded"},[t.debug?i("div",[t._v(" Segments drawn: "+t._s(t.segments.reduced)+" of "+t._s(t.segments.total)+" ")]):t._e(),t.mouse?i("div",[t._v(" Mouse @ "+t._s(t.mouse.x.toFixed(3))+" "+t._s(t.mouse.y.toFixed(3))+" ")]):t._e(),t.distance?i("div",[t._v("Distance "+t._s(t.distance.toFixed(3)))]):t._e()])])])},O=[],z=(i("a15b"),i("13d5"),i("a434"),i("b680"),i("c1f9"),i("f8f9")),C=i.n(z),P=i("c8b5"),j=i.n(P),M={controlIconsEnabled:!0,dblClickZoomEnabled:!1,zoomScaleSensitivity:.5,minZoom:5e-4,maxZoom:100,customEventsHandler:{haltEventListeners:["touchstart","touchend","touchmove","touchleave","touchcancel"],init:function(t){var e=t.instance,i=1,n=0,a=0;this.hammer=j()(t.svgElement,{inputClass:j.a.SUPPORT_POINTER_EVENTS?j.a.PointerEventInput:j.a.TouchInput}),this.hammer.get("pinch").set({enable:!0}),this.hammer.on("doubletap",(function(){e.zoomIn()})),this.hammer.on("panstart panmove",(function(t){"panstart"===t.type&&(n=0,a=0),e.panBy({x:t.deltaX-n,y:t.deltaY-a}),n=t.deltaX,a=t.deltaY})),this.hammer.on("pinchstart pinchmove",(function(t){"pinchstart"===t.type&&(i=e.getZoom(),e.zoomAtPoint(i*t.scale,{x:t.center.x,y:t.center.y})),e.zoomAtPoint(i*t.scale,{x:t.center.x,y:t.center.y})})),t.svgElement.addEventListener("touchmove",(function(t){t.preventDefault()}))},destroy:function(){this.hammer.destroy()}}},W=function(){function t(e){Object(c["a"])(this,t),Object(d["a"])(this,"svgElement",void 0),this.svgElement=e,g&&g.destroy(),g=C()(this.svgElement,M)}return Object(u["a"])(t,[{key:"getSvgPoint",value:function(t){var e=t.x,i=t.y,n=this.svgElement.createSVGPoint();return n.x=e,n.y=i,n.matrixTransform(document.getElementsByClassName("svg-pan-zoom_viewport")[0].getCTM().inverse())}},{key:"resize",value:function(){g.resize()}}]),t}(),A={name:"Map",data:function(){return{debug:!0,leftclicking:null,mouse:null,wptDragging:!1}},props:{editor:Object,mapImageURL:String},computed:{distance:function(){return 2===this.selectedWpts.length?Math.sqrt(Math.pow(this.selectedWpts[0].x-this.selectedWpts[1].x,2)+Math.pow(this.selectedWpts[0].z-this.selectedWpts[1].z,2)):null},selectedPaths:function(){var t=this;return this.editor.selection.filter((function(t){return t&&t.path})).map((function(e){var i=e.path;return{d:t.pathDef(i.wpts)}}))},selectedWpts:function(){return this.editor.selection.filter((function(t){return t&&t.waypoint})).map((function(t){var e=t.waypoint;return e}))},pathsInEditing:function(){var t=this;return this.wptDragging&&this.wptDragging.dragged&&this.wptDragging.waypoint?this.wptDragging.waypoint.paths().map((function(e,i){return{index:i,d:t.pathDef(e.wpts)}})):null},drawnPaths:function(){var t=this;return this.editor.map.paths.map((function(e){var i=t.reducePath(e.wpts),n=Object.fromEntries(Object.entries(e));return delete n.wpts,n.segments=e.wpts.length-1,n.reducedsegments=i.length-1,n.d=t.pathDef(i),n.original=e,n}))},segments:function(){return this.drawnPaths.reduce((function(t,e){return{total:t.total+e.segments,reduced:t.reduced+e.reducedsegments}}),{total:0,reduced:0})},mapBoundsPoints:function(){return[[-this.editor.map.size/2,-this.editor.map.size/2].join(","),[this.editor.map.size/2,-this.editor.map.size/2].join(","),[this.editor.map.size/2,this.editor.map.size/2].join(","),[-this.editor.map.size/2,this.editor.map.size/2].join(",")].join(" ")}},methods:{pathDef:function(t){return"M"+t.map((function(t){return[t.x,t.z].join(",")})).join(" L")},mapMouseMove:function(t){this.mouse=this.mouseEventMapCoords(t),0===t.button&&this.wptDragging&&(!this.wptDragging.dragged&&Math.pow(t.movementX,2)+Math.pow(t.movementY,2)>9&&(this.wptDragging.dragged=!0),this.wptDragging.dragged&&(this.wptDragging.waypoint.x=+(this.mouse.x-this.wptDragging.offset.x).toFixed(3),this.wptDragging.waypoint.z=+(this.mouse.y-this.wptDragging.offset.y).toFixed(3)))},wptMouseBtn:function(t){var e=t.event,i=t.waypoint;0===e.button&&("mousedown"===e.type&&i&&(this.wptDragging={waypoint:i,offset:{x:this.mouse.x-i.x,y:this.mouse.y-i.z},dragstart:{x:i.x,z:i.z},dragged:!1}),this.wptDragging&&"mouseup"===e.type&&(this.wptDragging.dragged?this.$emit("wpt-dragged",this.wptDragging):i&&this.$emit("wpt-click",{event:e,waypoint:i}),this.wptDragging=!1))},mouseEventMapCoords:function(t){return this.handler.getSvgPoint({x:t.offsetX,y:t.offsetY})},mouseBtn:function(t){0===t.button&&("mousedown"===t.type&&(this.leftclicking=!0),"mousemove"===t.type&&(this.leftclicking=!1),"mouseup"===t.type&&this.leftclicking&&this.$emit("map-click",{event:t,svgpoint:this.mouseEventMapCoords(t)}))},windowResize:function(){this.handler.resize()},reducePath:function(t){function e(t,e,i){var n=e-t.x,a=i-t.z;return Math.sqrt(Math.pow(n,2)+Math.pow(a,2))}function i(t,i,n){var a=n.x-i.x,s=n.z-i.z,o=a*a+s*s;if(0==o)return this.dist(t,i.x,i.z);var r=((t.x-i.x)*a+(t.z-i.z)*s)/o;return r=Math.max(0,Math.min(1,r)),e(t,i.x+r*a,i.z+r*s)}return t.reduce((function(e,n,a){return a<2?(e.push(n),e):(i(t[a-1],e.slice(-2,-1)[0],n)<.15&&e.splice(-1)[0],e.push(n),e)}),[])}},beforeDestroy:function(){window.removeEventListener("resize",this.windowResize)},mounted:function(){this.handler=new W(this.$refs.svgMap),window.addEventListener("resize",this.windowResize)}},E=A,R=(i("9b94"),Object(b["a"])(E,_,O,!1,null,"411302ca",null)),T=R.exports,F=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"border border-gray-400 rounded shadow-md p-2 flex flex-col"},[i("div",{staticClass:"shadow-inner bg-gray-100 rounded flex mb-2",class:{collapsable:t.collapsable},on:{click:function(e){t.collapsable&&(t.collapsed=!t.collapsed)}}},[i("h2",{staticClass:"w-full text-center font-bold uppercase"},[t._t("title"),t.collapsable?[t.collapsed?i("span",[t._v("⇓")]):i("span",[t._v("⇑")])]:t._e()],2)]),i("div",{directives:[{name:"show",rawName:"v-show",value:!t.collapsable||!t.collapsed,expression:"!collapsable || !collapsed"}]},[t._t("default")],2)])},D=[],S={props:{collapsable:{type:Boolean,default:!0}},data:function(){return{collapsed:!1}}},I=S,L=(i("b3b0"),Object(b["a"])(I,F,D,!1,null,"20c030be",null)),K=L.exports;i("c740"),i("38cf");function U(t,e,i){var n={x:i.x-e.x,z:i.z-e.z},a={x:t.x-e.x,z:t.z-e.z},s=n.x*n.x+n.z*n.z,o=a.x*n.x+a.z*n.z,r=Math.min(1,Math.max(0,o/s));if(0!==r&&1!==r)return{x:e.x+n.x*r,z:e.z+n.z*r}}var B=function(){function t(e){Object(c["a"])(this,t),Object(d["a"])(this,"editor",void 0),this.editor=e}return Object(u["a"])(t,[{key:"addWaypoint",value:function(t,e){if(!e){var i=this.editor.map.addWaypoint({x:+t.x.toFixed(3),y:+t.y.toFixed(3),z:+t.z.toFixed(3)});return{action:"addWaypoint",data:i}}return this.editor.map.removeWaypoint(t.index),{action:"addWaypoint",data:{x:t.x,y:t.y,z:t.z}}}},{key:"removeWaypoint",value:function(t,e){return e?(this.editor.map.addWaypoint({waypoint:t}),{action:"removeWaypoint",data:t}):(this.editor.map.removeWaypoint(t.index),{action:"removeWaypoint",data:t})}},{key:"selectionAdd",value:function(t,e){return e?(t=this.editor.selection.pop(),{action:"selectionAdd",data:t}):(this.editor.selection.push(t),{action:"selectionAdd"})}},{key:"selectionReplace",value:function(t){var e={action:"selectionReplace",data:this.editor.selection.slice()};return this.editor.selection=t,e}},{key:"selectionRemoveAtIndex",value:function(t,e){return e?(this.editor.selection.splice(t.index,0,t.item),{action:"selectionRemoveAtIndex",data:t.index}):{action:"selectionRemoveAtIndex",data:{index:t,item:this.editor.selection.splice(t,1)[0]}}}},{key:"movedWaypoint",value:function(t,e){var i=t.waypoint,n=t.dragstart,a=t.dragend;return e?(a={x:i.x,z:i.z},i.x=n.x,i.z=n.z,{action:"movedWaypoint",data:{waypoint:i,dragstart:n,dragend:a}}):(a&&(i.x=a.x,i.z=a.z),{action:"movedWaypoint",data:{waypoint:i,dragstart:n}})}},{key:"alignWpts",value:function(t,e){var i=t.wpts,n=t.movedWpts;if(i&&!e){var a=i[0],s=i.slice(-1)[0],o=[];return i.slice(1,-1).forEach((function(t){var e=U(t,a,s);e&&(o.push({wpt:t,original:{x:t.x,z:t.z}}),t.x=e.x,t.z=e.z)})),o.length?{action:"alignWpts",data:{movedWpts:o}}:void 0}var r=[];return n.forEach((function(t){var e=t.wpt,i=t.original;r.push({wpt:e,original:{x:e.x,z:e.z}}),e.x=i.x,e.z=i.z})),{action:"alignWpts",data:{movedWpts:r}}}},{key:"linkWayPointsToggle",value:function(t){var e=t[0],i=t[1],n=t[2],a=e.linkType(i.index),s=i.linkType(e.index);if(null===a&&null===s)e.outs.push(i.index),n||i.ins.push(e.index);else if("out"===a&&"in"===s||"reverse-out"===a&&"reverse-in"===s){var o=e.outs.indexOf(i.index);-1!==o&&e.outs.splice(o,1);var r=i.ins.indexOf(e.index);-1!==r&&i.ins.splice(r,1)}else if("in"===a&&"out"===s||"reverse-in"===a&&"reverse-out"===s)e.outs.push(i.index),i.ins.push(e.index);else{var l=e.outs.indexOf(i.index);-1!==l&&e.outs.splice(l,1);var c=i.ins.indexOf(e.index);-1!==c&&i.ins.splice(c,1)}return{action:"linkWayPointsToggle",data:t}}},{key:"togglePathLinkType",value:function(t){var e=t.path,i=t.option,n=t.original;if(!n){var a=!1;if(!i)return;if(("oneWay"===i&&e.bidirectional||("twoWay"===i||"switchDirection"===i)&&!e.bidirectional&&!e.reverse||"toggleReverse"===i&&!e.bidirectional)&&(a=!0),!a)return;var s,o=e.wpts.map((function(t){return{wpt:t,ins:t.ins.slice(0),outs:t.outs.slice(0)}}));return e.wpts.forEach((function(t){if(s&&("oneWay"===i&&(s.ins.splice(s.ins.indexOf(t.index),1),t.outs.splice(t.outs.indexOf(s.index),1)),"twoWay"!==i&&"switchDirection"!==i||(s.ins.push(t.index),t.outs.push(s.index)),"switchDirection"===i&&(s.outs.splice(s.outs.indexOf(t.index),1),t.ins.splice(t.ins.indexOf(s.index),1)),"toggleReverse"===i)){var e=t.ins.indexOf(s.index);-1===e?t.ins.push(s.index):t.ins.splice(e,1)}s=t})),{action:"togglePathLinkType",data:{original:o}}}var r=n.map((function(t){var e=t.wpt;return{wpt:e,ins:e.ins.slice(0),outs:e.outs.slice(0)}}));return n.forEach((function(t){t.wpt.ins=t.ins,t.wpt.outs=t.outs})),{action:"togglePathLinkType",data:{original:r}}}}]),t}(),$=function(){function t(e){Object(c["a"])(this,t),Object(d["a"])(this,"executor",void 0),Object(d["a"])(this,"actions",void 0),Object(d["a"])(this,"redoables",void 0),Object(d["a"])(this,"map",void 0),Object(d["a"])(this,"selection",void 0),Object(d["a"])(this,"toolsAvailable",void 0),this.executor=new B(this),this.actions=[],this.redoables=[],this.map=e,this.selection=[],this.toolsAvailable=[]}return Object(u["a"])(t,[{key:"undo",value:function(){var t=this;if(this.actions.length){var e=this.actions.pop();this.redoables.push({rebuildPaths:e.rebuildPaths,label:e.label,actions:e.actions.slice(0).reverse().map((function(e){var i=e.action,n=e.data;return t.executor[i](n,!0)}))}),e.rebuildPaths&&this.mapRebuildPaths(),this.updateAvilableTools()}}},{key:"redo",value:function(){var t=this;if(this.redoables.length){var e=this.redoables.pop();this.actions.push({rebuildPaths:e.rebuildPaths,label:e.label,actions:e.actions.map((function(e){var i=e.action,n=e.data;return t.executor[i](n,!1)}))}),e.rebuildPaths&&this.mapRebuildPaths(),this.updateAvilableTools()}}},{key:"mapRebuildPaths",value:function(){this.selection=this.selection.filter((function(t){var e=t.path;return!e})),this.map.buildPaths()}},{key:"doneaction",value:function(t){return!!t&&(this.actions.push(t),this.redoables=[],t.rebuildPaths&&this.mapRebuildPaths(),this.updateAvilableTools(),!0)}},{key:"updateAvilableTools",value:function(){if(this.toolsAvailable=[],this.selection.length){var t=[],e=[];if(this.selection.forEach((function(i){if(i.waypoint&&e.push(i.waypoint),i.path){t.push(i.path);var n=i.path.wpts.slice(0);i.reverse&&n.reverse(),n.forEach((function(t){e.push(t)}))}})),e.length>2&&this.toolsAvailable.push({icon:"settings_ethernet",label:"Align waypoints",description:"Align "+e.length+" wpts in selection along a line from # "+e[0].index+" to #"+e.slice(-1)[0].index,action:"alignWpts",data:{wpts:e}}),1===t.length&&1===this.selection.length){var i=t[0],n=[];i.bidirectional&&n.push({label:"One way",value:"oneWay",icon:"arrow_right_alt"}),i.bidirectional||(i.reverse||(n.push({label:"Bidirectional",value:"twoWay",icon:"compare_arrows"}),n.push({label:"Opposite direction",value:"switchDirection",icon:"cached"})),n.push({label:(i.reverse?"Forward":"Reverse")+" driving",value:"toggleReverse",icon:"swap_horizontal_circle"}));var a,s="timeline",o="Change all links in path # "+t[0].index+" to ";1===n.length?(s=n[0].icon,o+=n[0].label,a=n[0].value,n=null):o+=" selected type",this.toolsAvailable.push({icon:s,label:"Change path type",description:o,action:"togglePathLinkType",options:n,data:{path:i,option:a},rebuildPaths:!0})}}}},{key:"toolAction",value:function(t,e){var i=t.action,n=t.data,a=t.label,s=t.rebuildPaths;e&&void 0!==e.value&&(n.option=e.value);var o=this.executor[i](n);o&&this.doneaction({label:a,actions:[o],rebuildPaths:s})}},{key:"keyUp",value:function(t){var e,i=this;if("Delete"===t.code&&!t.ctrlKey&&!t.shiftKey&&!t.altKey&&!t.metaKey&&!t.repeat&&this.selection.length){var n=this.selection.slice(0),a=[this.executor.selectionReplace([])];n.forEach((function(t){t&&t.waypoint&&a.push(i.executor.removeWaypoint(t.waypoint))})),e={label:"Remove selected items",actions:a,rebuildPaths:!0}}return this.doneaction(e)}},{key:"wptDragged",value:function(t){var e=t.waypoint,i=t.dragstart;this.doneaction({label:"Move Waypont # "+e.index,actions:[this.executor.movedWaypoint({waypoint:e,dragstart:i})]})}},{key:"mapClick",value:function(t){var e,i=t.event,n=t.svgpoint;if(!this.selection.length||i.ctrlKey||i.shiftKey||i.altKey||i.metaKey||(e={label:"Empty selection",actions:[this.executor.selectionReplace([])]}),i.ctrlKey&&!i.shiftKey&&!i.altKey&&!i.metaKey){var a=this.map.waypointsArray().sort((function(t,e){return Math.sqrt(Math.pow(t.x-n.x,2)+Math.pow(t.z-n.y,2))-Math.sqrt(Math.pow(e.x-n.x,2)+Math.pow(e.z-n.y,2))})).slice(0,2);a=a.length?a.reduce((function(t,e){return t+e.y}),0)/a.length:0,e={label:"Add new Waypoint",actions:[this.executor.addWaypoint({x:+n.x.toFixed(3),y:+a.toFixed(3),z:+n.y.toFixed(3)})]}}this.doneaction(e)}},{key:"mouseReplaceSelectionAction",value:function(t,e){var i,n;if(!(this.selection.length&&t.ctrlKey||t.shiftKey||t.altKey))return e.waypoint?(i="waypoint",n=e.waypoint.index):e.path&&(i="path",n=e.path.index),{label:"Set "+i+" # "+n+" as selection",actions:[this.executor.selectionReplace([e])]}}},{key:"mouseAddToSelectionAction",value:function(t,e){if(this.selection.length&&t.ctrlKey&&!t.shiftKey&&!t.altKey){var i,n,a;e.waypoint?(i="waypoint",n=e.waypoint.index):e.path&&(i="path",n=e.path.index);var s=this.selection.findIndex((function(t){return e.waypoint&&t.waypoint===e.waypoint||e.path&&t.path===e.path}));return a=-1!==s?1===this.selection.length?{label:"Empty selection",actions:[this.executor.selectionReplace([])]}:{label:"Remove "+i+" # "+n+" from selection",actions:[this.executor.selectionRemoveAtIndex(s)]}:{label:"Add "+i+" # "+n+" to selection",actions:[this.executor.selectionAdd(e)]},a}}},{key:"selectionMouseActions",value:function(t,e){var i=this.mouseAddToSelectionAction(t,e);return i||(i=this.mouseReplaceSelectionAction(t,e)),i}},{key:"pathClick",value:function(t){var e=t.event,i=t.path,n={path:i},a=this.selectionMouseActions(e,n);this.doneaction(a)}},{key:"wptClick",value:function(t){var e=t.event,i=t.waypoint,n={waypoint:i},a=this.selectionMouseActions(e,n);if(!a&&1===this.selection.length&&this.selection.slice(0)[0].waypoint&&this.selection.slice(0)[0].waypoint.index!==i.index&&!e.ctrlKey&&e.shiftKey){var s=this.selection.slice(0)[0].waypoint;a={label:"Toggle Link # "+s.index+" -> # "+i.index,actions:[this.executor.linkWayPointsToggle([s,i,e.altKey])],rebuildPaths:!0}}this.doneaction(a)}}]),t}(),N={name:"App",components:{Card:K,LoadRoute:k,Map:T},data:function(){return{editor:null,mapImageURL:null,mapLoading:!1,error:null,defaultMapSizes:{2048:"default",4096:"4x",8192:"8x"}}},computed:{factor:function(){return this.editor&&this.editor.map.size?this.defaultMapSizes[this.editor.map.size]?this.defaultMapSizes[this.editor.map.size]:"custom":null}},mounted:function(){var t=this;window.addEventListener("keyup",(function(e){t.editor&&t.editor.keyUp(e)&&e.preventDefault()}))},methods:{saveMap:function(){var t=this;return Object(o["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(t.editor&&t.editor.map){e.next=2;break}return e.abrupt("return");case 2:t.editor.map.save();case 3:case"end":return e.stop()}}),e)})))()},mapLoaded:function(t){this.error=t.error,t.map&&(this.editor=new $(t.map))},undo:function(){this.editor.undo()},redo:function(){this.editor.redo()},toolAction:function(t,e){this.editor.toolAction(t,e)},mapClick:function(t){var e=t.event,i=t.svgpoint;this.editor.mapClick({event:e,svgpoint:i})},pathClick:function(t){this.editor.pathClick(t)},wptClick:function(t){this.editor.wptClick(t)},wptDragged:function(t){this.editor.wptDragged(t)}}},X=N,q=(i("e4a6"),Object(b["a"])(X,a,s,!1,null,"cd91c5d6",null)),Y=q.exports;i("ba8c");i("d4b8"),i("c789"),n["a"].config.productionTip=!1,new n["a"]({render:function(t){return t(Y)}}).$mount("#app")},"9b94":function(t,e,i){"use strict";var n=i("fc0b"),a=i.n(n);a.a},b3b0:function(t,e,i){"use strict";var n=i("540a"),a=i.n(n);a.a},ba8c:function(t,e,i){},e4a6:function(t,e,i){"use strict";var n=i("17fe"),a=i.n(n);a.a},fc0b:function(t,e,i){}});
//# sourceMappingURL=app.d1b51094.js.map