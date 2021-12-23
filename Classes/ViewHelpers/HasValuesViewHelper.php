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
class HasValuesViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('material', 'array', 'document descibing a material', TRUE, array());
		$this->registerArgument('properties', 'array', 'schema definition carrying relevant properties to be checked for values', TRUE, array());
		$this->registerArgument('skipSeparatelyRenderedProperties', 'boolean', 'indicates whether properties with the flag "renderedSeparately" should be skipped', FALSE);
	}

	/**
	 * @return array
	 */
	public function render() {
	    $properties = $this->arguments["properties"];
	    $material = $this->arguments["material"];
	    $skip = $this->arguments["skipSeparatelyRenderedProperties"];
	    
	    // we dont check the actual value, but rather assume that
	    // existence of a field provides sufficient evidence
	    $propertiesAvailable = false;
	    foreach($properties as $id => $config){
	        if ($config["renderedSeparately"] && $skip) continue;
	        
	        if (isset($material[$id."_value"]) ||
	            isset($material[$id."_value_min"]) ||
	            isset($material[$id."_value_max"]) ||
	            isset($material[$id."_remark"])|| 
	            isset($material[$id])){
	            $propertiesAvailable = true;
	            break;
	        }
	        
	        /*foreach ($material as $key => $value){
	            if (strncmp($key, $id, strlen($key)) === 0){
	                $propertiesAvailable = true;
	                break;
	            }
	        }*/
	    }
	    
	    return $propertiesAvailable;
	}
}

?>