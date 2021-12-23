const MaterialSelector=function(){let e=[],t=null,i="materialSelectorContainer",n=[];const a=function(){sessionStorage.setItem("MaHu-selectedMaterials",JSON.stringify(e))},l=function(n){let a="",l=Localization.getString("matSel.clickToRemove");for(let t=0;t<e.length;++t){let i=e[t];a+='<div style="position:relative;" class="materialPreview" data-id="'+i.id+'" ><div><a tabindex="0" class="actionsMenuButton" title="'+l+" '"+i.name+'\'"><i class="fas fa-times" aria-hidden="true"></i></a></div><div class="thumbWrap" style="position:relative"><img src="'+i.imageURL+'" class="thumb"></img>',i.isSymbolicImage&&(a+='<p class="siOverlay">'+Localization.getString("symbolicImage")+"</p>"),a+='</div><div class="materialPreviewText"><p class="materialName">'+i.name,i.altName&&(a+="<span class='alternativeName'>"+i.altName+"</span>"),a+='</p><p class="plain">'+i.producer+"</p></div></div>"}e.length<2&&(a+='<div><i class="fas fa-exclamation-triangle smallicon"></i>'+Localization.getString("matSel.select")+"</div>"),$("#"+i+"contentLine").html(a),$("#countIndicator").text(e.length);let o=$(t),d=o.find("#compare");e.length>=2?d[0].disabled=!1:d[0].disabled=!0,d=o.find("#comparePlot"),e.length>=2?d[0].disabled=!1:d[0].disabled=!0;let u=function(e){let t=$(e.target).parents(".materialPreview").attr("data-id");r(t)};$("#materialSelectorContainer .materialPreview .actionsMenuButton").click(u).keyup(function(e){if(13!=e.originalEvent.keyCode)return!0;u(e)}),0==e.length?s():c(n)},o=function(e){f()||u()},r=function(t){let i=-1;if(e.forEach(function(e,n){t==e.id&&(i=n)}),-1!=i){let t=e[i];e.splice(i,1),l(f()),a(),y(t,MaterialSelector.eventTypes.MATERIALREMOVED)}},c=function(e){t.style.visibility="visible",e&&u(),window.addEventListener("click",o)},s=function(){t.style.visibility="hidden",window.removeEventListener("click",o)},d=function(e){let t=$("#materialSelectorContainer #materialSelectorContainercontent"),i=$("#materialSelectorContainer #materialSelectorContainerminMaxBtn i")[0];i&&(e?$(i).addClass("fa-chevron-circle-up").removeClass("fa-chevron-circle-down"):$(i).addClass("fa-chevron-circle-down").removeClass("fa-chevron-circle-up")),e?t.hide():t.show()},u=function(){d(!0)},m=function(){d(!1)},f=function(){return"none"==$("#materialSelectorContainer #materialSelectorContainercontent").css("display")},p=function(){e.length=0,a(),l(!0)},g=function(e,t){let i=document.createElement("div");i.innerHTML='<i class="fas fa-spinner fa-pulse fa-5x fa-fw"></i><span class="sr-only">'+Localization.getString("matSel.loading")+"</span>",i.className="loadingIndicator",document.body.appendChild(i),v(0,e,[],function(){document.body.removeChild(i),p(),s()},t)},v=function(e,t,i,n,a){if(e==t.length)mahuUtils.querySchema().done(function(e){let t=null;(t=a?new CompareViewPlot(i,e):new CompareView(i,e)).render(),t.addListener(CompareView.eventTypes.CLOSED,function(){y(null,MaterialSelector.eventTypes.CLOSED)},this)}).always(n);else{const l=t;mahuUtils.queryMaterialDescription(t[e].id).done(function(o){let r=o[0];r.imageURL||(r.imageURL=t[e].imageURL,t[e].isSymbolicImage&&(r.isSymbolicImage=!0)),r.altName=t[e].altName,r.query=t[e].query,i.push(r),v(e+1,l,i,n,a)}).fail(n)}},b=function(e,t,i){let a=-1;for(let l=0;l<n.length;++l){let o=n[l];if(o.eventType==e&&o.handler==t&&o.scope==i){a=l;break}}return a},y=function(e,t){n.forEach(function(i){if(i.eventType&&i.eventType==t||i.eventType==MaterialSelector.eventTypes.ALL||!i.eventType)try{i.handler.call(i.scope,e,t)}catch(e){console.error(e)}})};return function(){{let t=sessionStorage.getItem("MaHu-selectedMaterials");if(t)try{let i=JSON.parse(t);Array.isArray(i)&&(e=i)}catch(e){console.error(e)}}(t=document.createElement("div")).id=i,document.body.append(t);let n='<div id="matSelHeader"><h3>'+Localization.getString("matSel.heading")+'<p style="font-size:initial;margin:0 0 0 10px;display:inline">(<span id="countIndicator">0</span> Materialien ausgewählt)</p></h3><a id="'+i+'minMaxBtn" tabindex="0" title="'+Localization.getString("close")+'"><i class="fas fa-chevron-circle-down" aria-hidden="true"></i></a></div><div id="'+i+'content"><div class="flexResultLine" id="'+i+'contentLine"></div><div class="buttonbar"><button id="compare" type="button" class="btn btn-primary" disabled><i class="fas fa-table smallicon"></i>'+Localization.getString("matSel.compare")+'</button><button id="comparePlot" type="button" class="btn btn-primary" disabled><i class="fas fa-chart-area smallicon"></i>'+Localization.getString("matSel.comparePlot")+'</button><button id="abort" type="button" class="btn btn-primary">'+Localization.getString("matSel.abort")+"</button></div></div>",a=$(t);a.html(n),a.find("#abort").click(function(){p(),s(),y(null,CompareView.eventTypes.CLOSED)}),a.click(function(e){e.stopPropagation()}),a.mouseleave(function(e){u()}),a.mouseenter(function(e){m()}),a.find("#matSelHeader").click(function(e){f()?m():u(),a.find("#"+i+"minMaxBtn").blur(),e.stopPropagation()}).keyup(function(e){if(13!=e.originalEvent.keyCode)return!0;f()?m():u(),e.stopPropagation()}),a.find("#compare").click(function(){g(e,!1)}),a.find("#comparePlot").click(function(){g(e,!0)})}(),{render:l,addMaterial:function(t){let i=!1;e.forEach(function(e){t.id==e.id&&(i=!0)}),1!=i&&(e.length<7?(e.push(t),l(!0),y(t,MaterialSelector.eventTypes.MATERIALADDED)):$.notify({message:String.format(Localization.getString("matSel.maxSel"),7),icon:"glyphicon glyphicon-warning-sign"},{type:"info",delay:3e3,allow_dismiss:!1,animate:{enter:"animated fadeInRight",exit:"animated fadeOutRight"}})),a(),$("#countIndicator").text(e.length)},removeMaterial:function(e){e&&r(e.id)},addListener:function(e,t,i){if(!$.isFunction(t))return!1;return-1==b(e,t,i)&&(n.push({eventType:e,handler:t,scope:i}),!0)},removeListener:function(e,t,i){let a=b(e,t,i);return-1!=a&&(n.splice(a,1),!0)},isSelected:function(t){let i=!1;return e.forEach(function(e){t.id==e.id&&(i=!0)}),i},clear:p,show:c,hide:s}};Object.defineProperties(MaterialSelector,{eventTypes:{value:Object.defineProperties({},{MATERIALADDED:{value:"add",configurable:!1,enumerable:!0,writable:!1},MATERIALREMOVED:{value:"remove",configurable:!1,enumerable:!0,writable:!1},CLOSED:{value:"remove",configurable:!1,enumerable:!0,writable:!1},ALL:{value:"all",configurable:!1,enumerable:!0,writable:!1}}),writeable:!1,enumerable:!0,configurable:!1}});