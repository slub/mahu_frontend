const Wizard=function(e){let n=[],t=null,l=null,a=null,s=null;const o=function(e){let t=!1;for(let l=0;l<n.length;++l){let a=n[l];if(e.id==a.id&&e.type==a.type&&e.value==a.value){t=!0;break}}t||n.push(e)},i=function(){let e="name_unstemmed";(function(e){return $.ajax(mahu.getTermLink(e,"json-all"),{accepts:"text/json",async:!0,contentType:"text/json",dataType:"json",crossDomain:!0})})(e).done(function(n){let t=[];for(let l=0;l<n.terms[e].length;l+=2){let a=n.terms[e][l];n.terms[e][l+1];t.push({label:a,value:a})}$("#matNameSearchField").autocomplete({source:t,select:function(e,n){let l=n.item.value,a=null;for(let e=0;e<t.length;++e)if(t[e].label==l){a=t[e];break}null!=a&&console.info(a)}})}),new ResearchOverview(a,5,{queries:!1,savedQueries:!1}).render()};return{render:function(){let n=$(e);t=n.find("#chooseClasses")[0],l=n.find("#chooseAppAreas")[0],a=n.find("#chooseSimMat")[0],s=n.find("#defineReqs")[0],function(){let e=new MaterialClassSelector(t,!0);e.render(),e.addListener(MaterialClassSelector.events.itemSelected,function(e){console.info(e),o({type:"facet",id:"category",value:e.facetValue||e.id})})}(),function(){let e=new ImageGrid(l,"applicationAreaGeneral","usecases",30,!0);e.render(),e.addListener(ImageGrid.events.itemSelected,function(e){console.info(e),o({type:"facet",id:"usecases",value:e.label})})}(),i()}}};