/**
 * JavaScript for the TYPO3 find extension.
 *
 * Handles:
 *  * passing underlying query information using POST to enable result paging
 *  * toggling extended search
 *  * autocomplete initialisation
 *  * histogram facet selection
 *  * showing facet overflow items
 *
 * 2013 Sven-S. Porst, SUB Göttingen <porst@sub.uni-goettingen.de>
 */
var tx_find = (function() {

var URLParameterPrefix = 'tx_find_find';
var container;


/**
 * Initialise. Set up:
 * * container element variable
 * * autocomplete for form fields
 * * autocomplete for facets
 * * event handlers
 */
var initialise = function () {
	
	$.widget( "custom.catcomplete", $.ui.autocomplete, {
			_create: function() {
				this._super();
				this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
			},
			_renderMenu: function( ul, items ) {
				var that = this,
					currentCategory = "";
				$.each( items, function( index, item ) {
					var li;
					if ( item.category != currentCategory ) {
						ul.append( "<li class='ui-autocomplete-category'>" + item.categoryLabel + "</li>" );
						currentCategory = item.category;
					}
					li = that._renderItemData( ul, item );
					if ( item.category ) {
						li.attr( "aria-label", item.categoryLabel + " : " + item.label );
					}
				});
			}
		});
	
	jQuery(document).ready(function() {
		container = jQuery('.tx_find');

		if (jQuery.ui && jQuery.ui.autocomplete) {
			// Set up jQuery UI Autocomplete search fields with the autocompleteURL attribute.
			jQuery('.fieldContainer input[autocompleteURL!=""]', container).catcomplete({
				minLength: 2,
				source: function(request, returnSuggestions) {
					
					var autocompleteURL = this.element.attr('autocompleteURL');
					if (autocompleteURL) {
						let queryTerm = request.term.toLowerCase().trim();
						autocompleteURL = autocompleteURL.replace('%25%25%25%25', queryTerm);
						// first, query suggestions from Solr
						jQuery.getJSON(autocompleteURL, function (data) {
							// the data struture holding suggestions from all sources
							let finaldata = [];
							// add all Solr suggestions (per default max 10)
							data.forEach(function(item){
								finaldata.push({
									label: item,
									category: "query",
									categoryLabel: Localization.getString("querySuggestions")
								});
							});
							
							let matClassReqs = [];
							
							// try to identify material classes
							let matClasses = mahu.getTaxonomy().listMaterialClasses();
							for (let mci=0; mci < matClasses.length; ++mci) {
								let matClass = matClasses[mci];
								
								let tokens = queryTerm.split(" ");
								for (let ti= 0; ti < tokens.length;++ti) {
									let token = tokens[ti];
									
									// skip very short tokens
									if (token.length < 2) continue;
									
									let lmcl = Localization.getString(matClass);
									
									if (matClass.toLowerCase().indexOf(token) != -1 || lmcl.toLowerCase().indexOf(token) != -1) {
										let mcr= {
											category: "filter",
											categoryLabel: Localization.getString("addFilter"),
											label: Localization.getString("matClass")+" = "+ lmcl,
											value: matClass,
											id: "category"
										};
										matClassReqs.push(mcr);
										break; // avoid duplicate material categories
									}
								}
							}

							// add up to 5 material category suggestions							
							matClassReqs = matClassReqs.slice(0,5);
							finaldata= finaldata.concat(matClassReqs);
							
							// in addition, we determine suggestions on material property filters (--> lead to Requirement Tags)
							// get the Schema
							mahuUtils.querySchema().done(function(r){
								if (r.properties) {
									let propNames = Object.getOwnPropertyNames(r.properties);
									
									for (let b=0; b < propNames.length; ++b) {
										let prop = r.properties[propNames[b]];
										let label = Localization.getString(prop.id);
										
										// per property, we match query tokens with the localized label of that property 
										let requirement = null;
										let matchingToken = -1;
										let tokens = queryTerm.split(" ");
										
										for (let ti= 0; ti < tokens.length;++ti) {
											let token = tokens[ti];
											
											// only match tokens that are at least 3 chars long 
											if (token.length > 2 &&	label.toLowerCase().indexOf(token) != -1) {
												requirement = {
													category: "filter",
													categoryLabel: Localization.getString("addFilter"),
													propertyLabel: label,
													label: label + " = *",
													id: prop.id,
													prop: prop
												};
												matchingToken = ti;
												break;
											}
										}
										if (requirement){
											// if we found a matching requirement and if there are more than two tokens in the query, we try to identify 
											// candidates that can serve as min/max or value for the requirement
											if (tokens.length > 1) {
												tokens.splice(matchingToken, 1);
												
												// try to parse min and/or max values from the query
												if (requirement.prop.isQualitative) {
													// get Tokens from the query again, this time without "lowercase-ing"
													let orgTokens= request.term.trim().split(" ");
													orgTokens.splice(matchingToken,1);
													
													requirement.from = orgTokens[0];
													requirement.label = requirement.propertyLabel + " = "+ orgTokens[0];
												} else {
													let numbersInQuery= [];
													for (let ti=0; ti < tokens.length; ++ti) {
														let token = tokens[ti];
														if (isNaN(token)) {
															// the token cannot directly be interpreted as a number but contains digits -->
															// "post-process" it by, amongst others, removing all non-digits
															if (/\d/.test(token)) {
																let subtokens = token.replaceAll(/[^0-9,.]/g," ").replaceAll(/\s+/g," ").trim().split(" ");
																for (let sti=0; sti < subtokens.length; ++sti) {
																	let subtoken = subtokens[sti];
																	if (!isNaN(subtoken)) {
																		numbersInQuery.push(parseFloat(subtoken));
																	}
																}
															}
														} else {
															numbersInQuery.push(parseFloat(token));
														}
													}
													// fill the requirement data structure depending on the count of identified numbers
													// exactly one number leads to ">= a" requirements (TODO maybe support comparators in query)
													if (numbersInQuery.length == 1) {
														requirement.from = numbersInQuery[0];
														requirement.label = requirement.propertyLabel + " >= "+ numbersInQuery[0];
													}
													// more than one number: sort the numbers and take the first two to create a requirement "a - b"
													if (numbersInQuery.length > 1) {
														numbersInQuery.sort(function(a, b) {
														  return a - b;
														});
														requirement.from = numbersInQuery[0];
														requirement.to = numbersInQuery[1];
														requirement.label = requirement.propertyLabel + " = "+ numbersInQuery[0] + "-" + numbersInQuery[1];
													}
												}
											}
											// add the requirement suggestion to the results
											finaldata.push(requirement);
											
											// if there are material class requirements, we also suggest all combinations
											if (matClassReqs.length > 0) {
												for (let mcri= 0; mcri < matClassReqs.length; ++mcri) {
													let mcr = matClassReqs[mcri];
													
													finaldata.push({
														category: "filter",
														categoryLabel: Localization.getString("addFilter"),
														label: mcr.label + " und "+requirement.label,
														children: [mcr, requirement]
													});
												}
											}
										}
									}
								}
								
								// limit suggestions and return them
								returnSuggestions(finaldata.slice(0, 30));
							});
						});
					}
				},
				select: function(event, ui){
					let item = ui.item;
					// handle query suggestions from Solr and requirement suggestions accordingly
					if (item.category == "query") {
						// if the extended search form is invisible, we directly trigger the search when selecting a suggestion 
						if ($("#extendedSearchOptions .field-mode-extended").is(":visible")){
							return;
						}
						event.preventDefault();
						event.stopPropagation();
						// set the selected value and submit the form to initiate a new search
						this.value = ui.item.value;
						$("form[class~='searchForm']").submit();
					} else {
						// handle composite requirements (one on material class, the other on a physical property)
						if (Array.isArray(item.children)) {
							event.preventDefault();
							event.stopPropagation();
	
							this.value = "";
							// add a requirement tag
							mahu.getCurrentPage().addRequirementTag({
									unit: item.children[1].prop.defaultUnit || undefined,
									property: item.children[1].prop,
									from: item.children[1].from,
									to: item.children[1].to
								}, true);
							
							setTimeout(function(){
								let	formElement = document.createElement("input");
								formElement.value = "1";
								formElement.type = "hidden";
								formElement.name = "tx_find_find[facet][category]["+item.children[0].value+"]";
								//formElement.classList.add("hiddenSelectedFacet");
								$("form.searchForm").append(formElement);
								$("form.searchForm button.submit").click();	
							},100);
							
						} else {
							event.preventDefault();
							event.stopPropagation();
	
							this.value = "";
							if (item.id == "category") {
								let	formElement = document.createElement("input");
								formElement.value = "1";
								formElement.type = "hidden";
								formElement.name = "tx_find_find[facet][category]["+item.value+"]";
								//formElement.classList.add("hiddenSelectedFacet");
								$("form.searchForm").append(formElement);
								$("form.searchForm button.submit").click();
							} else {
								// add a requirement tag
								mahu.getCurrentPage().addRequirementTag({
										unit: item.prop.defaultUnit || undefined,
										property: item.prop,
										from: item.from,
										to: item.to
									}, true);
								// make sure that the extended search mode is active
								if (!$(".searchForm").hasClass("search-extended")) {
									$(".searchForm .hero-unit .controls a.extendedSearch").click();
								}
							}
						}
					}
				}
			});

			// Set up jQuery chosen for facet lists with a .facetSearch input.
			jQuery('.facetSearch', container).each( function () {
				jQuery(this).chosen({width: "100%;"}).bind('change', facetChosenSelect);
			});
		}

		jQuery('a.extendedSearch', container).click(toggleExtendedSearch);

//		jQuery('.position .resultPosition', container).click(onClickRecordNumber);
	});
};



// Localisation function. Currently not implemented.
var localise = function (term) {
	return term;
};



var googleMapsLoader = (function() {
	var load = function () {
		if (!window.google || !window.google.maps) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=tx_find.googleMapsLoader.mapsCallback';
			document.body.appendChild(script);
		}
	};

	var mapsCallback = function () {
		jQuery(document).trigger('tx_find.mapsLoaded');
	};

	return {
		'load': load,
		'mapsCallback': mapsCallback
	};

})();



/**
 * Handles selection in jquery.chosen menu for facets:
 * Get link of the selected facet and follow it.
 *
 * @param {Event} event
 * @param {object} data
 * @returns {undefined}
 */
var facetChosenSelect = function (event, data) {
	var term = data.selected;
	var jArticle = jQuery(this).parents('article');
	var jLI = jQuery("li[value='" + term + "']", jArticle);
	if (jLI.length === 1) {
		jQuery('a', jLI)[0].click();
	}
};



/**
 * Slides in the hidden items of a facet.
 *
 * @param {Event} myEvent click event
 * @returns {Boolean} false
 */
var showAllFacetsOfType = function (myEvent) {
	let jLink = jQuery(myEvent.currentTarget);
	let containingList = jLink.parents('ol')[0];
	// Fade in the hidden elemens and hide the Show All link.
	let hiddenElements = jQuery('.hidden', containingList);
	hiddenElements.slideDown(300);
	hiddenElements.removeClass('hidden').addClass('shown');

	jLink.attr("onclick", "return tx_find.hideFacetsOfType(event)");
	let jchild = jLink.children();
	jLink.text(Localization.getString("facets.showLess")).prepend(jchild);
	
	myEvent.stopPropagation();
	
	return false;
};

/**
 * Shorten the list of a facet
 * changes the name of the "hide" link
 *
 * @param myEvent
 * @returns {boolean}
 */
const hideFacetsOfType = function (myEvent) {
	let jLink = jQuery(myEvent.currentTarget);
	let containingList = jLink.parents('ol')[0];
	let els = jQuery('.shown', containingList);
	// Fade in the elements and change class to hidden again
	els.switchClass('shown', 'hidden');
	jLink.attr("onclick", "return tx_find.showAllFacetsOfType(event)");

	let num = els.length;
	let jchild = jLink.children();
	jLink.text(String.format(Localization.getString("facets.showMore"), num)).prepend(jchild);

	return false;
}


/**
 * Uses jQuery.flot to create a histogram for »terms« with configuration »config«
 * in »container.
 *
 * @param {object} terms (keys: year numbers, values: result counts)
 * @param {DOMElement} histogramContainer
 * @param {object} config
 */
var createHistogramForTermsInContainer = function (terms, histogramContainer, config) {
	var jGraphDiv = jQuery(histogramContainer);
	var graphWidth = jGraphDiv.parents('.facets').width();
	var canvasHeight = 150;
	jGraphDiv.css({'width': graphWidth + 'px', 'height': canvasHeight + 'px', 'position': 'relative'});

	var startSearchWithNewFacet = function (range) {
		var facetQueryString = 'RANGE%20' + range.from + '%20TO%20' + range.to;
		if (mahuUtils.usesPostRequests()){
			let formElement = document.createElement("input");
			formElement.type = "hidden";
			formElement.name = "tx_find_find[facet]["+config.facetID+"]["+unescape(facetQueryString)+"]";
			formElement.value = "1";

			let mainForm = $("form.searchForm")[0];
			mainForm.appendChild(formElement);
			mainForm.submit();
		} else {
			var linkTemplate = jQuery('.link-template', jQuery(histogramContainer).parent())[0].href;
			var facetLink = linkTemplate.replace('%25%25%25%25', facetQueryString);
			window.location.href = facetLink;
		}
	};

	var graphData = [];
	for (var yearName in terms) {
		var year = parseInt(yearName, 10);
		if (year) {
			graphData.push([year, terms[yearName]]);
		}
	}

	/**
	 * Set up xaxis with two labelled ticks, one at each end.
	 * Dodgy: Use whitespace to approximately position the labels in a way that they don’t
	 * extend beyond the end of the graph (by default they are centered at the point of
	 * their axis, thus extending beyond the width of the graph on one site.
	 *
	 * @param {object} axis
	 * @returns {array}
	 */
	var xaxisTicks = function (axis) {
		return [[axis.datamin, '      ' + axis.datamin], [axis.datamax, axis.datamax + '      ']];
	};

	// Use the colour of term list titles for the histogram.
	var graphColour = jQuery('.facetAdd', container).css('color');
	var selectionColour = jQuery('.facet h1', container).css('color');

	var graphOptions = {
		'series': {
			'bars': {
				'show': true,
				'fill': true,
				'lineWidth': 0,
				'barWidth': config.barWidth,
				// 'fillColor': graphColour
				'fillColor': 'grey'
			}
		},
		'xaxis':  {
			'tickDecimals': 0,
			'ticks': xaxisTicks,
			'autoscaleMargin': null
		},
		'yaxis': {
			'position': 'right',
			'tickDecimals': 0,
			'tickFormatter': function(val, axis) {return (val != 0) ? (val) : ('');},
			'labelWidth': 30
		},
		'grid': {
			'borderWidth': 0,
			'hoverable': true
		},
		'selection': {
			'mode': 'x',
			'color': selectionColour,
			'minSize': 0
		}
	};

	// Create plot.
	var plot = jQuery.plot(jGraphDiv , [{'data': graphData, 'color': graphColour}], graphOptions);
	
	jGraphDiv.parent().resize(function(event){
		let resizedElement = $(event.target);
		
		jGraphDiv.width(resizedElement.width());
		jGraphDiv.height(resizedElement.height());
	});

	// Create tooltip.
	var jTooltip = jQuery('#tx_pazpar2-histogram-tooltip');
	if (jTooltip.length === 0) {
		var tooltipDiv = document.createElement('div');
		tooltipDiv.setAttribute('id', 'tx_find-histogram-tooltip');
		jTooltip = jQuery(tooltipDiv).appendTo(document.body);
	}

	for (var termIndex in config.activeFacets) {
		var term = config.activeFacets[termIndex];
		var matches = term.match(/RANGE (.*) TO (.*)/);
		if (matches) {
			var selection = {};
			selection.from = parseInt(matches[1]);
			selection.to = parseInt(matches[2]);
			plot.setSelection({'xaxis': selection});
		}
	}


	/**
	 * Rounds the passed range to the next multiple of config.barWidth
	 * below and above.
	 *
	 * @param {object} range
	 * @returns {object}
	 */
	var roundedRange = function (range) {
		var outputRange = {};

		var from = Math.floor(range.from);
		outputRange.from = from - (from % config.barWidth);

		var to = Math.ceil(range.to);
		outputRange.to = to - (to % config.barWidth) + config.barWidth;

		return outputRange;
	};


	/**
	 * Rounds the xaxis range of the passed ranges, selects the resulting
	 * range in the histogram and starts a new search.
	 *
	 * @param {object} ranges
	 */
	var selectRanges = function (ranges) {
		var newRange = roundedRange(ranges.xaxis);
		plot.setSelection({'xaxis': newRange}, true);
		hideTooltip();
		startSearchWithNewFacet(newRange);
	};

	jGraphDiv.bind('plotclick', function (event, pos, item) {
		return true;
	});

	jGraphDiv.bind('plotselected', function(event, ranges) {
		selectRanges(ranges);
	});

	jGraphDiv.bind('plotunselected', function() {
		return false;
	});


	/**
	 * Hides the tooltip.
	 */
	var hideTooltip = function () {
		jTooltip.hide();
	};


	/**
	 * Updates the tooltip visiblity, position and text.
	 *
	 * @param {event} event
	 * @param {object} ranges with property »xaxis«
	 * @param {float} pageX current x coordinate of the mouse
	 */
	var updateTooltip = function (event, ranges, pageX) {
		var showTooltip = function(x, y, contents) {
			jTooltip.text(contents);
			if (x) {
				jTooltip.css( {
					'top': y - 20,
					'left': x + 5
				});
			}
			jTooltip.show();
		};

		var tooltipY = jGraphDiv.offset().top + canvasHeight - 20;
		var displayString;

		if (ranges) {
			if (histogramContainer.currentSelection && histogramContainer.currentSelection.xaxis) {
				var range = roundedRange(ranges.xaxis);
				displayString = range.from.toString() + '-' + range.to.toString();
			}
			else {
				var year = Math.floor(ranges.xaxis.from);
				year = year - (year % config.barWidth);
				if (terms[year]) {
					var hitCount = terms[year];
					var displayString = year.toString() + ': ' + hitCount + ' ' + localise('Treffer');
				}
			}
		}

		if (displayString) {
			showTooltip(pageX, tooltipY, displayString);
		}
		else {
			hideTooltip();
		}
	};

	jGraphDiv.bind('plothover', function(event, ranges, item) {
		updateTooltip(event, {'xaxis': {'from': ranges.x, 'to': ranges.x}}, ranges.pageX);
	});

	jGraphDiv.bind('plotselecting', function (event, info) {
		histogramContainer.currentSelection = info;
		updateTooltip(event, info);
	});

	jGraphDiv.mouseout(hideTooltip);
};



/**
 * Called by links to detail view pages for which result paging is required.
 *	* passes the detail page information in GET parameters (for good URLs)
 *	* passes the query information in POST parameters
 *	* the server can then render the details page while still having information
 *		about the original query for paging
 *
 * @param {DOMElement} element receiver of the click event
 * @param {int} position number of the result to go to [optional]
 * @param {event} click event [optional]
 * @returns Boolean false when the POST request was submitted, true otherwise
 */
var detailViewWithPaging = function (element, position, event = window.event) {

	/**
	 * Recursively creates input elements with values for the content of the passed object.
	 * e.g. use the object { 'top' : {'a': 'b'}, 'second': 2} to create
	 * <input name="prefix[top][a]" value="b"/>
	 * <input name="prefix[second]" value="2"/>
	 *
	 * @param {string} prefix name attribute prefix
	 * @param {object} object data to build the <input> elements from
	 * @returns array of DOMElements
	 */
	var inputsWithPrefixForObject = function (prefix, object) {
		var inputs = [];
		for (var key in object) {
			var prefixWithKey = prefix + '[' + key + ']';
			var value = object[key];
			if (typeof(value) === 'object') {
				inputs = inputs.concat(inputsWithPrefixForObject(prefixWithKey, value));
			}
			else {
				inputs.push(inputWithNameAndValue(prefixWithKey, value));
			}
		}
		return inputs;
	};


	/**
	 * Creates an <input> element for the given name and value.
	 * 
	 * @param {string} name for name property of the <input> element
	 * @param {string} value for value property of the <input> element
	 * @returns DOMElement <input> element
	 */
	var inputWithNameAndValue = function (name, value) {
		var input = document.createElement('input');
		input.name = name;
		input.value = value;
		input.type = 'hidden';
		return input;
	};


	if (underlyingQuery) {
		// Try to determine position if it is not set explicitly (we should be in the main result list).
		var jLI = jQuery(element).parents('li');
		var jOL = jLI.parents('ul.resultList');
		if (position) {
			underlyingQuery.position = position;
		}
		else if (jOL) {
			underlyingQuery.position = parseInt(jOL.attr('start')) + parseInt(jLI.index());
		}

		var form = document.createElement('form');
		var linkURL = element.getAttribute('href');
		form.action = linkURL;
		form.method = 'POST';
		form.style = 'display:none;';
		document.body.appendChild(form);

		var inputs = inputsWithPrefixForObject(URLParameterPrefix + '[underlyingQuery]', underlyingQuery);
		for (var inputIndex in inputs) {
			form.appendChild(inputs[inputIndex]);
		};

		if (jQuery('.searchForm.search-extended', container).length > 0) {
			form.appendChild(inputWithNameAndValue(URLParameterPrefix + '[extended]', '1'));
		}
		
		if((event.which == 2) || event.ctrlKey || event.metaKey) {
			form.target = "_blank";
			event.preventDefault();
		}

		result = form.submit();
		return false;
	}

	return true;
};



/**
 * Toggles extended search: shows/hides additional fields
 * and changes location URL to reflect the state.
 *
 * @returns {boolean}
 */
var toggleExtendedSearch = function () {
	var parameterName = URLParameterPrefix + '[extended]';

	// Change URL in address bar.
	var jForm = jQuery('.searchForm', container);
	var jThis = jQuery(this);
	var makeExtended= !jForm.hasClass('search-extended');
	if (makeExtended) {
		jThis.text(this.getAttribute('extendedstring'));
		jQuery('.field-mode-extended', jForm).slideDown('fast');
		changeURLParameterForPage('extended', 1);
		$(".field-mode-extended").css("display","grid");
	}
	else {
		jThis.text(this.getAttribute('simplestring'));
		jQuery('.field-mode-extended', jForm).slideUp('fast');
		changeURLParameterForPage('extended');
	}
	jForm.toggleClass('search-simple').toggleClass('search-extended');

	return false;
};


var changeURLParameterForPage = function (name, value) {
	var parameterName = URLParameterPrefix + '[' + name + ']';

	// Change the URL in the location bar.
	var newURL = removeURLParameter(location.href, parameterName);
	if (value !== undefined) {
		newURL = addURLParameter(newURL, parameterName, value);
	}
	changeURL(newURL);

	// Change other link URLs on the page.
	jQuery('a:not(.no-change)', container).each( function () {
		if (value !== undefined) {
			this.href = addURLParameter(this.href, parameterName, value);
		}
		else {
			this.href = removeURLParameter(this.href, parameterName);
		}
	});

	// De/activate hidden input »extended« in the form.
	jQuery('input.' + parameterName, container).each( function () {
		if (value !== undefined) {
			this.setAttribute('name', URLParameterPrefix + '[' + parameterName + ']');
		}
		else {
			this.setAttribute('name', '');
		}
	});
};




var addURLParameter = function (url, name, value) {
	var nameEscaped = encodeURIComponent(name);
	var valueEscaped = encodeURIComponent(value);
	var urlParts = url.split('#');
	urlParts[0] += (urlParts[0].match(/\?/) ? '&' : '?') + nameEscaped + '=' + valueEscaped;
	return urlParts.join('#');
};

var removeURLParameter = function (url, name) {
	var nameEscaped = encodeURIComponent(name);
	var re = new RegExp('&?' + nameEscaped + '=[^&]*');
	var newURL = url.replace(re, '').replace(/\?$/, '');
	return newURL;
};



/**
 * Pushes newURL to the history state.
 *
 * @param {string} newURL
 */
var changeURL = function (newURL) {
	if (history.pushState !== undefined) {
		history.pushState(null, null, newURL);
	}
};


/*var onClickRecordNumber = function (myEvent) {
	
};

*/

initialise();

return {
	'showAllFacetsOfType': showAllFacetsOfType,
	'hideFacetsOfType': hideFacetsOfType,
	'createHistogramForTermsInContainer': createHistogramForTermsInContainer,
	'detailViewWithPaging': detailViewWithPaging,
	'toggleExtendedSearch': toggleExtendedSearch,
	'googleMapsLoader': googleMapsLoader,
	'changeURLParameterForPage': changeURLParameterForPage,
	'addURLParameter': addURLParameter,
	'removeURLParameter': removeURLParameter,
	'changeURL': changeURL,
	'URLParameterPrefix': URLParameterPrefix
};

})();




