/**
 *
 */
class MaterialListPage extends AbstractPage {
	
	constructor(userHistory, pageConfig){
		super(userHistory, pageConfig);
	}
	
	showBusyIndicator(targetClass){
		let target= $("."+targetClass);
		target.append('<div id="bindi" style="width:100%;height:100%;position:absolute;text-align:center;background:gray;opacity:0.6;top:0"><p style="position: absolute;top: calc(50% - 14px);right: calc(50% - 14px);"><i class="fas fa-spinner fa-spin fa-2x"></i></p></div>');
	}
	
	render() {
		super.render();
		
		let me = this;
		
		const registerHandlers = function(){
			
			// show a confirmation dialog before removing material descriptions
			$("a.action.remove").on("click keyup", function(event){
				if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
					return true;
				}
				event.stopPropagation();
				event.preventDefault();
				
				let href = $(this).attr("href");
				
				let targetClass = $(this).attr("data-class");
				let uriExtenstion = $(this).attr("data-ue"); 
				
				let t = $("#confirmDeletion"+targetClass).attr("data-title").replaceAll("$mat$", $(this).attr("data-file"));
				
				$("#confirmDeletion"+targetClass).dialog({
					resizable: false,
					height: "auto",
					title: t,
					width: 400,
					modal: true,
					buttons: [
						{
							text: Localization.getString("yes"),
							click: function() {
									href += uriExtenstion;
									// add loading indicator
									me.showBusyIndicator(targetClass);
									
									let diag = $(this);
									// call backend method and render response
									$.ajax(
										href,
										{
											async: true,
											dataType: "text"
										}).done(function(html){
											$("."+targetClass).html(html);
											registerHandlers();
										}).always(function(){
											diag.dialog("close");
											$("#bindi").remove();
										});
							}
						},
						{
							text: Localization.getString("no"),
							click: function() {
								$(this).dialog("close");
							}
						}
					]
				});
				
			});
			
			// when clicking the "duplicate material" button, show a dialog that asks for the name of the new material
			$("a.action.duplicate").on("click keyup", function(event){
				if (event.type == "keyup" && event.originalEvent.keyCode != 13) {
					return true;
				}
				event.stopPropagation();
				event.preventDefault();
				
				let hrefTemplate = $(this).attr("href");
				let targetClass = $(this).attr("data-class");
				let uriExtenstion = $(this).attr("data-ue"); 
				
				$("#copydialog"+targetClass).dialog({
					resizable: false,
					height: "auto",
					width: 400,
					modal: true,
					buttons: [
						{
							text: "OK",
							click: function() {
								let newmatname = $("#copydialog"+targetClass+" #newmatname").val();
								let href = hrefTemplate.replace("%24%24%24%24%24", encodeURIComponent(newmatname));
								href += uriExtenstion;
								
								let diag = $(this);
								
								// add loading indicator
								me.showBusyIndicator(targetClass);
								
								// call backend method and render response
								$.ajax(
									href,
									{
										async: true,
										dataType: "text"
									}).done(function(html){
										$("."+targetClass).html(html);
										registerHandlers();
									}).always(function(){
										diag.dialog("close");
										$("#bindi").remove();
									});
							}
						},
						{
							text: Localization.getString("close"),
							click: function() {
								$(this).dialog("close");
							}
						}
					]
				});
				
		});
		}
		
		registerHandlers();
	}
}
