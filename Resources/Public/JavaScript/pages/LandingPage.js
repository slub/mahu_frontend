class LandingPage extends SearchFormPage{constructor(e,s){super(e,s)}render(){super.render(),new UserMaterialClasses($("#userMaterialClasses")[0]).render();let e=document.createElement("div");e.style="background-color:whitesmoke;",$(e).hide();let s=document.createElement("div");$(s).hide();let a=document.getElementById("materialClassification");a.append(e),a.append(s);let i=this.pageConfig.showCountInTaxonomy||!1,t=this.pageConfig.disableEmptyClasses||!1;new MaterialClassSelector(e,i,!0,t).render(),new MobileMaterialClassSelector(s,i,t).render();const n=function(){window.innerWidth>991?($(e).show(),$(s).hide()):($(s).show(),$(e).hide())};n();const o=(r=null,function(e,s){r&&clearTimeout(r),r=setTimeout(e,s)});var r;$(window).resize(function(){o(n,150)}),new UserApplicationAreas($("#userApplicationAreas")[0]).render();let l=this,d=null,c=null,u='<div style="position:absolute;right:0">'+Localization.getString("appAreaWidgetToggle")+'<button id="switchToImages" tabindex="0" title="'+Localization.getString("showImageGrid")+'"><i class="fas fa-th"></i></button><button id="switchToTags" tabindex="0" title="'+Localization.getString("showTagCloud")+'"><i class="fas fa-cloud"></i></button></div>';$("#appAreasWidgetToggle").html(u),"ig"===this.userHistory.getSetting("lpucw")?($("#usecasesContainerIG").show(),(c=new ImageGrid($("#usecasesContainerIG")[0],"applicationAreaGeneral","usecases",27,!0,!0)).render(),$("#switchToImages").prop("disabled",!0).addClass("disabled")):($("#usecasesContainerTC").show(),(d=new TagCloud($("#usecasesContainerTC")[0],"applicationAreaGeneral","usecases",600,!0)).render(),$("#switchToTags").prop("disabled",!0).addClass("disabled")),$("#switchToImages").on("click keyup",function(e){if(e.preventDefault(),e.stopPropagation(),"keyup"==e.type&&13!=e.originalEvent.keyCode)return!0;$("#usecasesContainerIG").show(),$("#usecasesContainerTC").hide(),$("#switchToImages").prop("disabled",!0).addClass("disabled"),$("#switchToTags").prop("disabled",!1).removeClass("disabled"),c||((c=new ImageGrid($("#usecasesContainerIG")[0],"applicationAreaGeneral","usecases",27,!0)).addListener(ImageGrid.events.itemSelected,function(e){window.location=decodeURI(mahu.getQueryAndFacetLink("*","usecases",e.label))}),c.render()),l.userHistory.setSetting("lpucw","ig")}),$("#switchToTags").on("click keyup",function(e){if(e.preventDefault(),e.stopPropagation(),"keyup"==e.type&&13!=e.originalEvent.keyCode)return!0;$("#usecasesContainerIG").hide(),$("#usecasesContainerTC").show(),$("#switchToImages").prop("disabled",!1).removeClass("disabled"),$("#switchToTags").prop("disabled",!0).addClass("disabled"),d||(d=new TagCloud($("#usecasesContainerTC")[0],"applicationAreaGeneral","usecases",600,!0)).render(),l.userHistory.setSetting("lpucw","tc")})}handleSchemaQueried(){let e=$("#history");if(1==e.length&&!this.userHistory.isEmpty()){new ResearchOverview(e,this.pageConfig.recoLimit).render()}}}