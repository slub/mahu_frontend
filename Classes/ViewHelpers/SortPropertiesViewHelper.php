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
class SortPropertiesViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('properties', 'array', 'schema definition carrying relevant properties to be checked for values', TRUE, array());
		$this->registerArgument('skipSeparatelyRendered', 'boolean', 'indicates whether properties with the tag "renderedSeparately" should be filtered out', false, false);
	}

	private function cmp($a, $b)
	{
	    return strcasecmp($a["label"], $b["label"]);
	}
	
	/**
	 * @return array
	 */
	public function render() {
	    $properties = $this->arguments["properties"];
	    $skip = $this->arguments["skipSeparatelyRendered"];
	    
	    foreach($properties as $id => &$config){
	        if ($skip && $config["renderedSeparately"]) {
	            unset($properties[$id]);
	            continue;
	        }
	        $config["label"] = \TYPO3\CMS\Extbase\Utility\LocalizationUtility::translate("LLL:EXT:mahu_frontend/Resources/Private/Language/locallang-properties.xml:properties.".$id, "");
	    }
	    
	    uasort($properties, array($this, "cmp"));
	    
	    return $properties;
	}
}

?>