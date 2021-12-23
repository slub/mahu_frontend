<?php
/*******************************************************************************
 *
 * Copyright 2017-2018 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;


/**
 * Answers a tuple of stringified values and corresponding units for a given material-property-constellation.
 * Thereby, it transparently handles the different types of properties and styles of value definition.
 * 
 * @author Carsten Radeck
 *
 */
class ObfuscateMaterialViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('material', 'array', 'document describing a material', TRUE, array());
		$this->registerArgument('schema', 'array', 'underlying schema definition as object', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    $schema = $this->arguments["schema"];
	    $material = $this->arguments["material"];
	    
	    foreach ($schema["properties"] as $propName => $prop){
	        $this->handleProperty($propName, $prop, $material);
	    }
	    foreach ($schema["chemicalProperties"] as $propName => $prop){
	        $this->handleProperty($propName, $prop, $material);
	    }
	    
		return $material;
	}
	
	private function handleProperty($propName, $prop, &$material){
	    if ($prop["isMultivalued"]) {
	        if ($material[$propName."_unit"] && $prop["defaultUnit"]) {
	            $material[$propName."_unit"] =  $this->obfuscateEntries($material[$propName."_unit"], $prop["defaultUnit"]);
	        }
	        
	        if ($material[$propName."_remark"]){
	            $material[$propName."_remark"] = $this->obfuscateEntries($material[$propName."_remark"], "lorem ipsum dolor");
	        }
	        
	        if ($material[$propName."_value"]) {
	            $material[$propName."_value"] = $this->obfuscateEntries($material[$propName."_value"]);
	        }
	        
	        if ($material[$propName."_value_min"]) {
	            $material[$propName."_value_min"] = $this->obfuscateEntries($material[$propName."_value_min"]);
	        }
	        
	        if ($material[$propName."_value_max"]) {
	            $material[$propName."_value_max"] = $this->obfuscateEntries($material[$propName."_value_max"]);
	        }
	    } else {
	        
	        if ($material[$propName."_unit"] &&
	            $prop["defaultUnit"]) {
	                $material[$propName."_unit"] =  $prop["defaultUnit"];
	            }
	            
	            if ($material[$propName."_remark"]){
	                $material[$propName."_remark"] = "lorem ipsum dolor";
	            }
	            
	            if ($material[$propName."_value"]) {
	                $material[$propName."_value"] = 0;
	            }
	            
	            if ($material[$propName."_value_min"]) {
	                $material[$propName."_value_min"] = 0;
	            }
	            
	            if ($material[$propName."_value_max"]) {
	                $material[$propName."_value_max"] = 1;
	            }
	    }
	}
	
	private function obfuscateEntries(&$array, $valueToSet=NULL){
	    for($j=0; $j < count($array); ++$j) {
	        if ($valueToSet){
	            $array[$j] = $valueToSet;
	        } else {
	           $array[$j] = $j + 1;
	        }
	    }
	    return $array;
	}
}

?>