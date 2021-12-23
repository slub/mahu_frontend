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
class QueryHasFiltersViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('config', 'array', 'the current config', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    $config = $this->arguments["config"];
	    
	    if (!empty($config["activeFacets"])){
	        if (count($config["activeFacets"]) > 0 ) {
	            return true;
	        }
	    }
	    $query = $config["query"];
	    if (!empty($query)) {
	        foreach ($query as $key => $value) {
	            if ($key === "default") continue;
	            
	            if (!empty($value)) {
	                return true;
	            }
	        }
	    }
	    
	    return false;
	}
}

?>