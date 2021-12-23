/**
 * Renders a material taxonomy.
 * 
 * Copyright 2017-2020 SLUB Dresden
 */
const MaterialClassSelector = function(parentElement, showCounts = false, clickHandler){

	let listeners = [];
	// an array that holds information about material classes (index n) and the corresponding number of occurrences (n+1)
	let matClassesToCount = [];
	// the material taxononmy that stores the actual information about the material classes
	const taxonomy = mahu.getTaxonomy();
	
	/*
	 * Fetches the categories and their respective number of occurrences from the back-end.
	 */
	const queryData = function(){
		let promise = $.ajax(
			mahu.getTermLink("category_unstemmed", "json-all"),
			{
				accepts: "text/json",
				async: true,
				contentType: "text/json",
				dataType: "json",
				crossDomain: true
			});
		return promise;
	};
	
	/* 
	 * Renders the more vertically layered materials of the two lowest hierarchy layers. 
	 */
	const renderLowerCategories = function(materials, parent){
		let container= document.createElement("div");
		container.classList.add("flexResultLine");
		container.style = "width: 100%";
		
		for (let idy=0; idy < materials.length; ++idy){
			let div= document.createElement("div");
			div.classList.add("layer4Element");
			
			for (let idx = 0; idx < materials[idy].length; ++idx){
				let c = materials[idy][idx];
				if (c.hidden) continue;
	
				let label = taxonomy.getLabel(c.id);
				let materialTagMarkup= '<div class="materialClassTag layer5Element';
				if (showCounts){
					let count= getCount(c.id);
					if (count == 0){
						materialTagMarkup += ' disabled';
					} else {
						label += " ("+count+")";
					}
				}
				
				materialTagMarkup+='" ';
				
				if (c.facetValue){
					materialTagMarkup += 'data-facetValue="'+c.facetValue+'"';
				}
				
				materialTagMarkup+='data-id="'+c.id+'">'+
						'<div>'+
							'<span class="cropText">' + label + '</span>'+
						'</div>';
				
				if (Array.isArray(c.children)){
					materialTagMarkup += "<div>";
					
					for (let j=0; j < c.children.length; ++j){
						materialTagMarkup += renderClass(c.children[j], 6);
					}
					
					materialTagMarkup+="</div>";
				}
				materialTagMarkup += '</div>';
				
				$(div).append(materialTagMarkup);
			}
			
			container.append(div);
		}
		
		parent.append(container);
	};
	
	/** Renders a (horizontal) layer of material tags and appends it to the given parent Element.
	 * @return the created DOM element
	 */
	const renderLayer = function(layer, materials, parent, renderChildren){
		let div= document.createElement("div");
		div.classList.add("flexResultLine");
		
		for (let idx = 0; idx < materials.length; ++idx){
			let c = materials[idx];
			if (c.hidden) continue;

			let html = renderClass(c, layer);
			$(div).append(html).data(c);
			
			if (renderChildren && Array.isArray(c.children)){
				renderLayer(layer+1, c.children);
			}
		}
		
		parent.append(div);
		return div;
	};
	
	const getCount = function(materialClassName){
		// look up material class usage count
		let count = 0;
		for (let i=0; i < matClassesToCount.length; i+=2 ){
			let name= matClassesToCount[i];
			
			if (name == materialClassName){
				count = matClassesToCount[i+1];
				break;
			}
		}
		return count;
	}
	
	/** Renders a single material class tag.
	 * @return an HTML formatted string
	 */
	const renderClass = function(materialClass, layer){
		
		let label = taxonomy.getLabel(materialClass.id);
		let materialTagMarkup= '<div class="materialClassTag layer'+layer+'Element';
		if (showCounts){
			let count= getCount(materialClass.id);
			if (count == 0){
				materialTagMarkup += ' disabled';
			} else {
				label += " ("+count+")";
			}
		}
		
		materialTagMarkup+='" ';
		
		if (materialClass.facetValue){
			materialTagMarkup += 'data-facetValue="'+materialClass.facetValue+'"';
		}
		
		return materialTagMarkup += 'data-id="'+materialClass.id+'"><div >'+
						'<span class="cropText">' + label + '</span>'+
					'</div>'+
				'</div>';
	};
	
	const render_inner = function(){
		/* add material layers that are always visible */
		renderLayer(1, [ 
				taxonomy.getMaterialClass("Verbundwerkstoffe")
			], parentElement, false);
		renderLayer(1, [
				taxonomy.getMaterialClass("Werkstoffe")
			], parentElement, false);
		renderLayer(2, [
				taxonomy.getMaterialClass("Metalle")
				,
				taxonomy.getMaterialClass("Nichtmetalle")
			], parentElement, false);
		renderLayer(3, [
				taxonomy.getMaterialClass("Eisenmetalle"),
				taxonomy.getMaterialClass("Nichteisenmetalle"),
				taxonomy.getMaterialClass("Anorganisch"),
				taxonomy.getMaterialClass("Organisch")
			], parentElement, false);
		
		/* add div that contains content to be collapsible/ expandable */
		let expandable= document.createElement("div");
		expandable.id = "lowerMaterialCategories";
		expandable.classList.add("flexResultLine");
		parentElement.append(expandable);
		
		/* add first row of expandable content */
		let row1= renderLayer(4, [
			taxonomy.getMaterialClass("Stähle")
			,taxonomy.getMaterialClass("Eisengusswerkstoffe")
			,taxonomy.getMaterialClass("Leichtmetalle")
			,taxonomy.getMaterialClass("Schwermetalle")
			,taxonomy.getMaterialClass("Anorganisch-natürlich")
			,taxonomy.getMaterialClass("Anorganisch-synthetisch")
			,taxonomy.getMaterialClass("Organisch-natürlich")
			,taxonomy.getMaterialClass("Organisch-synthetisch")
		], expandable, false);
		row1.style= "width: 100%";
		
		/* add second row of expandable content */
		renderLowerCategories([
				taxonomy.getChildren("Stähle"),
				taxonomy.getChildren("Eisengusswerkstoffe"),
				taxonomy.getChildren("Leichtmetalle"),
				taxonomy.getChildren("Schwermetalle"),
				taxonomy.getChildren("Anorganisch-natürlich"),
				taxonomy.getChildren("Anorganisch-synthetisch"),
				taxonomy.getChildren("Organisch-natürlich"),
				taxonomy.getChildren("Organisch-synthetisch")
		], expandable);
		
		/* append the expander button */
		let div= document.createElement("div");
		div.id = "materialCategoryExpander";
		$(div).html('<a><i class="fas fa-chevron-circle-down" title="'+Localization.getString('matClassSel.expand')+'"></i></a>');
		
		parentElement.append(div);

		
		/* add click handler to the expander element */
		let expander = $("#materialCategoryExpander");
		expander.click(function(event){
			let lowerCategories = $("#lowerMaterialCategories");
			
			let expanded = lowerCategories.is(":visible");
			
			let icon = expander.find("i")[0];
			if (icon) {
				let clsToRemove = "fa-chevron-circle-up";
				let clsToAdd = "fa-chevron-circle-down";
				if (!expanded){
					clsToRemove = "fa-chevron-circle-down";
					clsToAdd = "fa-chevron-circle-up";
					icon.setAttribute("title", Localization.getString("matClassSel.collapse"))
				}
				else {
					icon.setAttribute("title", Localization.getString("matClassSel.expand"));
				}
				
				icon.classList.remove(clsToRemove);
				icon.classList.add(clsToAdd);
			}
			
			if (expanded) {
				lowerCategories.css("display", "none");
			} else {
				lowerCategories.css("display", "flex");
			}
			event.preventDefault();
		});
		
		$(parentElement).find(".materialClassTag").click(function(event){
			event.stopPropagation();
			event.preventDefault();
			
			notifyListeners(MaterialClassSelector.events.itemSelected, {
				facetValue: event.currentTarget.getAttribute("data-facetValue"),
				id: event.currentTarget.getAttribute("data-id")
			});
		});
	};
	
	/** Renders the material taxonomy */
	const render = function(){
		queryData().always(function(response){
			matClassesToCount = response.terms["category_unstemmed"];
			// calculate Werkstoffe count
			let werkstoffcount = getCount("Metalle") + getCount("Nichtmetalle");
			matClassesToCount = ["Werkstoffe", werkstoffcount].concat(matClassesToCount);
			
			// calculate counts for terms that occur twice (Natürlich, Synthethisch)
			let anorg_synthethisch_count = getCount("Keramik") + getCount("Gläser") + getCount("Anorganische Bindemittel");
			let organ_synthethisch_count = getCount("Kunststoffe");
			let organ_nat_count = getCount("Pflanzliche Stoffe") + getCount("Tierische Stoffe");
			let anorg_nat_count = getCount("Natürlich") - organ_nat_count;
			
			matClassesToCount = [
				"Anorganisch-natürlich", anorg_nat_count,
				"Anorganisch-synthethisch", anorg_synthethisch_count, 
				"Organisch-natürlich", organ_nat_count, 
				"Organisch-synthetisch", organ_synthethisch_count].concat(matClassesToCount);
			
			render_inner();
		});
	}
	
	const addListener = function(eventName, handler, scope){
		if (!$.isFunction(handler)) {
			return false;
		}
		
		let foundAtIndex = findEntry(eventName, handler, scope);
		if (foundAtIndex == -1){
			listeners.push({
				eventName: eventName,
				handler: handler,
				scope: scope
			});
			
			return true;
		}
		return false;
	};
	
	/**
	 * Private helper method to find a listener for the given parameters.
	 * 
	 * @return the index within the listeners array at which a matching record has been found 
	 */
	const findEntry = function(eventName, handler, scope){
		let foundAtIndex = -1;
		
		for (let i=0; i < listeners.length; ++i){
			let listener = listeners[i];
			
			if (listener.eventName == eventName &&
					listener.handler == handler &&
					listener.scope == scope){
				foundAtIndex = i;
				break;
			}
		}
		return foundAtIndex;
	};
	
	const removeListener = function(eventName, handler, scope){
		let foundAtIndex = findEntry(eventName, handler, scope);
		if (foundAtIndex != -1){
			listeners.splice(foundAtIndex, 1);
			return true;
		}
		return false;
	};
	
	/*
	 * Notify listeners.
	 */
	const notifyListeners = function(eventName, entity){
		listeners.forEach(function(listener){
			if (listener.eventName == eventName){
				try {
					listener.handler.call(
						listener.scope,
						entity
					);
				} catch(e) {
					console.error(e);
				}
			}
		});
	};
	
	/* expose public interface */
	return {
		render : render,
		addListener: addListener,
		removeListener: removeListener
	};
};


/**
 * Enumerates valid entry types.
 */
Object.defineProperties(MaterialClassSelector, {
	"events" : {
		value: Object.defineProperties({} , {
			"itemSelected": {
				value: "itemselected",
				configurable: false,
				enumerable: true,
				writable: false
			}
		}),
		writeable : false,
		enumerable: true,
		configurable: false
	}
});