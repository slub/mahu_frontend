"use strict";
/**
 * Defines the main object "mahu".
 * 
 * Copyright 2017-2020 SLUB Dresden
 */

if (!window.underlyingQuery)
	window.underlyingQuery = null;
if (!window.resultCount)
	window.resultCount = null;
if (!window.currentPage)
	window.currentPage = null;
if (!window.mahuCfg)
	window.mahuCfg = null;

const mahu = (function(){
	let config = {};
	
	let page = null;

	let userHistory= null;
	
	let taxonomy = null;
	
	let imageLinkResolver =  null;
	
	const getImageLinkResolver = function(){
		if (imageLinkResolver == null){
			imageLinkResolver = new ImageLinkResolver();
		}
		return imageLinkResolver;
	}
	
	let materialSelectorArea = null;
	
	const getMaterialSelector = function(){
		if (materialSelectorArea == null){
			materialSelectorArea = new MaterialSelector();
		}
		return materialSelectorArea;
	};
	
	/*
	 * Hide/Show "reset query"-button and modifier area
	 */
	const calculateButtonVisibility = function(){
		let button = $("#resetQuery");
		if (button && underlyingQuery && !isDetailPage()){
			if (!mahuUtils.queryIsEmpty(underlyingQuery)){
				button.show();
			}
		}
	};
	
	/*
	 * Add some click listeners
	 */
	const addClickHandlers = function(){
		
		/* in order to keep facet values when changing the query, add hidden form fields per query facet to the second <form> (which only contains
		 * the modifier area) */
		if (config.keepFacets){
			if (underlyingQuery && underlyingQuery.facet){
				let propNames= Object.getOwnPropertyNames(underlyingQuery.facet);
				for (let idx = 0; idx < propNames.length; ++idx){
					let propName = propNames[idx];
					
					let propValue = underlyingQuery.facet[propName];
					let propValues = Object.getOwnPropertyNames(propValue);
					let propValuesLength = propValues.length;
					
					for (let idy = 0; idy < propValuesLength; ++idy){
						let propValueText = propValues[idy].toString();
						
						let facetInput= document.createElement("input");
						facetInput.setAttribute("name", "tx_find_find[facet]["+propName+"]["+propValueText+"]");
						facetInput.setAttribute("value", "1");
						facetInput.setAttribute("type", "hidden");
						facetInput.setAttribute("class", "selectedFacetField");
						
						$("#modifierForm").append(facetInput);
					}
				}
			}
		}
		
		// clone all query fields of the (extended) search form and 
		// add them to the second <form> as well
		let clonedFields = $(".formFields input[id*='field']").clone();
		clonedFields.each(function(idx, clonedField){
			let orgId = clonedField.getAttribute("id");
			let org = $("#"+orgId)[0];
			let isCheckbox = org.type == "checkbox";
			clonedField.setAttribute("id", orgId + "_clone");
			if (isCheckbox){
				//clonedField.setAttribute("checked", org.getAttribute("checked"));
				clonedField.checked = org.checked;
				//clonedField.style = "visibility: hidden; float:right";
				$(clonedField).css("visibility", "hidden").css("float", "right");
			} else
				clonedField.setAttribute("type", "hidden");

			// link original and cloned input elements in order to synchronize changes
			$("#"+orgId).change(function(ev){
				if (isCheckbox) {
					//clonedField.setAttribute("checked", ev.target.getAttribute("checked"));
					clonedField.checked = ev.target.checked;
				} else {
					clonedField.value = ev.target.value;						
				}
				return false;
			});
		});
		
		// synchronize the other way around as well
		let clonedFields2 = $("#modifierForm select[id*='sortSelect'], #modifierForm select[id*='resultCountSelect'], #modifierForm input[id*='groupingSelector']").clone();
		clonedFields2.each(function(idx, clonedField){
			let orgId = clonedField.getAttribute("id");
			let org = $("#"+orgId)[0];
			let isCheckbox = org.type == "checkbox" || org.localName == "select";
			clonedField.setAttribute("id", orgId + "_clone");
			if (isCheckbox){
				//clonedField.setAttribute("checked", org.getAttribute("checked"));
				clonedField.checked = org.checked;
				//clonedField.style = "visibility: hidden; float:right";
				$(clonedField).css("visibility", "hidden").css("display","none");//.css("float", "right");
			} else
				clonedField.setAttribute("type", "hidden");

			// link original and cloned input elements in order to synchronize changes
			$("#"+orgId).change(function(ev){
				if (isCheckbox) {
					//clonedField.setAttribute("checked", ev.target.getAttribute("checked"));
					clonedField.checked = ev.target.checked;
				} else {
					clonedField.value = ev.target.value;						
				}
				return false;
			});
		});
		
		$("#modifierForm").append(clonedFields);
		$(".searchForm > div:first-Child").append(clonedFields2);
		
		
		/* collect info about range query fields */
		let rangeQueryFields = {};
		$(".formFields input").each(function(idx, field){
			let arr= new RegExp("c"+mahu.getUid()+"\-field\-(.+)\-(from|to|unit)").exec(field.id);
			if (arr && arr.length > 2){
				let fieldName = arr[1];
				if (!rangeQueryFields[fieldName])
					rangeQueryFields[fieldName] = {};
				
				rangeQueryFields[fieldName][arr[2]] = field;
			}
		});

		/* iterate all range query fields and attach a change listener */
		let rangeQueryFieldNames= Object.getOwnPropertyNames(rangeQueryFields); 
		let rangeQueryFieldNamesLength = rangeQueryFieldNames.length;
		
		for (let idx = 0; idx < rangeQueryFieldNamesLength; ++idx){
			let field= rangeQueryFields[rangeQueryFieldNames[idx]];
			
			let listener = function(){
				// make sure that the "unit" input is cleared if "from" and "to" are empty
				if (!field.from.value && !field.to.value)
					field.unit.value="";
				else { 
					// however, if a value is set to "from" or "to" and no unit is set (e.g. because it has been cleared by this listener),
					// we trigger a click event for the selected unit selector
					if (!field.unit.value)
					// query selected button (whose data attribute carries the id of the (hidden) unit input elemens 
					$("#"+field.from.id+" ~ button[class~='selected'][data='" + field.unit.id +"']")
					.click();
				}
				//return false;
			};
			// register listener on several events of the "from" and "to" input field 
			field.from.onchange = field.to.onchange = field.from.onkeyup = field.to.onkeyup = listener;
			
			/* click handler for unit selector buttons */
			let buttons = $("#"+field.from.id+" ~ button[class~='unitSelector']"), 
				_l = buttons.length;
			for (let i = 0; i < _l; ++i){
				let button = $(buttons[i]);
				
				button.click(function(me){
					button.addClass("selected");
					
					if (field.from.value || field.to.value) // only set if at least one of "from" and "to" fields carry a value
						$("#"+button.attr("data")).val(button.text());
					
					for (let j=0; j < _l; ++j){
						let otherButton = buttons[j];
						if (otherButton == me.target) continue;
						$(otherButton).removeClass("selected");
					}
					return false;
				});
			}
			
			/* click handler for unit selector as drop-down */
			let selects = $("#"+field.from.id+" ~ select[class~='unitSelector']"), 
				_sl = selects.length;
			for (let i = 0; i < _sl; ++i){
				let select = $(selects[i]);
				
				select.click(function(me){
					if (field.from.value || field.to.value) // only set if at least one of "from" and "to" fields carry a value
						$("#"+select.attr("data")).val(select.val());
					return false;
				});
			}
		}
		
		// register listener to history
		userHistory.addListener(history.entryTypes.BOOKMARK, history.eventTypes.ALL, calculateButtonVisibility, this);
	};
	
	const exportJSON = function(materialID, materialName){
		mahuUtils.queryMaterialDescription(materialID).done(function(res){
			mahuUtils.saveBlobAsFile(materialName+".json", [JSON.stringify(res)]);
		});
	};
	
	const exportRDF = function(materialID, materialName){
		mahuUtils.queryMaterialDescriptionRDF(materialID, true).done(function(res){
			mahuUtils.saveBlobAsFile(materialName+".rdf", [res]);
		});
	};
	
	/**
	 * Answers whether a material detail page is currently displayed.
	 */
	const isLandingPage = function(){
		return currentPage === "LandingPage";
		//return /find.+action.+=detail/.test(location.search);
	};
	
	/**
	 * Answers whether a material detail page is currently displayed.
	 */
	const isDetailPage = function(){
		return currentPage === "DetailPage";
		//return /find.+action.+=detail/.test(location.search);
	};
	
	/**
	 * Answers whether the FAQ page is currently displayed.
	 */
	const isFAQPage = function(){
		return currentPage === "FAQPage";
	};
	
	/**
	 * Answers whether the wizard is currently displayed.
	 */
	const isWizardPage = function(){
		return currentPage === "WizardPage";
	};

	
	/**
	 * Answers whether the partner page is currently displayed.
	 */
	const isPartnerPage = function(){
		return currentPage === "PartnerPage";
	};	

	/**
	 * Answers whether the facetted search interface with the results list is currently displayed.
	 */
	const isResultsPage = function(){
		//return $(".resultList, .noresultsMessage").length > 0;
		return currentPage === "ResultsPage";
	};

	/**
	 * Answers whether the regulations page is currently displayed.
	 */
	const isRegulationsPage = function(){
		return currentPage === "RegulationsPage";
	};
	
	/**
	 * Answers whether the facetted search interface with the results list is currently displayed and in 
	 * grouping mode.
	 */
	const isGroupedResultsView = function(){
		let firstTry = getParameter("tx_find_find[group]", window.location.search);
		if (firstTry !== undefined)
			return firstTry == "1";
		
		let nextTry = $("input[id$='groupingSelector']");
		if (nextTry && nextTry.length == 1){
			return nextTry[0].checked;
		}
		return false;
	};	
	
	/**
	 * Helper method that returns the value for the given key from the current URLs (window.location) query parameter list. 
	 * Optionally, a URL can be handed over.
	 */
	const getParameter = function(key, url) {
		if (!url){
			url = window.location.search;
		} else {
			// identify query part of the URL
			let idx = url.lastIndexOf("?");
			url = url.substring(idx);
		}
		let query = url.substring(1); 
		let pairs = query.split('&');
		
		let keyEncoded = encodeURI(key);
		
		let numPairs = pairs.length;
		for (var i = 0; i < numPairs; ++i) {
			var pair = pairs[i].split('=');
			if(pair[0] == key || pair[0] == keyEncoded) {
				if(pair[1].length > 0)
					return pair[1];
			}
		}
		 
		return undefined;  
	};
	
	/**
	 * Adds a bookmark for the given material descriptor.
	 */
	const addBookmark = function(entry){
		if (!userHistory) return;
		
		userHistory.addBookmark(entry);
	};
	
	/**
	 * Removes a bookmark for the given material descriptor.
	 */
	const removeBookmark = function(entry){
		if (!userHistory) return;
		
		userHistory.removeBookmark(entry);
	};
	
	
	/**
	 * Removes information about a material detail page visit to the user history.
	 */
	const removeVisitedPage = function(entry){
		if (!userHistory) return;
		
		userHistory.removePageVisit(entry);
	};
	
	/**
	 * Get the user history
	 */
	const getHistory = function(){
		return userHistory;
	};
	
	/**
	 * Get the material taxonomy
	 */
	const getTaxonomy = function(){
		if (taxonomy == null)
			taxonomy = new MaterialTaxonomy();
		return taxonomy;
	};
	
	/**
	 * initialize the MaHu
	 */
	const init = function(conf){
		// copy config provided via constructor
		Object.assign(config, conf);
		// copy config defined by global variable "mahuCfg" (injected via find --> partial JavaScript.html)
		if (mahuCfg)
			Object.assign(config, mahuCfg);

		
		// load user history from local storage
		userHistory= new history(config.userName || "");
		if (conf.enableHistory) { // directly enable history (otherwise this depends on the user accepting cookies)
			userHistory.enable();
		}
		

		if (config.materialSearchPageURL.indexOf("?") == -1) {
			// set term-API link template
			config.termLinkTemplate = config.materialSearchPageURL+ "?tx_find_find[data-format]=DATAFORMAT&tx_find_find[field]=FIELD&tx_find_find[controller]=Search&tx_find_find[action]=term&type=1369315139";
			// RDF-export link template
			config.rdfDataLinkTemplate = config.materialSearchPageURL+"?tx_find_find[data-format]=rdf&tx_find_find[controller]=Search&tx_find_find[id]=MATERIALID&tx_find_find[format]=data&type=1369315140";
			// JSON-export link template
			config.jsonDataLinkTemplate = config.materialSearchPageURL+ "?tx_find_find[data-format]=json&tx_find_find[controller]=Search&tx_find_find[id]=MATERIALID&tx_find_find[format]=data&type=1369315139";
			// suggestion API link template
			config.suggestLinkTemplate = config.materialSearchPageURL+ "?tx_find_find[q]=QUERY&tx_find_find[controller]=Search&tx_find_find[dictionary]=default&tx_find_find[format]=data&tx_find_find[action]=suggest&type=1369315139";
		} else {
			// set term-API link template
			config.termLinkTemplate = config.materialSearchPageURL+ "&tx_find_find[data-format]=DATAFORMAT&tx_find_find[field]=FIELD&tx_find_find[controller]=Search&tx_find_find[action]=term&type=1369315139";
			// RDF-export link template
			config.rdfDataLinkTemplate = config.materialSearchPageURL+"&tx_find_find[data-format]=rdf&tx_find_find[controller]=Search&tx_find_find[id]=MATERIALID&tx_find_find[format]=data&type=1369315140";
			// JSON-export link template
			config.jsonDataLinkTemplate = config.materialSearchPageURL+ "&tx_find_find[data-format]=json&tx_find_find[controller]=Search&tx_find_find[id]=MATERIALID&tx_find_find[format]=data&type=1369315139";
			// suggestion API link template
			config.suggestLinkTemplate = config.materialSearchPageURL+ "&tx_find_find[q]=QUERY&tx_find_find[controller]=Search&tx_find_find[dictionary]=default&tx_find_find[format]=data&tx_find_find[action]=suggest&type=1369315139";
		}
		
		addClickHandlers();
		calculateButtonVisibility();
		
		if (!isDetailPage()){
			// remove "related query" object from session storage
			sessionStorage.removeItem("RELATED_QUERY");
		}
		
		// add listener that renders notification pop-ups on history changes
		userHistory.addListener(history.entryTypes.ALL, history.eventTypes.ALL, function(type, entity, eventType){
			// dont show ADD notifications for other types than bookmarks to the user (because these are triggered by system action)
			if (history.eventTypes.ADD == eventType && 
					history.entryTypes.BOOKMARK != type && history.entryTypes.QUERY != type)
				return;
			if (history.eventTypes.ERROR == eventType)
				return;
				
			// build message based on function arguments
			let msg = "";
			if (history.entryTypes.BOOKMARK == type)
				msg += Localization.getString("history.types.bookmark");
			if (history.entryTypes.PAGEVISIT == type)
				msg += Localization.getString("history.types.pagevisit");
			if (history.entryTypes.QUERY == type || history.entryTypes.TRACKEDQUERY == type)
				msg += Localization.getString("history.types.query");
			if (history.entryTypes.ALL == type)
				msg += Localization.getString("history.types.all");
			msg += " "+Localization.getString(history.eventTypes.ADD == eventType ? "history.notification.added":"history.notification.removed");
			
			// render notification 
			$.notify({
				message: msg,
				icon: 'glyphicon glyphicon-info-sign'
			},{
				type: 'info',
				delay: 3000,
				allow_dismiss: false,
				animate: {
					enter: 'animated fadeInRight',
					exit: 'animated fadeOutRight'
				}
			});
		});
		// add listener that renders notification pop-ups on history errors
		userHistory.addListener(history.entryTypes.ALL, history.eventTypes.ERROR, function(type, entity, eventType){
			// render notification 
			$.notify({
				message: entity,
				icon: 'glyphicon glyphicon-alert'
			},{
				type: 'info',
				delay: 5000,
				allow_dismiss: false,
				animate: {
					enter: 'animated fadeInRight',
					exit: 'animated fadeOutRight'
				}
			});
		});
		
		page = instantiatePage();
		page.render();
		page.addListeners();
		
		// make sure that schema information are available before rendering history and tracking queries (needed for creating nicer labels) 
		mahuUtils.querySchema().always(function(schema){
			
			page.handleSchemaQueried(schema);
			
		});
	};
	
	const instantiatePage = function(){
		let page = null;
		if (isDetailPage()){
			page = new DetailPage(userHistory);
		}
		if (isResultsPage()){
			if (isGroupedResultsView()){
				page = new GroupedResultsPage(userHistory);
			} else {
				page = new ResultsPage(userHistory);
			}
		}
		let pageConfig = {};
		if (currentPage != undefined && config["pageConfig"][currentPage]) {
			pageConfig = config["pageConfig"][currentPage];
		}
		
		if (isLandingPage()){
			page = new LandingPage(userHistory, pageConfig);
		}
		if (isFAQPage()){
			page = new FAQPage(userHistory, pageConfig);
		}
		if (isWizardPage()){
			page = new WizardPage(userHistory, pageConfig);
		}
		if (currentPage === "MaterialEditorPage"){
			page = new MaterialEditorPage(userHistory, pageConfig);
		}
		if (currentPage === "PreviewPage"){
			page = new PreviewPage(userHistory, pageConfig);
		}
		if (currentPage === "MaterialListPage"){
			page = new MaterialListPage(userHistory, pageConfig);
		}
		if (currentPage === "SupplementEditorPage"){
			page = new SupplementEditorPage(userHistory, pageConfig);
		}

		
		if (page == null){
			page = new AbstractPage(userHistory, pageConfig);
		}
		return page;
	};
	
	/* expose some methods as public interface */
	return {
		init: init,
		logout: function(){
			if (materialSelectorArea!=null) {
				materialSelectorArea.clear();
			}
		},
		exportJSON: exportJSON,
		exportRDF: exportRDF,
		getTaxonomy: getTaxonomy,
		addBookmark: addBookmark,
		removeBookmark: removeBookmark,
		removeVisitedPage : removeVisitedPage,
		getHistory: getHistory,
		enableHistory: function(){
			userHistory.enable();
		},
		getMaterialSelector: getMaterialSelector,
		getImageRootPath: function(){
			return config.imgRootPath;
		},
		getLandingPageURL: function(){
			return config.landingPageURL;
		},
		getMaterialSearchPageURL: function(){
			return config.materialSearchPageURL;
		},
		getRegistrationPageURL: function(){
			return config.registrationPageURL;
		},
		getLoginPageURL: function(){
			return config.loginPageURL;
		},
		getProfilePageURL: function() {
			return config.profilePageURL;
		},
		getImageLinkResolver: getImageLinkResolver,
		getPageUid: function(){
			return config.pageUid;
		},
		isResultsPage: isResultsPage,
		isDetailPage: isDetailPage,
		getUid : function(){
			return config.uid;
		},
		getLanguageID: function(){
			return config.languageID;
		},
		getUserName: function(){
			return config.userName || "";
		},
		getUserNameExtended: function(){
			return config.userNameExt || "";
		},
		getKeepFacets: function(){
			return config.keepFacets || false;
		},
		getLanguageLinks: function(){
			return config.languageLinks;
		},
		handleImageError: function(err, matcat, mostspecificmatcat){
			$(document).ready(function(){
				let imgurl = null;
				if (matcat || mostspecificmatcat){
					// derive a symbolic image from the material category
					imgurl = mahu.getTaxonomy().getImage(mostspecificmatcat);
					if (imgurl.indexOf(mahu.getImageLinkResolver().getDefaultImageURL()) !== -1){
						imgurl = mahu.getTaxonomy().getImage(matcat);
					}
					// add the overlay hint
					let html = "<p class='siOverlay'>"+Localization.getString("symbolicImage")+"</p>";
					$(err.target).parent().append(html);
				} else {
					imgurl = '/typo3conf/ext/mahu_frontend/Resources/Public/Images/placeholder.png';
				}
				
				err.target.src= imgurl;
			});
		},
		/**
		 * Answers the URL of a material's detail page.
		 * 
		 * @return String a URL
		 */
		getDetailPageLink: function(materialID, absolute = false){
			let res = config.detailPageLinkTemplate.replace("VALUE", encodeURIComponent(materialID));
			if (absolute){
				let pre= window.location.protocol+"//"+window.location.host;
				if (!res.startsWith(pre)) {
					res = pre + res;
				}
			}
			return res;
		},
		getQueryLink: function(query){
			return config.queryLinkTemplate.replace("VALUE", encodeURIComponent(query));
		},
		getQueryAndFacetLink: function(query, facet, facetValue){
			return config.queryAndFacetLinkTemplate.replace("QUERY", encodeURIComponent(query)).replace("FACET", encodeURIComponent(facet)).replace("FACETVALUE", encodeURIComponent(facetValue));
		},
		getTermLink: function(field, dataFormat){
			return config.termLinkTemplate.replace("FIELD", encodeURIComponent(field)).replace("DATAFORMAT", encodeURIComponent(dataFormat));
		},
		getRDFExportLinkTemplate: function(materialID){
			return config.rdfDataLinkTemplate.replace("MATERIALID", encodeURIComponent(materialID));
		},
		getJSONExportLinkTemplate: function(materialID){
			return config.jsonDataLinkTemplate.replace("MATERIALID", encodeURIComponent(materialID));
		},
		getSuggestionLink: function(q){
			return config.suggestLinkTemplate.replace("QUERY", encodeURIComponent(q));
		},
		getCurrentPage: function(){
			return page;
		}
	}
})();