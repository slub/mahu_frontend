/**
 * Renders a menu with the specified entries in context of a given material. 
 * 
 * Copyright 2017-2020 SLUB Dresden
 */
const ActionsList = function(parentElement, menuConfig, material){
	
	// initialization
	let element = null;
	let menuEntries = '';
	// apply default menu options
	if (!menuConfig){
		menuConfig = {
			handler: function(actionID, material){},
			menuOptions : []
		};
	}
	if (!menuConfig.additionalCssClasses){
		menuConfig.additionalCssClasses = {};
	}

	// prepare the HTML markup for the given menu options
	if (Array.isArray(menuConfig.menuOptions)){
		menuConfig.menuOptions.forEach(function(option){
			menuEntries += '<div><a class="no-change" title="'+option.label+'" tabindex="0" data-id="'+option.id+'"><i class="'+option.cssClasses.base+'" aria-hidden="true"></i></a></div>';
		});
	}
	
	// register listeners at history ...
	mahu.getHistory().addListener(history.entryTypes.ALL, history.eventTypes.ALL, function(type, entity, eventType){
		checkStates();
	});
	// ... and the material selector in order to keep button states up to date
	mahu.getMaterialSelector().addListener(MaterialSelector.eventTypes.ALL, function(entity, eventType){
		checkStates();
	}, this);

	/*
	 * make sure that button states are up to date
	 */
	const checkStates = function(){
		menuConfig.menuOptions.forEach(function(option){
			checkState(option);
		});
	};
	
	/*
	 * checks for the given menu option if its button should be highlighted or not
	 */
	const checkState = function(option){
		let id= option.id;
		
		let icon = element.find("a[data-id='"+id+"']");
		icon.removeClass(option.cssClasses.highlight || "highlight");
/*		icon.removeClass(option.cssClasses.enabled);
		icon.removeClass(option.cssClasses.disabled);*/
		
		let state = menuConfig.getActionState.call(menuConfig.handler, id, material);
		if (state === true){
			icon.addClass(option.cssClasses.highlight || "highlight");
			icon.attr("title", option.labelInactive || option.label);
		} else {
			icon.attr("title", option.label);
		}
/*		if (state === "enabled"){
			icon.addClass(option.cssClasses.enabled);
		}
		if (state === "disabled"){
			icon.addClass(option.cssClasses.disabled);	
		}*/
	};
	
	/**
	 * Renders this actions list.
	 */
	const render = function(){
		// add button and menu container to DOM
		let menu = document.createElement("div");
		menu.classList.add("actionsList");
		if (menuConfig.additionalCssClasses.actionlist)
			menu.classList.add(menuConfig.additionalCssClasses.actionlist);
		parentElement.append(menu);
		
		element = $(menu);
		// add menu entries to menu container
		element.html(menuEntries);

		// add click listeners 
		element.find("a").each(function(){
			let me = $(this);
			let id= me.attr("data-id");
			me.on("click keyup", function(_event){
				if (_event.type == "keyup" && _event.originalEvent.keyCode != 13) {
					return true;
				}
				if (_event.type == "click") {
					$(this).blur();
				}

				_event.preventDefault();
				_event.stopPropagation();
				
				// invoke handler function
				menuConfig.handler.call(menuConfig.handler, id, material);
				
				checkStates();
			});
		});
		checkStates();
	};
	
	/* expose public interface */
	return {
		render : render
	};
};