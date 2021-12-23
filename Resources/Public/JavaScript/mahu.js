"use strict";window.underlyingQuery||(window.underlyingQuery=null),window.resultCount||(window.resultCount=null),window.currentPage||(window.currentPage=null),window.mahuCfg||(window.mahuCfg=null);const mahu=function(){let e={},t=null,n=null,i=null,a=null;let r=null;const o=function(){let e=$("#resetQuery");e&&underlyingQuery&&!l()&&(mahuUtils.queryIsEmpty(underlyingQuery)||e.show())},l=function(){return"DetailPage"===currentPage},d=function(){return"ResultsPage"===currentPage},u=function(e,t){if(t){let e=t.lastIndexOf("?");t=t.substring(e)}else t=window.location.search;let n=t.substring(1).split("&"),i=encodeURI(e),a=n.length;for(var r=0;r<a;++r){var o=n[r].split("=");if((o[0]==e||o[0]==i)&&o[1].length>0)return o[1]}},c=function(){let t=null;l()&&(t=new DetailPage(n)),d()&&(t=function(){let e=u("tx_find_find[group]",window.location.search);if(void 0!==e)return"1"==e;let t=$("input[id$='groupingSelector']");return!(!t||1!=t.length)&&t[0].checked}()?new GroupedResultsPage(n):new ResultsPage(n));let i={};return void 0!=currentPage&&e.pageConfig[currentPage]&&(i=e.pageConfig[currentPage]),"LandingPage"===currentPage&&(t=new LandingPage(n,i)),"FAQPage"===currentPage&&(t=new FAQPage(n,i)),"WizardPage"===currentPage&&(t=new WizardPage(n,i)),"MaterialEditorPage"===currentPage&&(t=new MaterialEditorPage(n,i)),"PreviewPage"===currentPage&&(t=new PreviewPage(n,i)),"MaterialListPage"===currentPage&&(t=new MaterialListPage(n,i)),"SupplementEditorPage"===currentPage&&(t=new SupplementEditorPage(n,i)),null==t&&(t=new AbstractPage(n,i)),t};return{init:function(i){Object.assign(e,i),mahuCfg&&Object.assign(e,mahuCfg),n=new history(e.userName||""),i.enableHistory&&n.enable(),-1==e.materialSearchPageURL.indexOf("?")?(e.termLinkTemplate=e.materialSearchPageURL+"?tx_find_find[data-format]=DATAFORMAT&tx_find_find[field]=FIELD&tx_find_find[controller]=Search&tx_find_find[action]=term&type=1369315139",e.rdfDataLinkTemplate=e.materialSearchPageURL+"?tx_find_find[data-format]=rdf&tx_find_find[controller]=Search&tx_find_find[id]=MATERIALID&tx_find_find[format]=data&type=1369315140",e.jsonDataLinkTemplate=e.materialSearchPageURL+"?tx_find_find[data-format]=json&tx_find_find[controller]=Search&tx_find_find[id]=MATERIALID&tx_find_find[format]=data&type=1369315139",e.suggestLinkTemplate=e.materialSearchPageURL+"?tx_find_find[q]=QUERY&tx_find_find[controller]=Search&tx_find_find[dictionary]=default&tx_find_find[format]=data&tx_find_find[action]=suggest&type=1369315139"):(e.termLinkTemplate=e.materialSearchPageURL+"&tx_find_find[data-format]=DATAFORMAT&tx_find_find[field]=FIELD&tx_find_find[controller]=Search&tx_find_find[action]=term&type=1369315139",e.rdfDataLinkTemplate=e.materialSearchPageURL+"&tx_find_find[data-format]=rdf&tx_find_find[controller]=Search&tx_find_find[id]=MATERIALID&tx_find_find[format]=data&type=1369315140",e.jsonDataLinkTemplate=e.materialSearchPageURL+"&tx_find_find[data-format]=json&tx_find_find[controller]=Search&tx_find_find[id]=MATERIALID&tx_find_find[format]=data&type=1369315139",e.suggestLinkTemplate=e.materialSearchPageURL+"&tx_find_find[q]=QUERY&tx_find_find[controller]=Search&tx_find_find[dictionary]=default&tx_find_find[format]=data&tx_find_find[action]=suggest&type=1369315139"),function(){if(e.keepFacets&&underlyingQuery&&underlyingQuery.facet){let e=Object.getOwnPropertyNames(underlyingQuery.facet);for(let t=0;t<e.length;++t){let n=e[t],i=underlyingQuery.facet[n],a=Object.getOwnPropertyNames(i),r=a.length;for(let e=0;e<r;++e){let t=a[e].toString(),i=document.createElement("input");i.setAttribute("name","tx_find_find[facet]["+n+"]["+t+"]"),i.setAttribute("value","1"),i.setAttribute("type","hidden"),i.setAttribute("class","selectedFacetField"),$("#modifierForm").append(i)}}}let t=$(".formFields input[id*='field']").clone();t.each(function(e,t){let n=t.getAttribute("id"),i=$("#"+n)[0],a="checkbox"==i.type;t.setAttribute("id",n+"_clone"),a?(t.checked=i.checked,$(t).css("visibility","hidden").css("float","right")):t.setAttribute("type","hidden"),$("#"+n).change(function(e){return a?t.checked=e.target.checked:t.value=e.target.value,!1})});let i=$("#modifierForm select[id*='sortSelect'], #modifierForm select[id*='resultCountSelect'], #modifierForm input[id*='groupingSelector']").clone();i.each(function(e,t){let n=t.getAttribute("id"),i=$("#"+n)[0],a="checkbox"==i.type||"select"==i.localName;t.setAttribute("id",n+"_clone"),a?(t.checked=i.checked,$(t).css("visibility","hidden").css("display","none")):t.setAttribute("type","hidden"),$("#"+n).change(function(e){return a?t.checked=e.target.checked:t.value=e.target.value,!1})}),$("#modifierForm").append(t),$(".searchForm > div:first-Child").append(i);let a={};$(".formFields input").each(function(e,t){let n=new RegExp("c"+mahu.getUid()+"-field-(.+)-(from|to|unit)").exec(t.id);if(n&&n.length>2){let e=n[1];a[e]||(a[e]={}),a[e][n[2]]=t}});let r=Object.getOwnPropertyNames(a),l=r.length;for(let e=0;e<l;++e){let t=a[r[e]],n=function(){t.from.value||t.to.value?t.unit.value||$("#"+t.from.id+" ~ button[class~='selected'][data='"+t.unit.id+"']").click():t.unit.value=""};t.from.onchange=t.to.onchange=t.from.onkeyup=t.to.onkeyup=n;let i=$("#"+t.from.id+" ~ button[class~='unitSelector']"),o=i.length;for(let e=0;e<o;++e){let n=$(i[e]);n.click(function(e){n.addClass("selected"),(t.from.value||t.to.value)&&$("#"+n.attr("data")).val(n.text());for(let t=0;t<o;++t){let n=i[t];n!=e.target&&$(n).removeClass("selected")}return!1})}let l=$("#"+t.from.id+" ~ select[class~='unitSelector']"),d=l.length;for(let e=0;e<d;++e){let n=$(l[e]);n.click(function(e){return(t.from.value||t.to.value)&&$("#"+n.attr("data")).val(n.val()),!1})}}n.addListener(history.entryTypes.BOOKMARK,history.eventTypes.ALL,o,this)}(),o(),l()||sessionStorage.removeItem("RELATED_QUERY"),n.addListener(history.entryTypes.ALL,history.eventTypes.ALL,function(e,t,n){if(history.eventTypes.ADD==n&&history.entryTypes.BOOKMARK!=e&&history.entryTypes.QUERY!=e)return;if(history.eventTypes.ERROR==n)return;let i="";history.entryTypes.BOOKMARK==e&&(i+=Localization.getString("history.types.bookmark")),history.entryTypes.PAGEVISIT==e&&(i+=Localization.getString("history.types.pagevisit")),history.entryTypes.QUERY!=e&&history.entryTypes.TRACKEDQUERY!=e||(i+=Localization.getString("history.types.query")),history.entryTypes.ALL==e&&(i+=Localization.getString("history.types.all")),i+=" "+Localization.getString(history.eventTypes.ADD==n?"history.notification.added":"history.notification.removed"),$.notify({message:i,icon:"glyphicon glyphicon-info-sign"},{type:"info",delay:3e3,allow_dismiss:!1,animate:{enter:"animated fadeInRight",exit:"animated fadeOutRight"}})}),n.addListener(history.entryTypes.ALL,history.eventTypes.ERROR,function(e,t,n){$.notify({message:t,icon:"glyphicon glyphicon-alert"},{type:"info",delay:5e3,allow_dismiss:!1,animate:{enter:"animated fadeInRight",exit:"animated fadeOutRight"}})}),(t=c()).render(),t.addListeners(),mahuUtils.querySchema().always(function(e){t.handleSchemaQueried(e)})},logout:function(){null!=r&&r.clear()},exportJSON:function(e,t){mahuUtils.queryMaterialDescription(e).done(function(e){mahuUtils.saveBlobAsFile(t+".json",[JSON.stringify(e)])})},exportRDF:function(e,t){mahuUtils.queryMaterialDescriptionRDF(e,!0).done(function(e){mahuUtils.saveBlobAsFile(t+".rdf",[e])})},getTaxonomy:function(){return null==i&&(i=new MaterialTaxonomy),i},addBookmark:function(e){n&&n.addBookmark(e)},removeBookmark:function(e){n&&n.removeBookmark(e)},removeVisitedPage:function(e){n&&n.removePageVisit(e)},getHistory:function(){return n},enableHistory:function(){n.enable()},getMaterialSelector:function(){return null==r&&(r=new MaterialSelector),r},getImageRootPath:function(){return e.imgRootPath},getLandingPageURL:function(){return e.landingPageURL},getMaterialSearchPageURL:function(){return e.materialSearchPageURL},getRegistrationPageURL:function(){return e.registrationPageURL},getLoginPageURL:function(){return e.loginPageURL},getProfilePageURL:function(){return e.profilePageURL},getImageLinkResolver:function(){return null==a&&(a=new ImageLinkResolver),a},getPageUid:function(){return e.pageUid},isResultsPage:d,isDetailPage:l,getUid:function(){return e.uid},getLanguageID:function(){return e.languageID},getUserName:function(){return e.userName||""},getUserNameExtended:function(){return e.userNameExt||""},getKeepFacets:function(){return e.keepFacets||!1},getLanguageLinks:function(){return e.languageLinks},handleImageError:function(e,t,n){$(document).ready(function(){let i=null;if(t||n){-1!==(i=mahu.getTaxonomy().getImage(n)).indexOf(mahu.getImageLinkResolver().getDefaultImageURL())&&(i=mahu.getTaxonomy().getImage(t));let a="<p class='siOverlay'>"+Localization.getString("symbolicImage")+"</p>";$(e.target).parent().append(a)}else i="/typo3conf/ext/mahu_frontend/Resources/Public/Images/placeholder.png";e.target.src=i})},getDetailPageLink:function(t,n=!1){let i=e.detailPageLinkTemplate.replace("VALUE",encodeURIComponent(t));if(n){let e=window.location.protocol+"//"+window.location.host;i.startsWith(e)||(i=e+i)}return i},getQueryLink:function(t){return e.queryLinkTemplate.replace("VALUE",encodeURIComponent(t))},getQueryAndFacetLink:function(t,n,i){return e.queryAndFacetLinkTemplate.replace("QUERY",encodeURIComponent(t)).replace("FACET",encodeURIComponent(n)).replace("FACETVALUE",encodeURIComponent(i))},getTermLink:function(t,n){return e.termLinkTemplate.replace("FIELD",encodeURIComponent(t)).replace("DATAFORMAT",encodeURIComponent(n))},getRDFExportLinkTemplate:function(t){return e.rdfDataLinkTemplate.replace("MATERIALID",encodeURIComponent(t))},getJSONExportLinkTemplate:function(t){return e.jsonDataLinkTemplate.replace("MATERIALID",encodeURIComponent(t))},getSuggestionLink:function(t){return e.suggestLinkTemplate.replace("QUERY",encodeURIComponent(t))},getCurrentPage:function(){return t}}}();