/**
 * Object to set up the map in a facet.
 *
 * @type {object}
 */
var tx_find_facetMap = (function () {
	var interface = {};
	var config;
	var map;
	var markers = {};
	interface.markers = markers;

	var init = function (parameters) {
		config = parameters;
		interface.config = config;
		if (document.google !== undefined && google.maps) {
			mapsLoadedCallback();
		}
		else {
			jQuery(document).bind('tx_find.mapsLoaded', mapsLoadedCallback);
			tx_find.googleMapsLoader.load();
		}
	};
	interface.init = init;

	var mapsLoadedCallback = function () {
		// Extract information from facet data.
		// The facet term needs begin with the zero-padded zoom level,
		// a dash and the geohash. The facet needs to be sorted by index.
		var zoomInfo = {};
		var lastZoomLevel = 0;
		for (var facetIndex in config.facetData) {
			var indexParts = facetIndex.split('-');
			if (indexParts.length === 2) {
				var geohashScale = parseInt(indexParts[0]);
				lastZoomLevel = geohashScale;
				
				if (!zoomInfo[geohashScale]) {
					zoomInfo[geohashScale] = {};
				}
				zoomInfo[geohashScale][indexParts[1]] = config.facetData[facetIndex];
			}
		}

		var lastZoomLevelIsComplete = (Object.keys(config.facetData).length < config.facetFetchMaximum);
		if (!lastZoomLevelIsComplete) {
			lastZoomLevel--;
		}

		// Create map.
		var mapOptions = {
			'mapTypeId': google.maps.MapTypeId.ROADMAP,
			'mapTypeControl': false,
			'streetViewControl': false,
			'scrollwheel': false
		};

		map = new google.maps.Map(config.container, mapOptions);
		interface.map = map;

		// Use the last complete level of geo information to determine the bounding box.
		var containingBounds = new google.maps.LatLngBounds();
		var zoomLevelInfo = zoomInfo[lastZoomLevel];
		for (var geohashString in zoomLevelInfo) {
			var geohashBounds = geohash.bbox(geohashString);
			var bounds = new google.maps.LatLngBounds(
				new google.maps.LatLng(geohashBounds.s, geohashBounds.w),
				new google.maps.LatLng(geohashBounds.n, geohashBounds.e)
			);
			containingBounds.union(bounds);
		}

		// Shrink the bounding box a little to compensate for Google’s generous margins.
		var containingSpan = containingBounds.toSpan();
		var shrinkFactor = 0.2;
		var shrunkBounds = new google.maps.LatLngBounds(
			new google.maps.LatLng(
				containingBounds.getSouthWest().lat() + containingSpan.lat() * shrinkFactor,
				containingBounds.getSouthWest().lng() + containingSpan.lng() * shrinkFactor
			),
			new google.maps.LatLng(
				containingBounds.getNorthEast().lat() - containingSpan.lat() * shrinkFactor,
				containingBounds.getNorthEast().lng() - containingSpan.lng() * shrinkFactor
			)
		);

		var centre = shrunkBounds.getCenter();
		var bounds = shrunkBounds.extend(
			new google.maps.LatLng(centre.lat() - 0.01, centre.lng() - 0.01)
		).extend(
			new google.maps.LatLng(centre.lat() + 0.01, centre.lng() + 0.01)
		);

		map.fitBounds(shrunkBounds);

		// Determine which zoom level to take the data from.
		var geohashScaleForMarkers = 0;
		for (var zoomLevel = 1; zoomLevel <= lastZoomLevel; zoomLevel++) {
			if (Object.keys(zoomInfo[zoomLevel]).length < 100) {
				geohashScaleForMarkers = zoomLevel;
			}
		}

		zoomLevelInfo = zoomInfo[geohashScaleForMarkers];
		for (var geohashString in zoomLevelInfo) {
			var geohashPoint = geohash.decode_exactly(geohashString);
			var point = new google.maps.LatLng(geohashPoint[0], geohashPoint[1]);
			var resultCount = zoomLevelInfo[geohashString];
			var marker = new google.maps.Marker({
				'map': map,
				'position': point,
				'title': resultCount.toString(),
				'icon': {
					'path': google.maps.SymbolPath.CIRCLE,
					'strokeColor': 'e33',
					'fillColor': 'f33',
					'fillOpacity': 1,
					'scale': 0.5 + Math.min(Math.sqrt(resultCount), 5)
				}
			});
			markers[geohashString] = marker;
		}

		jQuery(config.container).trigger('tx_find.facetMapLoaded');
	};

	return interface;

})();


// Add object property counting for old browsers.
if (!Object.keys) {
    Object.keys = function (obj) {
        var keys = [],
            k;
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    };
}
