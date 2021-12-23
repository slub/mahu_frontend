<?php
/*******************************************************************************
 *
 * Copyright 2021 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;


/**
 * Hides material property values as specified in the field "obfuscate". 
 * 
 * @author Carsten Radeck
 *
 */
class HideMaterialPropertiesViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('material', 'array', 'document describing a material', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    // the oringinal material
	    $material = $this->arguments["material"];
	    $propertiesToBeHidden = $material["obfuscate"];
	    
	    if (is_array($propertiesToBeHidden)){
	        $copy = array();
	        
    	    foreach ($material as $propName => $propValue){
    	        $hideProp = false;
    	        
    	        // enforce property hiding as specified in the field "obfuscate"
	            foreach ($propertiesToBeHidden as $propertyToBeHidden) {
	                if ($this->startsWith($propName."_", $propertyToBeHidden)) {
	                    $hideProp = true;
	                    break;
	                }
	            }
	            
	            if ($hideProp == false) {
	               $copy[$propName] = $propValue;
	            }
    	    }
    	    
    	    return new \Solarium\QueryType\Select\Result\Document($copy);
	    }
	    return $material;
	}
	
	private function startsWith( $haystack, $needle ) {
	    $length = strlen( $needle );
	    return substr( $haystack, 0, $length ) === $needle;
	}
}

?>