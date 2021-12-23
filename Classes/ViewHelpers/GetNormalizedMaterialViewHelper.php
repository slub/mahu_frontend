<?php
/*******************************************************************************
 *
 * Copyright 2019 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;


/**
 * Prepares the given material for export. To this end, a copy of the given material descriptor is answered
 * where certain properties, like Solr-specific values and copy-fields, are omitted. In addition, the material
 * descriptor is sorted alphabetically by property names.
 * 
 * @author Carsten Radeck
 *
 */
class GetNormalizedMaterialViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


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
	    // the properties to be omitted
	    $blacklist = array("score","_version_", "documentType", "obfuscate", "suggestionsField");
	    // the oringinal material
	    $material = $this->arguments["material"];
	    
	    $copy = array();
	    
	    foreach ($material as $propName => $propValue){
	        if (in_array($propName, $blacklist) || 
	            strpos($propName, "_unstemmed")) {
	            continue;
	        }
	        
	        $copy[$propName] = $propValue;
	    }
	    
	    // sort alphabetically by keyname
	    ksort($copy);
	    
		return $copy;
	}
}

?>