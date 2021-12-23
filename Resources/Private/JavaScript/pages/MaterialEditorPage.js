/**
 * 
 */
class MaterialEditorPage extends AbstractPage {
	
	render() {
		super.render();
	}
	
	addListeners() {
		super.addListeners();
		
		let me = this;
		
		// prevent that the form is submitted on hitting the enter key
		$(".editform :input:not(textarea):not(:submit)").on("keydown", function(e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				return false;
			}
		});
		
		// handle clicks on the abort button
		$(".editform #abort").click(function(ev){
			ev.preventDefault();
			ev.stopPropagation();
			
			let u= $(this).attr("data-url");
			if (u) {
				window.location = u;
			}
		});
		
		// add material categories to drop down
		let matSelector = $("select.matcategoryselector")[0];
		let matClasses= [].concat(mahu.getTaxonomy().listMaterialClasses());
		let matClassValue = matSelector.getAttribute("data-value");
		for (let i=0; i < matClasses.length; ++i) {
			let matClass = matClasses[i];

			let opt = document.createElement('option');
		    opt.value = matClass;
		    opt.innerHTML = matClass;
			if (matClass === matClassValue) {
				opt.selected = "selected";
			}
			matSelector.appendChild(opt);
		}

		// adds auto completion to the given input element
		const addAutocompletion = function(inputElem){
			let fieldID = inputElem.getAttribute("data-autocomplete");
			
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
					
					terms.sort(function(a,b){
						return a.localeCompare(b, Localization.getLanguage(), { sensitivity: 'base' });
					});
					// finally we initialize the autocomplete feature
					$(inputElem).autocomplete({
						source: terms,
						minLength: 0
					}).focus(function(event){
						if (event.target.value != "") {
							return;
						}
						let e = $.Event('keydown');
						e.key = 40;
						$(inputElem).trigger(e);
					});
				});
			}
		}
		
		
		/* initialize autocompletion for fields with the "data-autocomplete" attribute */
		$("input[data-autocomplete]").each(function(index, inputElem){
			addAutocompletion(inputElem);
		});
		
		/* initialize jQuery chosen containers */
		$("#addIPSelector").chosen({
			allow_single_deselect: true,
			max_selected_options: 5
		});
		$("#addMPSelector").chosen();
		$("#addPPSelector").chosen();
		$("#DDSelector").chosen();
		$("#ProdSelector").chosen({
			allow_single_deselect: true,
			max_selected_options: 5
		});
		$("#SupSelector").chosen({
			allow_single_deselect: true,
			max_selected_options: 5
		});
		$("select.matcategoryselector").chosen();
		
		const duplicateInput = function(source){
			let num = source.parent().find(".cloneable").length;
			
			let clone= source.clone();
			clone.attr("id", "");
			clone.removeClass("noremove");
			
			let clonedInputElements = $(clone.find("input, textarea, select"));
			for (let i=0; i < clonedInputElements.length; ++i) {
				let clonedInputElement = clonedInputElements[i];
				
				let template = clonedInputElement.getAttribute("data-nametemplate");
				let name = template.replace("$num$", num);
				let id = clonedInputElement.getAttribute("id")+ "_"+num;
				
				clonedInputElement.setAttribute("name", name);
				clonedInputElement.setAttribute("id", id);
				$(clonedInputElement).val("");
				
				if (clonedInputElement.getAttribute("data-autocomplete")) {
					addAutocompletion(clonedInputElement);
				}
				
				// set label to input links properly
				let labels= $(clonedInputElement).parents("div.form-group").find("label");
				if (labels.length != 0) {
					labels[0].setAttribute("for", id);
				}
			}
			
			// enable remove button
			$("a.removeBtn",clone).removeClass("template");
			
			source.parent().append(clone);
			
			clone.find("a.removeBtn").click(function(ev){
				removeClonable($(ev.currentTarget));
			});
			
			populateUnits(clone);
			
			// focus the first input element of the new field set
			$($("input",clone)[0]).focus();
		};
		
		const populateUnits = function(element){
			// add units to drop down
			let unitSelectors = $("select.units", element);
			for (let i=0; i < unitSelectors.length; ++i) {
				let unitSelector = unitSelectors[i];
				// avoid duplicates
				$(unitSelector).empty();
				
				let myFieldSet = $(unitSelector).parents("div.propertyFields")[0];
				let propertyID = myFieldSet.getAttribute("data-pid");
				
				let propInfo = me.schema["properties"][propertyID];
				if (Array.isArray(propInfo.units)) {
					for (let u=0; u < propInfo.units.length; ++u) {
						let unit = propInfo.units[u];

						let opt = document.createElement('option');
					    opt.value = unit;
					    opt.innerHTML = unit;
						if (u == 0) {
							opt.selected = "selected";
						}
						unitSelector.appendChild(opt);
					}
				} else {
					// use default unit
					let opt = document.createElement('option');
				    opt.value = propInfo.defaultUnit;
				    opt.innerHTML = propInfo.defaultUnit;
					opt.selected = "selected";
					
					unitSelector.appendChild(opt);
				}
			}
		}

		$("a.addBtn").click(function(ev){
			duplicateInput($("#"+ev.currentTarget.getAttribute("data-clonetarget")));
		});
		
		const removeClonable = function(source){
			let elToBeRemoved = source.parent().parent();
			
			let isTheOnlyElement = elToBeRemoved.parent().find(".cloneable").length == 1;
			
			if (isTheOnlyElement) {
				if (elToBeRemoved.hasClass("noremove")) {
					// clear input fields
					elToBeRemoved.find("input,textarea").val("");
				} else {
					elToBeRemoved.parent().remove();
				}
			} else {
				if (elToBeRemoved.hasClass("noremove")) {
					// clear input fields
					elToBeRemoved.find("input,textarea").val("");
				} else {
					elToBeRemoved.remove();
				}
			}
		}
		
		$("a.removeBtn").click(function(ev){
			removeClonable($(ev.currentTarget));
		});
		
		$("#addPPBtn").click(function(ev){
			let propID= $("#addPPSelector").val();
			
			// check if there is already an input field group for that property
			let ifg = $("div[data-pid='"+propID+"']");
			// if so, trigger the add button for that group instead
			if (ifg.length > 0) {
				$("a.addBtn", ifg).click();
				return;
			}
			
			let template = $("#physicalPropertiesTemplate > div").clone();
			template.find("input, textarea, select").each(function(idx, el){
				// id
				let jEl = $(el);
				jEl.attr("id", jEl.attr("id").replace("$prop$", propID));
				// name
				jEl.attr("name", jEl.attr("name").replace("$prop$", propID));
				// data-nametemplate
				jEl.attr("data-nametemplate", jEl.attr("data-nametemplate").replace("$prop$", propID));
			});
			// set for attribute of labels correctly
			let lbl= template.find("label.control-label");
			lbl.attr("for", lbl.attr("for").replace("$prop$", propID)).text(Localization.getString(propID));
			template.find(".form-group label").each(function(idx, el){
				el.setAttribute("for", el.getAttribute("for").replace("$prop$", propID));
			});
			
			let addBtn= template.find("a.addBtn");
			addBtn.attr("data-clonetarget", addBtn.attr("data-clonetarget").replace("$prop$", propID));
			
			let div= template.find("div.cloneable");
			div.attr("id", div.attr("id").replace("$prop$", propID));
			
			// add new element to the DOM
			$("#physicalPropertiesFieldsets").append(template);
			
			// register listeners
			template.find("a.addBtn").click(function(ev){
				duplicateInput($("#"+ev.currentTarget.getAttribute("data-clonetarget")));
			});
			
			template.find("a.removeBtn").click(function(ev){
				removeClonable($(ev.currentTarget));
			});
			
			template.attr("data-pid", template.attr("data-pid").replace("$prop$", propID));
			
			// focus the first input element of the new field set
			$($("input",template)[0]).focus();
			
			populateUnits(template);
		});

		$("#addMPBtn").click(function(ev){
			let propID= $("#addMPSelector").val();
			
			// check if there is already an input field group for that property
			let ifg = $("div[data-pid='"+propID+"']");
			// if so, trigger the add button for that group instead
			if (ifg.length > 0) {
				$("a.addBtn", ifg).click();
				return;
			}
			
			let template = $("#miscPropertiesTemplate > div").clone();
			template.find("input, textarea").each(function(idx, el){
				// id
				let jEl = $(el);
				jEl.attr("id", jEl.attr("id").replace("$prop$", propID));
				// name
				jEl.attr("name", jEl.attr("name").replace("$prop$", propID));
				// data-nametemplate
				jEl.attr("data-nametemplate", jEl.attr("data-nametemplate").replace("$prop$", propID));
			});
			let lbl= template.find("label.control-label");
			lbl.attr("for", lbl.attr("for").replace("$prop$", propID)).text(Localization.getString(propID));
			
			let addBtn= template.find("a.addBtn");
			addBtn.attr("data-clonetarget", addBtn.attr("data-clonetarget").replace("$prop$", propID));
			
			let div= template.find("div.cloneable");
			div.attr("id", div.attr("id").replace("$prop$", propID));
			
			// add new element to the DOM
			$("#miscPropertiesFieldsets").append(template);
			
			// register listeners
			template.find("a.addBtn").click(function(ev){
				duplicateInput($("#"+ev.currentTarget.getAttribute("data-clonetarget")));
			});
			template.find("a.removeBtn").click(function(ev){
				removeClonable($(ev.currentTarget));
			});
			template.attr("data-pid", template.attr("data-pid").replace("$prop$", propID));
			
			// focus the first input element of the new field set
			$($("input",template)[0]).focus();
		});
		
		
		// auto-save feature
		setInterval(function(){
			
			let form = $("form.editform")[0];

			if (!form.checkValidity()) return;
			
			let a = form.action.replace("tx_mahufrontend_materialeditor%5Baction%5D=edit","tx_mahufrontend_materialeditor%5Baction%5D=autosave");
			a = a.replace("tx_mahufrontend_materialeditor%5Baction%5D=new","tx_mahufrontend_materialeditor%5Baction%5D=autosave");
			fetch(a + "&tx_mahufrontend_materialeditor[format]=data&type=1369315166", {
				method: form.method,
				body: new FormData(form)
			})
			.then(response => response.json())
			.then(function(response){
				if (response.success) {
					$.notify({
						message: String.format(Localization.getString("matedit.autosave"), response.file),
						icon: 'fa fa-save smallicon'
					},{
						type: 'info',
						delay: 7000,
						allow_dismiss: false,
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					});
				}
			});
			
		}, 120000);
	}
	
	handleSchemaQueried(schema) {
		this.schema = schema;
	}
}
