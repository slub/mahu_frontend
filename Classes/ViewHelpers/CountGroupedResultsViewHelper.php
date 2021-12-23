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
class CountGroupedResultsViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('grouping', 'array', 'document describing a material', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    $grouping= $this->arguments["grouping"];
	    $groups = $grouping->getValueGroups();

	    $overallCount = 0;
	    
	    if (!empty($groups) && is_array($groups)){
	        foreach ($groups as $key => $group){
	            $overallCount += count($group->getDocuments());
	        }
	    }
	    
		return array(
		    "overallCount" => $overallCount,
		    "numGroups" => count($groups)
		);
	}
}

?>