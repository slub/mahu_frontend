/**
 * A requirement tag allows users to define search criteria on material properties.
 * 
 * Copyright 2019-2020 SLUB Dresden
 */
const RequirementTag = function(parentElement, propertiesConfig, existingRequirement=null, genID=1){
	
	let requirement = {
		property: null,
		from: null,
		to: null,
		unit: null
	};
	/**
	 * -1	disposed
	 * 0	new, no property selected
	 * 1	property selected, no valid requirement yet
	 * 2	valid requirement, not added yet
	 * 3	valid, added requirement, editable
	 * 4	valid, added requirement, currently beeing edited
	 */
	let state = 0;
	
	if (existingRequirement){
		Object.assign(requirement, existingRequirement);
		state = 3;
	}
	
	let divEl = null;
	let clonedFieldsInModifierForm = null;
	
	let listeners= [];
	
	// build UI skeleton
	divEl = document.createElement("div");
	parentElement.append(divEl);
	
	const render = function(){
		let disabled = "";
		if (state == 3)
			disabled = "disabled";
		
		let rendered = '<div class="reqTag" data-genid='+genID+'>'+
			'<div class="propSelect">';
		if (state != 3) {
			rendered+='<select class="reqSelector" data-placeholder="'+Localization.getString("selectProperty")+'" '+disabled+'><option/>';
			
			let pps = Object.getOwnPropertyNames(propertiesConfig);
			let datas = [];
			// sort by localized property name
			for (let idx = 0; idx < pps.length; ++idx){
				//if (propertiesConfig[pps[idx]].isQualitative == 1)
				//	continue;
				
				let transl= Localization.getString(pps[idx]);
				datas.push({id: pps[idx], name: transl});
			}
			datas.sort(function(a,b){
				return a.name.localeCompare(b.name, Localization.getLanguage(), { sensitivity: 'base' });
			});
			
			for (let idx = 0; idx < datas.length; ++idx){
				let prop = datas[idx];
				//let prop= propertiesConfig[propName];
				rendered+='<option data-propID="'+prop.id+'"';
				if (state >= 1 && prop.id == requirement.property.id){
					rendered+=" selected";
				}
				rendered+='>'+prop.name+"</option>";
			}
			
			rendered+=	'</select>';
		} else {
			rendered+="<p class='propertyName cropText'>"+Localization.getString(requirement.property.id)+"</p>";
		}
		rendered+="<div class='btns'>";
		/*if (state == 0 || state == 1){
			rendered+= '<a tabindex="0" class="add disabled" title="'+Localization.getString("add")+'"><i class="fas fa-check"></i></a>';
		}
		if (state == 2 || state == 4){*/
		if (state != 3) {
			rendered+= '<a tabindex="0" class="add no-change" title="'+Localization.getString("add")+'"><i class="fas fa-check"></i></a>';
		}
		if (state == 3){
			rendered+= '<a tabindex="0" class="edit no-change" title="'+Localization.getString("edit")+'"><i class="fas fa-pen"></i></a>';
		}
		rendered+=	'<a tabindex="0" class="remove no-change" title="'+Localization.getString("remove")+'"><i class="fa fa-times" aria-hidden="true"></i></a>';
		rendered+="</div>";

		rendered+= '</div>'+
			'<div class="reqInner"/>';
		
		rendered+='</div>';
		
		let container = $(divEl);
		container.html(rendered);
		
		if (state != 0) {
			let prop = requirement.property;

			let value_min = "";
			let value_max = "";
			let curr_unit = "";
			if (state != 0){
				if (requirement.from){
					value_min = requirement.from;
				}
				if (requirement.to){
					value_max = requirement.to;
				}
				if (requirement.unit){
					curr_unit = requirement.unit;
				}
			}

			// render value specification area
			let detailrendered = '<div class="valueSelect">';
			if (state != 3) {
				if (requirement.property.isQualitative) {
					detailrendered+=
						'<input class="qualitative" id="c'+mahu.getUid()+'-field-genqft'+genID+'" data-name="from" type="text" name="tx_find_find[q][genqft'+genID+'][0]" value="'+value_min+'" >'+
						'<input id="c'+mahu.getUid()+'-field-genqft'+genID+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqft'+genID+'][1]" value="'+prop.id+'" >';					
				} else {
					if (requirement.property.id.indexOf("temperature") == 0) {
						detailrendered+=
							'<input id="c'+mahu.getUid()+'-field-genqftemp'+genID+'-from" '+disabled+' data-name="from" type="number" name="tx_find_find[q][genqftemp'+genID+'][0]" value="'+value_min+'" step="0.1" > &ndash; '+
							'<input id="c'+mahu.getUid()+'-field-genqftemp'+genID+'-to" '+disabled+' data-name="to" type="number" name="tx_find_find[q][genqftemp'+genID+'][1]" value="'+value_max+'" step="0.1" >'+
							' °C'+
							'<input id="c'+mahu.getUid()+'-field-genqftemp'+genID+'-prop" '+disabled+' data-name="propertyID" type="hidden" name="tx_find_find[q][genqftemp'+genID+'][2]" value="'+prop.id+'" >';
					} else {
						if (requirement.property.isDimensionlessQuantity) {
							detailrendered+=
									'<input id="c'+mahu.getUid()+'-field-genqfdq'+genID+'-from" '+disabled+' data-name="from" type="number" name="tx_find_find[q][genqfdq'+genID+'][0]" value="'+value_min+'" step="0.1" > &ndash; '+
									'<input id="c'+mahu.getUid()+'-field-genqfdq'+genID+'-to" '+disabled+' data-name="to" type="number" name="tx_find_find[q][genqfdq'+genID+'][1]" value="'+value_max+'" step="0.1" >'+
									'<input id="c'+mahu.getUid()+'-field-genqfdq'+genID+'-prop" '+disabled+' data-name="propertyID" type="hidden" name="tx_find_find[q][genqfdq'+genID+'][2]" value="'+prop.id+'" >';
						} else {
						
							let hideUnitArea = !prop.units && !prop.defaultUnit;
								
							detailrendered+=
									'<input id="c'+mahu.getUid()+'-field-genqf'+genID+'-from" '+disabled+' data-name="from" type="number" name="tx_find_find[q][genqf'+genID+'][0]" value="'+value_min+'" step="0.1" > &ndash; '+
									'<input id="c'+mahu.getUid()+'-field-genqf'+genID+'-to" '+disabled+' data-name="to" type="number" name="tx_find_find[q][genqf'+genID+'][1]" value="'+value_max+'" step="0.1" >'+
									'<input id="c'+mahu.getUid()+'-field-genqf'+genID+'-prop" '+disabled+' data-name="propertyID" type="hidden" name="tx_find_find[q][genqf'+genID+'][3]" value="'+prop.id+'" >'+
									'<select class="unitSelector selected" data="c'+mahu.getUid()+'-field-genqf'+genID+'-unit" data-name="unit" '+disabled+(hideUnitArea?' hidden="true"':'')+'>';
							
							// render unit selection area
							if (prop.units){
								for (let m = 0; m < prop.units.length; ++m){
									let unit = prop.units[m];
									detailrendered += '<option value="'+unit+'"';
									if (unit == curr_unit){
										detailrendered+= ' selected';
									}
									detailrendered+='>'+unit+'</option>';
								}
							} else {
								if (prop.defaultUnit) {
									detailrendered+='<option value="'+prop.defaultUnit+'" selected>'+prop.defaultUnit+'</option>';
								} else {
									detailrendered+='<option value="'+prop.defaultUnit+'" selected hidden>*</option>';
								}
							}
							detailrendered+=	'</select>'+
								'<input id="c'+mahu.getUid()+'-field-genqf'+genID+'-unit" '+disabled+' data-name="propertyID" type="hidden" name="tx_find_find[q][genqf'+genID+'][2]" value="'+(curr_unit)+'" >';
						}
					}
				}
			} else {
				let label = generateLabel(requirement);
				detailrendered+="<span>"+label+"</span>";
				if (requirement.property.isQualitative) {
					detailrendered+=
						'<input id="c'+mahu.getUid()+'-field-genqft'+genID+'" data-name="from" type="hidden" name="tx_find_find[q][genqft'+genID+'][0]" value="'+value_min+'" >'+
						'<input id="c'+mahu.getUid()+'-field-genqft'+genID+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqft'+genID+'][1]" value="'+prop.id+'" >';					
				} else {
					if (requirement.property.id.indexOf("temperature") == 0) {
						detailrendered+=
							'<input id="c'+mahu.getUid()+'-field-genqftemp'+genID+'-from" data-name="from" type="hidden" name="tx_find_find[q][genqftemp'+genID+'][0]" value="'+value_min+'" step="0.1" >'+
							'<input id="c'+mahu.getUid()+'-field-genqftemp'+genID+'-to" data-name="to" type="hidden" name="tx_find_find[q][genqftemp'+genID+'][1]" value="'+value_max+'" step="0.1" >'+
							'<input id="c'+mahu.getUid()+'-field-genqftemp'+genID+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqftemp'+genID+'][2]" value="'+prop.id+'" >';						
					} else {
						
						if (requirement.property.isDimensionlessQuantity) {
							detailrendered+=
								'<input id="c'+mahu.getUid()+'-field-genqfdq'+genID+'-from" data-name="from" type="hidden" name="tx_find_find[q][genqfdq'+genID+'][0]" value="'+value_min+'" step="0.1" >'+
								'<input id="c'+mahu.getUid()+'-field-genqfdq'+genID+'-to" data-name="to" type="hidden" name="tx_find_find[q][genqfdq'+genID+'][1]" value="'+value_max+'" step="0.1" >'+
								'<input id="c'+mahu.getUid()+'-field-genqfdq'+genID+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqfdq'+genID+'][2]" value="'+prop.id+'" >';							
						} else {
							detailrendered+=
								'<input id="c'+mahu.getUid()+'-field-genqf'+genID+'-from" data-name="from" type="hidden" name="tx_find_find[q][genqf'+genID+'][0]" value="'+value_min+'" step="0.1" >'+
								'<input id="c'+mahu.getUid()+'-field-genqf'+genID+'-to" data-name="to" type="hidden" name="tx_find_find[q][genqf'+genID+'][1]" value="'+value_max+'" step="0.1" >'+
								'<input id="c'+mahu.getUid()+'-field-genqf'+genID+'-unit" data-name="unit" type="hidden" name="tx_find_find[q][genqf'+genID+'][2]" value="'+curr_unit+'" >'+
								'<input id="c'+mahu.getUid()+'-field-genqf'+genID+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqf'+genID+'][3]" value="'+prop.id+'" >';
						}
					}
				}
			}
			detailrendered+='</div>';
			
			let reqInner = container.find(".reqInner");
			reqInner.html(detailrendered);
			
			// for qualitative properties, we query the terms that are used in records and provide these via autocompletion 
			if (requirement.property.isQualitative) {
				let fieldID = requirement.property.id+"_value";
				let autocompleteURL = mahu.getTermLink(fieldID, "json-all");
				if (autocompleteURL) {
					jQuery.getJSON(autocompleteURL, function (data) {
						// prepare the data structure (basically a string array) for jQuery autocomplete
						let terms = [];
						// first we have to look for the relevant data in Solr's response
						let arr = data["terms"][fieldID];
						// then we have to extracts the terms from the overall array (in which each term is followed by the number of its occurrences)
						for (let i=0; i< arr.length; i+=2) {
							terms.push(arr[i]);
						}
						// finally we initialize the autocomplete feature
						$('#c'+mahu.getUid()+'-field-genqft'+genID, container).autocomplete({
							source: terms,
							minLength: 0
						}).focus(function(event){
							if (event.target.value != "") {
								return;
							}
							let e = $.Event('keydown');
							e.key = 40;
							$(event.target).trigger(e);
						});
					});
				}
			}
			
			let inputHandler = function(ev){
				let v = ev.target.value;
				let n = ev.target.attributes["data-name"].value;
				requirement[n] = v;
				
				if (requirement.from || requirement.to){
					changeState(2);
				} else {
					if (state != 1)
						changeState(1);
				}
			};
			reqInner.find(".valueSelect input").change(inputHandler);//.keypress(inputHandler);
			
			
			let us = reqInner.find(".valueSelect .unitSelector");
			let usVal = us.is(":hidden") ? requirement.property.defaultUnit || "*" : us.val();
			$("#"+us.attr("data")).val(usVal);
			requirement.unit = usVal;
			us.change(function(ev){
				let select = $(ev.target);
				$("#"+select.attr("data")).val(select.val());
				requirement.unit= select.val();
				return false;
			});
		}
		
		
		// add click handler to min/max-button
		let editbtn = container.find(".edit");
		editbtn.on("click keyup", function(event){
			if (event.type === "keyup" && event.keyCode != 13)
				return;
			changeState(4);
			return false;
		});
		
		// add click handler to min/max-button
		let addbtn = container.find(".add");
		addbtn.on("click keyup", function(event){
			if (event.type === "keyup" && event.keyCode != 13)
				return;
				
			if (state == 0){
				// print error
				container.find(".propSelect .chosen-container .chosen-single").css("border","1px solid #d8000d");
				if (event.type == "click")
					addbtn.blur();
			}
			if (state == 1){
				// print error
				if (!requirement.from) {
					container.find(".reqInner .valueSelect input[id$='-from']").css("border","1px solid #d8000d");
				}
				if (!requirement.to) {
					container.find(".reqInner .valueSelect input[id$='-to']").css("border","1px solid #d8000d");
				}
				if (event.type == "click")
					addbtn.blur();
			}
			if (state == 2){
				// ensure the correct numeric format for solr
				if (requirement.from) {
					requirement.from = requirement.from.replace(",",".");
				}
				if (requirement.to){
					requirement.to = requirement.to.replace(",",".");
				}
				changeState(3);
				notifyListeners("created");
			}
			if (state == 4){
				changeState(3);
				notifyListeners("created");
			}
			return false;
		});

		// add click handler to min/max-button
		let removebtn = container.find(".remove");
		removebtn.on("click keyup", function(event){
			if (event.type === "keyup" && event.keyCode != 13)
				return;
			let notify = (state > 2);
			changeState(-1);
			if (notify) {// a requirement is removed that has been added before
				notifyListeners("removed");
			}
			return false;
		});
		
		if (state == 3 || state == 4){
			clonedFieldsInModifierForm = synchronizeFields();
		}
		
		
		let selectionBox = container.find(".propSelect select");
		// init jQuery chosen UI elements
		selectionBox.chosen({
			allow_single_deselect: true,
			search_contains: true
		});
		selectionBox.change(function(ev, selection){
			let asd = ev.currentTarget.selectedOptions[0];
			if (!asd)
				return;
			
			let propID = asd.getAttribute("data-propID");
			
			let entry = findEntry(propID);
			if (entry) {
				if (state != 0) {
					requirement.from = "";
					requirement.to = "";
					requirement.unit = "";
					unsynchronizeFields();
					clonedFieldsInModifierForm = null;
				}
				requirement.property = entry;
				requirement.unit = null;
				
				changeState(1);
			}
		});
	};
	
	const generateLabel = function(req){
		let from = req.from;
		let to = req.to;
		let unit = req.unit;
		
		if (req.property.isQualitative) {
			return "= "+from;
		}
		
		if (!unit)
			unit = req.property.defaultUnit || "";
		if (unit === "*")
			unit = "";
		
		if (from && to){
			return from + "&nbsp;" + unit + "&nbsp;&ndash;&nbsp;"+to + "&nbsp;" + unit;
		}
		if (from && !to){
			return ">= "+ from + "&nbsp;" + unit;
		}
		if (!from && to){
			return "<= "+ to + "&nbsp;" + unit;
		}
		
		return "";
	};
	
	const changeState = function(newState){
		let oldState = state;
		state = newState;
		
		if (state == -1){
			unsynchronizeFields();
			dispose();
			return;
		}
		if (state == 3){
			clonedFieldsInModifierForm = synchronizeFields();
		}
		
		if (state == 2) {
			// update "add" button state
			$(divEl).find(".btns .add").removeClass("disabled");
		}
		if (state == 1) {
			if (oldState > 1){
				// update "add" button state
				$(divEl).find(".btns .add").addClass("disabled");
				render();
			}else
				render();
		}
		
		if (state == 3 || state == 4)
			render();
	};
	
	const synchronizeFields = function(){
		let modForm = $("#modifierForm");
		if (modForm.length == 0) // obvisouly we are not on the results page. Thus, ther is no need to synchronize the form elements with the modifier form.
			return;

		// clone all query fields of the (extended) search form and 
		// add them to the second <form> as well
		let container = $(divEl);		
		if (clonedFieldsInModifierForm == null) {
			let clonedFields = container.find("input[id*='field']").clone();
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

			modForm.append(clonedFields);
			return clonedFields;
		} else {
			clonedFieldsInModifierForm.each(function(idx, clonedField){
				let orgId = clonedField.getAttribute("id").replace("_clone","");
				let org = $("#"+orgId)[0];
				let isCheckbox = org.type == "checkbox";
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
			return clonedFieldsInModifierForm;
		}
	};
	
	const unsynchronizeFields = function(){
		if (clonedFieldsInModifierForm)
			clonedFieldsInModifierForm.remove();
	};
	
	const dispose = function(){
		// remove elements
		parentElement.removeChild(divEl);
		divEl = null;
		requirement = null;
		clonedFieldsInModifierForm = null;
		
		notifyListeners("disposed");
	};
	
	const notifyListeners = function(type){
		for (let h=0; h < listeners.length; ++h){
			let listener= listeners[h];
			if (listener.type != type) continue;
			
			try {
				listener.handler.call(listener.scope, me);
			} catch(e){
				console.error(e);
			}
		}
	};
	
	const findEntry = function(name){
		return propertiesConfig[name];
	};
	
	/* expose public interface */
	let me= {
		render : render,
		addDisposeListener: function(fn, scope){
			listeners.push({
				handler: fn,
				scope: scope,
				type: "disposed"
			});
		},
		addCreatedListener: function(fn, scope){
			listeners.push({
				handler: fn,
				scope: scope,
				type: "created"
			});
		},
		addRemovedListener: function(fn, scope){
			listeners.push({
				handler: fn,
				scope: scope,
				type: "removed"
			});
		},
		getPropertyID: function(){
			if (!requirement.property)
				return null;
			return requirement.property.id;
		},
		edit: function(){
			changeState(4);
		}
	};
	return me;
};
