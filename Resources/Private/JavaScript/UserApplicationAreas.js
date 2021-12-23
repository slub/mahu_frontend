/**
 * Renders tags for application areas a user seems to be interested in.
 * 
 * Copyright 2018-2020 SLUB Dresden
 */
const UserApplicationAreas = function(parentElement){
	// the current user's history
	const history = mahu.getHistory();
	
	/*
	 * Calculates a relevance ranking of application areas / use cases based on the user history 
	 * (especially detail page visits) and the frecency approach which combines frequency and recency. 
	 */
	const calculateRanking = function(){
		// the user's page visits
		let pageVisits = history.getPageVisits();
		// stores information about application areas
		let appAreas= [];

		// internal helper to identify an element with a given name within the given array
		const findById = function(array, name){
			for (let i= 0; i < array.length; ++i){
				if (array[i].name == name)
					return array[i];
			}
			return null;
		};
		
		// gather all application areas from page visits
		pageVisits.forEach(function(material){
			let materialAppAreas = material.appAreas;
			
			if (materialAppAreas && Array.isArray(materialAppAreas)) {
				
				for (let i=0; i < materialAppAreas.length; ++i){
					let materialAppArea = materialAppAreas[i];
					
					let entry = findById(appAreas, materialAppArea);

					// material class has already occurred --> increment counter and update timestamp if necessary
					if (entry) {
						entry.count += 1
						entry.timestamp = Math.max( entry.timestamp, material.timestamp );
					} else {
						// material class has not yet appeared --> create new entrys
						appAreas.push({
							name: materialAppArea,
							label:Localization.getString(materialAppArea), 
							count: 1,
							timestamp: material.timestamp
						});
					}
				}
			}
		});
		
		let now = +new Date();
		let decayRate = 0.00000000026741789373;  // = (ln 2) / (30 days in milliseconds)
		let overallCount = 0;
		
		// determine overall count of application areas of materials visited by the user
		appAreas.forEach(function(appArea){
			overallCount += appArea.count;
		});

		// calc frecency value with half-life of 30 days
		appAreas.forEach(function(appArea){
			let age = now - appArea.timestamp;
			let count = appArea.count;
			
			let recency = Math.exp( -1 * decayRate * age);
			let frequence = count / overallCount;
			
			let frecency = recency + frequence;
			appArea.frecency = frecency;
		});
		
		// sort application areas by their frecency value
		return appAreas.sort(function(a, b){
			if (a.frecency > b.frecency)
				return -1;
			if (a.frecency < b.frecency)
				return 1;
			return 0;
		});
	};
	
	/*
	 * Answers the image URL for the given term.
	 */
	const getImgURL = function(term){
		return mahu.getImageLinkResolver().getImageURL(term) || mahu.getImageLinkResolver().getDefaultImageURL();
	};
	
	/**
	 * Renders the application areas which are relevant for the current user. 
	 */
	const render = function(){
		// derive the most relevant application areas (according to frecency)
		let ranking = calculateRanking();
		// limit to 5 entries
		ranking = ranking.slice(0, 5);
		
		if (ranking.length > 0){
			// render HTML to parent element
			let rendered = "";
			for (let i=0; i < ranking.length; ++i){
				let appArea = ranking[i];
				let href = mahu.getQueryAndFacetLink("*", "usecases", appArea.name);
				
				rendered +=
					'<a class="useCase" href="'+href+'" title="'+appArea.label+'">'+
						'<div class="imageWrap"><img src="'+getImgURL(appArea.name)+'" aria-hidden="true"></img></div>'+
						'<span class="cropText">'+appArea.label+'</span>'+
					'</a>';
			}
			
			$(parentElement).html(rendered);
		} else {
			// hide parent
			$(parentElement).hide();
			// hide h3 elements
			$(parentElement).siblings("h3").hide();
		}
	}
	
	/* expose public interface */
	return {
		render : render
	};
};