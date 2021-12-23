/**
 * 
 */
class SearchFormPage extends AbstractPage {
	
	constructor(userHistory, pageConfig){
		super(userHistory, pageConfig);
		
		this.MAXNUMBEROFREQTAGS = 6;
		
		this.currentRequirementTags = [];
	}
	
	render() {
		super.render();
		
		// init jQuery chosen UI elements
		$(".searchForm .chosen-container-multi").chosen({
			allow_single_deselect: true
		});

		let me = this;
		mahuUtils.querySchema().done(function(r){
			// create a req tag per query field
			if (underlyingQuery) {
				
				let reqs = [];
				
				if (underlyingQuery.q) {
					// build an array of requirement objects
					for (let i = 1; i < me.MAXNUMBEROFREQTAGS; ++i){
						let genqf = underlyingQuery.q["genqf"+i];
						if (genqf){
							let req = {
								from: genqf["0"],
								to: genqf["1"],
								unit: genqf["2"],
								property: r.properties[genqf["3"]]
							}
							reqs.push(req);
						} else {
							// qualitative properties (with text query field)
							let genqft = underlyingQuery.q["genqft"+i];
							if (genqft){
								let req = {
									from: genqft["0"],
									property: r.properties[genqft["1"]]
								}
								reqs.push(req);
							} else {
								// qualitative properties (with text query field)
								let genqftemp = underlyingQuery.q["genqftemp"+i];
								if (genqftemp){
									let req = {
										from: genqftemp["0"],
										to: genqftemp["1"],
										property: r.properties[genqftemp["2"]]
									}
									reqs.push(req);
								} else {
									let genqfdq = underlyingQuery.q["genqfdq"+i];
									if (genqfdq) {
										let req = {
											from: genqfdq["0"],
											to: genqfdq["1"],
											property: r.properties[genqfdq["2"]]
										}
										reqs.push(req);
									}
								}
							}
						}
					}
					// create req tag per array entry
					for (let j= 0; j < reqs.length; ++j){
						let reqTag = new RequirementTag($(".reqTagsContainer")[0], r.properties, reqs[j], j+1)
						reqTag.addDisposeListener(me.checkButtonState, me);
						reqTag.addCreatedListener(function(){
							// emulate click on the submit button (makes sure that the button's click handler is also triggered)
							$(".tx_find .searchForm button[type=submit]").click();
						}, me);
						reqTag.addRemovedListener(function(){
							// emulate click on the submit button (makes sure that the button's click handler is also triggered)
							$(".tx_find .searchForm button[type=submit]").click();
						}, me);
						reqTag.render();

						me.currentRequirementTags.push(reqTag);
					}
					
					if (!me.getNextFreeRequirementID($(".reqTagsContainer")))
						$("#addRequirement").addClass("disabled");
				}
			}
		});
		
		if (this.userHistory.getTrackedQueries().length > 0){
			$("#simpleSearchOptions").toggleClass("hasHistory");
			
			let qhp = new QueryHistoryPopup($("#queryPopup"));
			qhp.render();
		}
	}

	addRequirementTag(prop, inEditState = false) {
		let id= this.getNextFreeRequirementID($(".reqTagsContainer"));
		if (!id) {
			return;
		}
		let me = this;
		mahuUtils.querySchema().done(function(r){
			let reqTag = new RequirementTag($(".reqTagsContainer")[0], r.properties, prop, id)
			reqTag.addDisposeListener(me.checkButtonState, me);
			reqTag.addCreatedListener(function(){
				// emulate click on the submit button (makes sure that the button's click handler is also triggered)
				$(".tx_find .searchForm button[type=submit]").click();
			}, me);
			reqTag.addRemovedListener(function(){
				// emulate click on the submit button (makes sure that the button's click handler is also triggered)
				$(".tx_find .searchForm button[type=submit]").click();
			}, me);
			reqTag.render();
			
			if (inEditState == true && !prop.from && !prop.to) {
				reqTag.edit();
			}
		
			me.currentRequirementTags.push(reqTag);
		});
	}

	/*
	 * If generic query fields are utilized, this function returns the next available ID for the requirement
	 */
	getNextFreeRequirementID(container) {
		let arr = [];
		for (let i=1; i <= this.MAXNUMBEROFREQTAGS; ++i)
			arr.push(i);
		
		$(".reqTag", container).each(function(idx, elem){
			let attVal = elem.getAttribute("data-genid");
			if (!attVal) return;
			
			let attValAsInt = parseInt(attVal);
			let pos = arr.indexOf(attValAsInt);
			if (pos != -1)
				arr.splice(pos,1);
		});
		if (arr.length > 0){
			return arr[0];
		}
		return null;
	}
	
