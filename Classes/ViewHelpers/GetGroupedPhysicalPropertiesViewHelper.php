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
class GetGroupedPhysicalPropertiesViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('properties', 'array', 'list of properties to be grouped', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    $properties = $this->arguments["properties"];
	    
	    $arr = array(
	        "physical" => array(),
	        "mechanical" => array(),
	        "electrical" => array(),
	        "thermal" => array()
	    );
	    
	    foreach ($properties as $prop) {
	        $type = $prop["type"] ?? "physical";

	        $arr[$type][$prop["id"]] = $prop;
	    }
	    
	    return $arr;
	}
}

?>