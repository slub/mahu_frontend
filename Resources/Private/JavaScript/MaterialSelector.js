/**
 * Renders an container for material previews that are selected for comparison. Allows to start the actual comparison. 
 * 
 * Copyright 2017-2020 SLUB Dresden
 */
const MaterialSelector = function(){
	// the minimum number of materials required for a comparison
	const MIN = 2;
	// maxmimum number of materials that can be compared
	const LIMIT = 7;
	// the key under which data is managed in the session storage
	const STORE_KEY= "MaHu-selectedMaterials";
	
	// prepare data structure
	let data = [];
	let divEl = null;
	let elementID = "materialSelectorContainer";
	
	let listeners= [];
	
	/**
	 * Stores the selected materials in the session storage to be able to 
	 * restore the current state on page refresh.
	 */
	const store = function(){
		sessionStorage.setItem(STORE_KEY, JSON.stringify(data));
	};
	
	/* 
	 * Initialize the material selector (includes loading data, 
	 * rendering the base HTML structure and registering listeners).
	 */
	const initialize = function(){
		{
			// load data from session storage
			let temp = sessionStorage.getItem(STORE_KEY);
			if (temp){
				try {
					let _data = JSON.parse(temp);
					if (Array.isArray(_data)){
						data = _data;
					}
				} catch (e) {console.error(e);}
			}
		}
		
		// build UI skeleton
		divEl = document.createElement("div");
		divEl.id = elementID;
		document.body.append(divEl);
		
		let rendered = 
			'<div id="matSelHeader">'+
				'<h3>'+Localization.getString("matSel.heading")+'<p style="font-size:initial;margin:0 0 0 10px;display:inline">(<span id="countIndicator">0</span> Materialien ausgewählt)</p></h3>'+
				//'<div id="menu"><a id="'+elementID+'closeBtn" class="pull-right"><i class="fa fa-times" aria-hidden="true"></i></a>'+
				'<a id="'+elementID+'minMaxBtn" tabindex="0" title="'+Localization.getString("close")+'"><i class="fas fa-chevron-circle-down" aria-hidden="true"></i></a>'+
				//'</div>'+
			'</div>'+
			'<div id="'+elementID+'content">'+
				'<div class="flexResultLine" id="'+elementID+'contentLine">'+
				'</div>'+
				// add compare button (disabled at first)
				'<div class="buttonbar"><button id="compare" type="button" class="btn btn-primary" disabled><i class="fas fa-table smallicon"></i>'+Localization.getString("matSel.compare")+'</button><button id="comparePlot" type="button" class="btn btn-primary" disabled><i class="fas fa-chart-area smallicon"></i>'+Localization.getString("matSel.comparePlot")+'</button><button id="abort" type="button" class="btn btn-primary">'+Localization.getString("matSel.abort")+'</button></div>'+
			// close content-div
			"</div>";
		
		let container = $(divEl);
		container.html(rendered);

		// add click handler to close button
		container.find(/*"#"+elementID+"closeBtn,*/"#abort").click(function(){
			clear();
			hide();
			
			notifyListeners(null, CompareView.eventTypes.CLOSED);
		});
		
		// add mouse-in/out listener for convenient expand-collapse behaviour
		container.click(function(event){
			event.stopPropagation();
		});
		container.mouseleave(function(event){
			minimize();
		});
		container.mouseenter(function(event){
			maximize();
		});
		
		// add click handler to min/max-button
		let minmaxbtn = container.find("#matSelHeader");//container.find("#"+elementID+"minMaxBtn");
		minmaxbtn.click(function(event){
			if (isMinimized())
				maximize();
			else
				minimize();

			container.find("#"+elementID+"minMaxBtn").blur();
			event.stopPropagation();
		}).keyup(function(event){
			let kc= event.originalEvent.keyCode;
			if (kc != 13) {
				return true;
			}
			if (isMinimized())
				maximize();
			else
				minimize();

			event.stopPropagation();
		});
		
		container.find("#compare").click(function(){
			renderComparison(data, false);
		});
		container.find("#comparePlot").click(function(){
			renderComparison(data, true);
		});
	};
	
	/**
	 * Renders this material selector.
	 */
	const render = function(minimized){
		let rendered= "";
		
		let clickRemark = Localization.getString("matSel.clickToRemove");
		
		for (let i=0; i < data.length; ++i){
			let item = data[i];
			rendered += '<div style="position:relative;" class="materialPreview" data-id="'+item.id+'" >'+
					'<div><a tabindex="0" class="actionsMenuButton" title="'+clickRemark+' \''+item.name+'\'"><i class="fas fa-times" aria-hidden="true"></i></a></div>'+
					'<div class="thumbWrap" style="position:relative">'+
						'<img src="'+item.imageURL+'" class="thumb"></img>';
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
					
//					'<a class="contextMenuButton"><i class="fas fa-bars" aria-hidden="true"></i></a>'+
//					'<div class="contextMenu" style="display:none;">'+
//					'</div>'+
				'</div>';
		}
		
		// add hint if there are too few materials selected
		if (data.length < MIN ){
			rendered += '<div><i class="fas fa-exclamation-triangle smallicon"></i>'+Localization.getString("matSel.select")+'</div>';
		}
		$("#"+elementID+"contentLine").html(rendered);

		$("#countIndicator").text(data.length);
		
		let container = $(divEl);
		
		let btn = container.find("#compare");
		if (data.length >= MIN)
			btn[0].disabled = false;
		else
			btn[0].disabled = true;
		
		btn = container.find("#comparePlot");
		if (data.length >= MIN)
			btn[0].disabled = false;
		else
			btn[0].disabled = true;

		
		let handleClickAndKey= function(event){
			let btn = $(event.target).parents(".materialPreview");
			
			let matID= btn.attr("data-id");
			removeMaterial(matID);
		};
		$("#materialSelectorContainer .materialPreview .actionsMenuButton").click(handleClickAndKey).keyup(function(event){
			let kc= event.originalEvent.keyCode;
			if (kc != 13) {
				return true;
			}
			handleClickAndKey(event);
		});
		
		// add handlers for material previews
		/*$("#materialSelectorContainer .materialPreview").click(function(event){
			let btn = $(event.target).parents(".materialPreview");
			
			let matID= btn.attr("data-id");
			removeMaterial(matID);
		});*/
		// and add a tooltip
		/*.tooltip({
			//track: true
			//position:  {my: "left top", at: "left"}
		});*/
		
		if (data.length == 0)
			hide();
		else
			show(minimized);
	};
	
	/*
	 * Handle click events of the window object. 
	 * Essentially, the material selector is minimized.  
	 */
	const handleClick = function(event){
		if (!isMinimized()){
			minimize();
		}
	};
	
	/*
	 * Register a handler on click events of the window object
	 */
	const registerClickHandler = function(){
		window.addEventListener("click", handleClick);
	};
	
	/* 
	 * Removes the window click handler
	 */
	const unregisterClickHandler = function(){
		window.removeEventListener("click", handleClick);
	};
	
	const removeMaterial = function(id){
		let idx= -1;
		data.forEach(function(elem, _idx){
			if (id == elem.id){
				idx = _idx;
			}
		});
		// remove material if found
		if (idx != -1) {
			let material = data[idx];
			data.splice(idx,1);
			// update view
			render(isMinimized());
			// store selected materials in the Session Store
			store();
			
			notifyListeners(material, MaterialSelector.eventTypes.MATERIALREMOVED);
		}
	};
	
	/**
	 * Returns whether the given material is currently selected for comparison.
	 */
	const isSelected = function(material){
		let found = false;
		data.forEach(function(elem){
			if (material.id == elem.id){
				found = true;
			}
		});
		return found;
	};
	
	/**
	 * Add a material descriptor.
	 */
	const addMaterial = function(material){
		let found = false;
		data.forEach(function(elem){
			if (material.id == elem.id){
				found = true;
			}
		});
		// add material if not present yet
		if (found != true) {
			if (data.length < LIMIT){
				data.push(material);
				// update view
				render(true);
				
				notifyListeners(material, MaterialSelector.eventTypes.MATERIALADDED);
			} else {
				// render notification 
				$.notify({
					message: String.format(Localization.getString("matSel.maxSel"), LIMIT),
					icon: 'glyphicon glyphicon-warning-sign'
				},{
					type: 'info',
					delay: 3000,
					allow_dismiss: false,
					animate: {
						enter: 'animated fadeInRight',
						exit: 'animated fadeOutRight'
					}
				});
			}
		}
		// store selected materials in the Session Store
		store();
		
		// highlight counter to foster awareness
		$("#countIndicator").text(data.length)//.effect("highlight", { "color":"#059"}, 1000);
	};
	
	/**
	 * Show this material selector area.
	 */
	const show = function(minimized){
		divEl.style.visibility = "visible";
		if (minimized)
			minimize();
		/*else
			maximize();*/
		
		// add window-click-listener which minimizes the material selector
		registerClickHandler();
	};
	
	/**
	 * Hide this material selector area.
	 */
	const hide = function(){
		divEl.style.visibility = "hidden";
		
		// remove window-click-listener
		unregisterClickHandler();
	};
	
	/* 
	 * changes the display state to minimized or maximized
	 */
	const changeState = function(minimize){
		let contentArea = $("#materialSelectorContainer #materialSelectorContainercontent");
		let icon = $("#materialSelectorContainer #materialSelectorContainerminMaxBtn i")[0];
		
		if (icon) {
			if (minimize) {
				$(icon).addClass("fa-chevron-circle-up").removeClass("fa-chevron-circle-down");
			} else {
				$(icon).addClass("fa-chevron-circle-down").removeClass("fa-chevron-circle-up");
			}
		}
		
		if (minimize)
			contentArea.hide();
		else
			contentArea.show();
	};
	
	/* 
	 * switch the current display state to minimized
	 */
	const minimize = function(){
		changeState(true);
	};
	
	/* 
	 * switch the current display state to maximized
	 */
	const maximize = function(){
		changeState(false);
	};

	/* 
	 * answers whether this material selector is minimized
	 */
	const isMinimized = function(){
		//let icon = $("#materialSelectorContainer #materialSelectorContainerminMaxBtn i")[0];
		//return icon.classList.contains("fa-window-maximize");
		let contentArea = $("#materialSelectorContainer #materialSelectorContainercontent");
		return contentArea.css("display") == "none";
	};
	
	/**
	 * Remove all materials and updates the view.
	 */
	const clear = function(){
		data.length = 0;
		store();
		render(true);
	};
	
	/*
	 * Query material descriptors and render a CompareView 
	 */
	const renderComparison = function(materials, showPlot){
		// create loading indicator
		let div = document.createElement("div");
		div.innerHTML = '<i class="fas fa-spinner fa-pulse fa-5x fa-fw"></i><span class="sr-only">'+Localization.getString("matSel.loading")+'</span>';
		div.className = "loadingIndicator";
		document.body.appendChild(div);
		
		queryMaterial(0, materials, [], function(){
			// remove loading indicator
			document.body.removeChild(div);
			
			clear();
			hide();
		}, showPlot);
	};
	
	/*
	 * helper function that orchestrates the retrieval of the MaHu schema and the complete material descriptors for the given materials
	 */
	const queryMaterial = function(num, _materials, results, onFinish, showPlot){
		if (num == _materials.length) {
			// query schema and finally render comparison table
			mahuUtils.querySchema().done(function(schema){
				// render comparison table
				let cv = null;
				if (showPlot){
					cv = new CompareViewPlot(results, schema);
				} else {
					cv = new CompareView(results, schema);
				}
				cv.render();
				// handle close events of the CompareView and emit a closed event
				cv.addListener(CompareView.eventTypes.CLOSED, function(){
					notifyListeners(null, MaterialSelector.eventTypes.CLOSED);
				}, this);
				
			}).always(onFinish);
		} else {
			const _temp = _materials;
			// gather all material descriptors from the back-end
			mahuUtils
				.queryMaterialDescription(_materials[num].id)
				.done(function(_results){
					let m = _results[0];
					if (!m.imageURL){
						m.imageURL = _materials[num].imageURL;
						if (_materials[num]["isSymbolicImage"]){
							m.isSymbolicImage = true;
						}
					}
					m.altName = _materials[num].altName;
					m.query = _materials[num].query;
					results.push(m);
					
					queryMaterial(num + 1, _temp, results, onFinish, showPlot);
				})
				.fail(onFinish);
		}
	};
	
	/**
	 * Add a listener for the given entry type  and event type (see MaterialSelector.eventTypes).
	 * 
	 * @param eventType (String). The type of change for which to listen on. See MaterialSelector.eventTypes for valid values. 
	 * @param handler (Function). The function to be called.
	 * @param scope (Object, optional). The scope in which to call the handler function. 
	 * @return (boolean) success state
	 */
	const addListener = function(eventType, handler, scope){
		if (!$.isFunction(handler)) {
			return false;
		}
		
		let foundAtIndex = findEntry(eventType, handler, scope);
		if (foundAtIndex == -1){
			listeners.push({
				eventType: eventType,
				handler: handler,
				scope: scope
			});
			
			return true;
		}
		return false;
	};
	
	/**
	 * Private helper method to find a listener for the given parameters.
	 * 
	 * @return the index within the listeners array at which a matching record has been found 
	 */
	const findEntry = function(eventType, handler, scope){
		let foundAtIndex = -1;
		
		for (let i=0; i < listeners.length; ++i){
			let listener = listeners[i];
			
			if (listener.eventType == eventType && 
					listener.handler == handler &&
					listener.scope == scope){
				foundAtIndex = i;
				break;
			}
		}
		return foundAtIndex;
	};
	
	/**
	 * Remove a listener for the given entry type  and event type (see MaterialSelector.eventTypes).
	 * 
	 * @param eventType (String). The type of change for which to listen on. See MaterialSelector.eventTypes for valid values. 
	 * @param handler (Function). The function to be called.
	 * @param scope (Object, optional). The scope in which to call the handler function.
	 * @return (boolean) success state
	 */
	const removeListener = function(eventType, handler, scope){
		let foundAtIndex = findEntry(eventType, handler, scope);
		if (foundAtIndex != -1){
			listeners.splice(foundAtIndex, 1);
			return true;
		}
		return false;
	};
	
	/*
	 * Notify listeners.
	 */
	const notifyListeners = function(entity, eventType){
		listeners.forEach(function(listener){
			if ((listener.eventType && listener.eventType == eventType)	
					|| listener.eventType == MaterialSelector.eventTypes.ALL
					|| !listener.eventType){
				try {
					listener.handler.call(
						listener.scope,
						entity,
						eventType
					);
				} catch(e) {
					console.error(e);
				}
			}
		});
	};
	
	
	initialize();
	
	/* expose public interface */
	return {
		render : render,
		addMaterial: addMaterial,
		removeMaterial : function(material){
			if (!material) return;
			
			removeMaterial(material.id);
		},
		addListener: addListener,
		removeListener: removeListener,
		isSelected : isSelected,
		clear: clear,
		show: show,
		hide: hide
	};
};

/**
 * Enumerates valid event types.
 */
Object.defineProperties(MaterialSelector, {
	"eventTypes" : {
		value: Object.defineProperties({} , {
			"MATERIALADDED": {
				value: "add",
				configurable: false,
				enumerable: true,
				writable: false
			},
			"MATERIALREMOVED": {
				value: "remove",
				configurable: false,
				enumerable: true,
				writable: false
			},
			"CLOSED": {
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
			}
		}),
		writeable : false,
		enumerable: true,
		configurable: false
	}
});