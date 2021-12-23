/**
 * A tooltip that displays the extract of a Wikipedia article which is given by its name.
 * 
 * Copyright 2017-2020 SLUB Dresden
 */
const WikipediaTooltip = function(parentElement, term, lang){
	let pageSummary = null;
	
	let queried= false;
	let opened= false;
	
	// initialize the correct wikipedia depending on the given language flag
	let wiki = "de";
	if (lang && lang.trim().length > 0){
		wiki = lang;
	}
	
	let hoverAvailable = true;
	if ('ontouchstart' in window || 'ontouch' in window) {
		hoverAvailable = false;
	}
	
	/**
	 * Asynchronously fetches the page summary.
	 * @return a Promise object.
	 */
	const queryPageSummary = function(){
		// if we already queried the page meta data, 
		// take the cached result and return it directly.
		if (pageSummary){
			return $.Deferred().resolve(pageSummary);
		}
		
		// query the page summary using the Wikipedia API
		let promise = $.ajax(
			"https://"+wiki+".wikipedia.org/api/rest_v1/page/summary/"+term,
			{
				accepts: "text/json",
				async: true,
				contentType: "text/json",
				dataType: "json"
			});
		promise.done(function(result){
			// cache the result
			pageSummary = result;
		});
		return promise;
	};
	
	/**
	 * Render the given page summary. To this end a jQuery Tooltip 
	 * is appended to the DOM element.
	 */
	const renderSummary = function(summary){
		let imgURL = null;
		// get the URL of an image. take thumbnail first and the larger image as fallback
		if (summary['thumbnail']){
			imgURL = summary['thumbnail']['source'];
		} else {
			if (summary['originalimage']){
				imgURL = summary['originalimage']['source'];
			}
		}
		
		// generate HTML code
		let cls = "";
		let html = "<div>";
		if (imgURL){
			html += "<div class='wikiimg'><img src='"+imgURL+"'></img></div>";
			cls= "-withimg";
		}
		
		html+= "<div class='wikicontent"+cls+"'>"+summary['extract_html'] +
			"<span class='wikisource'>Quelle: <img alt='Wikipedia-Logo' src='https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png'/>&nbsp;Wikipedia</span></div>";

		// create tooltip
		$(parentElement).tooltip({
			content: html,
			classes: {
				"ui-tooltip" : "wikitooltip"
			}
		});
	};
	
	/**
	 * Render this Wikipedia tooltip.
	 */
	const render = function(){
		let p = $(parentElement);
		
		// click and key handler
		let handler = function(){
			// query Wikipedia API
			if (!queried) {
				queryPageSummary().always(function(){
					queried= true;
				})
				.done(function(resp){
					// create tooltip
					renderSummary(resp);
					
					p.tooltip("open");
					opened= true;
					//p.toggleClass("toggled");
				});
			} else {
				if (!opened){
					p.tooltip("open");
					opened= true;
				} else {
					p.tooltip("close");
					opened= false;
				}
				//p.toggleClass("toggled");
			}
		};
		
		// when first hovering the parent element we initialize the tooltip
		if (hoverAvailable){
			let receivedMouseOut = false;
			// handler function
			let fn = function(event){
				if (event.type == "mouseleave")
					receivedMouseOut = true;
				
				// query Wikipedia API
				queryPageSummary().always(function(){
					// unregister this listener
					p.off( "mouseenter mouseleave", fn);
				})
				.done(function(resp){
					// create tooltip
					renderSummary(resp);
					
					if (!receivedMouseOut)
						// emit an artificial hover event to trigger the actual jQuery Tooltip (created in #renderSummary)
						p.mouseenter();
				});
			};
			// register the above function as a listener for hover events
			p.hover(fn);
		}
		else {
			p.click(handler);
		}
		
		p.keyup(function(event){
			let kc= event.originalEvent.keyCode;
			if (kc != 13) {
				return true;
			}
			handler();
		});
	};
	
	/* expose public interface */
	return {
		render : render,
		hide: function (){
			let p = $(parentElement);
			if (!p.tooltip("instance"))
				return;
			p.tooltip("close");
			p.removeClass("toggled");
			opened= false;
		}
	};
};
