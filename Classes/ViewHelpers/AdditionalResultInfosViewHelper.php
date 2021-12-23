<?php
/*******************************************************************************
 *
 * Copyright 2017-2018 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;


/**
 * Answers a list of material properties to be displayed as preview in the results list.
 * To this end, the current query is analyzed to prioritize properties that are currently used as filters.
 * However, a set of defaults applies to make sure there are always three properties returned.
 * 
 * @author Carsten Radeck
 *
 */
class AdditionalResultInfosViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('query', 'array', 'a query object', FALSE, array());
		$this->registerArgument('schema', 'array', 'the mahu schema descriptor', FALSE, array());
		$this->registerArgument('documents', 'array', 'result documents (material descriptors)', FALSE, array());
		$this->registerArgument('customprops', 'array', 'user-defined properties to be shown', FALSE, array());
	}

	private function cmp($a, $b) {
	    if ($a == $b) {
	        return 0;
	    }
	    return ($a < $b) ? 1 : -1;
	}
	
	/**
	 * @return array
	 */
	public function render() {
	    $q= $this->arguments["query"];
	    $schema = $this->arguments["schema"];
	    $documents = $this->arguments["documents"];
	    $customprops = $this->arguments["customprops"];

	    $result = [];
	    // add those properties that are defined as preview properties in the user settings
	    if (!empty($customprops)) {
	        foreach ($customprops as $customprop) {
	            if (!empty($customprop)) {
	                array_push($result, $customprop);
	            }
	        }
	    }

        // add all properties that are used as filters (and that are specified in the given schema) to the result list
        foreach($q as $qp => $val){
            if (!empty($val)){
                if ($schema["properties"][$qp] ||  $schema["miscProperties"][$qp]){
                    if ("hardness" == $qp){// special handling for hardness; maybe this could be generalized to material properties with "variants"
                        $variant = $val[2];
                        if (empty($val[2]))
                            $variant = $schema["properties"]["hardness"]["defaultUnit"];
                        array_push($result, $qp."_".$variant);
                    } else {
                        array_push($result, $qp);
                    }
                } else {
                    if (strpos($qp, "genqf") !== false){
                        if (strpos($qp, "genqftemp") !== false) {// temperature field
                            $temp = $q[$qp]["2"];
                        } else {
                            if (strpos($qp, "genqft") !== false) {// qualitative properties (text query field)
                                $temp = $q[$qp]["1"];
                            } else {
                                if (strpos($qp, "genqfdq") !== false) {// dimensionless quantities
                                    $temp = $q[$qp]["2"];
                                } else {  // quantitative properties (range query field)
                                    $temp = $q[$qp]["3"];
                                }
                            }
                        }
                        if (!empty($temp)){
                            array_push($result, $temp);
                        }
                    }
                    
                }
            }
        }
        
        // fill with defaults
        $defaults = array("category", "density", "temperatureRange_air");
        $rlen = count($result);
        if ($rlen < 3){
            $needed = 3 - $rlen;
            $added = 0;
            
            array_push($result, "category");
            ++$added;
            
            if ($added < $needed) {
                // determine properties the majority of materials has a value for
                $prop2count = [];
                $nod = count($documents);
                foreach ($documents as $doc) {
                    foreach($schema["properties"] as $propid => $prop){
                        if (!empty($doc[$propid."_value"])
                            || !empty(!empty($doc[$propid."_value_min"]))
                            || !empty(!empty($doc[$propid."_value_max"]))
                            || !empty($doc[$propid])){
                                if ($prop2count[$propid]){
                                    $prop2count[$propid] += 1;
                                } else {
                                    $prop2count[$propid] = 1;
                                }
                        }
                    }
                }
                uasort($prop2count, array($this, "cmp"));
                //$slice = array_slice($prop2count, 0, $needed-1);
                
                foreach ($prop2count as $propid => $count){
                    if ($count/$nod > 0.3 &&
                            !in_array($propid, $result)){
                        array_push($result, $propid);
                        ++$added;
                        if ($added == $needed)
                            break;
                    }
                }
            }
            
            if ($added < $needed) {
                foreach ($defaults as $qp){
                    if (!in_array($qp, $result)){
                        array_push($result, $qp);
                        ++$added;
                    }
                    
                    if ($added == $needed)
                        break;
                }
            }
        }
        // limit the result to three entries
		$result = array_slice($result, 0, 3);
		return $result;
	}
}

?>