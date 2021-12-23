/**
 * 
 */
class DetailPage extends SearchFormPage {
	
	/*
	 * Prepare an e-mail to the material supplier based on the current query,
	 * and expand mailTo links accordingly.
	 * 
	 * In order to better understand the following code, please refer to this exemplified "underlyingQuery" which
	 * provides broad coverage of possible cases:
	 * 
	 * {
  "q": {
    "default": "*",
    "hardness": {
      "0": "1",
      "2": "Shore"
    },
    "tensileStrength": [
      "16",
      "23",
      "MPa"
    ],
    "density": [
      
    ],
    "temperature_range_air": [
      
    ],
    "food": [
      "true"
    ],
    "chemicalResistance": [
      "k1",
      "k2"
    ]
  },
  "facet": {
    "hardness": {
      "RANGE 84 TO 88": "1"
    },
    "certificate": {
      "(EG) 2023\/2006 (GMP)": "1",
      "3-A Sanity": "1"
    },
    "dataDeliverer": {
      "freudenberg": "1"
    }
  }
}
	 * 
	 */
	generateEMailTemplate() {
		let mailLinks = $(".contactDetails .mail");
		
		if (mailLinks.length > 0){
			let _query = underlyingQuery;
			if (!_query){//no underyling query available (e.g. when navigating from one detail page to another via "similar materials")
				let relQueryAsString = sessionStorage.getItem("RELATED_QUERY"); 
				if (relQueryAsString){
					let relatedQuery = null;
					try {
						relatedQuery = JSON.parse(relQueryAsString);
					} catch(exception){	}
					
					if (relatedQuery != null)
						_query = relatedQuery;
				}
			}
			
			if (_query == null) {
				// no query information available -> leave the email-links as is
				return;
			}

			let matName = $("h1#materialName").text().trim(); 
			let subject= Localization.getString("emailTpl.subject")+matName;
			let body= String.format(Localization.getString("emailTpl.body"), matName);
			
			let q2s = mahuUtils.queryToString(_query);
			q2s.forEach(function(entry){
				body+= "\t" + entry.propName + " = "+entry.propValue+"\n";
			});
			
			body+= Localization.getString("emailTpl.footer");
			
			mailLinks.each(function(idx, mailLink){
				// the original link URI
				let oldValue = mailLink.getAttribute("href");
				
				// append subject and e-mail body to link node 
				mailLink.setAttribute("href",oldValue+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body));
			});
		}
	}
	
	/* 
	 * Initialize expandable producer areas
	 */
	initExpanders() {
		let expanders = $('.expander');
		
		let hide = expanders.length > 1;
		
		$.each(expanders, function(i, elem){
			let expander = $(elem);
			let _content = expander.siblings(".companyDetail, .companyDetailAddition");
			
			/* expanders' click hanlder; takes care of setting the proper icon and hiding/showing the content */
			expander.click(function(a) {
				if (expander.hasClass("fa-chevron-circle-up")){
					expander.removeClass("fa-chevron-circle-up");
					expander.addClass("fa-chevron-circle-down");
				} else {
					expander.addClass("fa-chevron-circle-up");
					expander.removeClass("fa-chevron-circle-down");
				}
			
				_content.toggle();
			});
			
			/* if there are multiple expandable areas, collapse them initially */
			if (hide)
				expander.trigger('click');
		});
	}
	
	/*
	 * answers a small subset of meta-data about the material currently shown on the detail page
	 */
	gatherMaterialInfo(){
		let appAreaSpan = $("#appAreasGeneral")[0];
		let appAreas = null;
		if (appAreaSpan){
			let rawText = appAreaSpan.innerText;//.trim();
			appAreas = rawText.split("; ");
		}
		
		/*let appAreaItems = $("#appAreas li");
		let appAreas = null;
		if (appAreaItems){
			appAreas = [];
			for (let p=0; p < appAreaItems.length; ++p){
				let appAreaItem = appAreaItems[p];
				let appArea = appAreaItem.textContent.trim();
				appAreas.push(appArea);
			}
		}*/
		
		let cat = null;
		let catEl = $("#category a")[0];
		if (catEl){
			//cat = catEl.textContent.trim();
			cat = $(catEl).attr("data-cid");
			
			if (!mahu.getTaxonomy().getMaterialClass(cat)) {
				try {
				cat = $("#category").siblings(".categoryPath").attr("data-cat");
				} catch(E) {}
			}
		}
		
		let companyName = null;
		let companyNameSpan = $(".companyName")[0];
		if (companyNameSpan){
			companyName = companyNameSpan.textContent;
		}
		
		// get the alternative name (either from the heading or the alternative names list)
		let altName = undefined;
		let altNameElem = $("h1 .alternativeName");
		if (altNameElem && altNameElem.length > 0) {
			altName = altNameElem[0].textContent.trim();
		} else {
			altNameElem = $("#descriptionheader .alternativeName");
			if (altNameElem && altNameElem.length > 0) {
				altName = altNameElem[0].textContent.trim();
				altName = altName.split(", ")[0]; // handle lists of comma-separated alternative names of a certain type
				altName = "(" + altName + ")";
			}
		}
		
		
		let id = "";
		let pid= $("article.detail").prop("id");
		let s= pid.split("-result-");
		id = s[1];
		
		return {
			id : id,
			name : $("#materialName")[0].textContent.trim(),
			altName: altName,
			imageURL : $("#materialImage").attr("src"),
			isSymbolicImage: $("#materialImage").siblings("p.siOverlay").length == 1,
			producer: companyName,
			category: cat,
			appAreas: appAreas,
			timestamp: +new Date()
		};
	}
	
	render() {
		super.render();
		
		this.initExpanders();
		
		this.generateEMailTemplate();
		
		// add visit info to the history
/*		let me = this;
		setTimeout(function(){
			me.userHistory.addPageVisit(me.gatherMaterialInfo());			
		}, 200);*/
		
		this.initTabs();
		
		this.initDiagrams();
	}
	
	initDiagrams(){
		if (typeof diagrams === "undefined") return; // no diagrams to render
		if (Array.isArray(diagrams)) {
			let len = diagrams.length;

			for (let i = 0; i < len; ++i) {
				let diag = diagrams[i];
				let container = $("div#dc" + diag.supID);

				let html = "<div class='chartArea'><div class='chart' id='dc" + diag.supID + "_" +  i   + "'></div>" +
					"<div><p class='caption'>" +  diag.caption + "</p></div></div>";
				container.append(html);

				let targetEl = $("div#dc" + diag.supID + "_" +   i, container);
				if (diag.type == "groupedBarChart") {
					d3.dsv(";", diag.url).then(function(csvd){
						let data = Object.assign(csvd, { y: diag.yAxisCaption })
	
						let groupKey = data.columns[0];
						let keys = data.columns.slice(1);
	
						let margin = ({top: 30, right: 0, bottom: 30, left: 40 });
						let height = 400;
						let width = 800;
						let color = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
	
						let y = d3.scaleLinear()
							.domain([0, d3.max(data, d => d3.max(keys, key => d[key]))]).nice()
							.rangeRound([height - margin.bottom, margin.top]);
						let yAxis = g => g
							.attr("transform", `translate(${margin.left},0)`)
							.call(d3.axisLeft(y).ticks(null, "s"))
							//.call(g => g.select(".domain").remove())
						    .call(g => g.append("text")
						        .attr("x", -margin.left)
						        .attr("y", 10)
						        .attr("fill", "currentColor")
						        .attr("text-anchor", "start")
								.attr("font-weight", "bold")
						        .text(data.y));
							/*.call(g => g.select(".tick:last-of-type text").clone()
								.attr("x", 3)
								.attr("text-anchor", "start")
								.attr("font-weight", "bold")
								.text(data.y));*/

						let x0 = d3.scaleBand()
							.domain(data.map(d => d[groupKey]))
							.rangeRound([margin.left, width - margin.right])
							.paddingInner(0.1);
						let x1 = d3.scaleBand()
							.domain(keys)
							.rangeRound([0, x0.bandwidth()])
							.padding(0.05);
						let xAxis = g => g
							.attr("transform", `translate(0,${height - margin.bottom})`)
							.call(d3.axisBottom(x0).tickSizeOuter(0))
							.call(g => g.select(".domain").remove());
	
						let legend = function(svg) {
							const g = svg
								.attr("transform", `translate(${width},0)`)
								.attr("text-anchor", "end")
								.attr("font-family", "sans-serif")
								.attr("font-size", 10)
								.selectAll("g")
								.data(color.domain().slice().reverse())
								.join("g")
								.attr("transform", (d, i) => `translate(0,${i * 20})`);
	
							g.append("rect")
								.attr("x", -19)
								.attr("width", 19)
								.attr("height", 19)
								.attr("fill", color);
	
							g.append("text")
								.attr("x", -24)
								.attr("y", 9.5)
								.attr("dy", "0.35em")
								.attr("stroke", "white")
								.attr("paint-order","stroke")
								.text(d => d);
						}
	
						let chart = function() {
							const svg = d3.create("svg")
	      						.attr("viewBox", [0, 0, width, height]);
	
							let tooltip = d3.select("body")
						      .append("div")
						      .style("position", "absolute")
						      .style("font-family", "'Open Sans', sans-serif")
						      .style("font-size", "10px")
						      .style("z-index", "10")
						      .style("background-color", "white")
						      .style("color", "black")
						      .style("border", "solid")
						      .style("border-color", "white")
						      .style("padding", "5px")
						      .style("border-radius", "2px")
						      .style("visibility", "hidden"); 
	
							svg.append("g")
								.selectAll("g")
								.data(data)
								.join("g")
								.attr("transform", d => `translate(${x0(d[groupKey])},0)`)
								.selectAll("rect")
								.data(d => keys.map(key => ({ key, value: d[key] })))
								.join("rect")
								.attr("x", d => x1(d.key))
								.attr("y", d => y(d.value))
								.attr("width", x1.bandwidth())
								.attr("height", d => y(0) - y(d.value))
								.attr("fill", d => color(d.key))
								
								// tooltip
							    .on("mouseover", function(d) {
							      	tooltip.style("visibility", "visible").text(d.value);
							      	d3.select(this).attr("fill", "lightskyblue");
							    })
							    .on("mousemove", d => tooltip.style("top", (d3.event.pageY+15)+"px").style("left", (d3.event.pageX+15)+"px").text(d.value))
							    .on("mouseout", function(d) {
							      	tooltip.style("visibility", "hidden");
							      	d3.select(this).attr("fill", color(d.key))
							    });
	
							svg.append("g").call(xAxis);
	
							svg.append("g").call(yAxis);
	
							svg.append("g").call(legend);
							return svg.node();
						}
						let svgnode = chart();
						targetEl.append(svgnode);
					});
				} else {
					if (diag.type == "barChart") {
						d3.dsv(";", diag.url).then(function(csvd){
							let data = Object.assign(csvd, { y: diag.yAxisCaption });
		
							let margin = ({top: 30, right: 0, bottom: 30, left: 40 });
							let height = 400;
							let width = 800;
							let color = "#059";
							
							let groupKey = data.columns[0];
							let keys = data.columns.slice(1);
		
							let y = d3.scaleLinear()
							    .domain([0, d3.max(data, d => d3.max(keys, key => d[key]))]).nice()
							    .range([height - margin.bottom, margin.top])
							let yAxis = g => g
							    .attr("transform", `translate(${margin.left},0)`)
							    .call(d3.axisLeft(y).ticks(null, "s"))
							    //.call(g => g.select(".domain").remove())
							    .call(g => g.append("text")
							        .attr("x", -margin.left)
							        .attr("y", 10)
							        .attr("fill", "currentColor")
							        .attr("text-anchor", "start")
									.attr("font-weight", "bold")
							        .text(data.y));
	
							let x =d3.scaleBand()
							    .domain(d3.range(data.length))
							    .range([margin.left, width - margin.right])
							    .padding(0.1);
							let xAxis = g => g
							    .attr("transform", `translate(0,${height - margin.bottom})`)
							    .call(d3.axisBottom(x).tickFormat(i => data[i][groupKey]).tickSizeOuter(0))
		
							let chart = function() {
								let tooltip = d3.select("body")
								      .append("div")
								      .style("position", "absolute")
								      .style("font-family", "'Open Sans', sans-serif")
								      .style("font-size", "10px")
								      .style("z-index", "10")
								      .style("background-color", "white")
								      .style("color", "black")
								      .style("border", "solid")
								      .style("border-color", "white")
								      .style("padding", "5px")
								      .style("border-radius", "2px")
								      .style("visibility", "hidden"); 
								
							  	const svg = d3.create("svg")
							      	.attr("viewBox", [0, 0, width, height]);
								
							  	svg.append("g")
							      	.attr("fill", color)
							    	.selectAll("rect")
							    	.data(data)
							    	.join("rect")
							      	.attr("x", (d, i) => x(i))
							      	.attr("y", d => y(d[keys[0]]))
							      	.attr("height", d => y(0) - y(d[keys[0]]))
							      	.attr("width", x.bandwidth())
									// tooltip
								    .on("mouseover", function(d) {
								      	tooltip.style("visibility", "visible").text(d[keys[0]]);
								      	d3.select(this).attr("fill", "lightskyblue");
								    })
								    .on("mousemove", d => tooltip.style("top", (d3.event.pageY+15)+"px").style("left", (d3.event.pageX+15)+"px").text(d[keys[0]]))
								    .on("mouseout", function(d) {
								      	tooltip.style("visibility", "hidden");
								      	d3.select(this).attr("fill", color)
								    });

							  	svg.append("g").call(xAxis);

							  	svg.append("g").call(yAxis);
							
							  	return svg.node();
							}
							let svgnode = chart();
							targetEl.append(svgnode);
						});
					} else {
						if (diag.type == "lineChart") {
							
						} else {
							console.warn("unsupported chart type");
						}
					}
				}
			}
		}
	}
	
	addListeners() {
		super.addListeners();
		
		let me = this;
		
		/*
		 * Hide/Show "reset query"-button and modifier area
		 */
		$("#modifierArea").hide();
		if (this.userHistory.isBookmarked(this.gatherMaterialInfo())){
			$("#bookmark").hide();
			$("#removebookmark").show();
		} else {
			$("#bookmark").show();
			$("#removebookmark").hide();
		}
		
		// helper function that reverse-engineers the values (min, max, value) of a given material property from the properties table; and applies the deviation
		// as definied by the slider field
		let getValuesFromTable = function(propName, abw){
			let min = null, max = null;
			let unit = null;
			
			let multipl = abw / 100;
			
			// search proper row
			$("#properties .propertiesTable tbody tr").each(function(o,el){
				if ($(el).attr("data-mid") !== propName)
					return;
				
				// select the second cell in the row
				$(el).find("td:nth-of-type(2)").each(function(q, elem){
					// extract value and unit text
					let txt = $(elem).find(".value").text().trim();
					unit = $(elem).find(".unit").text().trim();
					
					// parse value text and derive min/max/value
					let regex= /(\-?\d+.?\d*)\s–\s(\-?\d+.?\d*)/;
					let res= regex.exec(txt);
					if (res != null){
						if (res.length == 3){
							min = mahuUtils.round(res[1]*(1-multipl),2);
							max = mahuUtils.round(res[2]*(1+multipl),2);
						}
					} else {
						let regex2 = /(<|>)\s(.+)/;
						let res2 = regex2.exec(txt)
						if (res2 != null){
							if (res2.length == 3){
								if (res2[1]=="<"){
									max = res2[2];
								} else {
									min = res2[2];
								}
							}
						} else {
							let num = parseFloat(txt);
							if (!isNaN(num)){
								min = mahuUtils.round(num*(1-multipl),2);
								max = mahuUtils.round(num*(1+multipl),2);
							}
						}
					}
				});
			});
			
			return {
				min: min,
				max: max,
				unit: unit
			};
		};
		
		// add blank option to the template selection box
		$("#simMaterialsSearch .simMatPropertyTemplate .reqTag .simMaterialsSearchPropSelector").prepend("<option/>");
		// set button states
		const checkButton = function(){
			let hasSelection = false;
			$("#simMatPropertyContainer .reqTag .simMaterialsSearchPropertySelector select").each(function(idx, elem){
				hasSelection = hasSelection || elem.selectedIndex != 0;
			});
			$(".simMaterialsSearchForm input[type='submit']").attr(
				"disabled", 
				!hasSelection);
			
			let c = $("#simMatPropertyContainer");
			if (!me.getNextFreeRequirementID(c) || (c.attr("data-maxreqtags") <= c.find(".reqTag").length ))
				$("#addSimSearchProperty").addClass("disabled");
			else
				$("#addSimSearchProperty").removeClass("disabled");
		};
		const initReqTag = function(irt){
			// init jquery chosen
			let selectionBox = $(".simMaterialsSearchPropSelector", irt);
			selectionBox.addClass("chosen-container-multi");
			selectionBox.chosen();
			selectionBox.change(function(){
				checkButton();
				startAsynchReq();
			});
			
			// handler for the remove button
			$(".remove", irt).on("click keyup", function(event){
				if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
					return true;
				}
				irt.remove();
				checkButton();
			});

			const delay = (function(){
				let timer= null;
				return function (callback, ms) {
					if (timer) {
						clearTimeout (timer);
					}
					timer = setTimeout(callback, ms);
				};
			})();

			// instantiate slider for similar materials search
		    $(".slider-range", irt).slider({
		        min: 1,
		        max: 10,
		        values: [5],
		        slide: function( event, ui ) {
		        	// synchronize element that shows the value 
		        	$(".slider-value", irt).text(ui.values[0]+" %");

					delay(startAsynchReq, 200);
		        }
		    });
		};
		$("#addSimSearchProperty").on("click keyup", function(ev){
			if (ev.type == "keyup" && ev.originalEvent.keyCode != 13) {
				return true;
			}
			$(this).blur();
			
			if (this.classList.contains("disabled")) return false;
			
			let genID = me.getNextFreeRequirementID($("#simMatPropertyContainer"));
			if (genID == null) {
				$("#addSimSearchProperty").addClass("disabled");
				return false;
			}

			let targetContainer = $("#simMatPropertyContainer");
			let template = $("#simMaterialsSearch .simMatPropertyTemplate .reqTag");
			
			let clone = template.clone();
			targetContainer.append(clone);
			
			clone.attr("data-genid", genID);
			
			initReqTag(clone);
			
			/*// init jquery chosen
			let selectionBox = $(".simMaterialsSearchPropSelector",clone);
			selectionBox.addClass("chosen-container-multi");
			selectionBox.chosen();
			selectionBox.change(function(){
				checkButton();
			});
			
			// handler for the remove button
			$(".remove", clone).on("click keyup", function(event){
				if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
					return true;
				}
				clone.remove();
				checkButton();
			});
			// instantiate slider for similar materials search
		    $(".slider-range", clone).slider({
		        min: 1,
		        max: 10,
		        values: [5],
		        slide: function( event, ui ) {
		        	// synchronize element that shows the value 
		        	$(".slider-value", clone).text(ui.values[0]+" %");
		        }
		    });*/

			checkButton();
			
			ev.stopPropagation();
			ev.preventDefault();
		});
		
		// init default requirement
		let irt = $("#simMaterialsSearch #simMatPropertyContainer .reqTag");
		if (irt.length > 0)
		{
			// prepare the selection box
			let numberOfProperties = $(".simMaterialsSearchPropSelector option", irt).length;
			// set the first entry as selected
			$(".simMaterialsSearchPropSelector option", irt)[0].setAttribute("selected","");
			// and prepend an empty option
			$(".simMaterialsSearchPropSelector", irt).prepend("<option/>");
			// finally, initialize the requirement tag (i.e. add listeners and set up jquery chosen)
			initReqTag(irt);
			
			$("#simMatPropertyContainer").attr("data-maxreqtags", numberOfProperties);
		}
		checkButton();
		
		const getHTMLforRequirements = function(schema){
			let html = "";
			let tags = $("#simMatPropertyContainer .reqTag");
			for (let t=0;t<tags.length; ++t) {
				let tag = tags[t];
				
				let genID = $(tag).attr("data-genid");

				// get the selected property name
				let field = $(".simMaterialsSearchPropSelector",tag)[0].selectedOptions[0].value;
				// get the desired deviation
				let abw = $(".slider-range", tag).slider("values")[0] || 5;

				let values = getValuesFromTable(field, abw);
				
				let property = schema.properties[field];
				if (!property){
					continue;
				}
				
				if (property.isQualitative) {
					html+=
						'<input id="c'+mahu.getUid()+'-field-genqft'+genID+'" data-name="from" type="hidden" name="tx_find_find[q][genqft'+genID+'][0]" value="'+values.min+'" >'+
						'<input id="c'+mahu.getUid()+'-field-genqft'+genID+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqft'+genID+'][1]" value="'+property.id+'" >';
				} else {
					if (property.id.indexOf("temperature") == 0) {
						if (values.min  != null)
							html+= '<input id="c'+mahu.getUid()+'-field-genqftemp'+genID+'-from" data-name="from" type="hidden" name="tx_find_find[q][genqftemp'+genID+'][0]" value="'+values.min+'" step="0.1" >';
						if (values.max  != null)
							html+= '<input id="c'+mahu.getUid()+'-field-genqftemp'+genID+'-to" data-name="to" type="hidden" name="tx_find_find[q][genqftemp'+genID+'][1]" value="'+values.max+'" step="0.1" >';
						html+= '<input id="c'+mahu.getUid()+'-field-genqftemp'+genID+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqftemp'+genID+'][2]" value="'+property.id+'" >';
					} else {
						if (property.isDimensionlessQuantity) {
							if (values.min  != null)
								html+= '<input id="c'+mahu.getUid()+'-field-genqfdq'+genID+'-from" data-name="from" type="hidden" name="tx_find_find[q][genqfdq'+genID+'][0]" value="'+values.min+'" step="0.1" >';
							if (values.max  != null)
								html+= '<input id="c'+mahu.getUid()+'-field-genqfdq'+genID+'-to" data-name="to" type="hidden" name="tx_find_find[q][genqfdq'+genID+'][1]" value="'+values.max+'" step="0.1" >';
							html+= '<input id="c'+mahu.getUid()+'-field-genqfdq'+genID+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqfdq'+genID+'][2]" value="'+property.id+'" >';
						} else {
							if (values.min != null)
								html+= '<input id="c'+mahu.getUid()+'-field-genqf'+genID+'-from" data-name="from" type="hidden" name="tx_find_find[q][genqf'+genID+'][0]" value="'+values.min+'" step="0.1" >';
							if (values.max != null)
								html+= '<input id="c'+mahu.getUid()+'-field-genqf'+genID+'-to" data-name="to" type="hidden" name="tx_find_find[q][genqf'+genID+'][1]" value="'+values.max+'" step="0.1" >';
							if (values.unit  != null)
								html+= '<input id="c'+mahu.getUid()+'-field-genqf'+genID+'-unit" data-name="unit" type="hidden" name="tx_find_find[q][genqf'+genID+'][2]" value="'+values.unit+'" >';
							html+= '<input id="c'+mahu.getUid()+'-field-genqf'+genID+'-prop" data-name="propertyID" type="hidden" name="tx_find_find[q][genqf'+genID+'][3]" value="'+property.id+'" >';
						}
					}
				}
			}
			return html;
		};
		
	    // click listener for the submit button
		$(".simMaterialsSearchForm input[type='submit']").click(function(ev){
			ev.stopPropagation();
			
			let html = getHTMLforRequirements(me.schema);
			$(".simMaterialsSearchForm .dynfields").html(html);
			
			// append custom preview properties settings to the form if defined
			let cpp = $("form.searchForm input.cpp").val();
			if (cpp) {
				$(".simMaterialsSearchForm").append("<input class='cpp' type='hidden' name='tx_find_find[cpp]' value='"+cpp+"'>");	
			}
			
			ev.preventDefault();
			ev.target.form.submit();
		});
		
		const initSimMaterialsActionMenus = function(){
			// add an action menu to each similar material panel
			let menuConfig = {
					handler: function(actionID, material){
						if ("compare" == actionID){
							mahu.getMaterialSelector().addMaterial(material);
						}
						if ("share" == actionID){
							mahuUtils.openEMail({
								subject: material.name,
								body: mahu.getDetailPageLink(material.id)
							});
						}
					},
					menuOptions: [
						{
							id: "compare",
							label: Localization.getString("compare"),
							cssClasses: { 
								icon:"fas fa-exchange-alt smallicon"
							}
						},
						{
							id : "share",
							label: Localization.getString("share"),
							cssClasses: { 
								icon:"fas fa-share-alt smallicon"
							}
						}
					]
				};
			let panels = $("#similarMaterials .materialPreview");
			panels.each(function(){
				let panel = $(this);
				// collect some meta data from the UI to create an object representation for the material (required by MaterialSelector)
				let matID = panel.attr("data-id");
				let name = panel.find(".materialName")[0].textContent;
				let imageURL = panel.find(".thumb")[0].src;
				let producer = panel.find(".materialPreviewText .plain")[0].textContent;
				
				
				let material = {
					id: matID,
					name: name,
					imageURL: imageURL,
					isSymbolicImage: panel.find(".thumb").siblings("p.siOverlay").length == 1,
					producer: producer
				};
				
				// create menu
				new ActionsMenu(panel, menuConfig, material).render();
	
				// append click handler to div element
				/*panel.click(function(event){
					event.stopPropagation();
					event.preventDefault();
					
					window.location = panel.attr("data-url");
				});
				panel.keyup(function(event){
					let kc= event.originalEvent.keyCode;
					if (kc != 13) {
						return true;
					}
					window.location = panel.attr("data-url");
				});*/
			});
		};
		
		const startAsynchReq = function(){
			let html = getHTMLforRequirements(me.schema);
			$(".simMaterialsSearchForm .dynfields").html(html);
			
			// show a loading indicator in the results area
			if ($("#similarMaterials a.materialPreview").length > 0) {
				let target= $("#similarMaterials");
				let h = target.height();
				target.html('<div style="height:'+h+'px"><i class="fas fa-spinner fa-spin fa-2x"></i></div>');
			}
			
			// append custom preview properties settings to the form if defined
			let cpp = $("form.searchForm input.cpp").val();
			if (cpp) {
				$(".simMaterialsSearchForm").append("<input class='cpp' type='hidden' name='tx_find_find[cpp]' value='"+cpp+"'>");	
			}
			
			let form = $(".simMaterialsSearchForm")[0];
			fetch(form.action + "&tx_find_find[data-format]=json&tx_find_find[format]=data&type=1369315139", {
				method: form.method,
				body: new FormData(form)
			})
			.then(response => response.json())
			.then(function(materials){
				// dont show the material whose detail page we are currently on as a similar material
				let currentMaterialID = mahu.getCurrentPage().gatherMaterialInfo().id;
				let pos = -1;
				for (let i=0; i < materials.length; ++i){
					let mat = materials[i];
					if (mat.id === currentMaterialID) {
						pos = i;
						break;
					}
				}
				if (pos != -1) {
					materials.splice(pos,1);
				}
				
				let html = "";
				let max = 0;
				if (Array.isArray(materials)) {
					max = Math.min(materials.length, 5);
				
					for (let i=0; i < max; ++i){
						let material = materials[i];
						let cname = material.producer || material.supplier || material.dataDeliverer;
						
						html += '<a class="materialPreview" tabindex="0" style="position:relative" data-id="'+material.id+'" href="'+mahu.getDetailPageLink(material.id)+'">'+
					      			'<div class="thumbWrap" style="position:relative">';
						if (material.imageUrl){
							html+=  '<img alt="'+Localization.getString("matImage")+'" src="'+material.imageUrl+'" class="thumb" onerror="mahu.handleImageError(arguments[0])">';
						} else {
							if (Array.isArray(material.category)) {
								// render symbolic image derived by the material category
								let c= material.category[material.category.length - 1];
								if (!mahu.getTaxonomy().getMaterialClass(c)) {
									c = materials[s].category[materials[s].category.length - 2];
								}
								html += '<img alt="'+Localization.getString("placeholder")+'" src="' + mahu.getTaxonomy().getImage(c) + '" class="thumb">';
							} else {
								html+=  '<img alt="'+Localization.getString("placeholder")+'" src="/typo3conf/ext/mahu_frontend/Resources/Public/Images/placeholder.png" class="thumb">';
							}
							html+='<p class="siOverlay">'+Localization.getString("symbolicImage")+'</p>';
						}
						html += `</div>
									<div class="materialPreviewText">
										<p class="materialName">${material.name}</p>
										<p class="plain">${cname}</p>
									</div>
								</a>`;
					}
				}
				
				// show a no results message
				if (max == 0) {
					html = "<p style='grid-column:1/-1'><i class='fas fa-exclamation-triangle smallicon'></i>"+Localization.getString("simMaterialsSearch.noresults")+"</p>";
				}
				// render HTML in the similar material area
				$("#similarMaterials").html(html);
				
				// initialize actions menus for the material panels
				initSimMaterialsActionMenus();
			});
		};
		
		/* store info about the query (because "underylingQuery" will not be available when navigating from one detail page to another;
		 * provides later on the necessary context to generate a meaningful e-mail template. 
		 * the entry is removed from the session store when navigating to a page other than a detail-page */
		$("#similarMaterials .materialPreview").click(function(event){
			if (sessionStorage.getItem("RELATED_QUERY")== null) // only if not already set
				sessionStorage.setItem("RELATED_QUERY", JSON.stringify(underlyingQuery));
		});
		
		/* click handler for action menu on detail page */			
		new ActionsList($(".detail > div:first-child"), {
			handler: function(actionID, material){
				// gather material info anew since the image may be changed (symbolic image derived from material category; see below)
				material = me.gatherMaterialInfo();
				if ("bookmark" == actionID){
					if (mahu.getHistory().isBookmarked(material)){
						mahu.removeBookmark(material);
					} else {
						mahu.addBookmark(material);
					}
				}
				/*if ("removebookmark" == actionID){
					mahu.removeBookmark(material);
				}*/
				if ("compare" == actionID){
					mahu.getMaterialSelector().addMaterial(material);
				}
				if ("exportJSON" == actionID){
					mahu.exportJSON(material.id, material.name);
				}
				if ("exportRDF" == actionID){
					mahu.exportRDF(material.id, material.name);
				}
				if ("share" == actionID) {
					mahuUtils.openEMail({
						subject: material.name,
						body: window.location
					});
				}
				if ("print" == actionID) {
					window.print();
				}
			},
			getActionState: function(actionID, material){
				if ("bookmark" == actionID){
					return mahu.getHistory().isBookmarked(material);
				}
				/*if ("removebookmark" == actionID){
					return mahu.getHistory().isBookmarked(material);
				}*/
				if ("compare" == actionID){
					return mahu.getMaterialSelector().isSelected(material);
				}
				return undefined;
			},
			menuOptions: [
				{
					id: "bookmark",
					label: Localization.getString("addBookmark"),
					labelInactive: Localization.getString("removeBookmark"),
					cssClasses: { 
						base:"fas fa-bookmark smallicon"
					}
				},
				/*{
					id: "removebookmark",
					label: Localization.getString("removeBookmark"),
					cssClasses: {
						base:"far fa-bookmark smallicon"
					}
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
						base:"fas fa-share-alt smallicon"
					}
				},
				{
					id : "exportJSON",
					label: Localization.getString("ExportJSON"),
					cssClasses: {
						base:"fas fa-download smallicon"
					}
				},
				{
					id : "exportRDF",
					label: Localization.getString("ExportRDF"),
					cssClasses: {
						base:"fas fa-download smallicon"
					}
				},
				{
					id : "print",
					label: Localization.getString("print"),
					cssClasses: { 
						base:"fa fa-print smallicon"
					}
				}
			],
			additionalCssClasses: {
				actionlist : "detailpageActions"	
			}
		}, me.gatherMaterialInfo()).render();
		
		
		initSimMaterialsActionMenus();
		
		// initialize mouse-over info boxes for obfuscated areas
		//$(".blurredTable").tooltip({});
		
		me.tooltips = [];
		// initialze Wikipedia tooltips
		$(".propertyInfo[data-pid]").each(function(idx, elem){
			let term = elem.getAttribute("data-pid") || elem.parentElement.innerText;
			let lang = elem.getAttribute("data-wid");
			let wtt= new WikipediaTooltip(elem, term, lang);
			wtt.render();
			me.tooltips.push(wtt);
		});
		// register global click listener that takes care of hiding the tooltips
		window.onclick= function(e){
			if (e.target.classList.contains("propertyInfo")){
				return;
			}
			for (let i=0; i < me.tooltips.length; ++i){
				me.tooltips[i].hide();
			}
		};
		
		// add links to external ressources to category span
		let category = $("#category").text().trim();
		let classDescription = mahu.getTaxonomy().getMaterialClass(category);
		if (classDescription && classDescription.externalResources){
			let extResources = classDescription.externalResources;
			
			let container = $(document.createElement("span")).attr({
				"id": "externalCategoryInfo"
			});
			
			for (let _h = 0; _h < extResources.length; ++_h){
				let extRes = extResources[_h];
				
				let name = extRes.name;
				let uri = extRes.uri;
				
				let elem = $(document.createElement('a')).attr({
					"href": uri,
					"title": String.format(Localization.getString("detailpage.classInfo"), name),
					"class": "external no-change"
				}).text(name).prepend('<i class="fas fa-external-link-alt smallicon"></i>');
				
				container.append(elem);
			}
			$("#category").parent().append(container);
		}
		
		
		// replace placeholder images by the image of the most specific material category
		let placeholderImage = $("#materialImageContainer #materialImage.placeholder");
		if (placeholderImage.length > 0) {
			let matInfo = this.gatherMaterialInfo();
			let iurl = mahu.getTaxonomy().getImage(matInfo.category);
			if (iurl !== mahu.getImageLinkResolver().getDefaultImageURL()) {
				placeholderImage.on("load", function(){
					placeholderImage.css("visibility","visible");
				}).attr("src", iurl);
			} else {
				placeholderImage.css("visibility","visible");
			}
		}
	}
	
	handleSchemaQueried(schema) {
		this.schema = schema;
		
		// trigger the asynch loading of similar materials
		$("#simMaterialsSearch #simMatPropertyContainer .reqTag .simMaterialsSearchPropSelector").change();
		
				// add visit info to the history
		let me = this;
		setTimeout(function(){
			me.userHistory.addPageVisit(me.gatherMaterialInfo());			
		}, 200);
	} 
}
