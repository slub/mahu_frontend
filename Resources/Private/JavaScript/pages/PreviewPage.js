/**
 * 
 */
class PreviewPage extends AbstractPage {
	
	constructor(userHistory, pageConfig){
		super(userHistory, pageConfig);
	}
	
	render() {
		// deactivate links
		$("article.preview a").attr("href","javascript:void(0)");
	}
}
