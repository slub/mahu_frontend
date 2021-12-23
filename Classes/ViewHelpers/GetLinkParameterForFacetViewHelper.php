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
class GetLinkParameterForFacetViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {
    
	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
	    parent::initializeArguments();
	    $this->registerArgument('facet', 'string', 'id of the facet to be set', TRUE);
	    $this->registerArgument('facetValue', 'mixed', 'value to be set for the given facet', TRUE);
	}

	/**
	 * @return array
	 */
	public function render() {
	    $facet = $this->arguments["facet"];
	    $facetValue = $this->arguments["facetValue"];
	    
	    if (is_array($facetValue)){
	        $res= array();
	        
	        foreach($facetValue as $idx => $fVal){
	            $res[trim($fVal)] = 1;
	        }
	        
	        return array($facet => $res);
	    }else {
	        return array($facet => array( $facetValue => 1 ));
	    }
    }
}

?>