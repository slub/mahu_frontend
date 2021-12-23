/**
 * 
 */
class GroupedResultsPage extends ResultsPage {
	
	/* 
	 * Initialize group expanders in results view 
	 */
	initGroupedResultsViewExpanders (collapse = false){
		let expanders = $('.groupExpander');
		
		$.each(expanders, function(i, elem){
			let expander = $(elem);
			let _content = expander.parent().siblings(".groupEntries");
			
			/* expanders' click handler; takes care of setting the proper icon and hiding/showing the content */
			let parent = expander.parent();
			parent.on("click keyup", function(event) {
				if (event.type === "keyup" && event.originalEvent.keyCode != 13) {
					return true;
				}
				
				if (expander.hasClass("fa-chevron-circle-up")){
					expander.removeClass("fa-chevron-circle-up");
					expander.addClass("fa-chevron-circle-down");
					parent.addClass("collapsed");
					parent.removeClass("expanded");
				} else {
					expander.addClass("fa-chevron-circle-up");
					expander.removeClass("fa-chevron-circle-down");
					parent.addClass("expanded");
					parent.removeClass("collapsed");
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
	
	render() {
		super.render();
		
	}
	
	addListeners() {
		super.addListeners();
		
		$("#expandCollapse").on("click keyup", function(event){
			if (event.type === "keyup" && event.originalEvent.keyCode != 13) {
				return true;
			}
			
			let expander = $(event.target);
			let expand = true;
			if (expander.hasClass("fa-chevron-circle-up")){
				expand = false;
				expander.removeClass("fa-chevron-circle-up");
				expander.addClass("fa-chevron-circle-down");
			} else {
				expander.addClass("fa-chevron-circle-up");
				expander.removeClass("fa-chevron-circle-down");
			}
			
			if (expand) {
				$(".groupHeader.collapsed").click();
			} else {
				$(".groupHeader.expanded").click();
			}
		});
		
		/* initialize expanders in grouped view */
		this.initGroupedResultsViewExpanders();
	}
}