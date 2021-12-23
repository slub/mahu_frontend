const MobileMaterialClassSelector=function(e,t=!1,n=!1){let a=[],i=[];const l=mahu.getTaxonomy();let r=null,c=null,s=null;const o=function(e,t){let n=g(e);$(t).append(n).find(".matSelNav").on("click keyup",function(e){if("keyup"==e.type&&13!=e.originalEvent.keyCode)return!0;e.stopPropagation(),e.preventDefault();let t=e.currentTarget.parentElement,n=l.getMaterialClass(t.getAttribute("data-id"));d(n)})},d=function(e){$(c).children().detach(),$(s).children().detach(),f(),r=e;let t=[],n=e;for(;null!=(n=l.getParent(n.id));)l.isRoot(n.id)||t.unshift(n);t.length>0&&t.forEach(function(e){o(e,c)}),l.isRoot(e.id)||o(e,c),e.children&&u(e.children)},u=function(e){s.style="visibility:visible",e.forEach(function(e){o(e,s)})},f=function(){l.getRootIDs().forEach(function(e){o(l.getMaterialClass(e),c)})},h=function(e){let t=0;for(let n=0;n<i.length;n+=2){if(i[n]==e){t=i[n+1];break}}return t},g=function(e){let a=l.getLabel(e.id),i=a,r='<div class="materialClassTag',c=h(e.id);t&&0!=c&&(i+=" ("+c+")");let s=0==c&&n;if(s&&(r+=" disabled"),r+='" ',e.facetValue&&(r+='data-facetValue="'+e.facetValue+'"'),r+='data-id="'+e.id+'">',s)r+="<span>"+i+"</span>";else{let t="";r+='<a class="matName" href="'+(t="Werkstoffe"===e.id?mahu.getQueryLink("*"):mahu.getQueryAndFacetLink("*","category",e.facetValue||e.id))+'" title="'+Localization.getString("matClassSel.goto")+"'"+a+"'\"><span>"+i+"</span></a>"}return e.children&&(r+='<div tabindex="0" class="matSelNav" title="'+Localization.getString("matClassSel.navigate")+" '"+a+'\'"><i class="fas fa-angle-right"></i></div>'),r+="</div>"},m=function(e,t,n){let i=-1;for(let l=0;l<a.length;++l){let r=a[l];if(r.eventName==e&&r.handler==t&&r.scope==n){i=l;break}}return i};return{render:function(){$.ajax(mahu.getTermLink("category_unstemmed","json-all"),{accepts:"text/json",async:!0,contentType:"text/json",dataType:"json",crossDomain:!0}).always(function(t){i=t.terms.category_unstemmed;let n=h("Metalle")+h("Nichtmetalle")+h("Verbundwerkstoffe");i=["Werkstoffe",n].concat(i);let a=h("Keramik")+h("Gläser")+h("Anorganische Bindemittel"),l=h("Kunststoffe"),r=h("Pflanzliche Stoffe")+h("Tierische Stoffe"),o=h("Natürlich")-r;i=["Anorganisch-natürlich",o,"Anorganisch-synthetisch",a,"Organisch-natürlich",r,"Organisch-synthetisch",l].concat(i),(c=document.createElement("div")).classList.add("navContainer"),e.append(c),(s=document.createElement("div")).classList.add("childrenContainer"),s.style="visibility:hidden",e.append(s),f()})},addListener:function(e,t,n){if(!$.isFunction(t))return!1;return-1==m(e,t,n)&&(a.push({eventName:e,handler:t,scope:n}),!0)},removeListener:function(e,t,n){let i=m(e,t,n);return-1!=i&&(a.splice(i,1),!0)}}};Object.defineProperties(MobileMaterialClassSelector,{events:{value:Object.defineProperties({},{itemSelected:{value:"itemselected",configurable:!1,enumerable:!0,writable:!1}}),writeable:!1,enumerable:!0,configurable:!1}});