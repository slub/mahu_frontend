/**
 * 
 */
class ResultsPage extends SearchFormPage {
	
	gatherMaterialInfoFromResultLine(resultLine){
		try {
			let imgurl= resultLine.find("img").attr("src");
			
			let producer = "";
			let temp= resultLine.find(".field-producer, .field-supplier")[0];
			if (temp)
				producer= temp.textContent.trim();
			
			let link = resultLine.find(".baseInfo h3 a")[0].href;
			
			let name = resultLine.find(".baseInfo h3 .field-name")[0].textContent.trim();
			
			let altName = undefined;
			let altNameElem = resultLine.find(".baseInfo h3 .alternativeName");
			if (altNameElem && altNameElem.length > 0) {
				altName = altNameElem[0].textContent.trim();
			}
			
			let id = "";
			let pid= resultLine.parent().prop("id");
			let s= pid.split("-result-");
			id = s[1];
			
			let matcat = resultLine.parent().attr("data-cat");
			let mostspecificmatcat = resultLine.parent().attr("data-mscat");

			let isSymbolicImage = false;
			// set symbolic image derived by the material category
			if ((matcat || mostspecificmatcat) && (!imgurl || imgurl.indexOf(mahu.getImageLinkResolver().getDefaultImageURL()) !== -1)){
				imgurl = mahu.getTaxonomy().getImage(mostspecificmatcat);
				if (imgurl.indexOf(mahu.getImageLinkResolver().getDefaultImageURL()) !== -1){
					imgurl = mahu.getTaxonomy().getImage(matcat);
				}
				isSymbolicImage = true;
			}
			
			return {
				id : id,
				name : name,
				category: mostspecificmatcat || matcat,
				altName : altName,
				link : link,
				imageURL : imgurl,
				isSymbolicImage: isSymbolicImage,
				producer: producer,
				query: underlyingQuery
			};
		}catch(exe){
			console.error(exe);
		}
		
		return {};
	}
	
	render() {
		super.render();
		
		// if there are no search results (indicated by the existence of the noresults message container) ...
		if ($(".noresultsMessage").length != 0) {
			// ... we try to derive some "did you mean" suggestions
			
			let q = this.getCurrentQuery().q;
			if (q["default"]) {
				let url = mahu.getSuggestionLink(q["default"]);
				
				jQuery.getJSON(url, function (suggestions) {
					// don't suggest the current query term
					let pos= suggestions.indexOf(q["default"]);
					if (pos !== -1) {
						suggestions.splice(pos, 1);
					}
					if (suggestions.length == 0) return;
					
					let html = `
						<div class="suggestions">
							<h3><i class="far fa-lightbulb smallicon"></i> ${Localization.getString('dym')}</h3>
							<ul>`;
					for (let i=0; i<suggestions.length; ++i) {
						let sugg = suggestions[i];
						let link = mahu.getQueryLink(sugg);
						html +=`<li><a href="${link}"><q>${sugg}</q></a></li>`;
					}
					html+=`</ul>
						</div>`;
					
					$(".results").append(html);
				});				
			}
		}
	}
	
	getCurrentQuery() {
		return underlyingQuery || {};
	}
	
	saveQuery (){
		if (!this.userHistory) return;
		
		if (mahuUtils.queryIsEmpty(underlyingQuery)) return;
		
		underlyingQuery.asString = mahuUtils.queryToString(underlyingQuery);
		underlyingQuery.url = mahuUtils.queryToURL(underlyingQuery);
		underlyingQuery.timestamp = +new Date;
		// "resultCount" is a global variable injected via fluid in index.html
		if (resultCount!= null)
			underlyingQuery.resultCount = resultCount || 0;
		
		this.userHistory.addQuery(underlyingQuery);
	};
	
