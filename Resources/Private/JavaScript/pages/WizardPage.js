/**
 * 
 */
class WizardPage extends AbstractPage {
	
	render() {
		super.render();
		
		let wizard = new Wizard($("div[class^='wizardpage']"));
		wizard.render();
	}
	
	addListeners () {
		super.addListeners();
		
		this.initGroupedResultsViewExpanders(true);
	}
}