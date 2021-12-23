/**
 * Renders a button which provides acces to a menu with the specified entries in context of a given material. 
 * 
 * Copyright 2017-2020 SLUB Dresden
 */
const ActionsMenu = function(parentElement, menuConfig, material){
	
	// initialization
	let element = null;
	let menuEntries = '';
	// set default menu configuration
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
	if (menuConfig.headerText && menuConfig.headerText.length > 0) {
		menuEntries += '<div class="actionsMenuHeaderText">'+menuConfig.headerText+'</div>';
	}
	if (Array.isArray(menuConfig.menuOptions)){
		menuEntries += '<div><a class="actionsMenuButton no-change" tabindex="0" title="'+Localization.getString("close")+'"><i class="fas fa-times" aria-hidden="true"></i></a></div>';
		
		menuConfig.menuOptions.forEach(function(option){
			if (option.cssClasses){
				menuEntries += '<div><a id="'+option.id+'" tabindex="0" class="no-change'+(option.cssClasses.link?' '+option.cssClasses.link:'')+'"><i class="'+option.cssClasses.icon+'" aria-hidden="true"></i>'+option.label+'</a></div>';
			} else {
				menuEntries += '<div><a id="'+option.id+'" tabindex="0" class="no-change"><i aria-hidden="true"></i>'+option.label+'</a></div>';
			}
		});
	}
	
	// register listeners at history ...
	mahu.getHistory().addListener(history.entryTypes.ALL, history.eventTypes.ALL, function(type, entity, eventType){
		checkStates();
	});
	
	/**
	 * Renders this actions menu.
	 */
	const render = function(){
		// add button and menu container to DOM
		let menu = document.createElement("div");
		menu.classList.add("contextMenu");
		menu.classList.add("cmright");
		menu.style.display = "none";
		
		let button = document.createElement("a");
		button.classList.add("contextMenuButton");
		button.classList.add("no-change");
		if (menuConfig.additionalCssClasses.button)
			button.classList.add(menuConfig.additionalCssClasses.button);
		button.setAttribute("title", menuConfig.label || Localization.getString("actionmenu"));
		button.setAttribute("tabindex","0");
		
		let icon = document.createElement("i");
		icon.classList.add("fa");
		icon.classList.add("fa-bars");
		if (menuConfig.additionalCssClasses.icon) {
			if (Array.isArray(menuConfig.additionalCssClasses.icon)){
				for (let ci=0; ci < menuConfig.additionalCssClasses.icon.length; ++ci){
					icon.classList.add(menuConfig.additionalCssClasses.icon[ci]);
				}
			}
			else {
				icon.classList.add(menuConfig.additionalCssClasses.icon);
			}
		}
			
		icon.setAttribute("aria-hidden", "true");
		
		button.append(icon);
		if (menuConfig.additionalElement) {
			let addElem= $(menuConfig.additionalElement);
			button.append(addElem[0]);
		}

		
		parentElement.append(button);
		parentElement.append(menu);
		
		
		if (menuConfig.staticMenu) {
			button.style.display = "block";
		} else {
			// add hover handler
			parentElement.hover(function(event){ // handle in 
				button.style.display = "block";
			}, function(event){// handle out
				button.style.display = "none";
			});
			parentElement.focus(function(){
				button.style.display = "block";
			}).blur(function(event){
				if (event.relatedTarget !== button && !$(menu).is(":visible"))
					button.style.display = "none";
			});
			$(button).blur(function(){
				if (!$(menu).is(":visible"))
					button.style.display = "none";
			});
		}
		
		let handleClickAndKey = function(){
			const hideMenu = function(e){
				menu.style.display="none";
				menu.classList.remove("cmleft");
				menu.classList.add("cmright");
			};
			
			// show context menu
			if (menu.style.display=="none"){
				menu.style.display="";
				
				// intelligent positioning
				let _m = $(menu);
				let position= _m.offset();
				let width = _m.outerWidth(true);
				if (window.innerWidth < position.left + width){
					_m.removeClass("cmright");
					_m.addClass("cmleft");
					
					// avoid negative y-coordinates
					if (_m.offset().left < 0){
						_m.offset({
							left: 3,
							top: _m.offset().top + $(button).height() + 10
						});
					}
				} else {
					_m.removeClass("cmleft");
					_m.addClass("cmright");
				}
				
				// click listener that hides the context menu when the user clicks somewhere outside of it
				let handler = function(e){
					if (e.target.localName != "a")
						e.preventDefault();
					hideMenu();
					window.removeEventListener("click", handler);// remove the click handler
				};
				// add the click handler to the window object
				window.addEventListener("click", handler);
			// hide context menu
			} else {
				hideMenu();
			}
		};
		
		// add menu button click handler
		$(button).on("click keyup", function(event){
			if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
				return true;
			}
			event.preventDefault();
			event.stopPropagation();
			
			handleClickAndKey();
		});
		
		
		element = $(menu);
		// add menu entries to menu container
		element.html(menuEntries);

		// add click listeners 
		element.find("a").each(function(){
			let me = $(this);
			let id= me.attr("id");
			me.on("click keyup",function(_event){
				if (_event.type == "keyup" && _event.originalEvent.keyCode != 13) {
					return true;
				}
				_event.preventDefault();
				_event.stopPropagation();
				// hide parent element, i.e., the menu
				element.hide();
				
				// get menu option
				let correspondingOption = null;
				for (let i=0; i< menuConfig.menuOptions.length; ++i){
					let option = menuConfig.menuOptions[i];
					
					if (option.id == id){
						correspondingOption = option;
						break;
					}
				}
				
				// invoke handler function
				menuConfig.handler.call(menuConfig.handler, id, material, correspondingOption);
				
				checkStates();
			});
		});
		
		checkStates();
	};
	
	/*	
	 * make sure that button states are up to date
	 */
	const checkStates = function(){
		if (!$.isFunction(menuConfig.getActionState)) return;
		
		menuConfig.menuOptions.forEach(function(option){
			checkState(option);
		});
	};
	
	/*
	 * checks for the given menu option if its button should be highlighted or not
	 */
	const checkState = function(option){
		let id= option.id;
		
		let icon = element.find("a[id='"+id+"']");
		
		let state = menuConfig.getActionState.call(menuConfig.handler, id, material);
		if (state === true){
			$(icon).show();
		}
		if (state === false) {
			$(icon).hide();
		}
	};
	
	/* expose public interface */
	return {
		render : render
	};
};