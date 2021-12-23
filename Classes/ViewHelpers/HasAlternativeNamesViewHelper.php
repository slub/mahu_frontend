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
class HasAlternativeNamesViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('material', 'array', 'document descibing a material', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    $material = $this->arguments["material"];
	    
	    $hasAV = false;
	    
	    $fieldsToCheck = ["nameAlternative_value", "nameAbbreviation_value", "nameLanguage_value"];
	    
	    $name = $material["name"];
	    
	    foreach ($fieldsToCheck as $fieldToCheck){
	        $hasAV = $hasAV || $this->hasEntries($material[$fieldToCheck], $name);
	        if ($hasAV)
	            break;
	    }
	    
	    return $hasAV;
	}
	
	private function hasEntries($array, $name) {
	    $hasEntry= false;
	    
	    if (!empty($array)){
	        if (is_array($array)){
	            foreach ($array as $key => $altName){
	                if (!empty($altName) && $altName != "-" && $name != $altName){
	                    $hasEntry = true;
	                    break;
	                }
	            }
	        } else {
	            if (!empty($array) && $array != "-" && $name != $altName){
	                $hasEntry = true;
	            }
	        }
	    }
	    return $hasEntry;
	}
}
