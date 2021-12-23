/**
 * Renders a tag cloud of terms for a given material property and, optionally, a search field.
 * In order to do so, this widget builds up on the terms API provided by find reqspectively Solr.
 * 
 * Copyright 2017-2020 SLUB Dresden
 */
const TagCloud = function(parentElement, fieldName, facetID, height, showSearchField){
	
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
	 * Renders this tag cloud.
	 */
	const render = function(){
		queryData().done(function(res){
			let array = [];
			// prepare data structure
			for (let idx = 0; idx < res.terms[fieldName].length; idx+=2){
				let name = res.terms[fieldName][idx];
				let count= res.terms[fieldName][idx+1];
				
				let label = Localization.getString(name);
				
				// properties "text" and "weight" are required for jQCloud; "label" and "value" for jQuery Autocomplete
				array.push({
					text: label,
					label: label,
					value: label,
					weight: count,
					link: decodeURI(mahu.getQueryAndFacetLink("*", facetID, name))
				});
			}
			
			// create dedicated container element which holds search field and/or tag cloud and which is added to the given parentElement
			let tagCloudContainer = document.createElement("div");
			tagCloudContainer.id = "usecasesTagCloudContainer";
			
			// add search field
			if (showSearchField){
				let searchField = document.createElement("input");
				searchField.id = "usecasesSearch";
				searchField.type = "text";
				searchField.classList.add("form-control");
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
							if (array[i].text == value){
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
			
			let dataToUse = [];
			// limit the number of terms to be rendered
			if (array.length > 100){
				// sort ...
				array.sort(function(a,b){
					return b.weight - a.weight;
				});
				// and limit terms
				dataToUse = array.slice(0, 70);
			} else
				dataToUse = array;
			
			// init tag cloud utilizing jQCloud
			$(tagCloudContainer).jQCloud(dataToUse, {
				shape: "rectangular",
				height: height || 300,
				delayedMode: false,
				autoResize: true,
				encodeURI: false
			});
		});
	};
	
	/* expose public interface */
	return {
		render : render
	};
};