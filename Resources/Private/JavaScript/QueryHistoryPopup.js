/**
 * Renders a pop-up menu (and the corresponding button to open it) that lists the recent user queries. 
 *
 * Copyright 2020 SLUB Dresden
 */
const QueryHistoryPopup = function(parentElement, _limit){
	const DEFAULT_LIMIT = 4;
	
	// reference to the user history
	let userHistory = mahu.getHistory();
	
	/**
	 * Answers the <limit> most relevant material entries of the given array.
	 * 
	 * Currently, the first <limit> elements are picked TODO relevance ranking!
	 */
	const getMostRelevant = function(array, limit, offset){
		if (!limit || isNaN(limit) || limit < 0)
			limit = DEFAULT_LIMIT;
		if (!offset || isNaN(offset) || offset < 0)
			offset = 0;
		
		defaultSort(array);
		
		return array.slice(offset, limit);
	};
	
	/**
	 * sorts the given array by the timestamp property of its entries
	 */
	const defaultSort = function(array){
		array.sort(function(a, b){
			return b.timestamp - a.timestamp;
		});
		return array;
	};
	
	/*
	 * Generates a text that states how long ago a certain timestamp is, e.g. "2 hours ago".
	 */
	const getAgoString = function(timeInMs){
		let now = +new Date();
		let diff = now - timeInMs;
		
		let unit = "";
		let plural = false;
		let diffString = "";
		let template = Localization.getString("ro.tmpl");
		
		let diffInMinutes = diff/(1000*60);
		if (diffInMinutes < 1){
			unit = Localization.getString("ro.ltm");
		} else if (diffInMinutes < 60){
			let d = Math.round(diffInMinutes);
			diffString += d;
			unit = Localization.getString("ro.minute");
			if (d != 1)
				plural= true;
		} else if (diffInMinutes < 60*24){
			let d = Math.round(diffInMinutes/60);
			diffString += d;
			unit = Localization.getString("ro.hour");

			if (d != 1)
				plural= true;
		} else {
			let d = Math.round(diffInMinutes/(60*24));
			diffString += d;
			unit = Localization.getString("ro.day");
			if (d != 1)
				plural= true;
		}
		
		return String.format(template, diffString, unit, plural?Localization.getString("ro.plural"):"", Localization.getString("ro.ago"));
	};
	
	/**
	 * Renders a given collection of material descriptors to the given DOM element.
	 */
	const renderQueries = function(element, queries){
		let ml = queries.length;
		let rendered = "";
		
		for (let idx = 0; idx < ml; ++idx){
			let q = queries[idx];
			
			let num = 0;
			let len = q.asString.length;
			let textQuery = null;
			
			for (let j= 0; j < len; ++j){
				let queryEntry = q.asString[j];
				
				if (queryEntry.type != "query") {
					++num;
				} else {
					textQuery = queryEntry.propValue;
				}
			}
			
			let numResultsString = q.resultCount;
			if (q.resultCount != 1)
				numResultsString += " "+Localization.getString("ro.results");
			else
				numResultsString += " "+ Localization.getString("ro.result");
			
			rendered += 
				'<a tabindex="0" class="queryPopupEntry" href="'+mahuUtils.addLanguageParameterToURL(q.url)+'" data-id="'+q.timestamp+'">'+
					'<div style="padding: 5px">'+
						'<p class="cropText">&bdquo;'+textQuery+'&ldquo;</p>'+
						'<div><p style="font-size: 0.8em" class="plain text-right">'+(num > 0? num+" "+Localization.getString("filters")+" | " :"") + numResultsString+' | '+getAgoString(q.timestamp)+'</p></div>'+
					'</div>'+
				'</a>';
		}
		// add "show complete research history" button
		rendered += '<a tabindex="0" class="queryPopupEntry" href="'+mahu.getMaterialSearchPageURL()+'#researchHistory" >'+
				'<div style="padding: 5px">'+
					'<div><p>'+Localization.getString("showResearchOverview")+'</p></div>'+
				'</div>'+
			'</a>';
		
		element.html(rendered);
		
		/* append event handlers 
		let panels = element.find(".queryPopupEntry");
		panels.on("click keyup", function(event){
			if (event.type === "keyup" && event.keyCode != 13){
				return;
			}
			
			window.location = $(event.currentTarget).attr("data-url");
		});*/
	};
	
	/*
	 * Renders the tracked queries section. 
	 */
	const _renderQueries = function(queriesToRender){
		if (!queriesToRender){
			queriesToRender = defaultSort(userHistory.getTrackedQueries());
		}
		
		if (queriesToRender.length > 0){
			// generate a string representation for each query. Although there may already be one
			// we re-generate it to enforce the current language
			queriesToRender.forEach(function(entry){
				entry.asString = mahuUtils.queryToString(entry);
			});
			
			renderQueries(parentElement.find(".queryList"), queriesToRender);

		} else 
			$("#searchQueriesContainer").hide();
	};
	
	/**
	 * Renders the research overview for the current user.
	 */
	const render = function(){
		let queriesToRender = getMostRelevant(userHistory.getTrackedQueries().reverse(), _limit);
		_renderQueries(queriesToRender);
		
		// register handler at history
		userHistory.addListener(history.entryTypes.TRACKEDQUERY, history.eventTypes.ALL, function(){
			$("#queryList").html("");
			$("#history").hide();
			render();
		}, this);

	};
	
	/* expose public interface */
	return {
		render : render
	};
};