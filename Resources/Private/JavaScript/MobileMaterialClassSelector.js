/**
 * Renders a material taxonomy in a vertical fashion.
 * 
 * Copyright 2017-2020 SLUB Dresden
 */
const MobileMaterialClassSelector = function(parentElement, showCounts = false, disableEmptyClasses = false) {

	let listeners = [];
	// an array that holds information about material classes (index n) and the corresponding number of occurrences (n+1)
	let matClassesToCount = [];
	// the material taxononmy that stores the actual information about the material classes
	const taxonomy = mahu.getTaxonomy();
	
	let currentClass = null;
	
	// DOM element that hosts material class tags according to the complete path from root to current selection
	let navContainer = null;
	// DOM element that hosts material class tags for each direct subclass of the current selection
	let childrenContainer = null;
	
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
	
	/** Renders a (horizontal) layer of material tags and appends it to the given parent Element.
	 * @return the created DOM element
	 */
	const renderLayer = function(material, parent){
		let html = renderClass(material);
		
		// add a click listener on the "navigate to" button
		$(parent).append(html).find(".matSelNav").on("click keyup", function(event){
			if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
				return true;
			}
			event.stopPropagation();
			event.preventDefault();
			
			let p = event.currentTarget.parentElement;
			
			let mat = taxonomy.getMaterialClass(p.getAttribute("data-id"));
			navigateTo(mat);
		});
	};
	
	/**
	 * Navigates to the given material class. To this end, the path from the root class
	 * to the given material class is rendered as well as the direct children of that class.  
	 */
	const navigateTo = function(material){
		// clear container elements
		$(navContainer).children().detach();
		$(childrenContainer).children().detach();
		// roots are always visible
		renderRoots();
		
		currentClass = material;
		
		// determine the path from the given material to the root
		let path = [];
		let p= material;
		while((p= taxonomy.getParent(p.id))!= null){
			if (!taxonomy.isRoot(p.id))
				path.unshift(p);
		}
		// ... and render each material along that path
		if (path.length > 0){
			path.forEach(function(el){
				renderLayer(el, navContainer);
			});
		}
		
		// render the material itself
		if (!taxonomy.isRoot(material.id))
			renderLayer(material, navContainer);
		// render subclasses if there are such
		if (material.children){
			renderChildren(material.children);
		}
		
		// add click handlers
		/*$(parentElement).find(".materialClassTag .matName").click(function(event){
			event.stopPropagation();
			event.preventDefault();
			
			let p = event.currentTarget.parentElement;
			
			notifyListeners(MobileMaterialClassSelector.events.itemSelected, {
				facetValue: p.getAttribute("data-facetValue"),
				id: p.getAttribute("data-id")
			});
		});*/
	};
	
	/**
	 * Renders a material tag for each of the given material classes
	 */
	const renderChildren = function(children){
		childrenContainer.style = "visibility:visible";
		
		children.forEach(function(ch){
			renderLayer(ch, childrenContainer);
		});
	};
	
	/**
	 * Renders the roots of the material taxonomy (currently two)
	 */
	const renderRoots = function(){
		let rids = taxonomy.getRootIDs();
		rids.forEach(function(rid){
			renderLayer(taxonomy.getMaterialClass(rid), navContainer);	
		});
	};
	
	/*
	 * Answers the count of materials belonging to the given material class
	 */
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
	const renderClass = function(materialClass){
		let materialClassName = taxonomy.getLabel(materialClass.id);
		let label = materialClassName;
		let materialTagMarkup= '<div class="materialClassTag';
		let count= getCount(materialClass.id);
		if (showCounts){
			if (count != 0){
				label += " ("+count+")";
			}
		}
		let disabled = count == 0 && disableEmptyClasses;
		if (disabled){
			materialTagMarkup += ' disabled';
		}
		
		materialTagMarkup+='" ';
		
		if (materialClass.facetValue){
			materialTagMarkup += 'data-facetValue="'+materialClass.facetValue+'"';
		}
		materialTagMarkup += 'data-id="'+materialClass.id+'">';
		
		if (disabled) {
			materialTagMarkup += '<span>' + label + '</span>';
		} else {
			let href = "";
			if (materialClass.id === "Werkstoffe") {
				href= mahu.getQueryLink("*");
			} else {
				href = mahu.getQueryAndFacetLink("*","category", (materialClass.facetValue||materialClass.id));
			}
			materialTagMarkup+='<a class="matName" href="'+href+'" title="'+Localization.getString("matClassSel.goto")+'\''+materialClassName+'\'">' +
									'<span>' + label + '</span>'+
								'</a>';
		}
		
		if (materialClass.children)
			materialTagMarkup+= '<div tabindex="0" class="matSelNav" title="'+Localization.getString("matClassSel.navigate")+' \''+materialClassName+'\'">'+
						'<i class="fas fa-angle-right"></i>'+
					'</div>';
		materialTagMarkup+=	'</div>';
		
		return materialTagMarkup;
	};
	
	const render_inner = function(){
		/* add material layers that are always visible */
		
		navContainer = document.createElement("div");
		navContainer.classList.add("navContainer");
		parentElement.append(navContainer);
		
		childrenContainer = document.createElement("div");
		childrenContainer.classList.add("childrenContainer");
		childrenContainer.style = "visibility:hidden";
		parentElement.append(childrenContainer);
		
		renderRoots();
/*		renderLayer(2, [
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
*/		
		
		/*$(parentElement).find(".materialClassTag .matName").click(function(event){
			event.stopPropagation();
			event.preventDefault();
			
			let p = event.currentTarget.parentElement;
			
			notifyListeners(MaterialClassSelector.events.itemSelected, {
				facetValue: p.getAttribute("data-facetValue"),
				id: p.getAttribute("data-id")
			});
		});*/
	};
	
	/** Renders the material taxonomy */
	const render = function(){
		queryData().always(function(response){
			matClassesToCount = response.terms["category_unstemmed"];
			// calculate Werkstoffe count
			let werkstoffcount = getCount("Metalle") + getCount("Nichtmetalle") + getCount("Verbundwerkstoffe");
			matClassesToCount = ["Werkstoffe", werkstoffcount].concat(matClassesToCount);
			
			// calculate counts for terms that occur twice (Natürlich, Synthethisch)
			let anorg_synthethisch_count = getCount("Keramik") + getCount("Gläser") + getCount("Anorganische Bindemittel");
			let organ_synthethisch_count = getCount("Kunststoffe");
			let organ_nat_count = getCount("Pflanzliche Stoffe") + getCount("Tierische Stoffe");
			let anorg_nat_count = getCount("Natürlich") - organ_nat_count;
			
			matClassesToCount = [
				"Anorganisch-natürlich", anorg_nat_count,
				"Anorganisch-synthetisch", anorg_synthethisch_count, 
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
Object.defineProperties(MobileMaterialClassSelector, {
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