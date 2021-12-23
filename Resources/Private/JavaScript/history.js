/**
 * Represents a history of a users bookmarks, visited pages and issued queries.  
 * 
 * Utilizes the Local Storage as client-side persistence layer.
 * 
 * Copyright 2017-2020 SLUB Dresden
 */
const history = function(userID = ""){
	const HISTKEY = "history";
	const LIMIT = 20;
	
	let listeners = [];
	
	let enabled = false;
	
	/**
	 * Load the user history from client-side persistence.
	 */
	
	let userHistory= {
		bookmarks: [],
		visitedSites: [],
		queries: [],
		trackedQueries: [],
		settings: {}
	};
	
	{
		let histString = localStorage.getItem(HISTKEY+userID);
		if (histString){
			try {
				userHistory = JSON.parse(histString);
			} catch (e) {console.error(e);}
		}
	}
	
	/**
	 * Persists the user history.
	 */
	const store= function(){
		if (userHistory){
			localStorage.setItem(HISTKEY+userID, JSON.stringify(userHistory));
		}
	};
	
	/* internal helper to get all entries of the given type */
	const getListByType = function(type){
		if (history.entryTypes.BOOKMARK == type)
			return userHistory.bookmarks;
		if (history.entryTypes.QUERY == type)
			return userHistory.queries;
		if (history.entryTypes.PAGEVISIT == type)  
			return userHistory.visitedSites;
		if (history.entryTypes.TRACKEDQUERY == type)  
			return userHistory.trackedQueries;
	}
	
	/**
	 * Adds information about a material detail page visit to the user history.
	 */
	const addPageVisit = function(entry){
		if (!enabled) return;
		
		let alreadyPresent = false;
		let vsl = userHistory.visitedSites.length;
		for (let idx = 0; idx < vsl; ++idx){
			let vs = userHistory.visitedSites[idx];
			if (vs.id == entry.id){
				//update timestamp
				vs.timestamp = +new Date();
				store();
				alreadyPresent = true;
				break;
			}
		}
		if (alreadyPresent)
			return false;
		
		userHistory.visitedSites.push(entry);
		// enforce a limit to the number of stored material visits
		if (userHistory.visitedSites.length > LIMIT){
			// find the oldest entry
			let oidx = -1, ots= +new Date();
			for (let idx = 0; idx < vsl+1; ++idx){
				let vs = userHistory.visitedSites[idx];
				if (vs.timestamp < ots) {
					oidx = idx;
					ots = vs.timestamp;
				}
			}
			// remove oldest entry
			userHistory.visitedSites.splice(oidx, 1);
		}
		
		store();
		
		notifyListeners(history.entryTypes.PAGEVISIT, entry, history.eventTypes.ADD);
		
		return true;
	};
	
	/**
	 * Removes information about a material detail page visit to the user history.
	 */
	const removePageVisit = function(entry){
		if (!enabled) {
			notifyListeners(history.entryTypes.ALL, Localization.getString("history.error.disabled"), history.eventTypes.ERROR);
			return;
		}
		
		let position = -1;
		let bml = userHistory.visitedSites.length;
		for (let idx = 0; idx < bml; ++idx){
			let bm = userHistory.visitedSites[idx];
			if (bm.id == entry.id){
				position = idx;
				break;
			}
		}

		if (position!=-1) {
			userHistory.visitedSites.splice(position, 1);
		
			store();
		
			notifyListeners(history.entryTypes.PAGEVISIT, entry, history.eventTypes.REMOVE);
			
			return true;
		}
		return false;
	};
	
	/**
	 * Answers the page visits stored in this history.
	 */
	const getPageVisits = function(){
		return [].concat(userHistory.visitedSites);
	};
	
	/**
	 * Removes all entries of given type or the whole history if there is no type given.
	 * @param type (String, optional). The type of entries to be removed. See history.entryTypes.
	 */
	const clear = function(type){
		if (!enabled) {
			notifyListeners(history.entryTypes.ALL, Localization.getString("history.error.disabled"), history.eventTypes.ERROR);
			return;
		}
		if (type) {
			let listToBeCleared = getListByType(type);
			if (listToBeCleared != null) {
				listToBeCleared.length = 0;
				store();
				
				notifyListeners(type, null, history.eventTypes.REMOVE);
			}
		} else {
			 userHistory = {
					bookmarks: [],
					visitedSites: [],
					queries: [],
					trackedQueries: [],
					settings: {}
				};
			 store();
			 
			 notifyListeners(history.entryTypes.ALL, null, history.eventTypes.REMOVE);
		}
	};

	
	/**
	 * Adds a bookmark for the given material descriptor.
	 */
	const addBookmark = function(entry){
		if (!enabled) {
			notifyListeners(history.entryTypes.ALL, Localization.getString("history.error.disabled"), history.eventTypes.ERROR);
			return;
		}
		
		if (isBookmarked(entry))
			return false;
		
		userHistory.bookmarks.push(entry);
		
		store();
		
		notifyListeners(history.entryTypes.BOOKMARK, entry, history.eventTypes.ADD);
		
		return true;
	};
	
	/**
	 * Removes a bookmark for the given material descriptor.
	 */
	const removeBookmark = function(entry){
		if (!enabled) {
			notifyListeners(history.entryTypes.ALL, Localization.getString("history.error.disabled"), history.eventTypes.ERROR);
			return;
		}
		
		let position = -1;
		let bml = userHistory.bookmarks.length;
		for (let idx = 0; idx < bml; ++idx){
			let bm = userHistory.bookmarks[idx];
			if (bm.id == entry.id){
				position = idx;
				break;
			}
		}

		if (position!=-1) {
			userHistory.bookmarks.splice(position, 1);
		
			store();
			
			notifyListeners(history.entryTypes.BOOKMARK, entry, history.eventTypes.REMOVE);
			return true;
		}
		return false;
	};
	
	/**
	 * Determines for a given material descriptor whether it is already bookmarked.
	 */
	const isBookmarked = function(entry){
		let alreadyPresent = false;
		let bml = userHistory.bookmarks.length;
		for (let idx = 0; idx < bml; ++idx){
			let bm = userHistory.bookmarks[idx];
			if (bm.id == entry.id){
				alreadyPresent = true;
				break;
			}
		}
		return alreadyPresent;
	};
	
	/**
	 * Answers the bookmarks stored in this user history.
	 */
	const getBookmarks = function(){
		return [].concat(userHistory.bookmarks);
	};
	
	/**
	 * Adds the given query to the user history.
	 * @return boolean. success state
	 */
	const addTrackedQuery = function(query){
		if (!enabled) return;
		
		/* test if the current query is likely to be a refinement of the previous one or a new research path */
		let vsl = userHistory.trackedQueries.length;
		if (vsl > 0){
			let lastEntry = userHistory.trackedQueries[vsl-1];
			
			if (query.q.default.term && lastEntry.q.default.term 
					&& query.q.default.term == lastEntry.q.default.term){
				userHistory.trackedQueries.pop();
			} else {
				if (lastEntry.q.default == query.q.default){
					userHistory.trackedQueries.pop();
				}
			}
			userHistory.trackedQueries.push(query);
		} else {
			// no research history yet -> create new entry
			userHistory.trackedQueries.push(query);			
		}
		
		// enforce a limit to the number of stored queries
		if (userHistory.trackedQueries.length > LIMIT){
			// remove first element in array
			userHistory.trackedQueries.splice(0, 1);
		}

		store();
		notifyListeners(history.entryTypes.TRACKEDQUERY, query, history.eventTypes.ADD);
		return true;
	};
	
	/**
	 * Removes the given query from the user history.
	 * @return boolean. success state
	 */
	const removeTrackedQuery = function(query){
		if (!enabled) {
			notifyListeners(history.entryTypes.ALL, Localization.getString("history.error.disabled"), history.eventTypes.ERROR);
			return;
		}
		let position = -1;
		let bml = userHistory.trackedQueries.length;
		for (let idx = 0; idx < bml; ++idx){
			let bm = userHistory.trackedQueries[idx];
			if (bm.timestamp == query.timestamp){
				position = idx;
				break;
			}
		}

		if (position!=-1) {
			userHistory.trackedQueries.splice(position, 1);
		
			store();
			
			notifyListeners(history.entryTypes.TRACKEDQUERY, query, history.eventTypes.REMOVE);
			return true;
		}
		return false;
	};
	
	/**
	 * Answers all stored queries.
	 */
	const getTrackedQueries = function(){
		return [].concat(userHistory.trackedQueries);
	};
	
	/**
	 * Adds the given query to the user history.
	 * @return boolean. success state
	 */
	const addQuery = function(query){
		if (!enabled) {
			notifyListeners(history.entryTypes.ALL, Localization.getString("history.error.disabled"), history.eventTypes.ERROR);
			return;
		}
		
		userHistory.queries.push(query);
		
		store();
		notifyListeners(history.entryTypes.QUERY, query, history.eventTypes.ADD);
		return true;
	};
	
	/**
	 * Removes the given query from the user history.
	 * @return boolean. success state
	 */
	const removeQuery = function(query){
		if (!enabled) {
			notifyListeners(history.entryTypes.ALL, Localization.getString("history.error.disabled"), history.eventTypes.ERROR);
			return;
		}
		let position = -1;
		let bml = userHistory.queries.length;
		for (let idx = 0; idx < bml; ++idx){
			let bm = userHistory.queries[idx];
			if (bm.timestamp == query.timestamp){
				position = idx;
				break;
			}
		}

		if (position!=-1) {
			userHistory.queries.splice(position, 1);
		
			store();
			
			notifyListeners(history.entryTypes.QUERY, query, history.eventTypes.REMOVE);
			return true;
		}
		return false;
	};
	
	/**
	 * Answers all stored queries.
	 */
	const getQueries = function(){
		return [].concat(userHistory.queries);
	};
	
	/**
	 * Answers the setting with the given key, if there is such.
	 */
	const getSetting = function(key){
		if (!userHistory.settings) {
			userHistory.settings = {};
		}
		if (userHistory.settings[key]) {
			return userHistory.settings[key];
		}
	};

	/**
	 * Stores the given key-value-pair in the user settings.
	 */
	const setSetting = function(key, value){
		if (!enabled) return;
		
		if (!userHistory.settings) {
			userHistory.settings = {};
		}
		userHistory.settings[key] = value;
		store();
	};
	
	/**
	 * Answers if the user history, containing both bookmarks and detail page visits, is empty.
	 */
	const isEmpty = function(){
		if (!userHistory) return true;
		
		if (!Array.isArray(userHistory.bookmarks) || !Array.isArray(userHistory.visitedSites) || !Array.isArray(userHistory.queries) || !Array.isArray(userHistory.trackedQueries))
			return true;
		
		return userHistory.bookmarks.length + userHistory.visitedSites.length + userHistory.queries.length + userHistory.trackedQueries.length == 0;
	}
	
	/**
	 * Enables user activity tracking 
	 */
	const enable = function(){
		enabled = true;
		console.info("history: tracking enabled");
	};
	
	/**
	 * Add a listener for the given entry type  and event type (see history.eventType).
	 * 
	 * @param entryType (String). The type of entries for which to listen on. See history.entryTypes for valid values.
	 * @param eventType (String). The type of change for which to listen on. See history.eventTypes for valid values. 
	 * @param handler (Function). The function to be called.
	 * @param scope (Object, optional). The scope in which to call the handler function. 
	 * @return (boolean) success state
	 */
	const addListener = function(entryType, eventType, handler, scope){
		if (!$.isFunction(handler)) {
			console.error("The event handler must be a function!");
			return false;
		}
		
		let foundAtIndex = findEntry(entryType, eventType, handler, scope);
		if (foundAtIndex == -1){
			listeners.push({
				type: entryType,
				eventType: eventType,
				handler: handler,
				scope: scope
			});
			
			return true;
		}
		console.info("Listener already has been registered!");
		return false;
	};
	
	/**
	 * Private helper method to find a listener for the given parameters.
	 * 
	 * @return the index within the listeners array at which a matching record has been found 
	 */
	const findEntry = function(type, eventType, handler, scope){
		let foundAtIndex = -1;
		
		for (let i=0; i < listeners.length; ++i){
			let listener = listeners[i];
			
			if (listener.type == type &&
					listener.eventType == eventType && 
					listener.handler == handler &&
					listener.scope == scope){
				foundAtIndex = i;
				break;
			}
		}
		return foundAtIndex;
	};
	
	/**
	 * Remove a listener for the given entry type  and event type (see history.eventType).
	 * 
	 * @param entryType (String). The type of entries for which to listen on. See history.entryTypes for valid values.
	 * @param eventType (String). The type of change for which to listen on. See history.eventTypes for valid values. 
	 * @param handler (Function). The function to be called.
	 * @param scope (Object, optional). The scope in which to call the handler function.
	 * @return (boolean) success state
	 */
	const removeListener = function(type, eventType, handler, scope){
		let foundAtIndex = findEntry(type, eventType, handler, scope);
		if (foundAtIndex != -1){
			listeners.splice(foundAtIndex, 1);
			return true;
		}
		return false;
	};
	
	/*
	 * Notify listeners.
	 */
	const notifyListeners = function(type, entity, eventType){
		listeners.forEach(function(listener){
			if (listener.type == type || listener.type == history.entryTypes.ALL){
				if ((listener.eventType && listener.eventType == eventType)	
						|| listener.eventType == history.eventTypes.ALL
						|| !listener.eventType){
					try {
						listener.handler.call(
							listener.scope,
							type,
							entity,
							eventType
						);
					} catch(e) {
						console.error(e);
					}
				}
			}
		});
	};
	
	/* expose some methods as public interface */
	return {
		isEmpty: isEmpty,
		clear: clear,
		addListener: addListener,
		removeListener: removeListener,
		enable: enable,
		
		addBookmark: addBookmark,
		removeBookmark: removeBookmark,
		isBookmarked: isBookmarked,
		getBookmarks: getBookmarks,
		
		addPageVisit: addPageVisit,
		removePageVisit: removePageVisit,
		getPageVisits: getPageVisits,
		
		addTrackedQuery: addTrackedQuery,
		removeTrackedQuery: removeTrackedQuery,
		getTrackedQueries: getTrackedQueries,
		
		addQuery: addQuery,
		removeQuery: removeQuery,
		getQueries: getQueries,
		
		getSetting: getSetting,
		setSetting: setSetting
	}
};


/**
 * Enumerates valid entry types.
 */
Object.defineProperties(history, {
	"entryTypes" : {
		value: Object.defineProperties({} , {
			"BOOKMARK": {
				value: "bookmark",
				configurable: false,
				enumerable: true,
				writable: false
			},
			"QUERY": {
				value: "query",
				configurable: false,
				enumerable: true,
				writable: false
			},
			"TRACKEDQUERY": {
				value: "trackedquery",
				configurable: false,
				enumerable: true,
				writable: false
			},
			"PAGEVISIT": {
				value: "pagevisit",
				configurable: false,
				enumerable: true,
				writable: false
			},
			"ALL": {
				value: "all",
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

/**
 * Enumerates valid event types.
 */
Object.defineProperties(history, {
	"eventTypes" : {
		value: Object.defineProperties({} , {
			"ADD": {
				value: "add",
				configurable: false,
				enumerable: true,
				writable: false
			},
			"REMOVE": {
				value: "remove",
				configurable: false,
				enumerable: true,
				writable: false
			},
			"ALL": {
				value: "all",
				configurable: false,
				enumerable: true,
				writable: false
			},
			"ERROR": {
				value: "error",
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
