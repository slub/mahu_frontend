/**
 * Renders an overview of the previous research activities including bookmarks, (saved and tracked) queries and visited materials.
 * 
 * Copyright 2018-2020 SLUB Dresden
 */
const ResearchOverview = function(parentElement, _limit, featureConfig){
	const DEFAULT_LIMIT = 4;
	
	// apply defaults on the features to be shown
	const features = Object.assign({
		bookmarks: true,
		visitedMaterials: true,
		queries: true,
		savedQueries: true
	}, featureConfig);
	
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
	
	const defaultSort = function(array){
		array.sort(function(a, b){
			return b.timestamp - a.timestamp;
		});
		return array;
	};
	
	/**
	 * Renders a given collection of material descriptors to the given DOM element.
	 */
	const renderMaterials = function(element, materials, menuConfig){
		let rendered = "";
		
		for (let i=0; i < materials.length; ++i){
			let item = materials[i];
			
			let url = mahu.getDetailPageLink(item.id);
			
			rendered += '<a tabindex="0" class="materialPreview" data-id="'+item.id+'" href="'+url+'">'+
					'<div class="thumbWrap" style="position:relative">'+
						'<img src="'+item.imageURL+'" class="thumb" onerror="mahu.handleImageError(arguments[0])" aria-hidden="true"></img>';
					if (item.isSymbolicImage) {
						rendered+= '<p class="siOverlay">'+Localization.getString("symbolicImage")+'</p>';
					}
			rendered+=	'</div>'+
					'<div class="materialPreviewText">'+
						'<p class="materialName">'+item.name;
			if (item.altName) {
				rendered+= "<span class='alternativeName'>"+item.altName+"</span>";
			}
			rendered+=	'</p>'+
						'<p class="plain">'+item.producer+'</p>'+
					'</div>'+
				'</a>';
		}
		
		element.html(rendered);
		
		/* append event handlers */
		let panels = element.find(".materialPreview");
		panels.each(function(){
			let panel = $(this);
			let matID = panel.attr("data-id");
			
			let material = materials.find(function(e){
				return e.id == matID;
			});
			
			new ActionsMenu(panel, menuConfig, material).render();

			/*panel.on("click keyup", function(event){
				if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
					return true;
				}
				window.location = panel.attr("data-url");
			});*/
		});
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
	const renderQueries = function(element, queries, menuConfig){
		let ml = queries.length;
		let rendered = "";
		for (var idx = 0; idx < ml; ++idx){
			let q = queries[idx];
			
			let num = 0;
			let len = q.asString.length;
			let queriesToRender= [];
			let textQuery = null;
			
			for (let j= 0; j < len; ++j){
				let queryEntry = q.asString[j];
				
				if (queryEntry.type != "query") {
					queriesToRender.push(queryEntry);
					++num;
				} else {
					textQuery = queryEntry.propValue;
				}
			}
			
			let numHiddenFilters = 0;
			// display only two filters
			if (num == 2){
				queriesToRender = queriesToRender.slice(0,2);
				numHiddenFilters = 0;
			} else {
				queriesToRender = queriesToRender.slice(0,1);
				numHiddenFilters = num - 1;
			}
			
			let numResultsString = q.resultCount;
			if (q.resultCount != 1)
				numResultsString += " "+Localization.getString("ro.results");
			else
				numResultsString += " "+ Localization.getString("ro.result");
			
			rendered += 
				'<a class="queryRepresentation" href="'+mahuUtils.addLanguageParameterToURL(q.url)+'" data-id="'+q.timestamp+'" tabindex="0">'+
					'<div class="materialPreviewText">'+
					'<p class="materialName">&bdquo;'+textQuery+'&ldquo;</p>';
					
					for (let b=0; b < queriesToRender.length; ++b){
						let queryToRender = queriesToRender[b];
						rendered += '<p class="plain cropText">'+queryToRender.propName+': '+queryToRender.propValue+'</p>';
					}
						if (numHiddenFilters > 0){
							rendered += '<p class="plain">'+String.format(Localization.getString("ro.furtherResults"), numHiddenFilters)+'</p>';
						}
						rendered += '<div class="bottom-right" style="width:100%;"><hr style="border-top: 1px solid #059;"/><p class="plain text-right"><i>'+numResultsString+'</i></p>'+
						'<p class="plain text-right"><i>'+getAgoString(q.timestamp)+'</i></p></div>'+
					'</div>'+
				'</a>';
		}
		
		element.html(rendered);
		
		/* append event handlers */
		let panels = element.find(".queryRepresentation");
		panels.each(function(){
			let panel = $(this);
			let matID = panel.attr("data-id");
			
			let material = queries.find(function(e){
				return e.timestamp == matID;
			});
			
			new ActionsMenu(panel, menuConfig, material).render();
			
			/*panel.on("click keyup", function(event){
				if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
					return true;
				}
				window.location = panel.attr("data-url");
			});*/
		});

	};
	
	/*
	 * Renders the bookmark section
	 */
	const _renderBookmarks = function(bookmarksToRender){
		let all = false;
		if (!bookmarksToRender){
			bookmarksToRender = userHistory.getBookmarks();
			all = true;
		}
		
		if (bookmarksToRender.length > 0) {
			// render bookmarked materials to the according container
			renderMaterials($("#bookmarkList"), bookmarksToRender, {
				handler: function(actionID, material){
					if ("removeBookmark" == actionID){
						mahu.removeBookmark(material);
					}
					if ("compare" == actionID){
						mahu.getMaterialSelector().addMaterial(material);
					}
					if ("share" == actionID){
						mahuUtils.openEMail({
							subject: material.name,
							body: mahu.getDetailPageLink(material.id, true)
						});
					}
				},
				menuOptions: [
					{
						id: "removeBookmark",
						label: Localization.getString("removeBookmark"),
						cssClasses: {
							icon:"far fa-bookmark smallicon"
						}
					},
					{
						id: "compare",
						label: Localization.getString("compare"),
						cssClasses: { 
							icon: "fas fa-exchange-alt smallicon"
						}
					},
					{
						id : "share",
						label: Localization.getString("share"),
						cssClasses: { 
							icon: "fas fa-share-alt smallicon"
						}
					}
				]
			});
			
			
			// menu options to be shown
			let mopts = [];
			// add "show all" option only if not already all items are visualized
			if (userHistory.getBookmarks().length > _limit){
				mopts.push({
						id: all?"showbookmarksCollapse":"showbookmarks",
						label: all?Localization.getString("showAllBookmarksCollapse"):Localization.getString("showAllBookmarks"),
						cssClasses: { 
							icon: "fas fa-bookmark smallicon"
						}
					});
			}
			mopts.push({
					id: "clearbookmarks",
					label: Localization.getString("removeAllBookmarks"),
					cssClasses: { 
						icon: "far fa-bookmark smallicon"
					}
				},
				{
					id : "share",
					label: Localization.getString("share"),
					cssClasses: { 
						icon:"fas fa-share-alt smallicon"
					}
				});
			
			// add a menu with actions for managing bookmarks as a whole
			new ActionsMenu($("#bookmarkContainer > div:first-child"), {
				handler: function(actionID){
					if ("showbookmarks" == actionID){
						_renderBookmarks();
					}
					if ("showbookmarksCollapse" == actionID){
						_renderBookmarks(getMostRelevant(userHistory.getBookmarks(), _limit));
					}
					if ("clearbookmarks" == actionID){
						// perform the actual action of clearing the bookmark list
						// in the user profile
						mahu.getHistory().clear(history.entryTypes.BOOKMARK);
					}
					if ("share" == actionID) {
						let content = "";
						for (let k=0; k < bookmarksToRender.length; ++k){
							let bookmarkToRender= bookmarksToRender[k];
							content+=bookmarkToRender.name+": "+mahu.getDetailPageLink(bookmarkToRender.id, true)+"\n";
						}
						
						mahuUtils.openEMail({
							subject: Localization.getString("ro.mail.bookmarks.subject"),
							body: content
						});
					}
				},
				menuOptions: mopts,
				staticMenu: true,
				additionalCssClasses: {
					button: "actionsMenuButton"
				}
			}, null).render();
		} else 
			$("#bookmarkContainer").hide();
	};
	
	/*
	 * Renders the visited materials section.
	 */
	const _renderVisitedMaterials = function(visitedMaterialsToRender){
		let all = false;
		if (!visitedMaterialsToRender){
			visitedMaterialsToRender = defaultSort(userHistory.getPageVisits());
			all = true;
		}
		
		if (visitedMaterialsToRender.length > 0){
			renderMaterials($("#visitedList"), visitedMaterialsToRender, {
				handler: function(actionID, material){
					if (actionID == "removeFromHistory"){
						mahu.removeVisitedPage(material);
					}
					if ("compare" == actionID){
						mahu.getMaterialSelector().addMaterial(material);
					}
					if ("share" == actionID){
						mahuUtils.openEMail({
							subject: material.name,
							body: mahu.getDetailPageLink(material.id, true)
						});
					}
				},
				menuOptions: [
					{
						id: "removeFromHistory",
						label: Localization.getString("removeFromHistory"),
						cssClasses: { 
							icon:"far fa-trash-alt smallicon"
						}
					},
					{
						id: "compare",
						label: Localization.getString("compare"),
						cssClasses: { 
							icon:"fas fa-exchange-alt smallicon"
						}
					},
					{
						id : "share",
						label: Localization.getString("share"),
						cssClasses: { 
							icon:"fas fa-share-alt smallicon"
						}
					}
				]
			});
			
			// menu options to be shown
			let mopts = []
			// add "show all" option only if not already all items are visualized
			if (userHistory.getPageVisits().length > _limit){
				mopts.push(
					{
						id: all?"showvisitsCollapse":"showvisits",
						label: all?Localization.getString("showVisitsCollapse"):Localization.getString("showVisits"),
						cssClasses: {
							icon:"fas fa-bookmark smallicon"
						}
					});
			}
			mopts.push({
					id: "clearvisits",
					label: Localization.getString("removeVisits"),
					cssClasses: {
						icon:"far fa-trash-alt smallicon"
					}
				},
				{
					id : "share",
					label: Localization.getString("share"),
					cssClasses: {
						icon:"fas fa-share-alt smallicon"
					}
				});
			
			// add a menu with actions for managing page visits as a whole
			new ActionsMenu($("#visitedSitesContainer > div:first-child"), {
				handler: function(actionID){
					if ("showvisits" == actionID){
						_renderVisitedMaterials();
					}
					if ("showvisitsCollapse" == actionID){
						_renderVisitedMaterials(getMostRelevant(userHistory.getPageVisits().reverse(), _limit));						
					}
					if ("clearvisits" == actionID){
						// perform the actual action of clearing the bookmark list
						// in the user profile
						mahu.getHistory().clear(history.entryTypes.PAGEVISIT);
					}
					if ("share" == actionID) {
						let content = "";
						for (let k=0; k < visitedMaterialsToRender.length; ++k){
							let visitedMaterial= visitedMaterialsToRender[k];
							content+= visitedMaterial.name+": "+mahu.getDetailPageLink(visitedMaterial.id, true)+"\n";
						}
						
						mahuUtils.openEMail({
							subject: Localization.getString("ro.mail.pageVisits.subject"),
							body: content
						});
					}
				},
				menuOptions: mopts,
				staticMenu: true,
				additionalCssClasses: {
					button: "actionsMenuButton"
				}
			}, null).render();
		} else 
			$("#visitedSitesContainer").hide();
	};
	
	/*
	 * Renders the tracked queries section. 
	 */
	const _renderQueries = function(queriesToRender){
		let all = false;
		if (!queriesToRender){
			queriesToRender = defaultSort(userHistory.getTrackedQueries());
			all = true;
		}
		
		if (queriesToRender.length > 0){
			// generate a string representation for each query. Although there may already be one
			// we re-generate it to enforce the current language
			queriesToRender.forEach(function(entry){
				entry.asString = mahuUtils.queryToString(entry);
			});
			
			renderQueries($("#queryList"), queriesToRender, {
				handler: function(actionID, query){
					if ("removeQueryFromHistory" == actionID){
						mahu.getHistory().removeTrackedQuery(query);
					}
					if ("share" == actionID){
						mahuUtils.openEMail({
							subject: Localization.getString("ro.mail.query.subject"),
							body: String.format(Localization.getString("ro.mail.query.content"), new Date(query.timestamp), query.resultCount, query.url)
						});
					}
				},
				menuOptions: [
					{
						id: "removeQueryFromHistory",
						label: Localization.getString("removeQuery"),
						cssClasses: {
							icon: "far fa-trash-alt smallicon"
						}
					},
					{
						id : "share",
						label: Localization.getString("share"),
						cssClasses: {
							icon:"fas fa-share-alt smallicon"
						}
					}
				]
			});
			
			// menu options to be shown
			let mopts = []
			// add "show all" option only if not already all items are visualized
			if (userHistory.getTrackedQueries().length > _limit){
				mopts.push({
					id: all ? "showqueriesCollapse":"showqueries",
					label: all ? Localization.getString("showQueriesCollapse"):Localization.getString("showQueries"),
					cssClasses: {
						icon: "fas fa-history smallicon"
					}
				});
			}
			mopts.push({
					id: "clearqueries",
					label: Localization.getString("removeQueries"),
					cssClasses: {
						icon:"far fa-trash-alt smallicon"
					}
				},
				{
					id : "share",
					label: Localization.getString("share"),
					cssClasses: { 
						icon: "fas fa-share-alt smallicon"
					}
				});
			
			
			// add a menu with actions for managing page visits as a whole
			new ActionsMenu($("#searchQueriesContainer > div:first-child"), {
				handler: function(actionID){
					if ("showqueries" == actionID){
						_renderQueries();
					}
					if ("showqueriesCollapse" == actionID){
						_renderQueries(getMostRelevant(userHistory.getTrackedQueries().reverse(), _limit));
					}
					if ("clearqueries" == actionID){
						// perform the actual action of clearing the bookmark list
						// in the user profile
						mahu.getHistory().clear(history.entryTypes.TRACKEDQUERY);
					}
					if ("share" == actionID) {
						let content = "";
						for (let k=0; k < queriesToRender.length; ++k){
							let queryToRender= queriesToRender[k];
							content += String.format(Localization.getString("ro.mail.query.content"), new Date(queryToRender.timestamp), queryToRender.resultCount, queryToRender.url)+"\n";
						}
						
						mahuUtils.openEMail({
							subject: Localization.getString("ro.mail.queries.subject"),
							body: content
						});
					}
				},
				menuOptions: mopts,
				staticMenu: true,
				additionalCssClasses: {
					button: "actionsMenuButton"
				}
			}, null).render();
		} else 
			$("#searchQueriesContainer").hide();
	};

	/*
	 * Renders the saved queries section. 
	 */
	const _renderSavedQueries = function(savedQueriesToRender){
		let all = false;
		if (!savedQueriesToRender){
			savedQueriesToRender = defaultSort(userHistory.getQueries());
			all = true;
		}
		
		if (savedQueriesToRender.length > 0){
			// generate a string representation for each query. Although there may already be one
			// we re-generate it to enforce the current language
			savedQueriesToRender.forEach(function(entry){
				entry.asString = mahuUtils.queryToString(entry);
			});

			renderQueries($("#savedQueryList"), savedQueriesToRender, {
				handler: function(actionID, query){
					if ("removeQueryFromHistory" == actionID){
						mahu.getHistory().removeQuery(query);
					}
					if ("share" == actionID){
						mahuUtils.openEMail({
							subject: Localization.getString("ro.savedQuery.subject"),
							body: String.format(Localization.getString("ro.savedQuery.content"), new Date(query.timestamp), query.resultCount, query.url)
						});
					}
				},
				menuOptions: [
					{
						id: "removeQueryFromHistory",
						label: Localization.getString("removeQuery"),
						cssClasses: {
							icon:"far fa-trash-alt smallicon"
						}
					},
					{
						id : "share",
						label: Localization.getString("share"),
						cssClasses: {
							icon:"fas fa-share-alt smallicon"
						}
					}
				]
			});
			
			// menu options to be shown
			let mopts = [];
			// add "show all" option only if not already all items are visualized
			if (userHistory.getQueries().length > _limit){
				mopts.prepend({
					id: all ? "showqueriesCollapse":"showqueries",
					label: all ? Localization.getString("showAllQueriesCollapse"):Localization.getString("showAllQueries"),
					cssClasses: {
						icon:"fas fa-history smallicon"
					}
				});
			}
			// add further menu entries
			mopts.push({
				id: "clearqueries",
				label: Localization.getString("removeAllQueries"),
				cssClasses: {
					icon:"far fa-trash-alt smallicon"
				}
			},
			{
				id : "share",
				label: Localization.getString("share"),
				cssClasses: {
					icon: "fas fa-share-alt smallicon"
				}
			});
			
			
			// add a menu with actions for managing page visits as a whole
			new ActionsMenu($("#savedSearchQueriesContainer > div:first-child"), {
				handler: function(actionID){
					if ("showqueries" == actionID){
						_renderSavedQueries();
					}
					if ("showqueriesCollapse" == actionID){
						_renderSavedQueries(getMostRelevant(userHistory.getQueries().reverse(), _limit));
					}
					if ("clearqueries" == actionID){
						// perform the actual action of clearing the bookmark list
						// in the user profile
						mahu.getHistory().clear(history.entryTypes.QUERY);
					}
					if ("share" == actionID) {
						let content = "";
						for (let k=0; k < savedQueriesToRender.length; ++k){
							let queryToRender= savedQueriesToRender[k];
							content += String.format(Localization.getString("ro.mail.savedQueries.content"), new Date(queryToRender.timestamp), queryToRender.resultCount, queryToRender.url);
						}
						
						mahuUtils.openEMail({
							subject: Localization.getString("ro.mail.savedQueries.subject"),
							body: content
						});
					}
				},
				menuOptions: mopts,
				staticMenu: true,
				additionalCssClasses: {
					button: "actionsMenuButton"
				}
			}, null).render();
		} else 
			$("#savedSearchQueriesContainer").hide();
	}
	
	/**
	 * Renders the research overview for the current user.
	 */
	const render = function(){
		// only render sections for activated sections
		if (features.bookmarks){
			let bookmarksToRender = getMostRelevant(userHistory.getBookmarks(), _limit);
			_renderBookmarks(bookmarksToRender);
			
			// register handler at history
			userHistory.addListener(history.entryTypes.BOOKMARK, history.eventTypes.ALL, function(){
				$("#bookmarkList").html("");
				$("#history").hide();
				render();
			}, this);
		}
		if (features.visitedMaterials){
			let visitedMaterialsToRender = getMostRelevant(userHistory.getPageVisits().reverse(), _limit);
			_renderVisitedMaterials(visitedMaterialsToRender);
			
			// register handler at history
			userHistory.addListener(history.entryTypes.PAGEVISIT, history.eventTypes.ALL, function(){
				$("#visitedList").html("");
				$("#history").hide();
				render();
			}, this);
			
		}
		if (features.queries){
			let queriesToRender = getMostRelevant(userHistory.getTrackedQueries().reverse(), _limit);
			_renderQueries(queriesToRender);
			
			// register handler at history
			userHistory.addListener(history.entryTypes.TRACKEDQUERY, history.eventTypes.ALL, function(){
				$("#queryList").html("");
				$("#history").hide();
				render();
			}, this);

		}
		if (features.savedQueries){
			let savedQueriesToRender = getMostRelevant(userHistory.getQueries().reverse(), _limit);
			_renderSavedQueries(savedQueriesToRender);
			
			// register handler at history
			userHistory.addListener(history.entryTypes.QUERY, history.eventTypes.ALL, function(){
				$("#savedQueryList").html("");
				$("#history").hide();
				render();
			}, this);
		}

		$("#history").show();
	};
	
	/* expose public interface */
	return {
		render : render
	};
};