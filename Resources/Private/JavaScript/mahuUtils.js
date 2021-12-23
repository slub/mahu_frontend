"use strict";
/**
 * Provides Material Hub specific utility functionality. 
 * 
 * Copyright 2017-2020 SLUB Dresden
 */
const mahuUtils = (function(){
	// caches the MaHu schema as well as material descriptors
	const CACHE = {
		schema: null,
		materials: []
	};
	
	/**
	 * Generates a data structure that contains textual representations of query parameters and facets 
	 * of a given query object.
	 * 
	 * The returned structure adheres to the following schema and can be utilized to generate a textual representation
	 * of a query:
	 * <code><pre> 
	 * {
	 *		type: "query" | "facet",
	 *		propName: String,
	 *		propValue: String 
	 * }
	 * </pre></code>
	 * @return Object
	 */
	const queryToString = function(query){
		let res= [];
		
		let fromString = Localization.getString("from");
		let toString = Localization.getString("to");
		
		// generate a human-readable text from facet values...
		if (query.facet){
			let propNames= Object.getOwnPropertyNames(query.facet);
			for (let idx = 0; idx < propNames.length; ++idx){
				let propName = propNames[idx];
				
				let propValue = query.facet[propName];
				let propValues = Object.getOwnPropertyNames(propValue);

				let propValueText = "";
				if (Array.isArray(propValues))
					propValueText = propValues.join(", ");
				else 
					propValueText = propValues.toString();
				propValueText = propValueText.replace("RANGE", fromString).replace("TO", toString);
				
				if (propName === "category" || propName === "usecases") {
					propValueText = Localization.getString(propValueText);
				}
				
				propName = Localization.getString(propName);
				
				res.push({
					type: "facet",
					propName: propName,
					propValue: propValueText 
				});
			}
		}
		
		const getPropName = function(pName, pValue){
			if (pName.indexOf("genqft")!= -1) {
				if (pName.indexOf("genqftemp")!= -1) {// genqftempX
					if (pValue["2"]) {
						return Localization.getString(pValue["2"]);		
					}
				} else { // genqftX
					if (pValue["1"]) {
						return Localization.getString(pValue["1"]);		
					}
				}	
			} else {
				if (pName.indexOf("genqfdq")!= -1) {
					if (pValue["2"]) {
						return Localization.getString(pValue["2"]);		
					}
				} else { 
					if (pValue["3"]) {
						return Localization.getString(pValue["3"]);		
					}
				}
			}
			return "";
		};
		const getTo = function(pName, pValue){
			if (pName.indexOf("genqft")!= -1) {
				if (pName.indexOf("genqftemp")!= -1) {// genqftempX
					if (pValue["1"]) {
						return pValue["1"];		
					}
				} else { // genqftX --> no range
					return undefined;
				}	
			}
			return pValue["1"];
		};
		const getUnit = function(pName, pValue){
			if (pName.indexOf("genqft")!= -1) {
				if (pName.indexOf("genqftemp")!= -1) {// genqftempX
					return "° C";
				} 
				// genqftX --> no unit
			} else {
				if (pName.indexOf("genqfdq")!= -1) {
					// genqfdq --> no unit
				} else {
					if (pValue["2"]) {
						return pValue["2"];		
					}
				}
			}
			return "";
		};
		
		// ... and query parameters
		if (query.q){
			let propNames= Object.getOwnPropertyNames(query.q);
			for (let idx = 0; idx < propNames.length; ++idx){
				let propName = propNames[idx];
				
				let propValue = query.q[propName];
				let propValueText = "";
				if (Array.isArray(propValue)){
					if (propValue.length > 0){
						// get value depending on input element type (select vs textfield)
						let node = $(".fieldContainer *[id^='c"+mahu.getUid()+"-field-"+propName+"']")[0];
						if (node && node.nodeName == "SELECT"){
							for (let oi = 0 ; oi < node.length; ++oi){
								if (node[oi].value == propValue){
									propValueText = node[oi].text;
									break;
								}
							}
						} else {
							if (propValue.length == 1)
								propValueText = propValue[0];
							if (propValue.length > 1) {
								let from = propValue[0],
									to = propValue[1],
									unit = propValue[2];
							
								if (propName.indexOf("genqf")!= -1){
									to = getTo(propName, propValue);
									unit = getUnit(propName, propValue);
								}
								
								if (from) {
									if (propName.indexOf("genqft")!= -1 && propName.indexOf("genqftemp")== -1) {
										propValueText += from +" ";
									} else {
										propValueText += fromString + " " + from + " ";
									}
									if (unit)
										propValueText += unit + " ";
								}
								if (to) {
									propValueText += toString + " " + to;
									if (unit)
										propValueText += " "+unit;
								}
							}
						}
					}
				} else {
					if (typeof(propValue) == "string"){
						propValueText = propValue;
					} else {
						// propValue is an object. This occurs in case of range query fields with min and/or max and/or unit not set; 
						// and if "queryAlternate" is activated (in setup.txt; c.f. documentation of the extension "find")
						if (propValue["term"]){
							propValueText += propValue["term"];
						} else {
							let from = propValue[0],
								to = propValue[1],
								unit = propValue[2];
							
							if (propName.indexOf("genqf")!= -1){
								to = getTo(propName, propValue);
								unit = getUnit(propName, propValue);
							}
							
							if (from) {
								propValueText += fromString + " " + from;
								if (unit)
									propValueText += " " + unit + " ";
							}
							if (to) {
								propValueText += toString + " " + to;
								if (unit)
									propValueText += " "+unit;
							}
						}
					}
				}
				
				// some post processing for better readability
				propName = Localization.getString(propName);
				if (propName == "default")
					propName = Localization.getString("keywords");
				if (propName.indexOf("genqf")!= -1){// in case of generic query fields, the actual material property is encoded as an object property
					propName = getPropName(propName, propValue);
				}

				if (propValueText == "true")
					propValueText = Localization.getString("yes");
				if (propValueText == "false")
					propValueText = Localization.getString("no");
				
				propValueText = propValueText.trim();
				
				if (propValueText.length > 0){
					let type = "query";
					if (propName != Localization.getString("keywords")){
						type = "filter";
					}
					
					res.push({
						type: type,
						propName: propName,
						propValue: propValueText 
					});
				}
			}
		}
		return res;
	};
	
	/**
	 * Answers if the given query object carries any meaningful query parameters or facet values.
	 * @return String
	 */
	const queryIsEmpty = function(query){
		if (!query) return true;
		
		let qu = query.q;
		
		let hasFacets = query.facet;
		let hasText = false;
		let hasQuery = false;
		
		if (qu!=null){
			if (qu.default)
				hasText = (qu.default.length > 0 && qu.default != "*") || (qu.default.term && qu.default.term.length > 0 && qu.default.term != "*");
			
			let propNames= Object.getOwnPropertyNames(qu);
			for (let idx = 0; idx < propNames.length; ++idx){
				let propName = propNames[idx];
				if ("default" === propName) continue;
				
				let val = qu[propName];
			
				let isArray = Array.isArray(val);
				hasQuery = hasQuery || (isArray && val.length > 0) || (!isArray && val != null);
			}
		}
		
		return !hasFacets && !hasText && !hasQuery;
	};
	
	/**
	 * Asynchronously fetches the complete description of the material specified by its ID. 
	 * 
	 * @return Promise
	 */
	const queryMaterialDescription = function(materialID){
		if (!materialID || materialID.length < 1) return false;
		
		let cacheHit = null;
		// lookup material descriptor in cache first
		for (var i=0; i < CACHE.materials.length; ++i){
			let material = CACHE.materials[i];
			if (material.id === materialID){
				cacheHit = material;
				break;
			}
		};

		if (cacheHit){
			return $.Deferred().resolve( [cacheHit] );
		} else {
			// query material descriptor in the JSON format from the server
			let promise = $.ajax(
				mahu.getJSONExportLinkTemplate(materialID),
				{
					accept: "text/json",
					async: true,
					contentType: "text/json",
					dataType: "json"
				});
			// cache material descriptor
			promise.done(function(_rs){
				CACHE.materials.push(_rs[0]);
			});
			return promise;
		}
	};

	/**
	 * Asynchronously fetches the complete description of the material specified by its ID. 
	 * 
	 * @return Promise
	 */
	const queryMaterialDescriptionRDF = function(materialID){
		if (!materialID || materialID.length < 1) return false;
		
		// query material descriptor in the JSON format from the server
		let promise = $.ajax(
			mahu.getRDFExportLinkTemplate(materialID),
			{
				accepts: "application/rdf+xml",
				async: true,
				contentType: "application/rdf+xml",
				dataType: "text"
			});
		return promise;
	};

	
	/**
	 * Asynchronously fetches the MaHu schema formatted in JSON. 
	 * 
	 * @return Promise
	 */
	const querySchema = function(){
		// lookup cache first
		if (CACHE.schema){
			return $.Deferred().resolve(CACHE.schema);
		} else {
			// query schema data structure from server if not yet cached
			let promise = $.ajax(
					mahu.getJSONExportLinkTemplate(""),
					{
						accepts: "text/json",
						async: true,
						contentType: "text/json",
						dataType: "json"
					});
			// cache the schema data structure
			promise.done(function(_r){
				CACHE.schema = _r;
			});
			return promise;
		}
	};
	
	/**
	 * Creates an in-memory file with the given name, filetype and data and opens a
	 * download dialog to make it accessible for users.
	 * 
	 */
	const save = function(filename, data, filetype) {
		// code adapted from https://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
	    var blob = new Blob(data, {
	    	type: filetype || 'text/csv'
	    	});
	    if(window.navigator.msSaveOrOpenBlob) {
	        window.navigator.msSaveBlob(blob, filename);
	    }
	    else{
	        var elem = window.document.createElement('a');
	        elem.href = window.URL.createObjectURL(blob);
	        elem.download = filename;
	        document.body.appendChild(elem);
	        elem.click();
	        document.body.removeChild(elem);
	    }
	};
	
	/**
	 * Open an e-mail as configured by the <code>config</code> parameter, which is structured as follows
	 * <pre><code>
	 * {
	 *     to: String,
	 *     subject: String
	 *     body: String
	 * }
	 * </code></pre>
	 * 
	 * @param (Object) config
	 */
	const openEMail = function(config){
		let to = config.to,
			subject = config.subject,
			content = config.body;
		
		let linkEl = document.createElement("a");
		let body= document.getElementsByTagName("body")[0];
		body.appendChild(linkEl);
		let href = "mailto:";
		if (to){
			href+=to
		}
		href+="?";
		if (subject) {
			href+="subject="+subject;
		}
		href+="&";
		if (content) {
			href+="body="+encodeURIComponent(content);
		}
		linkEl.href= href;
		linkEl.click();
		body.removeChild(linkEl);
	};
	
	/**
	 * Appends the langugage parameter with the currently set language id to the given URL.
	 */
	const addLanguageParameterToURL = function(url){
		let lid = mahu.getLanguageID() || "0";
		if (!url.endsWith("&")) {
			url+="&";
		}
		return url+"L="+lid;
	};
	
	/**
	 * This method constructs a URL representing the given query object.
	 * 
	 * @param {Query} the query object
	 * @return String a URL
	 */
	const queryToURL = function(query){
		let res = window.location.origin+mahu.getMaterialSearchPageURL()+"?";
		
		const qPref = "tx_find_find";
		
		if (query.q){
			let propNames= Object.getOwnPropertyNames(query.q);
			for (let idx = 0; idx < propNames.length; ++idx){
				let propName = propNames[idx];
				
				let propValue = query.q[propName];

				if (Array.isArray(propValue)){
					if (propValue.length > 0){
						for (let j=0;j < propValue.length; ++j){
							res+= qPref+"[q]["+propName+"]["+j+"]="+propValue[j];
							if (j!= propValue.length-1)
								res+="&";
						}
						res+="&";
					}
				} else {
					if (typeof(propValue) == "string"){
						res+= qPref+"[q]["+propName+"]="+propValue+"&";
					} else {
						let innerPropNames= Object.getOwnPropertyNames(propValue);
						for (let b = 0; b < innerPropNames.length; ++b){
							let innerPropName = innerPropNames[b];
							let innerPropValue = propValue[innerPropName];
							
							// assume only primitive datatypes here
							res+= qPref+"[q]["+propName+"]["+innerPropName+"]="+innerPropValue;
							res+="&";
						}
					}
				}
			}
		}
		if (query.facet){
			let propNames= Object.getOwnPropertyNames(query.facet);
			for (let idx = 0; idx < propNames.length; ++idx){
				let propName = propNames[idx];
				
				let propValue = query.facet[propName];

				if (Array.isArray(propValue)){
					if (propValue.length > 0){
						for (let j=0;j < propValue.length; ++j){
							res+= qPref+"[facet]["+propName+"]["+j+"]="+propValue[j];
							if (j!= propValue.length-1)
								res+="&";
						}
						res+="&";
					}
				} else {
					if (typeof(propValue) == "string"){
						res+= qPref+"[facet]["+propName+"]="+propValue+"&";
					} else {
						let innerPropNames= Object.getOwnPropertyNames(propValue);
						for (let b = 0; b < innerPropNames.length; ++b){
							let innerPropName = innerPropNames[b];
							let innerPropValue = propValue[innerPropName];
							
							let ipnEscaped = innerPropName.replace("&","%26");
							
							// assume only primitive datatypes here
							res+= qPref+"[facet]["+propName+"]["+ipnEscaped+"]="+innerPropValue;
							res+="&";
						}
					}
				}
			}
		}
		if (query.sort){
			res+=qPref+"[sort]="+query.sort+"&";
		}
		if (query.count){
			res+=qPref+"[count]="+query.count;
		}

		return res;
	};
	
	/**
	 * This method rounds the given numeric value with the given precision.
	 * 
	 * @param value {number} the value to be rounded
	 * @param precision {integer} desired number of decimal places
	 * @return number the result
	 */
	const round = function(value, precision){
		  let factor = Math.pow(10, precision);
		  
		  return Math.round(value * factor) / factor;
	};
	
	/**
	 * Determines whether the search form uses POST requests.
	 */
	const usesPostRequests = function(){
		let sfr = $("form.searchForm")[0];
		if (sfr)
			return sfr.method == "post";
		return false;
	}
	
	/* expose public interface */
	return {
		queryIsEmpty: queryIsEmpty,
		queryToString: queryToString,
		queryToURL: queryToURL,
		queryMaterialDescription: queryMaterialDescription,
		queryMaterialDescriptionRDF: queryMaterialDescriptionRDF,
		querySchema : querySchema,
		saveBlobAsFile : save,
		openEMail: openEMail,
		round : round,
		usesPostRequests : usesPostRequests,
		addLanguageParameterToURL: addLanguageParameterToURL
	}
})();