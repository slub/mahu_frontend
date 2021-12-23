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
class GetGroupedAlternativeNamesViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


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
	    $material = $this->arguments["material"];
	    
	    $arr = array();
	    $types = $material["nameAlternative_norm"];
	    $altNames = $material["nameAlternative_value"];
	    
	    if (!empty($types)){
	        if (is_array($types)){
	            for ($idx = 0; $idx < count($types); ++$idx){
	                $type = $types[$idx];
	                
	                if (!empty($type)){
	                    if (!is_array($arr[$type])) {
	                        $arr[$type] = array();
	                    }
	                    array_push($arr[$type], $altNames[$idx]);
	                }
	            }
	        }
	    }
	    return $arr;
	}
}

?>