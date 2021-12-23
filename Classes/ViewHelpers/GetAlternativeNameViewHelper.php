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
class GetAlternativeNameViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


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
	    $fieldsToCheck = ["nameAlternative_value", "nameAbbreviation_value", "nameLanguage_value"];
	    
	    $material = $this->arguments["material"];
	    
	    $name =$material["name"]; 
	    
	    foreach ($fieldsToCheck as $fieldToCheck){
	        $val = $material[$fieldToCheck];
	        if (!empty($val)){
	            foreach ($val as $altName){
	                if (!empty($altName) && $altName != '' && $altName != '-' && $name != $altName) {
	                    return $altName;
	                }
	            }
	        }
	    }
	    
	    return NULL;
	}
}

?>