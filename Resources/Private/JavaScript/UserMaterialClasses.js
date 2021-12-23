/**
 * Renders tags for material classes a user seems to be interested in.
 * 
 * Copyright 2018-2020 SLUB Dresden
 */
const UserMaterialClasses = function(parentElement){
	
	// get an instance of the material taxonomy
	const taxonomy = mahu.getTaxonomy();
	
	// the default material classes to be shown in case of an empty user history
	const defaultClasses = [
		/*{
			id: "Schnellarbeitsstähle",
			imgUrl: "/typo3conf/ext/mahu_frontend/Resources/Public/Images/schnellarbeitsstahl.jpg",
			frecency: 1
		},
		{
			id: "Warmarbeitsstähle",
			imgUrl: "/typo3conf/ext/mahu_frontend/Resources/Public/Images/warmarbeitsstahl.jpg",
			frecency: 0.8
		},*/
		{
			id: "Metalle",
			imgUrl: "/typo3conf/ext/mahu_frontend/Resources/Public/Images/metall.jpg",
			frecency: 1
		},
		{
			id: "Keramik",
			imgUrl: "/typo3conf/ext/mahu_frontend/Resources/Public/Images/keramik.jpg",
			frecency: 0.8
		},
		{
			id: "Kunststoffe",
			imgUrl: "/typo3conf/ext/mahu_frontend/Resources/Public/Images/organisch-synthetisch.jpg",
			frecency: 0.6
		},
		{
			id: "Elastomere",
			imgUrl: "/typo3conf/ext/mahu_frontend/Resources/Public/Images/elastomere.jpg",
			frecency: 0.4
		},
		{
			id: "Verbundwerkstoffe",
			imgUrl: "/typo3conf/ext/mahu_frontend/Resources/Public/Images/compound.jpg",
			frecency: 0.2
		}
		/*{
			id: "Leichtmetalle",
			imgUrl: "/typo3conf/ext/mahu_frontend/Resources/Public/Images/leichtmetall.jpg",
			frecency: 0.2
		}*/
	];
	
	// the current user's history
	const history = mahu.getHistory();
	
	/*
	 * Calculates a relevance ranking of material classes based on the user history (especially 
	 * detail page visits) and the frecency approach which combines frequency and recency. 
	 * 
	 * more info about the adopted frecency algorithm can be found here https://wiki.mozilla.org/User:Jesse/NewFrecency
	 */
	const calculateRanking = function(){
		// the user's page visits
		let materials = history.getPageVisits();
		// stores information about material classes
		let classInfo= [];
		
		// internal helper to identify an element with a given name within the given array
		const findById = function(array, id){
			for (let i= 0; i < array.length; ++i){
				if (array[i].id == id)
					return array[i];
			}
			return null;
		};
		
		// gather all material classes from page visits
		materials.forEach(function(material){
			let cat = material.category;
			
			if (cat == null || cat.trim().length == 0) {
				return;
			}
			
			let entry = findById(classInfo, cat);
			
			// material class has already occurred --> increment counter and update timestamp if necessary
			if (entry){
				entry.count += 1
				entry.timestamp = Math.max( entry.timestamp, material.timestamp );
			} else {
				// material class has not yet appeared --> create new entrys
				classInfo.push({
					id: cat,
					count: 1,
					timestamp: material.timestamp,
					imgUrl: taxonomy.getImage(cat)
				});
			}
		});
		
		let now = +new Date();
		let decayRate = 0.00000000026741789373; // = (ln 2) / (30 days in milliseconds)
		let overallCount = 0;
		
		// determine overall count of material classes of materials visited by the user
		classInfo.forEach(function(matClass){
			overallCount += matClass.count;
		});
		
		// calc frecency value with half-life of 30 days		
		classInfo.forEach(function(matClass){
			let age = now - matClass.timestamp;
			let count = matClass.count;
			
			let recency = Math.exp( -1 * decayRate * age);
			let frequence = count / overallCount;
			
			let frecency = recency + frequence;
			matClass.frecency = frecency;
		});
		
		// sort material classes by their frecency value
		return classInfo.sort(function(a, b){
			if (a.frecency > b.frecency)
				return -1;
			if (a.frecency < b.frecency)
				return 1;
			return 0;
		});
	};
	
	/** 
	 * Renders the material classes 
	 */
	const render = function(){
		// derive the most relevant material classes (according to frecency)
		let ranking = calculateRanking();
		// limit to 5 entries
		ranking = ranking.slice(0, 5);
		
		if (ranking.length == 0) {
			ranking = defaultClasses;
			
			// hide h3 elements
			$(parentElement).siblings("h3")[0].textContent= Localization.getString("userMatClasses.headerWhenNoHistory");
		}
		
		// generate HTML code ...
		let rendered = "";
		for (let i=0; i < ranking.length; ++i){
			let mat = ranking[i];
			let label = taxonomy.getLabel(mat.id);
			let href = mahu.getQueryAndFacetLink("*","category", (mat.facetValue||mat.id));
			
			rendered +=
				'<a class="materialClass" href="'+href+'">'+
					'<div class="imageWrap"><img src="'+mat.imgUrl+'" aria-hidden="true"></img></div>'+
					'<span class="cropText">'+label+'</span>'+
				'</a>';
		}
		
		// ... and append it to the parent element 
		$(parentElement).html(rendered);
	}
	
	/* expose public interface */
	return {
		render : render
	};
};