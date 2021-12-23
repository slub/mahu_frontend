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
class HasNominalRangeValuesViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('material', 'array', 'document descibing a material', TRUE, array());
		$this->registerArgument('properties', 'array', 'schema definition carrying relevant properties to be checked for values', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    $properties = $this->arguments["properties"];
	    $material = $this->arguments["material"];
	    
	    $res = false;
	    
	    if (!is_array($properties)) {
	        return false;
	    }
	    
	    foreach($properties as $id => $config){
	        if ($config["renderedSeparately"]) continue;
	        
	        $len = 0;
            $val = $material[$id."_value"];
            if (is_array($val)) {
                $len = count($val);
            }

            $min = $material[$id."_value_min"];
            if (is_array($min)) {
                $len = count($min);
            }
            
            $max = $material[$id."_value_max"];
            if (is_array($max)) {
                $len = count($max);
            }
            
            
            if ($len > 0) {
                for ($i = 0; $i < $len; $i++) {
                    $_val = NULL;
                    $_min = NULL;
                    $_max = NULL;
                    if (is_array($val)) {
                        $_val = $val[$i];
                    }
                    if (is_array($min)) {
                        $_min = $min[$i];
                    }
                    if (is_array($max)) {
                        $_max = $max[$i];
                    }
                    if (isset($_val) && $_val !== "NaN") {
                        if ( (isset($_min) && $_min !== "NaN") || (isset($_max) && $_max !== "NaN") ){
                            $res = true;
                            break;
                        }
                    }
                }
                if ($res) {
                    break;
                }
                
            } else {
	            if (isset($val) && $val !== "NaN") {
	                if ( (isset($min) && $min !== "NaN") || (isset($max) && $max !== "NaN") ){
	                    $res = true;
	                    break;
	                }
	            }
            }
	    }
	    
	    return $res;
	}
}

?>