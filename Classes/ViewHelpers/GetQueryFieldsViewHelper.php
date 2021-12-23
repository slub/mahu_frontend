<?php
/*******************************************************************************
 *
 * Copyright 2017 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;


use TYPO3\CMS\Core\Exception;

/**
 * 
 * @author radeck
 *
 */
class GetQueryFieldsViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('qfields', 'array', 'certificate name as stated in a material description', TRUE, array());
		$this->registerArgument('schema', 'array', 'certificate name as stated in a material description', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    $qfs = $this->arguments['qfields'];
	    $schema = $this->arguments['schema'];
	    $results = array();
	    try {
	    foreach ($qfs as $key => $entry){
	        
	        if ($entry["type"] == "Range"){
	            $e= array();
	            $e["id"] = $entry["id"];
	            if (isset($entry["min"])){
	               $e["min"] = $entry["min"];
	            }
	            if (isset($entry["max"])) {
	                $e["max"] = $entry["max"];
	            }
	            if (isset($entry["step"])) {
	                $e["step"] = $entry["step"];
	            }
	            $schemaInfo = $schema[$e["id"]];
	            if (isset($schemaInfo)){
	                if (isset($schemaInfo["units"])){
	                    $e["units"] = $schemaInfo["units"];
	                }
	            }
	            
	            array_push($results, $e);
	        }
	    }
	    }catch (Exception $e) {
	        return $e;
	    }
        return $results;
	}
}

?>