<?php
/*******************************************************************************
 *
 * Copyright 2017 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;


/**
 * 
 * @author radeck
 *
 */
class GetGroupedExpertisesViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {
    
	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('company', 'object', 'document describing a material', TRUE, array());
		
	}
	/**
	 * @return array
	 */
	public function render() {
	    $company = $this->arguments["company"];

	    /* Mapping according to TCA config
	     ['Production', 0],
	     ['Testing', 1],
	     ['Certification', 2],
	     ['Coating', 3],
	     ['Processing', 4],
	     ['Construction', 5],
	     */
	    $arr = array(
	        0 => [],
	        1 => [],
	        2 => [],
	        3 => [],
	        4 => [],
	        5 => [],
	    );
	    
	    foreach ($company->getExpertises() as $key => $exp){
	        
	        array_push($arr[$exp->getType()], $exp);
	        
	    }
	    

	    return $arr;
	}
}

?>