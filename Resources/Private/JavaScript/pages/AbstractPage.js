/**
 * 
 */
class AbstractPage {
	constructor(userHistory, pageConfig){
		this.userHistory = userHistory;
		this.pageConfig = pageConfig;
	}
	
	render() {
		/* render material selector */
		mahu.getMaterialSelector().render(true);
		
		/* render user context menu */
		let uic = $("#userIconContainer");
		if (uic) {
			let opts = [];

			// clearing the history is always possible
			opts.push({
				id: "clear",
				label: Localization.getString("clearHistory"),
				cssClasses: { 
					icon: "far fa-trash-alt smallicon"
				}
			});

			// navigating to the profile page and logging out requires a logged in user
			if (mahu.getUserName().trim().length > 0){
				if (mahu.getProfilePageURL()){
					opts.push({
						id: "showProfile",
						label: Localization.getString("showProfile"),
						cssClasses: {
							icon: "fas fa-user-edit smallicon"
						}
					});
				}
				opts.push({
					id: "logout",
					label: Localization.getString("logout"),
					cssClasses: {
						icon: "fas fa-sign-out-alt smallicon"
					}
				});
			} else {
				opts.push({
					id: "login",
					label: Localization.getString("login"),
					cssClasses: { 
						icon: "fas fa-user smallicon"
					}
				});
				opts.push({
					id: "register",
					label: Localization.getString("register"),
					cssClasses: { 
						icon: "fas fa-user-plus smallicon"
					}
				});
			}
			
			new ActionsMenu(uic, {
				handler: function(actionID, material){
					if ("clear" == actionID) {
						mahu.getHistory().clear();
						
						window.location.reload();
					}
					if ("logout" == actionID) {
						mahu.logout();
						
						let lpu = mahu.getLandingPageURL();
						if (lpu && lpu.endsWith("/")) {
							lpu+="?";
						} else {
							lpu += "&";
						}
						window.location = lpu + "logintype=logout";
					}
					if ("showProfile" == actionID) {
						window.location = mahu.getProfilePageURL();
					}
					if ("register" == actionID) {
						window.location = mahu.getRegistrationPageURL();
					}
					if ("login" == actionID) {
						window.location = mahu.getLoginPageURL();
					}
				},
				label: Localization.getString("user profile menu"),
				headerText: (mahu.getUserNameExtended()!=""?Localization.getString("loggedInAs")+ " " + mahu.getUserNameExtended() : undefined),
				menuOptions: opts,
				additionalCssClasses: {
					icon: ["fa-user-circle", "fa-2x", "userIcon"],
					button: "actionsMenuButton"
				},
				staticMenu: true
			}, null).render();
		}
		
		/* render language menu */
		let langopts = [];
		let linkConfig = mahu.getLanguageLinks();
		let cLang = mahu.getLanguageID();
		
		for (let i=0;i < linkConfig.length; ++i){
			let link = linkConfig[i];
			
			langopts.push({
				id: link.langID,
				label: link.langName,
				uri: link.uri,
				cssClasses: { 
					link: (link.langID == cLang ? 'currentLang':'') 
				}
			});
		}
		new ActionsMenu($(".language-switch"), {
			handler: function(actionID, material, option){
				
				if ($.isFunction(mahu.languageSwitchHook)){
					if (mahu.languageSwitchHook(option) === false){
						return;
					}
				}
				
				let mainForm = $("form.searchForm");
				
				if (mahu.isResultsPage() && mahuUtils.usesPostRequests()) {
					// the following doesnt seem to work any more in TYPO3 v9
					/*// append language parameter to form
					mainForm.append("<input type='hidden' name='L' value='"+option.id+"'/>"); */

					// thus, we alter the form action parameter instead
					mainForm.prop("action", option.uri);
					
					// submit the form
					mainForm[0].submit();
					
				} else {
					if (mahu.isDetailPage()) {
						let id= mahu.getCurrentPage().gatherMaterialInfo().id;
						
						let pos = option.uri.indexOf("?");
						if (pos!==-1){
							window.location = option.uri.substring(0, pos)+"/"+id;
						} else {
							window.location = option.uri+"/"+id;
						}
					} else {
						window.location = option.uri;
					}
				}
			},
			menuOptions: langopts,
			additionalElement: '<div class="currLang">'+Localization.getLanguage()+'</div>',
			additionalCssClasses: {
				icon: ["fas","fa-globe-europe", "fa-2x", "userIcon"],
				button: "actionsMenuButton"
			},
			staticMenu: true
		}, null).render();
		
		
		// render cookie info
		/*if (this.userHistory.getSetting("ac") == undefined) {
			let el = document.createElement("div");
			el.classList.add("cookieinfo");
			
			$(el).html("<p>"+Localization.getString("cookieInfo")+"</p><button class='btn btn-primary' id='ciok'>OK</button>");
			document.body.appendChild(el);
			
			$("#ciok").on("click keyup", function(event){
				if (event.type === "keyup" && event.originalEvent.keyCode != 13) {
					return true;
				}
				
				mahu.getHistory().setSetting("ac", true);
				document.body.removeChild(el);
			});
		}*/
	}
	
