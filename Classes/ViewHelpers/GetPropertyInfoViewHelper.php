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
class GetPropertyInfoViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('propertyID', 'string', 'ID of the requested material property', TRUE, "");
		$this->registerArgument('schema', 'array', 'mahu schema definition', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    $propertyID = $this->arguments["propertyID"];
	    $schema = $this->arguments["schema"];
	    
	    foreach ($schema as $s) {
    	    foreach($s as $id => $config){
    	        if ($id == $propertyID) 
    	            return $config;
    	    }
	    }
	    
	    return array();
	}
}

?>