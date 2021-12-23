/**
 * Renders a table for the given materials and properties to be shown. 
 * 
 * Copyright 2017-2020 SLUB Dresden
 */
const CompareView = function(materials, props){
	const elementID = "compareViewContainer";
	
	let overlay = null;
	let divEl = null;
	
	let listeners = [];
	
	let names = [],
		altNames = [];
	materials.forEach(function(mat){
		names.push(mat["nameTrade_value"]||mat["name"]);
		altNames.push(mat["altName"]);
	});

	// prepare data structure
	let data = [];
	
	let dataDeliverers= [];
	// add data deliverer
	materials.forEach(function(material1){
		dataDeliverers.push(material1["dataDeliverer"]);
	});
	data.push({
		name: Localization.getString("dataDeliverer"),
		values : dataDeliverers
	});
	
	const getMethodLabel = function(idx, norm, method, testCondition){
		if (!norm && !method && !testCondition) {
			return "";
		}
		
		let lbl = "";
		let setPrevious = false;
		if (Array.isArray(norm) && norm.length >= idx){
			lbl += norm[idx];
			setPrevious= true;
		}
		
		if (Array.isArray(method) && method.length >= idx){
	        if (setPrevious) {
	            lbl += ", ";
	        }
			lbl += method[idx];
			setPrevious = true;
		}
		if (Array.isArray(testCondition) && testCondition.length >= idx){
	        if (setPrevious) {
	            lbl+= ", ";
	        }
			lbl += testCondition[idx];
		}

		if (lbl.trim().length > 0) {
			return '<i class="fas fa-info-circle propertyInfo" tabindex="0" title="'+lbl+'"></i>';
		} else {
			return "";
		}
	}

	// first, gather all values of "miscellaneous" material properties
	Object.getOwnPropertyNames(props.miscProperties).forEach(function(propName){
		let prop= props.miscProperties[propName];
		
		if (prop.hideInComparison) return;
		
		let values = [];
		
		materials.forEach(function(material1){
			let _p = material1[propName];

			let val1 = "";
			if (Array.isArray(_p)) {
				let len = _p.length;
				
				// special handling required since we only want to display the most specific category
				if ("category" == propName){
					val1 = _p[len-1];
				} else {
					for (let idx = 0; idx < len; ++idx){
						val1 += _p[idx];
						if (idx != len -1)
							val1 += ", ";
					}
				}
			} else {
				// its a non-array entry --> use default toString
				val1 = _p;
			}
			// as fallback, show a "-" to indicate missing values 
			val1 = val1 || "-";
			
			// append the default unit if available
			if (_p && prop["defaultUnit"]){
				val1 += prop["defaultUnit"];
			}
			values.push(val1);
		});
		
		// test if there is at least one value available for that property...
		let hasValues = false;
		for(var k=0; k< values.length; ++k){
			if (values[k] && values[k] != "-") {
				hasValues = true;
				break;
			}
		}
		// .. and leave out empty rows
		if (hasValues)
		data.push({
			name: Localization.getString(propName),
			values : values
		});
	});
	
	// next, gather all values of physical material properties
	Object.getOwnPropertyNames(props.properties).forEach(function(propName){
		let prop= props.properties[propName];
		
		if (prop.hideInComparison) return;
		
		let values = [];
		let obfuscate = [];
		
		materials.forEach(function(material1){
			let value = "";

			let min1 = material1[propName+"_value_min"],
				max1 = material1[propName+"_value_max"],
				val1 = material1[propName+"_value"],
				unit = material1[propName+"_unit"],
				remark = material1[propName+"_remark"],
				substance = material1[propName+"_substance"],
				norm = material1[propName+"_norm"],
	    		method = material1[propName+"_method"],
	    		testCondition = material1[propName+"_testCondition"];

			if (!prop.isMultivalued) {
				if ((min1 && min1 != "NaN") || (max1 && max1 != "NaN" )) {
					if ((!min1 || min1 == "NaN") && max1){
						value = "&#x003C;&#160;"+max1;
					}
					if (min1 && (!max1 || max1 == "NaN")){
						value = "&#x003E;&#160;"+min1;
					}
					if (min1 != "NaN" && max1 != "NaN"){
						value = min1 +" - "+ max1;	
					}
					value += " " + (unit||prop["defaultUnit"]||"");
				} else {
					if (val1!= null && val1 != undefined && val1 != "NaN") {
						value = val1;
						value += " " + (unit||prop["defaultUnit"]||"");
					} else {
						if (remark) {
							value +="("+remark+")";
						}
					}
					if (prop.isQualitative && substance) {
						value = substance + ": "+ value;
					}
				}
				value += getMethodLabel(0, norm, method, testCondition);
			} else {
				if (val1 && !Array.isArray(val1)){
					val1 = [val1];
				}
				if (min1 && !Array.isArray(min1)){
					min1 = [min1];
				}
				if (max1 && !Array.isArray(max1)){
					max1 = [max1];
				}

				let len = 0;
				if (val1)
					len = val1.length || 1;
				else {
					if (min1)
						len = min1.length || 1;
					else if (max1)
						len = max1.length || 1;
				}

				for (let k=0; k < len; ++k){
					let _val = (val1? val1[k]:undefined);
					let _min = (min1? min1[k]:undefined);
					let _max = (max1? max1[k]:undefined);
					
					let _unit = (unit? unit[k]: prop["defaultUnit"] || "");
					
					if (!_val || _val == "NaN") {
						if (remark && remark[k] && remark[k]!="-") {
							value +="("+remark[k]+")";
						} else {
							if ((!_min || _min == "NaN") && _max && _max != "NaN"){
								value+= "&#x003C;&#160;"+_max + " " +_unit;
							}
							if (_min && _min != "NaN" && (!_max || _max == "NaN")){
								value+= "&#x003E;&#160;"+_min + " "+_unit;
							}
							if (_min && _min != "NaN" && _max && _max != "NaN"){
								value+= _min +" - "+ _max + " "+ _unit;
							}
						}
					} else {
						
						if (prop.isQualitative && substance) {
							value += substance[k] + ": "+ val1[k] + " " + _unit;
						} else {
							value += val1[k] + " "+ _unit;
						}
						
					}
					value += getMethodLabel(k, norm, method, testCondition);
					if (k != len-1) {
						value+=",<br/> ";
					}
				}
			}
			
			values.push(value);
			obfuscate.push(material1.obfuscate);
		});
		
		// test if there is at least one value available for that property...
		let hasValues = false;
		for(var k=0; k< values.length; ++k){
			if (values[k] && values[k] != "-") {
				hasValues = true;
				break;
			}
		}
		
		// .. and leave out empty rows
		if (hasValues)
		data.push({
			name: Localization.getString(propName),
			values : values,
			obfuscate: obfuscate
		});
	});
	
	/**
	 * Renders the comparison view.
	 */
	const render = function(){
		overlay = document.createElement("div");
		overlay.id = "overlay";
		overlay.classList.add("overlay");
		document.body.append(overlay);
		
		divEl = document.createElement("div");
		divEl.id = elementID;
		document.body.append(divEl);
		
		let rendered = '<div style="text-align:right"><a id="compareViewCloseRightUpper" tabindex="0"><i class="fas fa-times" aria-hidden="true"></i></a></div>'+
				'<div style="overflow:auto"><table id="comparisonTable" class="propertiesTable">'+
					'<thead>'+
					'<tr><th><h3>'+Localization.getString("compView.heading")+'</h3></th>';

		for (var s=0; s < materials.length; ++s){
			rendered += '<th>';
			let iurl = materials[s].imageURL;
			if (!materials[s].isSymbolicImage && iurl && iurl.indexOf(mahu.getImageLinkResolver().getDefaultImageURL()) === -1){
				rendered += '<div class="thumbWrap"><img src="' + iurl + '" class="thumb"></img></div>';
			} else {
				// render symbolic image derived by the material category
				let c= null;
				if (materials[s].category) {
					c= materials[s].category[materials[s].category.length - 1];
					if (!mahu.getTaxonomy().getMaterialClass(c)) {
						c = materials[s].category[materials[s].category.length - 2];
					}
				}
				rendered += '<div class="thumbWrap" style="position:relative"><img src="' + mahu.getTaxonomy().getImage(c) + '" class="thumb"></img><p class="siOverlay">'+Localization.getString("symbolicImage")+'</p></div>';
				materials[s]["isSymbolcImage"]= true;
			}
		}

		rendered+='</tr><tr><th>'+Localization.getString("compView.property")+'</th>';
		
		for (var s=0; s < materials.length; ++s){
			let href = mahu.getDetailPageLink(materials[s].id);
			
			rendered += '<th>';
			rendered += '<div class="cropText">'+
					'<a class="detailPageLink" data-mid="'+materials[s].id+'" href="'+href+'"><i class="fas fa-search smallicon" aria-hidden="true"></i>'+names[s]+(altNames[s]?" "+altNames[s]:"")+'</a>'+
				'</div>'+
			'</th>';
		}
		rendered+='</tr></thead><tbody>';
		
		data.forEach(function(prop){
			rendered+= '<tr><td>'+prop.name+'</td>';
			for (var j=0; j< prop.values.length; ++j){
				rendered += '<td';
				if (prop.obfuscate && prop.obfuscate[j]){
					rendered+= ' class="blurred"';
				}
				rendered += '>'+prop.values[j]+'</td>';
			}
			rendered+='</tr>';
		});
		/*rendered+="<tr><td></td>";
		for (var i=0;i<names.length;++i)
			rendered+='<td><button data-material="'+i+'" class="btn btn-primary">Neuen Vergleich mit diesem Material</button></td>';
		rendered+='</tr>';*/
		rendered+='</tbody></table></div>';
		rendered+='<div class="buttonbar"><button id="compare-back" class="btn btn-primary">'+Localization.getString("compView.back")+'</button>';
		rendered+='<button id="compare-close" class="btn btn-primary">'+Localization.getString("compView.close")+'</button>';
		rendered+='<button id="compare-export" class="btn btn-primary">'+Localization.getString("ExportCSV")+'</button>';
		rendered+='</div>';
		
		let container = $("#"+elementID);
		// render contents
		container.html(rendered);
		
		// add click handler to close button (cross in right upper corner)
		container.find("#compareViewCloseRightUpper").on("click keyup", function(event){
			if (event.type === "keyup" && event.keyCode != 13){
				return;
			}
			dispose();
		});
		// add click handler to close button
		$("#compare-close").click(function(){
			dispose();
		});
		// add click handler to back button
		$("#compare-back").click(function(){
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
		$("#compare-export").click(function(){
			// dont let table2csv extract headers (caused issues due to two rows in the thead), but rather set it manually
			let header= [];
			$("#comparisonTable thead tr:nth-child(2) th").each(function(idx , el) {
				header.push(el.textContent);
			});
			
			// generate semicolon-separated CSV (as string at this moment)
			let data = $("#comparisonTable").table2CSV({
				delivery: 'value',
				separator: ';',
				header: header
			});
			// convert to an array with an entry per row.
			// prepend UTF-8 BOM to ensure correct encoding
			let array = [ "\ufeff" ].concat(data.split("\n"));
			for (let i=0; i < array.length; ++i){
				array[i]+="\n";
			}
			// open save-file-dialog
			mahuUtils.saveBlobAsFile("comparison.csv", array);
		});
		$(".detailPageLink").on("click keyup", function(event){
			if (event.type === "keyup" && event.keyCode != 13){
				return;
			}
			let mid = $(this).attr("data-mid");
			let query= null;
			materials.forEach(function(mat){
				if (mat.id == mid) {
					query = mat.query;
				}
			});
			if (query)
				sessionStorage.setItem("RELATED_QUERY", JSON.stringify(query));
		});
		
		// center the container
		center(container);
		// add listener to window resize events (centers the comparison table)
		window.onresize = function(){
			center(container);
		};
		
		$("body").addClass("noscroll");
	};
	
	const dispose = function(){
		// dispose this widget clear DOM
		document.body.removeChild(divEl);
		document.body.removeChild(overlay);
		
		window.onresize = null;
		
		$("body").removeClass("noscroll");
		notifyListeners(null, CompareView.eventTypes.CLOSED);
	};
	
	/*
	 * Centers the given container element vertically and horizontally on the screen.
	 */
	const center = function(container){
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

/**
 * Enumerates valid event types.
 */
Object.defineProperties(CompareView, {
	"eventTypes" : {
		value: Object.defineProperties({} , {
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