<?php
/*******************************************************************************
 *
 * Copyright 2017-2018 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;


/**
 * 
 * @author radeck
 *
 */
class GetUnitsViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('property', 'array', 'the property info object', TRUE, NULL);
	}

	/**
	 * @return array
	 */
	public function render() {
	    $property = $this->arguments["property"];
	    if (empty($property)) {
	        return array();
	    }
	    $units = $property["units"];
	    
	    $result= array();
	    if (!empty($units)) {
    	    foreach ($units as $u) {
    	        $result[$u] = $u;
    	    }
	    }
	    
	    return $result;
	}
}

?>