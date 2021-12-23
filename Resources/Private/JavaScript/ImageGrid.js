/**
 * Renders a grid of images (or labels if there is no applicable image available) for a given material property and, optionally, a search field.
 * In order to do so, this widget builds up on the terms API provided by find reqspectively Solr.
 * 
 * Copyright 2017-2020 SLUB Dresden
 */
const ImageGrid = function(parentElement, fieldName, facetID, numberOfElements, showSearchField, useStandardBehavior = true){
	let listeners = [];
	
	let data = [];
	let tagCloudContainer = null;
	
	let state = "less";
	
	/*
	 * Asynchronously queries data using find's terms action.
	 * @return {Promise} a promise
	 */
	const queryData = function(){
		let promise = $.ajax(
			mahu.getTermLink(fieldName, "json-all"),
			{
				accepts: "text/json",
				async: true,
				contentType: "text/json",
				dataType: "json",
				crossDomain: true
			});
		return promise;
	};
	
	/**
	 * Renders this image grid.
	 */
	const render = function(){
		queryData().done(function(res){
			let array = [];
			// prepare data structure
			for (let idx = 0; idx < res.terms[fieldName].length; idx+=2){
				let name = res.terms[fieldName][idx];
				let count= res.terms[fieldName][idx+1];
				
				array.push({
					label: Localization.getString(name),
					name: name,
					weight: count,
					link: decodeURI(mahu.getQueryAndFacetLink("*", facetID, name))
				});
			}
			
			// create dedicated container element which holds search field and/or tag cloud and which is added to the given parentElement
			tagCloudContainer = document.createElement("div");
			tagCloudContainer.id = "imageGridContainer";
			
			// add search field
			if (showSearchField){
				let searchField = document.createElement("input");
				searchField.id = "imageGridSearch";
				searchField.classList.add("form-control");
				searchField.type = "text";
				searchField.placeholder= Localization.getString("tagCloud.search");
				
				parentElement.appendChild(searchField);
				
				// use jquery autocomplete
				$(searchField).autocomplete({
					source: array,
					select: function(event, selection){
						let value = selection.item.value;
						let entry= null;
						
						// check whether the selected value matches any term
						for (let i=0; i < array.length; ++i) {
							if (array[i].label == value){
								entry = array[i];
								break;
							}
						}
						
						// navigate to the facet browser with a preset facet value according to the selected term
						if (entry != null && entry.link)
							if (entry.link.href)
								window.location = entry.link.href;
							else
								window.location = entry.link;
					}
				});
			}
			
			parentElement.appendChild(tagCloudContainer);
			
			data = array;
			
			// sort ...
			data.sort(function(a,b){
				if(a.label.toLowerCase() < b.label.toLowerCase()) 
					return -1;
    			if(a.label.toLowerCase() > b.label.toLowerCase()) 
					return 1;
			    return 0;
				//return b.weight - a.weight;
			});
			showLess();
		});
	};
	
	/*
	 * Determines the image URL for the given term.
	 */
	const getImageURL = function(itemName){
		return mahu.getImageLinkResolver().getImageURL(itemName);
	}
	
	const showAll = function(){
		renderItems(tagCloudContainer, data);
		tagCloudContainer.classList.remove("toggled");
		state = "all";
	};
	
	const showLess = function(){
		let dataToUse = [];
		// and limit terms
		dataToUse = data.slice(0, numberOfElements || 50);
		
		renderItems(tagCloudContainer, dataToUse);
		
		tagCloudContainer.classList.add("toggled");
		state = "less";
	};
	
	/*
	 * Renders the given items into the given DOM element and registers
	 * event handlers.
	 */
	const renderItems = function(element, items){
		let rendered = "";
		for (let i=0; i < items.length; ++i){
			let item = items[i];
			
			let href = "";
			if (useStandardBehavior){
				href = 'href="'+mahu.getQueryAndFacetLink("*","usecases", item.name)+'"';
			}
			
			rendered +=
				'<a class="gridItem" tabindex="0" data-name="'+item.name+'" title="'+item.label+'" '+href+'>'+
					'<div class="imageWrap">'
			
			let img = getImageURL(item.name);
			if (img!=null){
				rendered += '<img src="'+img+'" aria-hidden="true"></img>';
			} 
			rendered += '</div><span>'+item.label+'</span>';
			
			rendered += '</a>';
		}
		
		let toggleDrawn = false;
		if (data.length > numberOfElements) {
		if (state == "less"){
			rendered+='<a class="gridItem toggle" tabindex="0"><span>' + Localization.getString("show all") + '</span></div>';
			toggleDrawn = true;
		} else {
			if (items.length > numberOfElements){
				rendered+='<a class="gridItem toggle" tabindex="0"><span>' + Localization.getString("show less") + '</span></div>';
				toggleDrawn = true;
			}
		}
		}

		$(element).html(rendered);
		
		// catch click events on grid items and propagate them to listeners
		if (!useStandardBehavior) {
		$(element).find(".gridItem:not(.toggle)").on("click keyup",function(event){
			event.stopPropagation();
			event.preventDefault();
			if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
				return true;
			}
			
			notifyListeners(ImageGrid.events.itemSelected, {
				label: event.currentTarget.getAttribute("data-name")
			});
		});
		}
		
		if (toggleDrawn){
			let toggle = $(element).find(".toggle").on("click keyup", function(event){
				event.stopPropagation();
				event.preventDefault();
				if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
					return true;
				}
				
				if (state == "less"){
					showAll();
					$(element).find(".toggle").html("<span>"+Localization.getString("show less")+"</span>");
				} else {
					showLess();
					$(element).find(".toggle").html("<span>"+Localization.getString("show all")+"</span>");
				}
			});
		}
	};
	
	/**
	 * Add a listener for the given entry type  and event type (see history.eventType).
	 * 
	 * @param eventName (String). The type of change for which to listen on. See ImageGrid.events for valid values. 
	 * @param handler (Function). The function to be called.
	 * @param scope (Object, optional). The scope in which to call the handler function. 
	 * @return (boolean) success state
	 */
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
	/**
	 * Remove a listener for the given entry type  and event type (see ImageGrid.events).
	 * 
	 * @param eventName (String). The type of change for which to listen on. See history.eventTypes for valid values. 
	 * @param handler (Function). The function to be called.
	 * @param scope (Object, optional). The scope in which to call the handler function.
	 * @return (boolean) success state
	 */
	const removeListener = function(eventName, handler, scope){
		let foundAtIndex = findEntry(eventName, handler, scope);
		if (foundAtIndex != -1){
			listeners.splice(foundAtIndex, 1);
			return true;
		}
		return false;
	};
	
	/*
	 * Notify listeners by invoking the registered handler function 
	 * with the given event name as well as the given object as payload.
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
Object.defineProperties(ImageGrid, {
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