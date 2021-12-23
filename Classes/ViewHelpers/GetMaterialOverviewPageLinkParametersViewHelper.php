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
class GetMaterialOverviewPageLinkParametersViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {
    
	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
	    parent::initializeArguments();
	    $this->registerArgument('company', 'string', 'company ID', TRUE);
	    $this->registerArgument('settings', 'array', 'extension config', TRUE);
	}

	/**
	 * @return array
	 */
	public function render() {
	    $company = $this->arguments["company"];
	    $settings = $this->arguments["settings"];
	    
	    $ps = $settings["materialOverviewPageParameters"] ?? array();
	    $result = array();
	    
	    foreach ($ps as $idx => $val) {
	        $result[$val] = array("company"=>$company);
	    }
	    
        return $result;
    }
}

?>