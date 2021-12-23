class ResultsPage extends SearchFormPage{gatherMaterialInfoFromResultLine(e){try{let t=e.find("img").attr("src"),n="",i=e.find(".field-producer, .field-supplier")[0];i&&(n=i.textContent.trim());let a=e.find(".baseInfo h3 a")[0].href,r=e.find(".baseInfo h3 .field-name")[0].textContent.trim(),l=void 0,u=e.find(".baseInfo h3 .alternativeName");u&&u.length>0&&(l=u[0].textContent.trim());let s="";s=e.parent().prop("id").split("-result-")[1];let o=e.parent().attr("data-cat"),c=e.parent().attr("data-mscat"),d=!1;return!o&&!c||t&&-1===t.indexOf(mahu.getImageLinkResolver().getDefaultImageURL())||(-1!==(t=mahu.getTaxonomy().getImage(c)).indexOf(mahu.getImageLinkResolver().getDefaultImageURL())&&(t=mahu.getTaxonomy().getImage(o)),d=!0),{id:s,name:r,category:c||o,altName:l,link:a,imageURL:t,isSymbolicImage:d,producer:n,query:underlyingQuery}}catch(e){console.error(e)}return{}}render(){if(super.render(),0!=$(".noresultsMessage").length){let e=this.getCurrentQuery().q;if(e.default){let t=mahu.getSuggestionLink(e.default);jQuery.getJSON(t,function(t){let n=t.indexOf(e.default);if(-1!==n&&t.splice(n,1),0==t.length)return;let i=`\n\t\t\t\t\t\t<div class="suggestions">\n\t\t\t\t\t\t\t<h3><i class="far fa-lightbulb smallicon"></i> ${Localization.getString("dym")}</h3>\n\t\t\t\t\t\t\t<ul>`;for(let e=0;e<t.length;++e){let n=t[e];i+=`<li><a href="${mahu.getQueryLink(n)}"><q>${n}</q></a></li>`}i+="</ul>\n\t\t\t\t\t\t</div>",$(".results").append(i)})}}}getCurrentQuery(){return underlyingQuery||{}}saveQuery(){this.userHistory&&(mahuUtils.queryIsEmpty(underlyingQuery)||(underlyingQuery.asString=mahuUtils.queryToString(underlyingQuery),underlyingQuery.url=mahuUtils.queryToURL(underlyingQuery),underlyingQuery.timestamp=+new Date,null!=resultCount&&(underlyingQuery.resultCount=resultCount||0),this.userHistory.addQuery(underlyingQuery)))}addListeners(){super.addListeners();const e=function(e,t){let n=e.name+";"+e.producer+";'"+e.link+"'";return t&&Array.isArray(t)&&t.forEach(function(e,t){n+=";"+e}),n+"\n"};let t=this;if($("#saveQuery").on("click keyup",function(e){if("keyup"==e.type&&13!=e.originalEvent.keyCode)return!0;"click"==e.type&&$(this).blur(),t.saveQuery()}),$("#exportResults").on("click keyup",function(n){if("keyup"==n.type&&13!=n.originalEvent.keyCode)return!0;"click"==n.type&&$(this).blur(),function(){let n=["\ufeff"];n.push(Localization.getString("ExportCSV.query")+": "+mahuUtils.queryToURL(underlyingQuery)+"\n"),n.push(Localization.getString("ro.results")+":\n");let i=[];$(".results .flexResultLine").each(function(e,t){$(t).find(".additionalInfo .propertyName").each(function(e,t){i[e]=t.innerText})});let a=Localization.getString("ExportCSV.heading");i.forEach(function(e){a+=";"+e}),a+="\n",n.push(a),$(".results .flexResultLine").each(function(i,a){let r=$(a),l=[];r.find(".additionalInfo .propertyValue").each(function(e,t){l.push(t.innerText)}),n.push(e(t.gatherMaterialInfoFromResultLine(r),l))}),mahuUtils.saveBlobAsFile("results.csv",n)}()}),$("#printResults").on("click keyup",function(e){if("keyup"==e.type&&13!=e.originalEvent.keyCode)return!0;"click"==e.type&&$(this).blur(),window.print()}),$("#configure").on("click keyup",function(e){if("keyup"==e.type&&13!=e.originalEvent.keyCode)return!0;mahuUtils.querySchema().done(function(e){let n=new SettingsDialog(t.userHistory,e.properties);n.render(),n.addListener("change",function(e){if($("form.searchForm input.cpp").remove(),e.cppEnabled){let n=e.selectedProperties;t.userHistory.setSetting("customPreviewProps",n);let i="";for(let e=0;e<n.length;++e)i+=n[e],e!=n.length-1&&(i+=",");let a="<input class='cpp' type='hidden' name='tx_find_find[cpp]' value='"+i+"'>";$("form.searchForm > div:first-of-type").append(a)}else t.userHistory.setSetting("customPreviewProps",void 0);$("form.searchForm")[0].submit()},t)})}),$("#showFacets, .tx_find .facets #closeFacets").click(function(e){$(".facets").toggleClass("open"),$("body").toggleClass("noscroll")}),$(".facet").each(function(e,t){$(t).find(".facetList").children(".hidden").first().addClass("firstHiddenItem")}),mahuUtils.usesPostRequests()){let e=$("form.searchForm")[0];$(".facetList li:not([class~='facetShowAll'])").each(function(t,n){let i=null;$(n).parents("article")[0].classList.forEach(function(e){0==e.indexOf("facet-id-")&&(i=e.substring("facet-id-".length))});let a=$(n).attr("value"),r=n.classList.contains("facetActive"),l=null;r&&((l=document.createElement("input")).value="1",l.type="hidden",l.name="tx_find_find[facet]["+i+"]["+a+"]",l.classList.add("hiddenSelectedFacet"),e.appendChild(l)),$(n).find("a").on("click keyup",function(t){if(t.stopPropagation(),t.preventDefault(),"keyup"==t.type&&13!=t.originalEvent.keyCode)return!0;if(r)e.removeChild(l);else{let t=document.createElement("input");t.value="1",t.type="hidden",t.name="tx_find_find[facet]["+i+"]["+a+"]",e.appendChild(t)}let n=$("input[id$='field-default']")[0];n&&""==n.value&&(n.value="*"),e.submit()})}),$(".facetHistogram-container span[class~='facetActive']").each(function(t,n){let i=null;$(n).parents("article")[0].classList.forEach(function(e){0==e.indexOf("facet-id-")&&(i=e.substring("facet-id-".length))});let a=underlyingQuery.facet[i],r=Object.getOwnPropertyNames(a)[0],l=null;n.classList.contains("facetActive")&&((l=document.createElement("input")).value="1",l.type="hidden",l.name="tx_find_find[facet]["+i+"]["+r+"]",e.appendChild(l)),n.onclick=function(t){t.stopPropagation(),t.preventDefault(),e.removeChild(l),e.submit()}}),$("#nextPage, #previousPage, .listPager li a[class$='internal']").each(function(t,n){n.onclick=function(t){t.stopPropagation(),t.preventDefault();let i=document.createElement("input");i.value=n.getAttribute("data-page"),i.type="hidden",i.name="tx_find_find[page]",e.appendChild(i),e.submit()}}),$("#langSelector #de, #langSelector #en").each(function(t,n){n.onclick=function(t){t.stopPropagation(),t.preventDefault();let i=n.getAttribute("data-langid"),a=document.createElement("input");a.value=i,a.type="hidden",a.name="L",e.appendChild(a),e.submit()}})}$(".resultList .flexResultLine").each(function(e,n){let i=$(n);new ActionsList(i,{handler:function(e,t){"bookmark"==e&&(mahu.getHistory().isBookmarked(t)?mahu.removeBookmark(t):mahu.addBookmark(t)),"compare"==e&&(mahu.getMaterialSelector().isSelected(t)?mahu.getMaterialSelector().removeMaterial(t):mahu.getMaterialSelector().addMaterial(t)),"share"==e&&mahuUtils.openEMail({subject:t.name,body:t.link})},getActionState:function(e,t){return"bookmark"==e?mahu.getHistory().isBookmarked(t):"compare"==e&&mahu.getMaterialSelector().isSelected(t)},menuOptions:[{id:"bookmark",label:Localization.getString("addBookmark"),labelInactive:Localization.getString("removeBookmark"),cssClasses:{base:"fas fa-bookmark smallicon"}},{id:"compare",label:Localization.getString("compare"),cssClasses:{base:"fas fa-exchange-alt smallicon"}},{id:"share",label:Localization.getString("share"),cssClasses:{base:"fas fa-share-alt smallicon"}}],staticMenu:!0,additionalCssClasses:{button:"actionsMenuButton"}},t.gatherMaterialInfoFromResultLine(i)).render()}),$(".explanation a").on("click keyup",function(e){if("keyup"==e.type&&13!=e.originalEvent.keyCode)return!0;"click"==e.type&&$(this).blur(),$(e.delegateTarget).toggleClass("toggled").siblings("span").toggleClass("hidden")})}trackQueries(){if(!this.userHistory)return;if(mahuUtils.queryIsEmpty(underlyingQuery))return;underlyingQuery.asString=mahuUtils.queryToString(underlyingQuery),underlyingQuery.url=mahuUtils.queryToURL(underlyingQuery),underlyingQuery.timestamp=+new Date,null!=resultCount&&(underlyingQuery.resultCount=resultCount||0);let e=this;setTimeout(function(){e.userHistory.addTrackedQuery(underlyingQuery)},200)}handleSchemaQueried(){this.trackQueries()}}