	addListeners() {
		// add click handler for debug area toggle
		let _debugArea = $("#debugContent");
		if (_debugArea){
			$("#debugExpander").click(function(event){
				event.preventDefault();
				event.stopPropagation();
				
				if (_debugArea.hasClass("collapsed")){
					_debugArea.removeClass("collapsed");
					_debugArea.addClass("expanded");
				} else {
					_debugArea.addClass("collapsed");
					_debugArea.removeClass("expanded");
				}
				_debugArea.toggle();
			});
		}

		/* scroll handler for showing/hiding the to-top-button */
		$(window).scroll(function(){
			if ($(this).scrollTop() > 200)
				$("body").addClass("scrolled");
			else
				$("body").removeClass("scrolled");
		});
		
		/* click handler for to-top-button */
		$("#toTop").click(function(event) {
			let href = $(this).attr("href");
			$(this).blur();
			event.preventDefault();
			let elem = $(href);
			$("html,body").animate({scrollTop: elem.offset().top - 50}, 1050, "easeInOutExpo");
		});
		
		/* click handler for feedback-button */
		$(".feedbackHeader").click(function(event) {
			event.preventDefault();
			let fbc = $(this).parent();
			if (fbc.hasClass("expanded"))
				fbc.removeClass("expanded");
			else
				fbc.addClass("expanded");
		}).keyup(function(event){
			let kc= event.originalEvent.keyCode;
			if (kc != 13) {
				return true;
			}
			event.preventDefault();
			let fbc = $(this).parent();
			if (fbc.hasClass("expanded"))
				fbc.removeClass("expanded");
			else
				fbc.addClass("expanded");
		});
		
		// add click handler to nav menu dropdowns
		let navdds = $("a.dropdown-toggle");
		if (navdds.length > 0) {
			navdds.click(function(event){
				event.preventDefault();
				event.stopPropagation();
				
				// collapse all other expanded menus
				$("ul.dropdown-menu:not(:hidden)").hide();
				
				// show / hide sub menu
				let ul= $(event.currentTarget).parent().find("ul.dropdown-menu");
				if (ul.is(":hidden")) {
					ul.show();
				} else {
					ul.hide();
				}
			});
			// close sub menus when clicking somewhere in the browser window
			window.addEventListener("click", function(){
				$("ul.dropdown-menu:not(:hidden)").hide();
			});
		}
	}
	
	/* 
	 * Initialize group expanders in results view 
	 */
	initGroupedResultsViewExpanders(collapse = false){
		let expanders = $('.groupExpander');
		
		$.each(expanders, function(i, elem){
			let expander = $(elem);
			let _content = expander.parent().siblings(".groupEntries");
			
			/* expanders' click hanlder; takes care of setting the proper icon and hiding/showing the content */
			expander.parent().click(function(a) {
				if (expander.hasClass("fa-chevron-circle-up")){
					expander.removeClass("fa-chevron-circle-up");
					expander.addClass("fa-chevron-circle-down");
				} else {
					expander.addClass("fa-chevron-circle-up");
					expander.removeClass("fa-chevron-circle-down");
				}
			
				_content.toggle();
			});
		});
		
		if (collapse){
			expanders.click();
		}
		
		/* add click handlers to result expanders, if there are such */
		if ($(".groupResultsExpanderContainer").length > 0){
			let MAX = 10;
			let groups = $(".resultList > li .groupEntries").each(function(idx, domElem){
				
				let group = $(this);
				let expanders= group.parent().find(".groupResultsExpander");
				if (expanders.length == 1){
					let entriesInGroup=	group.find("li");
					if (entriesInGroup.length > MAX){
						entriesInGroup.each(function(idy, elem){
							if (idy >= MAX){
								$(this).hide();
							}
						});
					}
					
					let expander= $(expanders[0]);
					expander.click(function(){
						if (this.classList.contains("resultsshown")){
							this.classList.remove("resultsshown");
							this.classList.add("resultshidden");
							// hide all results beginning from index MAX
							group.find("li:nth-child(n+"+MAX+")").hide();
							expander.text("Alle anzeigen...");
						} else {
							this.classList.remove("resultshidden");
							this.classList.add("resultsshown");
							// show hidden results
							group.find("li:hidden").show();
							expander.text("Weniger anzeigen...");
						}
					});
				}
			});
		}
	}
	
	initTabs() {
		$(".tabs").each(function(idx, tabsContainer) {
			let tabs = $(tabsContainer).find(".tab");
			if (tabs.length > 1) {
				
				tabs.each(function(idx, elem){
					/* click handler for tabs */
					$(elem).find("a").on("click keyup", function(event){
						if (event.type === "keyup" && event.originalEvent.keyCode != 13) {
							return true;
						}
						
						// ignore clicks on the currently active tab
						let isCurrentTab = event.target.parentElement.classList.contains("currentTab");
						if (isCurrentTab) 
							return;
						
						// ignore clicks on tabs without attribute "data-cid"
						let tid = event.target.getAttribute("data-cid");
						if (!tid) return;
						
						// the clicked anchor element as jQuery object
						let tab = $(event.target.parentElement);
						
						// get the corresponding element with class tabContent and hide all elements except that referred to in the clicked tab
						let tabContent = tab.parents(".tabs").siblings(".tabContent");
						tabContent.children().hide();
						let tEl = tabContent.find("."+tid);
						tEl.show();
						
						// mark the clicked tab as the active one and all others as deactive
						tab.addClass("currentTab");
						tab.siblings(".tab").removeClass("currentTab");
					});
				});
			}
		});
	}
	
	handleSchemaQueried() {
		
	} 
}