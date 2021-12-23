/**
 * The wizard provides a step-wise assisted procedure that enables a user to state his requirements.
 * 
 * Copyright 2018-2020 SLUB Dresden
 */
const Wizard = function(parentElement){
	let requirements = [];
	
	let chooseClasses = null;
	let chooseAppAreas = null;
	let chooseSimMat = null;
	let defineReqs = null;
	
	/*
	 * Asynchronously queries data using find's terms action.
	 * @return {Promise} a promise
	 */
	const queryMaterialNames = function(fieldName){
		let promise = $.ajax(
			mahu.getTermLink(fieldName, "json-all"),
			{
				accepts: "text/json",
				async: true,
				contentType: "text/json",
				dataType: "json",
				crossDomain: true
			});
		return promise;
	};
	
	/*
	 * Add a requirement to the current requirements set if it is not yet present.
	 * @param req (Object)  
	 */
	const addRequirement = function(req){
		let hit = false;
		for (let i=0; i< requirements.length; ++i){
			let requirement = requirements[i];
			
			if (req.id == requirement.id && req.type == requirement.type && req.value == requirement.value){
				hit = true;
				break;
			}
		}
		
		if (!hit){
			requirements.push(req);
		}
	};

	/*
	 * Renders the material class selection step.
	 */
	const renderClassSelection = function(){
		let classificationWidget = new MaterialClassSelector(chooseClasses, true);
		classificationWidget.render();
		classificationWidget.addListener(MaterialClassSelector.events.itemSelected, function(item){
			console.info(item);
			
			addRequirement({
				type: "facet",
				id: "category",
				value: item.facetValue || item.id
			});
		});
	};

	/*
	 * Renders the application are selection step.
	 */
	const renderAppAreaSelection = function(){
		let imageGrid = new ImageGrid(chooseAppAreas, "applicationAreaGeneral", "usecases", 30, true);
		imageGrid.render();
		imageGrid.addListener(ImageGrid.events.itemSelected, function(item){
			console.info(item);
			
			addRequirement({
				type: "facet",
				id: "usecases",
				value: item.label
			});
		});
	};
	
	/*
	 * Renders the similar materials selection step.
	 */
	const renderSimMatSelection = function(){
		
		let fieldName = "name_unstemmed";
		queryMaterialNames(fieldName).done(function(res){
				let array = [];
				// prepare data structure
				for (let idx = 0; idx < res.terms[fieldName].length; idx+=2){
					let name = res.terms[fieldName][idx];
					let count= res.terms[fieldName][idx+1];
					
					// properties "text" and "weight" are required for jQCloud; "label" and "value" for jQuery Autocomplete
					array.push({
						label: name,
						value: name
					});
				}
				
				$("#matNameSearchField").autocomplete({
					source: array,
					select: function(event, selection){
						let value = selection.item.value;
						let entry= null;
						
						// check whether the selected value matches any term
						for (let i=0; i < array.length; ++i) {
							if (array[i].label == value){
								entry = array[i];
								break;
							}
						}
						
						// navigate to the facet browser with a preset facet value according to the selected term
						if (entry != null)
							console.info(entry);
					}
				});
		});
		
		let rowidget = new ResearchOverview(chooseSimMat, 5, {
			queries: false,
			savedQueries: false
		});
		rowidget.render();
		
	};
	
	/*
	 * Renders the further requirements definition step. 
	 */
	const renderReqDefinition = function(){
		// TODO
	};
	
	/**
	 * Render this Wizard
	 */
	const render = function(){
		let p = $(parentElement);
		
		chooseClasses= p.find("#chooseClasses")[0];
		chooseAppAreas= p.find("#chooseAppAreas")[0];
		chooseSimMat= p.find("#chooseSimMat")[0];
		defineReqs= p.find("#defineReqs")[0];
		
		renderClassSelection();
		renderAppAreaSelection();
		renderSimMatSelection();
		renderReqDefinition();
	};
	
	/* expose public interface */
	return {
		render : render
	};
};
