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
class GetSetPropertiesViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('material', 'array', 'document descibing a material', TRUE, array());
		$this->registerArgument('schema', 'array', 'schema definition carrying relevant properties to be checked for values', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    $setProperties = array();
	    $schema = $this->arguments["schema"];
	    $material = $this->arguments["material"];
	    
	    // we dont check the actual value, but rather assume that
	    // existence of a field provides sufficient evidence
	    foreach($schema as $id => $config){
	        if ($config["isQualitative"]) continue;
	        
	        foreach ($material as $key => $value){
	            $usPos = strripos($key, "_");
	            $propID = $key;
	            if ($usPos >= 0) {
	            // extract the actual property ID (substring from start to _)
	               $propID = substr($key, 0, $usPos);
	            }
	            
	            if (strcmp($propID, $id) === 0){
                    $lbl = \TYPO3\CMS\Extbase\Utility\LocalizationUtility::translate("LLL:EXT:mahu_frontend/Resources/Private/Language/locallang-properties.xml:properties.".$id, "");
                    if (!is_null($lbl)){
                        $config["label"] = $lbl;
                    } else {
                        $config["label"] = $id;
                    }
	                $setProperties[]= $config;
	                break;
	            }
	        }
	    }
	    
	    // sort alphabetically by label
	    uasort($setProperties, function($a, $b)
	    {
	        return strcasecmp($a["label"], $b["label"]);
	    });
	    
	    return $setProperties;
	}
}

?>