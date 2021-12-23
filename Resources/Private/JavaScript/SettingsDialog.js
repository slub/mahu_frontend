/**
 * Renders the settings dialog.
 * 
 * Copyright 2020 SLUB Dresden
 */
const SettingsDialog = function(userProfile, props){
	const elementID = "settingsDialogContainer";
	
	let parentElement = null;
	let grayout = null;
	
	let listeners = [];
	
	// determine such material properties where at least one of the given materials has a value for
	let usefulProps = props;
	
	/**
	 * Sets the state of the save button depending on the current selection in the dialog
	 */
	const checkButtonStates = function (){
		let cppEnabled = $("#enableCPP")[0].checked;
		let selOps = $("#sdPropertySelector")[0].selectedOptions;
		
		if (cppEnabled && selOps.length == 0) {
			$("#sdsave").prop( "disabled", true );			
		} else {
			$("#sdsave").prop( "disabled", false );	
		}
	};
	
	/**
	 * Renders the comparison view.
	 */
	const render = function(){
		let me = this;
		
		// an overlay graying out the background
		grayout = document.createElement("div");
		grayout.classList.add("overlay");
		
		// the element that contains the comparison view
		parentElement = document.createElement("div");
		parentElement.id = elementID;
		
		// instantiate some elements ...
		
		let iEl = document.createElement("i");
		iEl.classList.add("fas");
		iEl.classList.add("fa-times");
		
		let clsBtn = document.createElement("a");
		clsBtn.id = "sdcloseRightUpper";
		clsBtn.setAttribute("tabindex","0");
		clsBtn.classList.add("pull-right");
		clsBtn.appendChild(iEl);
		
		let heading = document.createElement("h3");
		heading.innerText = "Einstellungen";
		
		let buttonBar = document.createElement("div");
		
		let headerBar = document.createElement("div");
		headerBar.classList.add("compareViewHeader");
		
		// ... and add them to the container
		parentElement.appendChild(clsBtn);
		parentElement.appendChild(heading);
		parentElement.appendChild(headerBar);
		parentElement.appendChild(buttonBar);
		
		document.body.appendChild(grayout);
		document.body.appendChild(parentElement);
		
		let cpp = userProfile.getSetting("customPreviewProps") || [];
		
		// prepare the HTML markup for the selection box in the header bar
		let rendered = "<h4>Angezeigte Materialeigenschaften in der Ergebnisliste</h4>";
		
		if (cpp.length > 0) {
			rendered+="<input id='enableCPP' type='checkbox' value='1' checked>";
		} else {
			rendered+="<input id='enableCPP' type='checkbox' value='0'>";
		}
		rendered+="<label for='enableCPP' style='display:initial;margin-left:5px'>"+Localization.getString("sd.cpp")+"</label>";
		
		rendered += "<div id='cppSelectionArea'><p>"+Localization.getString("sd.cpp.selectProps")+"</p><select multiple='true' id='sdPropertySelector' class='chosen-container chosen-container-multi inputContainer'>";
		Object.getOwnPropertyNames(usefulProps).forEach(function(propName){
			if (cpp.indexOf(propName) != -1 ) {
				rendered += "<option selected value='"+propName+"'>"+Localization.getString(propName)+"</option>";
			} else {
				rendered += "<option value='"+propName+"'>"+Localization.getString(propName)+"</option>";
			}
		});
		rendered+="</select></div>";
		// add the markup to the DOM
		$(headerBar).html(rendered);
		
		if (cpp.length > 0) {
			$("#cppSelectionArea").show();
		} else {
			$("#cppSelectionArea").hide();
		}
		
		// initialize jQuery chosen for the newly created selection box
		$("#sdPropertySelector").chosen({
			allow_single_deselect: true,
			max_selected_options: 3
		}).change(function(){
			checkButtonStates();
		});
		// fix the width of the jQuery chosen element
		let sdPropertySelector_chosen = document.getElementById("sdPropertySelector_chosen");
		if (sdPropertySelector_chosen) {
			sdPropertySelector_chosen.style= "width:100% !important";
		}
		
		// prepare the HTML markup for the button bar
		rendered='<div class="buttonbar"><button id="sdsave" class="btn btn-primary">'+Localization.getString("save")+'</button>';
		rendered+='<button id="sdclose" class="btn btn-primary">'+Localization.getString("close")+'</button>';
		rendered+='</div>';
		
		let bbarjq= $(buttonBar);
		// render contents
		bbarjq.html(rendered);
		
		// add click handler to the close button (cross in right upper corner)
		$("#sdcloseRightUpper").on("click keyup", function(event){
			if (event.type === "keyup" && event.keyCode != 13){
				return;
			}
			dispose();
		});
		// add click handler to the close button
		bbarjq.find("#sdsave").click(function(){
			let res = {};
			let cppEnabled = $("#enableCPP")[0].checked;
			
			// add settings to the result object
			res["cppEnabled"] = cppEnabled;
			
			if (cppEnabled) {
				let selectedOptions = $("#sdPropertySelector")[0].selectedOptions;
				let selOps = [];
				for (let i=0; i < selectedOptions.length; ++i) {
					selOps.push(selectedOptions[i].value);
				}
				res["selectedProperties"] = selOps;
			}
			// inform listeners and close the dialog
			me.notifyListeners(res, "change");
			
			dispose();
		});
		// add click handler to the back button
		bbarjq.find("#sdclose").click(function(){
			dispose();
		});
		
		// click and key handler for the enable custom preview properties checkbox 
		$("#enableCPP").on("click keyup", function(event){
			if (event.type === "keyup" && event.keyCode != 13){
				return;
			}
			// hide/show property selection area depending on the checkbox state
			if (event.target.checked) {
				$("#cppSelectionArea").show();
			} else {
				$("#cppSelectionArea").hide();
			}
			checkButtonStates();
		});

		$("body").addClass("noscroll");
		
		// center the container
		center(parentElement);
		// add listener to window resize events (centers the comparison table)
		window.onresize = function(){
			center(parentElement);
		};
	};
	
	const dispose = function(){
		// dispose this widget 
		// clear DOM
		document.body.removeChild(grayout);
		document.body.removeChild(parentElement);
		
		window.onresize = null;
		
		$("body").removeClass("noscroll");
		notifyListeners(null, CompareView.eventTypes.CLOSED);
	};
	
	/*
	 * Centers the given container element vertically and horizontally on the screen.
	 */
	const center = function(_c){
		let container = $(_c);
		container.css({ 
			left: Math.max(($("body").width() - container.outerWidth())/2 , 0), 
			top: Math.max((window.innerHeight - container.outerHeight())/2, 0) 
		});
	};
	
	/**
	 * Add a listener for the given entry type  and event type (see CompareView.eventTypes).
	 * 
	 * @param eventType (String). The type of change for which to listen on. See CompareView.eventTypes for valid values. 
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
	 * Remove a listener for the given entry type  and event type (see CompareView.eventTypes).
	 * 
	 * @param eventType (String). The type of change for which to listen on. See CompareView.eventTypes for valid values. 
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
					|| listener.eventType == CompareView.eventTypes.ALL
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
	
	/* expose public interface */
	return {
		render : render,
		addListener: addListener,
		removeListener: removeListener,
		notifyListeners: notifyListeners
	};
};
