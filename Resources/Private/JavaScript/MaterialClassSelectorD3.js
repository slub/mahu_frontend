/**
 * Renders a material taxonomy using a tree visualization powered by D3js.
 * 
 * Copyright 2017-2020 SLUB Dresden
 */
const MaterialClassSelector = function(parentElement, showCounts = false, useStandardBehavior = true, disableEmptyClasses = false){

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
	
	const render_inner = function(){
		let width = 1100;
		
		let chart = function(){
			const root = tree(data);

			let x0 = Infinity;
			let x1 = -x0;
			root.each(d => {
				if (d.x > x1) x1 = d.x;
				if (d.x < x0) x0 = d.x;
			});
			
			let ml = "40px";
			let mr = "120px";
			if (Localization.getLanguage()=="en") {
				ml = "30px";
				mr = "130px";
			}
			// create base svg element
			const svg = d3.create("svg")
				.attr("style","overflow:visible;margin-left:"+ml+";margin-right:"+mr)
				.attr("viewBox", [0, 0, width, x1 - x0 + root.dx * 2])
				.attr("aria-label", "Materialtaxonomie als Graphdarstellung");

			const g = svg.append("g")
				.attr("font-family", "inherit")
				.attr("font-size", 18)
				.attr("transform", `translate(${root.dy / 3},${root.dx - x0})`);
			
			// create links
			const link = g.append("g")
				.attr("fill", "none")
				.attr("stroke", "#555")
				.attr("stroke-opacity", 1)
				.attr("stroke-width", 1.5)
				.attr("aria-hidden",true)
				.selectAll("path")
				.data(root.links())
				.join("path")
				.attr("d", d3.linkHorizontal()
					.x(d => d.y)
					.y(d => d.x));
			
			// create nodes
			const node = g.append("g")
				.attr("stroke-linejoin", "round")
				.attr("stroke-width", 3)
				.selectAll("g")
				.data(root.descendants())
				.join("g")
				.attr("transform", d => `translate(${d.y},${d.x})`);

			// draw circles at the end of lines
			node.append("circle")
				.attr("aria-hidden",true)
				.attr("fill", d => d.children ? "#555" : "#999")
				.attr("r", 2.5);
				
			let ele= node;
			// add text elements with material class names
			if (useStandardBehavior) {
				ele = node.append("a")
				.attr("href", function(d){
					if (useStandardBehavior) {
						if ((showCounts || disableEmptyClasses) && getCount(d.data.id) == 0) {
							return undefined;
						}
						if (d.data.id === "Werkstoffe") {
							return mahu.getQueryLink("*");
						} else {
							return mahu.getQueryAndFacetLink("*","category", (d.data.facetValue||d.data.id));
						}						
					}
					return undefined;
				}).attr("class", function(d) {
					if ((showCounts || disableEmptyClasses) && getCount(d.data.id) == 0) {
						return "no-change emptyClass";
					}
					return "no-change nonemptyClass";
				});
			}
			ele.append("text")
				.attr("dy", "0.31em")
				.attr("x", d => d.children ? -6 : 6)
				.attr("text-anchor", d => d.children ? "end" : "start")
				.attr("stroke", "white")
				.attr("paint-order", "stroke")
				.text(function(d){ // add localized labels (and material count, if this option is enabled)
					let txt = Localization.getString(d.data.id);
					let count = getCount(d.data.id);
					if (showCounts && count != 0){
						txt+= " ("+ count +")";
					}
					return txt;
				}).attr("class", function(d) {
					if (useStandardBehavior) return undefined;
					
					if ((showCounts || disableEmptyClasses) && getCount(d.data.id) == 0) {
						return "emptyClass";
					}
					return "nonemptyClass";
				});
			
			
			if (!useStandardBehavior) {
				// define click and key-up handler (notifies listeners about material class selection)
				let handleClickAndKey = function(elem){
					if (d3.event.type === "keyup" && d3.event.keyCode != 13) return;
					if (!showCounts || (showCounts && getCount(elem.data.id) != 0)) {
						notifyListeners(MaterialClassSelector.events.itemSelected, {
							facetValue: elem.data.facetValue,
							id: elem.data.id
						});
					}
				};
				// if material counts are enabled, filter text elements of material classes with count == 0 
				node.selectAll("text").filter(function(d){
					if ((showCounts || disableEmptyClasses) && getCount(d.data.id) == 0) {
						return false;
					}
					return true;
				})
				.on("click", handleClickAndKey)
				.on("keyup", handleClickAndKey)
				.attr("tabindex", function(d){// add tabindex to clickable elements
					if ((showCounts || disableEmptyClasses) && getCount(d.data.id) == 0) {
						return undefined;
					}
					return "0";
				});
			}
		
			return svg.node();
		};
		
		let data = taxonomy.getMaterialClass("Werkstoffe");
		
		const tree = function(data) {
			const root = d3.hierarchy(data);
			root.dx = 22;
			root.dy = width / (root.height + 1);
			return d3.tree().nodeSize([root.dx, root.dy])(root);
		};
		
		let svgnode = chart();
		parentElement.append(svgnode);
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