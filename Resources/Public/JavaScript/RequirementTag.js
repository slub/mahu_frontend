const RequirementTag=function(e,t,n=null,i=1){let d={property:null,from:null,to:null,unit:null},a=0;n&&(Object.assign(d,n),a=3);let l=null,r=null,f=[];l=document.createElement("div"),e.append(l);const p=function(){let e="";3==a&&(e="disabled");let n='<div class="reqTag" data-genid='+i+'><div class="propSelect">';if(3!=a){n+='<select class="reqSelector" data-placeholder="'+Localization.getString("selectProperty")+'" '+e+"><option/>";let i=Object.getOwnPropertyNames(t),l=[];for(let e=0;e<i.length;++e){let t=Localization.getString(i[e]);l.push({id:i[e],name:t})}l.sort(function(e,t){return e.name.localeCompare(t.name,Localization.getLanguage(),{sensitivity:"base"})});for(let e=0;e<l.length;++e){let t=l[e];n+='<option data-propID="'+t.id+'"',a>=1&&t.id==d.property.id&&(n+=" selected"),n+=">"+t.name+"</option>"}n+="</select>"}else n+="<p class='propertyName cropText'>"+Localization.getString(d.property.id)+"</p>";n+="<div class='btns'>",3!=a&&(n+='<a tabindex="0" class="add no-change" title="'+Localization.getString("add")+'"><i class="fas fa-check"></i></a>'),3==a&&(n+='<a tabindex="0" class="edit no-change" title="'+Localization.getString("edit")+'"><i class="fas fa-pen"></i></a>'),n+='<a tabindex="0" class="remove no-change" title="'+Localization.getString("remove")+'"><i class="fa fa-times" aria-hidden="true"></i></a>',n+="</div>",n+='</div><div class="reqInner"/>',n+="</div>";let f=$(l);if(f.html(n),0!=a){let t=d.property,n="",l="",r="";0!=a&&(d.from&&(n=d.from),d.to&&(l=d.to),d.unit&&(r=d.unit));let p='<div class="valueSelect">';if(3!=a)if(d.property.isQualitative)p+='<input class="qualitative" id="c'+mahu.getUid()+"-field-genqft"+i+'" data-name="from" type="text" name="tx_find_find[q][genqft'+i+'][0]" value="'+n+'" ><input id="c'+mahu.getUid()+"-field-genqft"+i+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqft'+i+'][1]" value="'+t.id+'" >';else if(0==d.property.id.indexOf("temperature"))p+='<input id="c'+mahu.getUid()+"-field-genqftemp"+i+'-from" '+e+' data-name="from" type="number" name="tx_find_find[q][genqftemp'+i+'][0]" value="'+n+'" step="0.1" > &ndash; <input id="c'+mahu.getUid()+"-field-genqftemp"+i+'-to" '+e+' data-name="to" type="number" name="tx_find_find[q][genqftemp'+i+'][1]" value="'+l+'" step="0.1" > °C<input id="c'+mahu.getUid()+"-field-genqftemp"+i+'-prop" '+e+' data-name="propertyID" type="hidden" name="tx_find_find[q][genqftemp'+i+'][2]" value="'+t.id+'" >';else if(d.property.isDimensionlessQuantity)p+='<input id="c'+mahu.getUid()+"-field-genqfdq"+i+'-from" '+e+' data-name="from" type="number" name="tx_find_find[q][genqfdq'+i+'][0]" value="'+n+'" step="0.1" > &ndash; <input id="c'+mahu.getUid()+"-field-genqfdq"+i+'-to" '+e+' data-name="to" type="number" name="tx_find_find[q][genqfdq'+i+'][1]" value="'+l+'" step="0.1" ><input id="c'+mahu.getUid()+"-field-genqfdq"+i+'-prop" '+e+' data-name="propertyID" type="hidden" name="tx_find_find[q][genqfdq'+i+'][2]" value="'+t.id+'" >';else{let d=!t.units&&!t.defaultUnit;if(p+='<input id="c'+mahu.getUid()+"-field-genqf"+i+'-from" '+e+' data-name="from" type="number" name="tx_find_find[q][genqf'+i+'][0]" value="'+n+'" step="0.1" > &ndash; <input id="c'+mahu.getUid()+"-field-genqf"+i+'-to" '+e+' data-name="to" type="number" name="tx_find_find[q][genqf'+i+'][1]" value="'+l+'" step="0.1" ><input id="c'+mahu.getUid()+"-field-genqf"+i+'-prop" '+e+' data-name="propertyID" type="hidden" name="tx_find_find[q][genqf'+i+'][3]" value="'+t.id+'" ><select class="unitSelector selected" data="c'+mahu.getUid()+"-field-genqf"+i+'-unit" data-name="unit" '+e+(d?' hidden="true"':"")+">",t.units)for(let e=0;e<t.units.length;++e){let n=t.units[e];p+='<option value="'+n+'"',n==r&&(p+=" selected"),p+=">"+n+"</option>"}else t.defaultUnit?p+='<option value="'+t.defaultUnit+'" selected>'+t.defaultUnit+"</option>":p+='<option value="'+t.defaultUnit+'" selected hidden>*</option>';p+='</select><input id="c'+mahu.getUid()+"-field-genqf"+i+'-unit" '+e+' data-name="propertyID" type="hidden" name="tx_find_find[q][genqf'+i+'][2]" value="'+r+'" >'}else{p+="<span>"+o(d)+"</span>",d.property.isQualitative?p+='<input id="c'+mahu.getUid()+"-field-genqft"+i+'" data-name="from" type="hidden" name="tx_find_find[q][genqft'+i+'][0]" value="'+n+'" ><input id="c'+mahu.getUid()+"-field-genqft"+i+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqft'+i+'][1]" value="'+t.id+'" >':0==d.property.id.indexOf("temperature")?p+='<input id="c'+mahu.getUid()+"-field-genqftemp"+i+'-from" data-name="from" type="hidden" name="tx_find_find[q][genqftemp'+i+'][0]" value="'+n+'" step="0.1" ><input id="c'+mahu.getUid()+"-field-genqftemp"+i+'-to" data-name="to" type="hidden" name="tx_find_find[q][genqftemp'+i+'][1]" value="'+l+'" step="0.1" ><input id="c'+mahu.getUid()+"-field-genqftemp"+i+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqftemp'+i+'][2]" value="'+t.id+'" >':d.property.isDimensionlessQuantity?p+='<input id="c'+mahu.getUid()+"-field-genqfdq"+i+'-from" data-name="from" type="hidden" name="tx_find_find[q][genqfdq'+i+'][0]" value="'+n+'" step="0.1" ><input id="c'+mahu.getUid()+"-field-genqfdq"+i+'-to" data-name="to" type="hidden" name="tx_find_find[q][genqfdq'+i+'][1]" value="'+l+'" step="0.1" ><input id="c'+mahu.getUid()+"-field-genqfdq"+i+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqfdq'+i+'][2]" value="'+t.id+'" >':p+='<input id="c'+mahu.getUid()+"-field-genqf"+i+'-from" data-name="from" type="hidden" name="tx_find_find[q][genqf'+i+'][0]" value="'+n+'" step="0.1" ><input id="c'+mahu.getUid()+"-field-genqf"+i+'-to" data-name="to" type="hidden" name="tx_find_find[q][genqf'+i+'][1]" value="'+l+'" step="0.1" ><input id="c'+mahu.getUid()+"-field-genqf"+i+'-unit" data-name="unit" type="hidden" name="tx_find_find[q][genqf'+i+'][2]" value="'+r+'" ><input id="c'+mahu.getUid()+"-field-genqf"+i+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqf'+i+'][3]" value="'+t.id+'" >'}p+="</div>";let c=f.find(".reqInner");if(c.html(p),d.property.isQualitative){let e=d.property.id+"_value",t=mahu.getTermLink(e,"json-all");t&&jQuery.getJSON(t,function(t){let n=[],d=t.terms[e];for(let e=0;e<d.length;e+=2)n.push(d[e]);$("#c"+mahu.getUid()+"-field-genqft"+i,f).autocomplete({source:n,minLength:0}).focus(function(e){if(""!=e.target.value)return;let t=$.Event("keydown");t.key=40,$(e.target).trigger(t)})})}let s=function(e){let t=e.target.value,n=e.target.attributes["data-name"].value;d[n]=t,d.from||d.to?u(2):1!=a&&u(1)};c.find(".valueSelect input").change(s);let m=c.find(".valueSelect .unitSelector"),g=m.is(":hidden")?d.property.defaultUnit||"*":m.val();$("#"+m.attr("data")).val(g),d.unit=g,m.change(function(e){let t=$(e.target);return $("#"+t.attr("data")).val(t.val()),d.unit=t.val(),!1})}f.find(".edit").on("click keyup",function(e){if("keyup"!==e.type||13==e.keyCode)return u(4),!1});let p=f.find(".add");p.on("click keyup",function(e){if("keyup"!==e.type||13==e.keyCode)return 0==a&&(f.find(".propSelect .chosen-container .chosen-single").css("border","1px solid #d8000d"),"click"==e.type&&p.blur()),1==a&&(d.from||f.find(".reqInner .valueSelect input[id$='-from']").css("border","1px solid #d8000d"),d.to||f.find(".reqInner .valueSelect input[id$='-to']").css("border","1px solid #d8000d"),"click"==e.type&&p.blur()),2==a&&(d.from&&(d.from=d.from.replace(",",".")),d.to&&(d.to=d.to.replace(",",".")),u(3),g("created")),4==a&&(u(3),g("created")),!1}),f.find(".remove").on("click keyup",function(e){if("keyup"===e.type&&13!=e.keyCode)return;let t=a>2;return u(-1),t&&g("removed"),!1}),3!=a&&4!=a||(r=c());let m=f.find(".propSelect select");m.chosen({allow_single_deselect:!0,search_contains:!0}),m.change(function(e,t){let n=e.currentTarget.selectedOptions[0];if(!n)return;let i=n.getAttribute("data-propID"),l=h(i);l&&(0!=a&&(d.from="",d.to="",d.unit="",s(),r=null),d.property=l,d.unit=null,u(1))})},o=function(e){let t=e.from,n=e.to,i=e.unit;return e.property.isQualitative?"= "+t:(i||(i=e.property.defaultUnit||""),"*"===i&&(i=""),t&&n?t+"&nbsp;"+i+"&nbsp;&ndash;&nbsp;"+n+"&nbsp;"+i:t&&!n?">= "+t+"&nbsp;"+i:!t&&n?"<= "+n+"&nbsp;"+i:"")},u=function(e){let t=a;if(-1==(a=e))return s(),void m();3==a&&(r=c()),2==a&&$(l).find(".btns .add").removeClass("disabled"),1==a&&(t>1?($(l).find(".btns .add").addClass("disabled"),p()):p()),3!=a&&4!=a||p()},c=function(){let e=$("#modifierForm");if(0==e.length)return;let t=$(l);if(null==r){let n=t.find("input[id*='field']").clone();return n.each(function(e,t){let n=t.getAttribute("id"),i=$("#"+n)[0],d="checkbox"==i.type;t.setAttribute("id",n+"_clone"),d?(t.checked=i.checked,$(t).css("visibility","hidden").css("float","right")):t.setAttribute("type","hidden"),$("#"+n).change(function(e){return d?t.checked=e.target.checked:t.value=e.target.value,!1})}),e.append(n),n}return r.each(function(e,t){let n=t.getAttribute("id").replace("_clone",""),i="checkbox"==$("#"+n)[0].type;$("#"+n).change(function(e){return i?t.checked=e.target.checked:t.value=e.target.value,!1})}),r},s=function(){r&&r.remove()},m=function(){e.removeChild(l),l=null,d=null,r=null,g("disposed")},g=function(e){for(let t=0;t<f.length;++t){let n=f[t];if(n.type==e)try{n.handler.call(n.scope,q)}catch(e){console.error(e)}}},h=function(e){return t[e]};let q={render:p,addDisposeListener:function(e,t){f.push({handler:e,scope:t,type:"disposed"})},addCreatedListener:function(e,t){f.push({handler:e,scope:t,type:"created"})},addRemovedListener:function(e,t){f.push({handler:e,scope:t,type:"removed"})},getPropertyID:function(){return d.property?d.property.id:null},edit:function(){u(4)}};return q};