	checkButtonState(reqTag){
		if (!this.getNextFreeRequirementID($(".reqTagsContainer")))
			$("#addRequirement").addClass("disabled");
		else
			$("#addRequirement").removeClass("disabled");
		
		// remove from data structure
		let idx = this.currentRequirementTags.indexOf(reqTag);
		if (idx != -1){
			this.currentRequirementTags.splice(idx, 1);
		}
	}

	addListeners() {
		super.addListeners();
		
		let me = this;
		$("#addRequirement").on("click keyup", function(ev){
			if (ev.type == "keyup" && ev.originalEvent.keyCode != 13) {
				return true;
			}
			if (ev.type == "click") {
				$(this).blur();
			}

			let genID = me.getNextFreeRequirementID($(".reqTagsContainer"));
			if (!genID) {
				return;
			}
			
			mahuUtils.querySchema().done(function(r){
				// filter those properties that are already part of a requirement
				let availableprops = Object.assign({}, r.properties);
				let propNames = Object.getOwnPropertyNames(r.properties);
				
				for (let k=0; k < propNames.length; ++k){
					let p= r.properties[propNames[k]];
					
					for (let j=0; j< me.currentRequirementTags.length; ++j){
						let reqTag = me.currentRequirementTags[j];
						let propID = reqTag.getPropertyID();
					
						if (p.id == propID){
							delete availableprops[propID];
						}
					}
				}
				
				// add new requirement tag
				let reqTag = new RequirementTag($(".reqTagsContainer")[0], availableprops, null, genID);
				reqTag.addDisposeListener(me.checkButtonState, me);
				reqTag.addCreatedListener(function(){
					// emulate click on the submit button (makes sure that the button's click handler is also triggered)
					$(".tx_find .searchForm button[type=submit]").click();
				}, me);
				reqTag.render();
				// keep track of requirement tags
				me.currentRequirementTags.push(reqTag);
			});
			
			me.checkButtonState();
			ev.stopPropagation();
			ev.preventDefault();
		});
		
		// add click listener to search button
		$(".tx_find form .hero-unit button[type='submit']").click(function(event){
			let inputField = $("input[id$='field-default']")[0];
			// replace empty search string by wildcard
			if (inputField && inputField.value == ''){
				inputField.value = "*";
			}
			if (!mahu.getKeepFacets()){
				$(".hiddenSelectedFacet").remove();
			}
		});
		
		if (this.userHistory.getTrackedQueries().length > 0){
			$("#showQueryHistory").click(function(event){
				event.preventDefault();
				event.stopPropagation();
				
				$("#queryPopup").toggleClass("active");
			});
			// add a click listener that hides the menu when the user clicks somewhere outside of it
			let handler = function(e){
				if (e.target.id == "showQueryHistory")
					return;
				if ($("#queryPopup").hasClass("active")){ 
					$("#queryPopup").toggleClass("active");
				}
			};
			window.addEventListener("click", handler);
		}
		
		/* add click handlers for search results modifiers and query fields */
		$('.sortOrder select').change(function() {
			this.form.submit();
		});
		$('.resultCountPicker select').change(function() {
			this.form.submit();
		});
		$('.groupingSelector input, .groupingSelector select').change(function() {
			this.form.submit();
		});
		
		$('input[id$="field-default"]').keypress(function(event){
			if (event.keyCode == 13){
				if (!mahu.getKeepFacets()){
					$(".hiddenSelectedFacet").remove();
				}
				this.form.submit();
			}
		});
		$(".inputContainer > input[type='number']").keypress(function(event){
			if (event.keyCode == 13)
				this.form.submit();
		});
		
		const appendCPP = function(theForm){
			let cpp = me.userHistory.getSetting("customPreviewProps");
			if (cpp && cpp.length > 0) {
				let val = "";
				for (let i=0; i < cpp.length; ++i){
					val += cpp[i];
					
					if (i != cpp.length - 1 ) {
						val += ",";
					}
				}
				let html= "<input class='cpp' type='hidden' name='tx_find_find[cpp]' value='"+val+"'>";
				
				$(theForm + " > div:first-of-type").append(html);
			}
		};
		
		// append info about custom preview properties to the form
		if ($("form.searchForm input.cpp").length == 0) {
			appendCPP("form.searchForm");
		}
		if ($("form#modifierForm input.cpp").length == 0) {
			appendCPP("form#modifierForm");
		}
		
		// initialize tooltips for remark info icons
		$(".remarkInfo").each(function(idx, elem){
			$(elem).tooltip();
		});
	}
	
	handleSchemaQueried() {
		
	} 
}