<?php
/*******************************************************************************
 *
 * Copyright 2017 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;


/**
 * 
 * @author radeck
 *
 */
class GetCategoryViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {
    
	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('material', 'object', 'document describing a material', TRUE, array());
		
	}
	/**
	 * @return array
	 */
	public function render() {
	    $material = $this->arguments["material"];
	    
	    if (empty($material["category"])){
	        return "";
	    }
	    
	    $num = count($material["category"]);

	    return $material["category"][$num-2];
	}
}

?>