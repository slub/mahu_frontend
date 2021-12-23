/**
 * The taxonomy of material classes used in the Material Hub.
 * 
 * Each material class adheres to the following schema: 
 * 
 * {
 * 		id : string,				// required, must be unique
 * 		facetValue: string,			// optional, the value to be used as facet value (defaults to the ID)
 *		children: Array,			// optional
 *		parent: String				// optional
 *	}
 *
 * Copyright 2018-2020 SLUB Dresden
 */
const MaterialTaxonomy = function(){
	// holds the taxonomy as JSON data structure beginning at the root classes
	const roots = [
		{
			id: "Werkstoffe",
			children: [
				{
					id: "Verbundwerkstoffe"
				},
				{
					id: "Metalle",
					parent: "Werkstoffe",
					children: [
						{
							id: "Eisenmetalle",
							parent: "Metalle",
							children: [
								{
									id: "Stähle",
									parent: "Eisenmetalle",
									children: [
										{
											id: "Bau- und Konstruktionsstähle",
											parent: "Stähle",
											children: [
												{
													id: "Unlegierte Baustähle",
													parent: "Bau- und Konstruktionsstähle",
												},
												{
													id: "Feinkornbaustähle",
													parent: "Bau- und Konstruktionsstähle",
												},
												{
													id: "Vergütungsstähle",
													parent: "Bau- und Konstruktionsstähle",
												},
												{
													id: "Einsatzstähle",
													parent: "Bau- und Konstruktionsstähle",
												},
												{
													id: "Nitrierstähle",
													parent: "Bau- und Konstruktionsstähle",
												},
												{
													id: "Federstähle",
													parent: "Bau- und Konstruktionsstähle",
												},
												{
													id: "Warmfeste Stähle",
													parent: "Bau- und Konstruktionsstähle",
												},
												{
													id: "Kaltzähe Stähle",
													parent: "Bau- und Konstruktionsstähle",
												},
												{
													id: "Nichtrostende Stähle",
													parent: "Bau- und Konstruktionsstähle",
												},
												{
													id: "Automatenstähle",
													parent: "Bau- und Konstruktionsstähle",
												}
											]
										},
										{
											id: "Werkzeugstähle",
											parent: "Stähle",
											children: [
												{
													id: "Kaltarbeitsstähle",
													parent: "Werkzeugstähle",
												},
												{
													id: "Warmarbeitsstähle",
													parent: "Werkzeugstähle",
												},
												{
													id: "Schnellarbeitsstähle",
													parent: "Werkzeugstähle",
												},
												{
													id: "Kunststoffformenstähle",
													parent: "Werkzeugstähle",
												}
											]
										}
									]
								},
								{
									id: "Eisengusswerkstoffe",
									parent: "Eisenmetalle",
									children: [
										{
											id: "Stahlguss",
											parent: "Eisengusswerkstoffe"
										},
										{
											id: "Weißes Gusseisen",
											parent: "Eisengusswerkstoffe"
										},
										{
											id: "Graues Gusseisen",
											parent: "Eisengusswerkstoffe"
										},
										{
											id: "Sondergusseisen",
											parent: "Eisengusswerkstoffe"
										}
									]
								}
							]
						},
						{
							id: "Nichteisenmetalle",
							parent: "Metalle",
							children: [
								{
									id: "Leichtmetalle",
									parent: "Nichteisenmetalle"
								},
								{
									id: "Schwermetalle",
									parent: "Nichteisenmetalle",
									children: [
										{
											id: "Edelmetalle",
											parent: "Schwermetalle"
										},
										{
											id: "Buntmetalle",
											parent: "Schwermetalle"
										},
										{
											id: "Weißmetalle",
											parent: "Schwermetalle"
										}
									]
								}
							]
						}
					]
				},
				{
					id: "Nichtmetalle",
					parent: "Werkstoffe",
					children: [
						{
							id: "Anorganisch",
							parent: "Nichtmetalle",
							facetValue: "Anorganisch",
							children: [
								{
									id: "Keramik",
									//parent: "Anorganisch-synthetisch",
									parent: "Anorganisch",
									children: [
										{
											id: "Silikatkeramik",
											parent: "Keramik"
										},
										{
											id: "Oxidkeramik",
											parent: "Keramik"
										},
										{
											id: "Nichtoxidkeramik",
											parent: "Keramik"
										}
									]
								},
								{
									id: "Gläser",
									//parent: "Anorganisch-synthetisch"
									parent: "Anorganisch"
								},
								{
									id: "Anorganische Bindemittel",
									//parent: "Anorganisch-synthetisch"
									parent: "Anorganisch"
								}

/*								{
									id: "Anorganisch-synthetisch",
									parent: "Anorganisch",
									facetValue: "Synthetisch",
									children: [
										{
											id: "Keramik",
											parent: "Anorganisch-synthetisch",
											children: [
												{
													id: "Silikatkeramik",
													parent: "Keramik"
												},
												{
													id: "Oxidkeramik",
													parent: "Keramik"
												},
												{
													id: "Nichtoxidkeramik",
													parent: "Keramik"
												}
											]
										},
										{
											id: "Gläser",
											parent: "Anorganisch-synthetisch"
										},
										{
											id: "Anorganische Bindemittel",
											parent: "Anorganisch-synthetisch"
										}
									]
								},
								{
									id: "Anorganisch-natürlich",
									facetValue: "Natürlich",
									parent: "Anorganisch"
								}*/
							]
						},
						{
							id: "Organisch",
							facetValue: "Organisch",
							parent: "Nichtmetalle",
							children: [
								{
									id: "Pflanzliche Stoffe",
									parent: "Organisch"
									//parent: "Organisch-natürlich"
								},
								{
									id: "Tierische Stoffe",
									//parent: "Organisch-natürlich"
									parent: "Organisch"
								},
								{
									id: "Kunststoffe",
									//parent: "Organisch-synthetisch",
									parent: "Organisch",
									children: [
										{
											id: "Thermoplaste",
											parent: "Kunststoffe",
										},
										{
											id: "Thermoplastische Elastomere",
											parent: "Kunststoffe",
										},
										{
											id: "Duroplaste",
											parent: "Kunststoffe"
										},
										{
											id: "Elastomere",
											parent: "Kunststoffe",
											externalResources: [
												/*{
													name: "Wikidata",
													uri: "https://www.wikidata.org/wiki/Q252266"
												},*/
												{
													name: "Wikipedia",
													uri: "https://de.wikipedia.org/wiki/Elastomer"
												}
											]
										},
										{
											id: "Umgewandelte Naturstoffe",
											parent: "Kunststoffe"
										}
									]
								}
								/*{
									id: "Organisch-natürlich",
									facetValue: "Natürlich",
									parent: "Organisch",
									children: [
										{
											id: "Pflanzliche Stoffe",
											parent: "Organisch-natürlich"
										},
										{
											id: "Tierische Stoffe",
											parent: "Organisch-natürlich"
										}
									]
								},
								{
									id: "Organisch-synthetisch",
									parent: "Organisch",
									facetValue: "Synthetisch",
									children: [
										{
											id: "Kunststoffe",
											parent: "Organisch-synthetisch",
											children: [
												{
													id: "Thermoplaste",
													parent: "Kunststoffe",
												},
												{
													id: "Thermoplastische Elastomere",
													parent: "Kunststoffe",
												},
												{
													id: "Duroplaste",
													parent: "Kunststoffe"
												},
												{
													id: "Elastomere",
													parent: "Kunststoffe",
													externalResources: [
														/*{
															name: "Wikidata",
															uri: "https://www.wikidata.org/wiki/Q252266"
														},*/
/*														{
															name: "Wikipedia",
															uri: "https://de.wikipedia.org/wiki/Elastomer"
														}
													]
												},
												{
													id: "Umgewandelte Naturstoffe",
													parent: "Kunststoffe"
												}
											]
										}
									]
								}*/
							]
						}
					]
				}
			]
		}
	];
	
	// internal helper method for depth-first-search of a material descriptor
	const iterateChildren = function(children, id){
		if (!children) return null;
		
		for (let j=0; j < children.length; ++j){
			let child = children[j];
			
			if (child.id == id)
				return child;
			
			if (child.children){
				let res= iterateChildren(child.children, id);
				if (res)
					return res;
			}
		}
		return null;
	};
	
	/**
	 * Returns a list of all material classes in this taxonomy.
	 */
	const listMaterialClasses = function(){
		let matClasses = [];
		
		// start searching at root level
		for (let i=0; i < roots.length; ++i){
			let root = roots[i];
			
			matClasses.push(root.id);
			
			// recursively traverse the taxonomy (depth first search)
			_listMaterialClasses(root.children, matClasses);
		}
		return matClasses;
	};
	const _listMaterialClasses = function(children, matClasses){
		if (!children) return;
		
		for (let j=0; j < children.length; ++j){
			let child = children[j];
			
			matClasses.push(child.id);
			
			if (child.children){
				_listMaterialClasses(child.children, matClasses);
			}
		}
	};
	
	/**
	 * Answers the material class description for the given class name or null if there is no such class.
	 * @param className (String) the material class' name
	 */
	const getMaterialClass = function(className){
		// start searching at root level
		for (let i=0; i < roots.length; ++i){
			let root = roots[i];
			
			if (root.id == className) return root;
			
			// recursively traverse the taxonomy (depth first search)
			let info = iterateChildren(root.children, className);
			if (info)
				return info;
		}
		return null;
	};
	
	/**
	 * Answers an image URL for the material class with the given name. 
	 * Thereby, if the class itself doesnt carry an image annotation, its ancestors queried.
	 * 
	 * @param className (String) the material class' name 
	 */
	const getImage = function(className){
		let info = getMaterialClass(className);
		
		if (info) {
			// requested material is annotated with an image
			let i= mahu.getImageLinkResolver().getImageURL(className);
			if (i)
				return i;
			
			// identify an ancestor with image annotation
			if (info.parent) {
				return getImage(info.parent);
			}
		} else {
			return getImage("Werkstoffe") || mahu.getImageLinkResolver().getDefaultImageURL();
		}
		
		return null;
	};
	
	/**
	 *  Answers a localized label for the given material class 
	 */
	const getLabel = function(materialID){
		let localizedLabel = Localization.getString(materialID);
		// if the material class is not represented in the taxonomy, we simply return the given ID
		return localizedLabel || materialID;
	};
	
	/**
	 * Returns the subclasses of a material class which is given by its name or id.
	 * @param className (String) the material class' name
	 */
	const getChildren = function(className){
		let mat = getMaterialClass(className);
		let children = [];
		if (mat && mat.children){
			children = mat.children;
		}
		return children;
	};

	/**
	 * Returns the superclass of a material class which is given by its name or id.
	 * @param className (String) the material class' name
	 */
	const getParent = function(className){
		let mat = getMaterialClass(className);
		if (mat && mat.parent){
			return getMaterialClass(mat.parent);
		}
		return null;
	};
	
	const isRoot = function(className){
		let mat = getMaterialClass(className);
		if (mat && !mat.parent){
			return true;
		}		
		return false;
	}
	
	// expose public interface
	return {
		getMaterialClass: getMaterialClass,
		getImage: getImage,
		getLabel: getLabel,
		getChildren: getChildren,
		getParent: getParent,
		isRoot: isRoot,
		getRootIDs: function(){
			let rids = [];
			for (let i=0; i < roots.length; ++i){
				rids.push(roots[i].id);
			}
			return rids;
		},
		listMaterialClasses: listMaterialClasses
	}
};