	addListeners() {
		super.addListeners();
		
		/**
		 * Exports the currently visible results as CSV file
		 */
		const exportResults = function(){
			let data = [ "\ufeff" ];
			
			data.push(Localization.getString("ExportCSV.query")+": "+mahuUtils.queryToURL(underlyingQuery)+"\n");
			data.push(Localization.getString("ro.results")+":\n");

			
			// determine names of properties shown as additional infos 
			let matProperties = [];
			$(".results .flexResultLine").each(function(idx, el){
				$(el).find(".additionalInfo .propertyName").each(function(idy, item){
					matProperties[idy] = item.innerText;
				});
			});

			// build table header
			let heading = Localization.getString("ExportCSV.heading");
			matProperties.forEach(function(value){
				heading+=";"+value;
			});
			heading+="\n";
			data.push(heading);
			
			// add individual material descriptions
			$(".results .flexResultLine").each(function(idx, el){
				let resultLine = $(el);
				
				let additional = [];
				resultLine.find(".additionalInfo .propertyValue").each(function(idy, item){
					additional.push(item.innerText);
				});
				
				data.push(toCSV(me.gatherMaterialInfoFromResultLine(resultLine), additional));
			});
			
			mahuUtils.saveBlobAsFile("results.csv", data);
		};
		
		/*
		 * Creates a CSV line for the given material description
		 */
		const toCSV = function(material, additionalInfos){
			let csv = material.name + ";"+ material.producer+";'"+material.link+"'";
			if (additionalInfos && Array.isArray(additionalInfos)){
				additionalInfos.forEach(function(item, idx){
					csv += ";"+item;
				});
			}
			return csv+"\n";
		};
		
		let me = this;
		
		/* add handlers for search-related buttons */
		$("#saveQuery").on("click keyup",function(event){
			if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
				return true;
			}
			if (event.type == "click") {
				$(this).blur();
			}

			me.saveQuery();
		});
		$("#exportResults").on("click keyup",function(event){
			if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
				return true;
			}
			if (event.type == "click") {
				$(this).blur();
			}

			exportResults();
		});
		$("#printResults").on("click keyup", function(event){
			if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
				return true;
			}
			if (event.type == "click") {
				$(this).blur();
			}

			window.print();
		});
		
		$("#configure").on("click keyup", function(event){
			if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
				return true;
			}
			mahuUtils.querySchema().done(function(r){
				let dialog = new SettingsDialog(me.userHistory, r.properties);
				dialog.render();
				dialog.addListener("change", function(settings){
					$("form.searchForm input.cpp").remove();
					
					if (settings.cppEnabled) {
						let selectedProperties = settings.selectedProperties;
						
						me.userHistory.setSetting("customPreviewProps", selectedProperties);
						
						let val = "";
						for (let i=0; i < selectedProperties.length; ++i){
							val += selectedProperties[i];
							
							if (i != selectedProperties.length - 1 ) {
								val += ",";
							}
						}
						let html= "<input class='cpp' type='hidden' name='tx_find_find[cpp]' value='"+val+"'>";
						
						$("form.searchForm > div:first-of-type").append(html);
					} else {
						me.userHistory.setSetting("customPreviewProps", undefined);
					}
					
					// reload results so that new settings can take effect
					$("form.searchForm")[0].submit();
				}, me);
			});
		});
		
		$("#showFacets, .tx_find .facets #closeFacets").click(function(event){
			  $(".facets").toggleClass("open");
			  $("body").toggleClass("noscroll");
		});
		
		/* initialize facet containers */
		$(".facet").each(function (i, f) {
			$(f).find(".facetList").children(".hidden").first().addClass("firstHiddenItem");
		});
		
		/* in case of a POST-based search form we have to make sure that
		 * facet values are sent as form fields rather than URL parameters */
		if (mahuUtils.usesPostRequests()){
			
			let mainForm = $("form.searchForm")[0];
			// override handlers of facet elements
			$(".facetList li:not([class~='facetShowAll'])").each(function(idx, el){
				let facet = $(el).parents("article")[0];
				let facetID = null;
				facet.classList.forEach(function(entry){
					if (entry.indexOf("facet-id-")==0){
						facetID = entry.substring("facet-id-".length);
					}
				});
				let facetValue = $(el).attr("value");
				
				let isActive = el.classList.contains("facetActive");
				let existingFormElement= null;
				if (isActive){
					existingFormElement = document.createElement("input");
					existingFormElement.value = "1";
					existingFormElement.type = "hidden";
					existingFormElement.name = "tx_find_find[facet]["+facetID+"]["+facetValue+"]";
					existingFormElement.classList.add("hiddenSelectedFacet");
					
					mainForm.appendChild(existingFormElement);
				}
				
				$(el).find("a").on("click keyup", function(event){
					event.stopPropagation();
					event.preventDefault();
					if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
						return true;
					}
					
					if (isActive){
						// remove input element
						mainForm.removeChild(existingFormElement);
					} else {
						// add new input element with facet value to search form and submit the latter
						let inputEl = document.createElement("input");
						inputEl.value = "1";
						inputEl.type = "hidden";
						inputEl.name = "tx_find_find[facet]["+facetID+"]["+facetValue+"]";
						
						mainForm.appendChild(inputEl);
					}
					
					let inputField = $("input[id$='field-default']")[0];
					// replace empty search string by wildcard
					if (inputField && inputField.value == ''){
						inputField.value = "*";
					}
					
					mainForm.submit();
				});
			});
			
			// histogram facets (handle initial addition and removal)
			$(".facetHistogram-container span[class~='facetActive']").each(function(idx, el){
				let facet = $(el).parents("article")[0];
				let facetID = null;
				facet.classList.forEach(function(entry){
					if (entry.indexOf("facet-id-")==0){
						facetID = entry.substring("facet-id-".length);
					}
				});
				//let facetValue = el.innerText;
				let t = underlyingQuery["facet"][facetID];
				let facetValue = Object.getOwnPropertyNames(t)[0];
				
				let isActive = el.classList.contains("facetActive");
				let existingFormElement= null;
				if (isActive){
					existingFormElement = document.createElement("input");
					existingFormElement.value = "1";
					existingFormElement.type = "hidden";
					existingFormElement.name = "tx_find_find[facet]["+facetID+"]["+facetValue+"]";
					
					mainForm.appendChild(existingFormElement);
				}
				
				el.onclick = function(event){
					event.stopPropagation();
					event.preventDefault();
					
					// remove input element
					mainForm.removeChild(existingFormElement);
					mainForm.submit();
				}
			});
			
			// the same holds true for paging links
			$("#nextPage, #previousPage, .listPager li a[class$='internal']").each(function(idx, el){
				el.onclick = function(event){
					event.stopPropagation();
					event.preventDefault();
					
					let formElement = document.createElement("input");
					formElement.value = el.getAttribute("data-page");
					formElement.type = "hidden";
					formElement.name = "tx_find_find[page]";
					mainForm.appendChild(formElement);
					
					mainForm.submit();
				};
			});
			
			// ... and language selectors
			$("#langSelector #de, #langSelector #en").each(function(idx, el){
				el.onclick = function(event){
					event.stopPropagation();
					event.preventDefault();
					
					let langID = el.getAttribute("data-langid");
					
					let formElement = document.createElement("input");
					formElement.value = langID;
					formElement.type = "hidden";
					formElement.name = "L";
					mainForm.appendChild(formElement);
					
					mainForm.submit();
				};
			});
		}
		
		/* click handler for action menus in the results list */			
		$(".resultList .flexResultLine").each(function(idx, el){
			let resultLine = $(el);
			//let additionalInfoContainer = resultLine.find("#additionalInfoContainer");
			
			new ActionsList(resultLine, {
				handler: function(actionID, material){
					if ("bookmark" == actionID){
						if (mahu.getHistory().isBookmarked(material)){
							mahu.removeBookmark(material);
						} else
							mahu.addBookmark(material);
					}
					/*if ("removebookmark" == actionID){
						mahu.removeBookmark(material);
					}*/
					if ("compare" == actionID){
						if (mahu.getMaterialSelector().isSelected(material)){
							mahu.getMaterialSelector().removeMaterial(material);
						} else 
							mahu.getMaterialSelector().addMaterial(material);
					}
					if ("share" == actionID){
						mahuUtils.openEMail({
							subject: material.name,
							body: material.link
						});
					}
				},
				getActionState: function(actionID, material){
					if ("bookmark" == actionID){
						return mahu.getHistory().isBookmarked(material);
					}
					if ("compare" == actionID){
						return mahu.getMaterialSelector().isSelected(material);
					}
					return false;
				},
				menuOptions: [
					{
						id: "bookmark",
						label: Localization.getString("addBookmark"),
						labelInactive: Localization.getString("removeBookmark"),
						cssClasses: {
							base: "fas fa-bookmark smallicon"
						}
					},
					/*{
						id: "removebookmark",
						label: Localization.getString("removeBookmark"),
						cssClasses: "fa fa-bookmark-o smallicon"
					},*/
					{
						id: "compare",
						label: Localization.getString("compare"),
						cssClasses: {
							base:"fas fa-exchange-alt smallicon"
						}
					},
					{
						id : "share",
						label: Localization.getString("share"),
						cssClasses: {
							base: "fas fa-share-alt smallicon"
						}
					}
				],
				staticMenu: true,
				additionalCssClasses: {
					button: "actionsMenuButton"
				}
			}, me.gatherMaterialInfoFromResultLine(resultLine)).render();
		});
		
		/* initialize explanation tooltips */
		$(".explanation a").on("click keyup", function(ev){
			if (ev.type == "keyup" && ev.originalEvent.keyCode != 13) {
				return true;
			}
			if (ev.type == "click") {
				$(this).blur();
			}
			$(ev.delegateTarget).toggleClass("toggled").siblings("span").toggleClass("hidden");
		});
	}
	
	/**
	 * Adds information about the current query to the user history.
	 */
	trackQueries (){
		if (!this.userHistory) return;
		
		if (mahuUtils.queryIsEmpty(underlyingQuery)) return;
		
		underlyingQuery.asString = mahuUtils.queryToString(underlyingQuery);
		underlyingQuery.url = mahuUtils.queryToURL(underlyingQuery);
		underlyingQuery.timestamp = +new Date;
		// "resultCount" is a global variable injected via fluid in index.html
		if (resultCount!= null)
			underlyingQuery.resultCount = resultCount || 0;
		
		// add query info to the history
		let me = this;
		setTimeout(function(){
			me.userHistory.addTrackedQuery(underlyingQuery);
		}, 200);
	};
	
	handleSchemaQueried() {
		this.trackQueries();
	}
}