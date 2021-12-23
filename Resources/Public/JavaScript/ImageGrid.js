const ImageGrid=function(e,t,n,a,l,i=!0){let o=[],r=[],s=null,c="less";const g=function(){let e=[];e=r.slice(0,a||50),d(s,e),s.classList.add("toggled"),c="less"},d=function(e,t){let n="";for(let e=0;e<t.length;++e){let a=t[e],o="";i&&(o='href="'+mahu.getQueryAndFacetLink("*","usecases",a.name)+'"'),n+='<a class="gridItem" tabindex="0" data-name="'+a.name+'" title="'+a.label+'" '+o+'><div class="imageWrap">';let r=(l=a.name,mahu.getImageLinkResolver().getImageURL(l));null!=r&&(n+='<img src="'+r+'" aria-hidden="true"></img>'),n+="</div><span>"+a.label+"</span>",n+="</a>"}var l;let o=!1;if(r.length>a&&("less"==c?(n+='<a class="gridItem toggle" tabindex="0"><span>'+Localization.getString("show all")+"</span></div>",o=!0):t.length>a&&(n+='<a class="gridItem toggle" tabindex="0"><span>'+Localization.getString("show less")+"</span></div>",o=!0)),$(e).html(n),i||$(e).find(".gridItem:not(.toggle)").on("click keyup",function(e){if(e.stopPropagation(),e.preventDefault(),"keyup"==e.type&&13!=e.originalEvent.keyCode)return!0;m(ImageGrid.events.itemSelected,{label:e.currentTarget.getAttribute("data-name")})}),o)$(e).find(".toggle").on("click keyup",function(t){if(t.stopPropagation(),t.preventDefault(),"keyup"==t.type&&13!=t.originalEvent.keyCode)return!0;"less"==c?(d(s,r),s.classList.remove("toggled"),c="all",$(e).find(".toggle").html("<span>"+Localization.getString("show less")+"</span>")):(g(),$(e).find(".toggle").html("<span>"+Localization.getString("show all")+"</span>"))})},u=function(e,t,n){let a=-1;for(let l=0;l<o.length;++l){let i=o[l];if(i.eventName==e&&i.handler==t&&i.scope==n){a=l;break}}return a},m=function(e,t){o.forEach(function(n){if(n.eventName==e)try{n.handler.call(n.scope,t)}catch(e){console.error(e)}})};return{render:function(){$.ajax(mahu.getTermLink(t,"json-all"),{accepts:"text/json",async:!0,contentType:"text/json",dataType:"json",crossDomain:!0}).done(function(a){let i=[];for(let e=0;e<a.terms[t].length;e+=2){let l=a.terms[t][e],o=a.terms[t][e+1];i.push({label:Localization.getString(l),name:l,weight:o,link:decodeURI(mahu.getQueryAndFacetLink("*",n,l))})}if((s=document.createElement("div")).id="imageGridContainer",l){let t=document.createElement("input");t.id="imageGridSearch",t.classList.add("form-control"),t.type="text",t.placeholder=Localization.getString("tagCloud.search"),e.appendChild(t),$(t).autocomplete({source:i,select:function(e,t){let n=t.item.value,a=null;for(let e=0;e<i.length;++e)if(i[e].label==n){a=i[e];break}null!=a&&a.link&&(a.link.href?window.location=a.link.href:window.location=a.link)}})}e.appendChild(s),(r=i).sort(function(e,t){return e.label.toLowerCase()<t.label.toLowerCase()?-1:e.label.toLowerCase()>t.label.toLowerCase()?1:0}),g()})},addListener:function(e,t,n){if(!$.isFunction(t))return!1;return-1==u(e,t,n)&&(o.push({eventName:e,handler:t,scope:n}),!0)},removeListener:function(e,t,n){let a=u(e,t,n);return-1!=a&&(o.splice(a,1),!0)}}};Object.defineProperties(ImageGrid,{events:{value:Object.defineProperties({},{itemSelected:{value:"itemselected",configurable:!1,enumerable:!0,writable:!1}}),writeable:!1,enumerable:!0,configurable:!1}});