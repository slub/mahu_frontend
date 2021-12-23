/**
 * Renders a parallel coordinates chart and a table for the given materials.
 * The material properties used for comparison (max. 6) can be selected by the user.
 * 
 * Copyright 2019-2020 SLUB Dresden
 */
const CompareViewPlot = function(materials, props){
	
	let scriptsReady = true;
	
	{
		let scriptsToLoad = [];
		if (window.d3 === undefined) {
			scriptsToLoad.push("https://d3js.org/d3.v5.min.js");
			scriptsToLoad.push("/typo3conf/ext/mahu_frontend/Resources/Public/JavaScript/libs/divgrid.min.js");
		} else {
			if (window.d3.divgrid === undefined) {
				scriptsToLoad.push("/typo3conf/ext/mahu_frontend/Resources/Public/JavaScript/libs/divgrid.min.js");
			}
		}
		if (window.ParCoords === undefined) {
			scriptsToLoad.push("/typo3conf/ext/mahu_frontend/Resources/Public/JavaScript/libs/parcoords.standalone.min.js");
		}
		if ($().chosen === undefined) {
			scriptsToLoad.push("/typo3conf/ext/mahu_frontend/Resources/Public/JavaScript/libs/chosen.jquery.min.js");
			
			// add CSS as well
			var css = document.createElement('link');
			css.rel = "stylesheet";
			css.type = "text/css";
			css.href = "/typo3conf/ext/mahu_frontend/Resources/Public/Css/chosen.jquery.min.css";
			css.media = "all";
			document.getElementsByTagName('head')[0].appendChild(css);
		}
		
		if (scriptsToLoad.length > 0)
			scriptsReady = false;
		
		function loadScript(scriptToLoad, pendingScripts){
			var script = document.createElement('script');
			script.onload = function() {
				if (pendingScripts.length > 0)
					loadScripts(pendingScripts);
				else
					scriptsReady = true;
			};
			script.src = scriptToLoad;
			document.getElementsByTagName('head')[0].appendChild(script);
		}
		
		function loadScripts(scripts){
			let firstScript= scripts.shift();
			if (firstScript)
				loadScript(firstScript, scripts);
		};
		
		loadScripts(scriptsToLoad);
	}
	
	const elementID = "compareViewContainer";
	
	let parentElement = null;
	let grayout = null;
	let container = null;
	
	let dimensions = [];
	
	let listeners = [];
	
	let graph = null;
	
	// determine such material properties where at least one of the given materials has a value for
	let usefulProps = {};
	Object.getOwnPropertyNames(props.properties).forEach(function(propName){
		let prop= props.properties[propName];
		
		let values = [];
		
		for (let k=0; k < materials.length; ++k){
			let material = materials[k];
			
			let min = material[propName+"_value_min"],
				max = material[propName+"_value_max"],
				val = material[propName+"_value"];
			
			if (val || min || max) {
				usefulProps[propName] = prop;
				break;
			}
		}
	});
	
	{
		// determine initial dimensions
		if (usefulProps["density"]) {
			dimensions.push("density");
		}
		if (usefulProps["hardness_ShoreD"]) {
			dimensions.push("hardness_ShoreD");
		}
		let arr = Object.getOwnPropertyNames(usefulProps);
		while (dimensions.length < 2) {
			for (let i=0; i < arr.length; ++i){
				let propName = arr[i];
				if (dimensions.indexOf(propName) == -1) {
					dimensions.push(propName);
					break;
				}
			}
		}
	}
	
	
	/**
	 *  Answers an array of data objects (material descriptors) to be visualized.
	 */
	const getData = function(withName=false){
		let _data = [];
		
		for (let i=0;i < materials.length; ++i){
			let res = materials[i];
			let adaptedRes = {};
			
			if (withName) {
				adaptedRes[Localization.getString("name")]= (res["nameTrade_value"] || res["name"]) + (res["altName"]? " "+res["altName"]:"");
			}

			for (let j=0;j<dimensions.length; ++j){
				let dimName = dimensions[j];
				//let dimName = dim.name;
				let dimNameV = dimName +"_value";
				
				let localizedDimName = Localization.getString(dimName);
				
				let value = res[dimNameV] || res[dimNameV+"_max"] || res[dimNameV+"_min"] || res[dimName] || undefined;
				if (Array.isArray(value)){
					if (dimName){ // special handling for the property category
						adaptedRes[localizedDimName] = value[value.length-1];
					} else {
						adaptedRes[localizedDimName] = value[0];
					}
				} else {
					adaptedRes[localizedDimName] = value;
				}
			}
			
			_data.push(adaptedRes);
		}
		return _data;
	};
	
	/**
	 *  Renders the actual parallel coordinates chart and the "table"
	 */
	const renderChart = function(){
		let data = getData(false);
		
		if (graph != null) {
			$(container).html("");
		}
		
		let color_scale = //d3.scaleLinear().domain([ -2, -0.5, 0.5, 2 ]).range([ "#DE5E60", "steelblue", "steelblue", "#98df8a" ]).interpolate(d3.interpolateLab);
			d3.scaleLinear()
			  .domain([9, 50])
			  .range(["steelblue", "brown"])
			  .interpolate(d3.interpolateLab);
		
		graph = ParCoords({nullValueSeparator: "bottom"})("#"+container.id).alpha(0.4).color(color_scale);
		
		// manually set the dimension type because the auto-detect mechanism struggles if the first values of a dimension in the dataset are null/undefined
		let ds = {};
		Object.keys(data[0]).forEach(function(dn){
			ds[dn] = {
				type: "number"
			}
		});
		
		graph.data(data).dimensions(ds).render().createAxes().brushMode("None")//.brushMode("1D-axes");
		
		data = getData(true);
		// render the comparison table
		let grid = d3.divgrid("#compareViewTable");
		d3.select("#compareViewTable").datum(data).call(grid).selectAll(".gridrow").on("mouseover", function(d) {
				graph.highlight([ d ])
			}).on("mouseout", graph.unhighlight);
		d3.select("#compareViewTable").select(".gridheader").selectAll(".cell").classed("cropText", true);
	};
	
	/**
	 * Renders the comparison view.
	 */
	const render = function(){
		if (!scriptsReady) {
			let me = this;
			setTimeout(function(){
				me.render();
			},200);
			return;
		}
		
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
		clsBtn.id = "compareViewCloseRightUpper";
		clsBtn.setAttribute("tabindex","0");
		clsBtn.classList.add("pull-right");
		clsBtn.appendChild(iEl);
		
		let heading = document.createElement("h3");
		heading.innerText = Localization.getString("compView.heading");
		
		container = document.createElement("div");
		container.id = "parCoordsWidget";
		container.classList.add("parcoords");
		container.style = "height:340px";
		
		let tableContainer = document.createElement("div");
		tableContainer.id = "compareViewTable";
		
		let buttonBar = document.createElement("div");
		
		let headerBar = document.createElement("div");
		headerBar.classList.add("compareViewHeader", "tx_find");
		
		let content = document.createElement("div");
		content.appendChild(container);
		content.appendChild(tableContainer);
		content.style= "overflow:auto;";
		
		parentElement.style = "width: auto";
		// ... and add them to the container
		parentElement.appendChild(clsBtn);
		parentElement.appendChild(heading);
		parentElement.appendChild(headerBar);
		parentElement.appendChild(content);
		parentElement.appendChild(buttonBar);
		
		document.body.appendChild(grayout);
		document.body.appendChild(parentElement);
		
		// prepare the HTML markup for the selection box in the header bar
		let rendered = Localization.getString("compViewPlot.selectProps")+"<select multiple='true' id='compareViewPropertySelector' class='chosen-container chosen-container-multi inputContainer'>";
		Object.getOwnPropertyNames(usefulProps).forEach(function(propName){
			if (dimensions.indexOf(propName) != -1 ) {
				rendered += "<option selected value='"+propName+"'>"+Localization.getString(propName)+"</option>";
			} else {
				rendered += "<option value='"+propName+"'>"+Localization.getString(propName)+"</option>";
			}
		});
		rendered+="</select>";
		// add the markup to the DOM
		$(headerBar).html(rendered);
		
		// initialize jQuery chosen for the newly created selection box
		$("#compareViewPropertySelector").chosen({
			allow_single_deselect: true,
			max_selected_options: 6
		}).change(function(e, ch){
			dimensions.length = 0;
			let selOps = e.target.selectedOptions;
			for (let i=0; i < selOps.length; ++i) {
				dimensions.push(selOps[i].value);
			}
			
			renderChart();			
			center(parentElement);
			setTimeout(function(){
				renderChart();
				center(parentElement);
			}, 10);
		});
		// fix the width of the jQuery chosen element
		let cel = document.getElementById("compareViewPropertySelector_chosen");
		if (cel) {
			cel.style= "width:100% !important";
		}
		
		// prepare the HTML markup for the button bar
		rendered='<div class="buttonbar"><button id="compare-back" class="btn btn-primary">'+Localization.getString("compView.back")+'</button>';
		rendered+='<button id="compare-close" class="btn btn-primary">'+Localization.getString("compView.close")+'</button>';
		rendered+='</div>';
		
		let bbarjq= $(buttonBar);
		// render contents
		bbarjq.html(rendered);
		
		// add click handler to the close button (cross in right upper corner)
		$("#compareViewCloseRightUpper").on("click keyup", function(event){
			if (event.type === "keyup" && event.keyCode != 13){
				return;
			}
			dispose();
		});
		// add click handler to the close button
		bbarjq.find("#compare-close").click(function(){
			dispose();
		});
		// add click handler to the back button
		bbarjq.find("#compare-back").click(function(){
			dispose();
			
			let msel = mahu.getMaterialSelector();
			// add descriptors to material selector
			for (let index=0; index < materials.length; ++index){
				let mat = materials[index];
				let name= mat["nameTrade_value"] || mat["name"];
				
				let m = {
					'id': mat["id"],
					'category': mat['category'],
					'link': mat['link'],
					'imageURL' : mat["imageURL"],
					'isSymbolicImage': mat["isSymbolicImage"],
					'producer': mat["producer"],
					'query': mat["query"],
					"name": name,
					"altName": mat["altName"]
				};
				
				msel.addMaterial(m);
			}
			// show the material selector
			msel.show();
		});

		// draw the chart
		renderChart();

		$("body").addClass("noscroll");
		
		// center the container
		center(parentElement);
		// add listener to window resize events (centers the comparison table)
		window.onresize = function(){
			renderChart();
			center(parentElement);
		};
		
		// render again to fix layout issues 
		renderChart();
		center(parentElement);
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
	};
};
