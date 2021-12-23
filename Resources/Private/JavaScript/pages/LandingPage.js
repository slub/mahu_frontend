/**
 * 
 */
class LandingPage extends SearchFormPage {
	constructor(history, pageConfig){
		super(history, pageConfig);
	}
	
	render() {
		super.render();
		
		// fill material categories and application areas sections
		
		// render material classes which are most relevant for the current user (based on frecency)
		let frecencyClasses = new UserMaterialClasses($("#userMaterialClasses")[0]);
		frecencyClasses.render();
		
		
		/** init material classes widget */
		// create a sub div for both, the mobile and 'traditional', material selectors
		let div1 = document.createElement("div");
		div1.style="background-color:whitesmoke;";
		$(div1).hide();
		let div2 = document.createElement("div");
		$(div2).hide()
		let matSelDiv = document.getElementById("materialClassification");
		matSelDiv.append(div1);
		matSelDiv.append(div2);
		
		// defines whether the number of materials per material class is shown in the taxonomy widget
		let showCount = this.pageConfig.showCountInTaxonomy || false;
		let disableEmptyClasses = this.pageConfig.disableEmptyClasses || false;
		
		// instantiate both versions of the material selector
		let classificationWidget = new MaterialClassSelector(div1, showCount, true, disableEmptyClasses);
		classificationWidget.render();
		/*classificationWidget.addListener(MaterialClassSelector.events.itemSelected, function(item){
			window.location = mahu.getQueryAndFacetLink("*","category", (item.facetValue||item.id));
		});*/

		let classificationWidgetMobile = new MobileMaterialClassSelector(div2, showCount, disableEmptyClasses);
		classificationWidgetMobile.render();
		/*classificationWidgetMobile.addListener(MobileMaterialClassSelector.events.itemSelected, function(item){
			window.location = mahu.getQueryAndFacetLink("*","category", (item.facetValue||item.id));
		});*/

		// switches between mobile (vertical layout) and traditional (more horizontal layout) material selector
		// depending on the browser window size
		const showMaterialSelector = function(){
			if (window.innerWidth > 991){
				$(div1).show();
				$(div2).hide();
			} else {
				$(div2).show();
				$(div1).hide();
			}
		};
		// initially show a material selector
		showMaterialSelector();
		
		// react on window resize events and show proper material selector
		const delay = (function(){
			var timer= null;
			return function (callback, ms) {
				if (timer) {
					clearTimeout (timer);
				}
				timer = setTimeout(callback, ms);
			};
		})();
		$(window).resize(function() {
		    delay(showMaterialSelector, 150);
		});
		/** material selector initialization END */
		
		// render application areas which are most relevant for the current user (based on frecency)
		let frecencyAppAreas = new UserApplicationAreas($("#userApplicationAreas")[0]);
		frecencyAppAreas.render();
		
		// init tag cloud
		
		/*$("#appAreasWidgetToggle").lc_switch("","");
		// triggered each time a field changes status
		$('body').delegate('.lcs_check', 'lcs-statuschange', function() {
			if ($(this).is(':checked')) {
				$("#usecasesContainerTC").show();
				$("#usecasesContainerIG").hide();
			} else {
				$("#usecasesContainerTC").hide();
				$("#usecasesContainerIG").show();
			}
		});
		
		if (!$("#appAreasWidgetToggle")[0].checked) {
			$("#appAreasWidgetToggle").lcs_on();
		}*/

		
		let me = this;
		let tagCloud = null;
		let imageGrid= null;

		let asd = 	'<div style="position:absolute;right:0">'+Localization.getString("appAreaWidgetToggle")+'<button id="switchToImages" tabindex="0" title="'+Localization.getString("showImageGrid")+'"><i class="fas fa-th"></i></button>'+
					'<button id="switchToTags" tabindex="0" title="'+Localization.getString("showTagCloud")+'"><i class="fas fa-cloud"></i></button></div>';
		// render switch buttons
		$("#appAreasWidgetToggle").html(asd);
		
		
		// show tag cloud or image grid as defined in the user settings
		if (this.userHistory.getSetting("lpucw")==="ig") {
			$("#usecasesContainerIG").show();
			imageGrid = new ImageGrid($("#usecasesContainerIG")[0], "applicationAreaGeneral", "usecases", 27, true, true);
			/*imageGrid.addListener(ImageGrid.events.itemSelected, function(item){
				window.location = decodeURI(mahu.getQueryAndFacetLink("*","usecases", item.label));
			});*/
			imageGrid.render();
			
			//$("#switchToImages").hide();
			$("#switchToImages").prop("disabled",true).addClass("disabled");
		} else {
			$("#usecasesContainerTC").show();
			tagCloud = new TagCloud($("#usecasesContainerTC")[0], "applicationAreaGeneral", "usecases", 600, true);
			tagCloud.render();
			
			//$("#switchToTags").hide();
			$("#switchToTags").prop("disabled", true).addClass("disabled");
		}
		
		// add listeners to switch buttons
		$("#switchToImages").on("click keyup", function(event){
			event.preventDefault();
			event.stopPropagation();
			if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
				return true;
			}
			$("#usecasesContainerIG").show();
			$("#usecasesContainerTC").hide();
			//$("#switchToImages").hide();
			//$("#switchToTags").show();
			$("#switchToImages").prop("disabled", true).addClass("disabled");
			$("#switchToTags").prop("disabled", false).removeClass("disabled");;
			
			if (!imageGrid) {
				imageGrid = new ImageGrid($("#usecasesContainerIG")[0], "applicationAreaGeneral", "usecases", 27, true);
				imageGrid.addListener(ImageGrid.events.itemSelected, function(item){
					window.location = decodeURI(mahu.getQueryAndFacetLink("*","usecases", item.label));
				});
				imageGrid.render();
			}
			me.userHistory.setSetting("lpucw", "ig");
		});
		$("#switchToTags").on("click keyup", function(event){
			event.preventDefault();
			event.stopPropagation();
			if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
				return true;
			}
			$("#usecasesContainerIG").hide();
			$("#usecasesContainerTC").show();
			//$("#switchToImages").show();
			//$("#switchToTags").hide();
			$("#switchToImages").prop("disabled", false).removeClass("disabled");
			$("#switchToTags").prop("disabled", true).addClass("disabled");
			
			if (!tagCloud) {
				tagCloud = new TagCloud($("#usecasesContainerTC")[0], "applicationAreaGeneral", "usecases", 600, true);
				tagCloud.render();			
			}
			
			me.userHistory.setSetting("lpucw", "tc");
		});
	}
	
	handleSchemaQueried() {
		// render bookmarks and history
		let historyContainer = $("#history");
		if (historyContainer.length == 1 && !this.userHistory.isEmpty()){
			let rowidget = new ResearchOverview(historyContainer, this.pageConfig.recoLimit);
			rowidget.render();
		}
	}
}