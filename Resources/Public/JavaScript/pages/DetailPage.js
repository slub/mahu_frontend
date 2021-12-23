class DetailPage extends SearchFormPage{generateEMailTemplate(){let e=$(".contactDetails .mail");if(e.length>0){let t=underlyingQuery;if(!t){let e=sessionStorage.getItem("RELATED_QUERY");if(e){let a=null;try{a=JSON.parse(e)}catch(e){}null!=a&&(t=a)}}if(null==t)return;let a=$("h1#materialName").text().trim(),i=Localization.getString("emailTpl.subject")+a,n=String.format(Localization.getString("emailTpl.body"),a);mahuUtils.queryToString(t).forEach(function(e){n+="\t"+e.propName+" = "+e.propValue+"\n"}),n+=Localization.getString("emailTpl.footer"),e.each(function(e,t){let a=t.getAttribute("href");t.setAttribute("href",a+"?subject="+encodeURIComponent(i)+"&body="+encodeURIComponent(n))})}}initExpanders(){let e=$(".expander"),t=e.length>1;$.each(e,function(e,a){let i=$(a),n=i.siblings(".companyDetail, .companyDetailAddition");i.click(function(e){i.hasClass("fa-chevron-circle-up")?(i.removeClass("fa-chevron-circle-up"),i.addClass("fa-chevron-circle-down")):(i.addClass("fa-chevron-circle-up"),i.removeClass("fa-chevron-circle-down")),n.toggle()}),t&&i.trigger("click")})}gatherMaterialInfo(){let e=$("#appAreasGeneral")[0],t=null;if(e){t=e.innerText.split("; ")}let a=null,i=$("#category a")[0];if(i&&(a=$(i).attr("data-cid"),!mahu.getTaxonomy().getMaterialClass(a)))try{a=$("#category").siblings(".categoryPath").attr("data-cat")}catch(e){}let n=null,r=$(".companyName")[0];r&&(n=r.textContent);let l=void 0,s=$("h1 .alternativeName");s&&s.length>0?l=s[0].textContent.trim():(s=$("#descriptionheader .alternativeName"))&&s.length>0&&(l="("+(l=(l=s[0].textContent.trim()).split(", ")[0])+")");let o="";return{id:o=$("article.detail").prop("id").split("-result-")[1],name:$("#materialName")[0].textContent.trim(),altName:l,imageURL:$("#materialImage").attr("src"),isSymbolicImage:1==$("#materialImage").siblings("p.siOverlay").length,producer:n,category:a,appAreas:t,timestamp:+new Date}}render(){super.render(),this.initExpanders(),this.generateEMailTemplate(),this.initTabs(),this.initDiagrams()}initDiagrams(){if("undefined"!=typeof diagrams&&Array.isArray(diagrams)){let e=diagrams.length;for(let t=0;t<e;++t){let e=diagrams[t],a=$("div#dc"+e.supID),i="<div class='chartArea'><div class='chart' id='dc"+e.supID+"_"+t+"'></div><div><p class='caption'>"+e.caption+"</p></div></div>";a.append(i);let n=$("div#dc"+e.supID+"_"+t,a);"groupedBarChart"==e.type?d3.dsv(";",e.url).then(function(t){let a=Object.assign(t,{y:e.yAxisCaption}),i=a.columns[0],r=a.columns.slice(1),l=30,s=0,o=30,d=40,c=d3.scaleOrdinal().range(["#98abc5","#8a89a6","#7b6888","#6b486b","#a05d56","#d0743c","#ff8c00"]),m=d3.scaleLinear().domain([0,d3.max(a,e=>d3.max(r,t=>e[t]))]).nice().rangeRound([400-o,l]),p=e=>e.attr("transform",`translate(${d},0)`).call(d3.axisLeft(m).ticks(null,"s")).call(e=>e.append("text").attr("x",-d).attr("y",10).attr("fill","currentColor").attr("text-anchor","start").attr("font-weight","bold").text(a.y)),u=d3.scaleBand().domain(a.map(e=>e[i])).rangeRound([d,800-s]).paddingInner(.1),g=d3.scaleBand().domain(r).rangeRound([0,u.bandwidth()]).padding(.05),f=e=>e.attr("transform",`translate(0,${400-o})`).call(d3.axisBottom(u).tickSizeOuter(0)).call(e=>e.select(".domain").remove()),h=function(e){const t=e.attr("transform","translate(800,0)").attr("text-anchor","end").attr("font-family","sans-serif").attr("font-size",10).selectAll("g").data(c.domain().slice().reverse()).join("g").attr("transform",(e,t)=>`translate(0,${20*t})`);t.append("rect").attr("x",-19).attr("width",19).attr("height",19).attr("fill",c),t.append("text").attr("x",-24).attr("y",9.5).attr("dy","0.35em").attr("stroke","white").attr("paint-order","stroke").text(e=>e)},y=function(){const e=d3.create("svg").attr("viewBox",[0,0,800,400]);let t=d3.select("body").append("div").style("position","absolute").style("font-family","'Open Sans', sans-serif").style("font-size","10px").style("z-index","10").style("background-color","white").style("color","black").style("border","solid").style("border-color","white").style("padding","5px").style("border-radius","2px").style("visibility","hidden");return e.append("g").selectAll("g").data(a).join("g").attr("transform",e=>`translate(${u(e[i])},0)`).selectAll("rect").data(e=>r.map(t=>({key:t,value:e[t]}))).join("rect").attr("x",e=>g(e.key)).attr("y",e=>m(e.value)).attr("width",g.bandwidth()).attr("height",e=>m(0)-m(e.value)).attr("fill",e=>c(e.key)).on("mouseover",function(e){t.style("visibility","visible").text(e.value),d3.select(this).attr("fill","lightskyblue")}).on("mousemove",e=>t.style("top",d3.event.pageY+15+"px").style("left",d3.event.pageX+15+"px").text(e.value)).on("mouseout",function(e){t.style("visibility","hidden"),d3.select(this).attr("fill",c(e.key))}),e.append("g").call(f),e.append("g").call(p),e.append("g").call(h),e.node()}();n.append(y)}):"barChart"==e.type?d3.dsv(";",e.url).then(function(t){let a=Object.assign(t,{y:e.yAxisCaption}),i=30,r=0,l=30,s=40,o=a.columns[0],d=a.columns.slice(1),c=d3.scaleLinear().domain([0,d3.max(a,e=>d3.max(d,t=>e[t]))]).nice().range([400-l,i]),m=e=>e.attr("transform",`translate(${s},0)`).call(d3.axisLeft(c).ticks(null,"s")).call(e=>e.append("text").attr("x",-s).attr("y",10).attr("fill","currentColor").attr("text-anchor","start").attr("font-weight","bold").text(a.y)),p=d3.scaleBand().domain(d3.range(a.length)).range([s,800-r]).padding(.1),u=e=>e.attr("transform",`translate(0,${400-l})`).call(d3.axisBottom(p).tickFormat(e=>a[e][o]).tickSizeOuter(0)),g=function(){let e=d3.select("body").append("div").style("position","absolute").style("font-family","'Open Sans', sans-serif").style("font-size","10px").style("z-index","10").style("background-color","white").style("color","black").style("border","solid").style("border-color","white").style("padding","5px").style("border-radius","2px").style("visibility","hidden");const t=d3.create("svg").attr("viewBox",[0,0,800,400]);return t.append("g").attr("fill","#059").selectAll("rect").data(a).join("rect").attr("x",(e,t)=>p(t)).attr("y",e=>c(e[d[0]])).attr("height",e=>c(0)-c(e[d[0]])).attr("width",p.bandwidth()).on("mouseover",function(t){e.style("visibility","visible").text(t[d[0]]),d3.select(this).attr("fill","lightskyblue")}).on("mousemove",t=>e.style("top",d3.event.pageY+15+"px").style("left",d3.event.pageX+15+"px").text(t[d[0]])).on("mouseout",function(t){e.style("visibility","hidden"),d3.select(this).attr("fill","#059")}),t.append("g").call(u),t.append("g").call(m),t.node()}();n.append(g)}):"lineChart"==e.type||console.warn("unsupported chart type")}}}addListeners(){super.addListeners();let e=this;$("#modifierArea").hide(),this.userHistory.isBookmarked(this.gatherMaterialInfo())?($("#bookmark").hide(),$("#removebookmark").show()):($("#bookmark").show(),$("#removebookmark").hide());let t=function(e,t){let a=null,i=null,n=null,r=t/100;return $("#properties .propertiesTable tbody tr").each(function(t,l){$(l).attr("data-mid")===e&&$(l).find("td:nth-of-type(2)").each(function(e,t){let l=$(t).find(".value").text().trim();n=$(t).find(".unit").text().trim();let s=/(\-?\d+.?\d*)\s–\s(\-?\d+.?\d*)/.exec(l);if(null!=s)3==s.length&&(a=mahuUtils.round(s[1]*(1-r),2),i=mahuUtils.round(s[2]*(1+r),2));else{let e=/(<|>)\s(.+)/.exec(l);if(null!=e)3==e.length&&("<"==e[1]?i=e[2]:a=e[2]);else{let e=parseFloat(l);isNaN(e)||(a=mahuUtils.round(e*(1-r),2),i=mahuUtils.round(e*(1+r),2))}}})}),{min:a,max:i,unit:n}};$("#simMaterialsSearch .simMatPropertyTemplate .reqTag .simMaterialsSearchPropSelector").prepend("<option/>");const a=function(){let t=!1;$("#simMatPropertyContainer .reqTag .simMaterialsSearchPropertySelector select").each(function(e,a){t=t||0!=a.selectedIndex}),$(".simMaterialsSearchForm input[type='submit']").attr("disabled",!t);let a=$("#simMatPropertyContainer");!e.getNextFreeRequirementID(a)||a.attr("data-maxreqtags")<=a.find(".reqTag").length?$("#addSimSearchProperty").addClass("disabled"):$("#addSimSearchProperty").removeClass("disabled")},i=function(e){let t=$(".simMaterialsSearchPropSelector",e);t.addClass("chosen-container-multi"),t.chosen(),t.change(function(){a(),o()}),$(".remove",e).on("click keyup",function(t){if("keyup"==t.type&&13!=t.originalEvent.keyCode)return!0;e.remove(),a()});const i=function(){let e=null;return function(t,a){e&&clearTimeout(e),e=setTimeout(t,a)}}();$(".slider-range",e).slider({min:1,max:10,values:[5],slide:function(t,a){$(".slider-value",e).text(a.values[0]+" %"),i(o,200)}})};$("#addSimSearchProperty").on("click keyup",function(t){if("keyup"==t.type&&13!=t.originalEvent.keyCode)return!0;if($(this).blur(),this.classList.contains("disabled"))return!1;let n=e.getNextFreeRequirementID($("#simMatPropertyContainer"));if(null==n)return $("#addSimSearchProperty").addClass("disabled"),!1;let r=$("#simMatPropertyContainer"),l=$("#simMaterialsSearch .simMatPropertyTemplate .reqTag").clone();r.append(l),l.attr("data-genid",n),i(l),a(),t.stopPropagation(),t.preventDefault()});let n=$("#simMaterialsSearch #simMatPropertyContainer .reqTag");if(n.length>0){let e=$(".simMaterialsSearchPropSelector option",n).length;$(".simMaterialsSearchPropSelector option",n)[0].setAttribute("selected",""),$(".simMaterialsSearchPropSelector",n).prepend("<option/>"),i(n),$("#simMatPropertyContainer").attr("data-maxreqtags",e)}a();const r=function(e){let a="",i=$("#simMatPropertyContainer .reqTag");for(let n=0;n<i.length;++n){let r=i[n],l=$(r).attr("data-genid"),s=$(".simMaterialsSearchPropSelector",r)[0].selectedOptions[0].value,o=$(".slider-range",r).slider("values")[0]||5,d=t(s,o),c=e.properties[s];c&&(c.isQualitative?a+='<input id="c'+mahu.getUid()+"-field-genqft"+l+'" data-name="from" type="hidden" name="tx_find_find[q][genqft'+l+'][0]" value="'+d.min+'" ><input id="c'+mahu.getUid()+"-field-genqft"+l+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqft'+l+'][1]" value="'+c.id+'" >':0==c.id.indexOf("temperature")?(null!=d.min&&(a+='<input id="c'+mahu.getUid()+"-field-genqftemp"+l+'-from" data-name="from" type="hidden" name="tx_find_find[q][genqftemp'+l+'][0]" value="'+d.min+'" step="0.1" >'),null!=d.max&&(a+='<input id="c'+mahu.getUid()+"-field-genqftemp"+l+'-to" data-name="to" type="hidden" name="tx_find_find[q][genqftemp'+l+'][1]" value="'+d.max+'" step="0.1" >'),a+='<input id="c'+mahu.getUid()+"-field-genqftemp"+l+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqftemp'+l+'][2]" value="'+c.id+'" >'):c.isDimensionlessQuantity?(null!=d.min&&(a+='<input id="c'+mahu.getUid()+"-field-genqfdq"+l+'-from" data-name="from" type="hidden" name="tx_find_find[q][genqfdq'+l+'][0]" value="'+d.min+'" step="0.1" >'),null!=d.max&&(a+='<input id="c'+mahu.getUid()+"-field-genqfdq"+l+'-to" data-name="to" type="hidden" name="tx_find_find[q][genqfdq'+l+'][1]" value="'+d.max+'" step="0.1" >'),a+='<input id="c'+mahu.getUid()+"-field-genqfdq"+l+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqfdq'+l+'][2]" value="'+c.id+'" >'):(null!=d.min&&(a+='<input id="c'+mahu.getUid()+"-field-genqf"+l+'-from" data-name="from" type="hidden" name="tx_find_find[q][genqf'+l+'][0]" value="'+d.min+'" step="0.1" >'),null!=d.max&&(a+='<input id="c'+mahu.getUid()+"-field-genqf"+l+'-to" data-name="to" type="hidden" name="tx_find_find[q][genqf'+l+'][1]" value="'+d.max+'" step="0.1" >'),null!=d.unit&&(a+='<input id="c'+mahu.getUid()+"-field-genqf"+l+'-unit" data-name="unit" type="hidden" name="tx_find_find[q][genqf'+l+'][2]" value="'+d.unit+'" >'),a+='<input id="c'+mahu.getUid()+"-field-genqf"+l+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqf'+l+'][3]" value="'+c.id+'" >'))}return a};$(".simMaterialsSearchForm input[type='submit']").click(function(t){t.stopPropagation();let a=r(e.schema);$(".simMaterialsSearchForm .dynfields").html(a);let i=$("form.searchForm input.cpp").val();i&&$(".simMaterialsSearchForm").append("<input class='cpp' type='hidden' name='tx_find_find[cpp]' value='"+i+"'>"),t.preventDefault(),t.target.form.submit()});const l=function(){let e={handler:function(e,t){"compare"==e&&mahu.getMaterialSelector().addMaterial(t),"share"==e&&mahuUtils.openEMail({subject:t.name,body:mahu.getDetailPageLink(t.id)})},menuOptions:[{id:"compare",label:Localization.getString("compare"),cssClasses:{icon:"fas fa-exchange-alt smallicon"}},{id:"share",label:Localization.getString("share"),cssClasses:{icon:"fas fa-share-alt smallicon"}}]};$("#similarMaterials .materialPreview").each(function(){let t=$(this),a=t.attr("data-id"),i=t.find(".materialName")[0].textContent,n=t.find(".thumb")[0].src,r=t.find(".materialPreviewText .plain")[0].textContent,l={id:a,name:i,imageURL:n,isSymbolicImage:1==t.find(".thumb").siblings("p.siOverlay").length,producer:r};new ActionsMenu(t,e,l).render()})},o=function(){let t=r(e.schema);if($(".simMaterialsSearchForm .dynfields").html(t),$("#similarMaterials a.materialPreview").length>0){let e=$("#similarMaterials"),t=e.height();e.html('<div style="height:'+t+'px"><i class="fas fa-spinner fa-spin fa-2x"></i></div>')}let a=$("form.searchForm input.cpp").val();a&&$(".simMaterialsSearchForm").append("<input class='cpp' type='hidden' name='tx_find_find[cpp]' value='"+a+"'>");let i=$(".simMaterialsSearchForm")[0];fetch(i.action+"&tx_find_find[data-format]=json&tx_find_find[format]=data&type=1369315139",{method:i.method,body:new FormData(i)}).then(e=>e.json()).then(function(e){let t=mahu.getCurrentPage().gatherMaterialInfo().id,a=-1;for(let i=0;i<e.length;++i){if(e[i].id===t){a=i;break}}-1!=a&&e.splice(a,1);let i="",n=0;if(Array.isArray(e)){n=Math.min(e.length,5);for(let t=0;t<n;++t){let a=e[t],n=a.producer||a.supplier||a.dataDeliverer;if(i+='<a class="materialPreview" tabindex="0" style="position:relative" data-id="'+a.id+'" href="'+mahu.getDetailPageLink(a.id)+'"><div class="thumbWrap" style="position:relative">',a.imageUrl)i+='<img alt="'+Localization.getString("matImage")+'" src="'+a.imageUrl+'" class="thumb" onerror="mahu.handleImageError(arguments[0])">';else{if(Array.isArray(a.category)){let t=a.category[a.category.length-1];mahu.getTaxonomy().getMaterialClass(t)||(t=e[s].category[e[s].category.length-2]),i+='<img alt="'+Localization.getString("placeholder")+'" src="'+mahu.getTaxonomy().getImage(t)+'" class="thumb">'}else i+='<img alt="'+Localization.getString("placeholder")+'" src="/typo3conf/ext/mahu_frontend/Resources/Public/Images/placeholder.png" class="thumb">';i+='<p class="siOverlay">'+Localization.getString("symbolicImage")+"</p>"}i+=`</div>\n\t\t\t\t\t\t\t\t\t<div class="materialPreviewText">\n\t\t\t\t\t\t\t\t\t\t<p class="materialName">${a.name}</p>\n\t\t\t\t\t\t\t\t\t\t<p class="plain">${n}</p>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</a>`}}0==n&&(i="<p style='grid-column:1/-1'><i class='fas fa-exclamation-triangle smallicon'></i>"+Localization.getString("simMaterialsSearch.noresults")+"</p>"),$("#similarMaterials").html(i),l()})};$("#similarMaterials .materialPreview").click(function(e){null==sessionStorage.getItem("RELATED_QUERY")&&sessionStorage.setItem("RELATED_QUERY",JSON.stringify(underlyingQuery))}),new ActionsList($(".detail > div:first-child"),{handler:function(t,a){a=e.gatherMaterialInfo(),"bookmark"==t&&(mahu.getHistory().isBookmarked(a)?mahu.removeBookmark(a):mahu.addBookmark(a)),"compare"==t&&mahu.getMaterialSelector().addMaterial(a),"exportJSON"==t&&mahu.exportJSON(a.id,a.name),"exportRDF"==t&&mahu.exportRDF(a.id,a.name),"share"==t&&mahuUtils.openEMail({subject:a.name,body:window.location}),"print"==t&&window.print()},getActionState:function(e,t){return"bookmark"==e?mahu.getHistory().isBookmarked(t):"compare"==e?mahu.getMaterialSelector().isSelected(t):void 0},menuOptions:[{id:"bookmark",label:Localization.getString("addBookmark"),labelInactive:Localization.getString("removeBookmark"),cssClasses:{base:"fas fa-bookmark smallicon"}},{id:"compare",label:Localization.getString("compare"),cssClasses:{base:"fas fa-exchange-alt smallicon"}},{id:"share",label:Localization.getString("share"),cssClasses:{base:"fas fa-share-alt smallicon"}},{id:"exportJSON",label:Localization.getString("ExportJSON"),cssClasses:{base:"fas fa-download smallicon"}},{id:"exportRDF",label:Localization.getString("ExportRDF"),cssClasses:{base:"fas fa-download smallicon"}},{id:"print",label:Localization.getString("print"),cssClasses:{base:"fa fa-print smallicon"}}],additionalCssClasses:{actionlist:"detailpageActions"}},e.gatherMaterialInfo()).render(),l(),e.tooltips=[],$(".propertyInfo[data-pid]").each(function(t,a){let i=a.getAttribute("data-pid")||a.parentElement.innerText,n=a.getAttribute("data-wid"),r=new WikipediaTooltip(a,i,n);r.render(),e.tooltips.push(r)}),window.onclick=function(t){if(!t.target.classList.contains("propertyInfo"))for(let t=0;t<e.tooltips.length;++t)e.tooltips[t].hide()};let d=$("#category").text().trim(),c=mahu.getTaxonomy().getMaterialClass(d);if(c&&c.externalResources){let e=c.externalResources,t=$(document.createElement("span")).attr({id:"externalCategoryInfo"});for(let a=0;a<e.length;++a){let i=e[a],n=i.name,r=i.uri,l=$(document.createElement("a")).attr({href:r,title:String.format(Localization.getString("detailpage.classInfo"),n),class:"external no-change"}).text(n).prepend('<i class="fas fa-external-link-alt smallicon"></i>');t.append(l)}$("#category").parent().append(t)}let m=$("#materialImageContainer #materialImage.placeholder");if(m.length>0){let e=this.gatherMaterialInfo(),t=mahu.getTaxonomy().getImage(e.category);t!==mahu.getImageLinkResolver().getDefaultImageURL()?m.on("load",function(){m.css("visibility","visible")}).attr("src",t):m.css("visibility","visible")}}handleSchemaQueried(e){this.schema=e,$("#simMaterialsSearch #simMatPropertyContainer .reqTag .simMaterialsSearchPropSelector").change();let t=this;setTimeout(function(){t.userHistory.addPageVisit(t.gatherMaterialInfo())},200)}}