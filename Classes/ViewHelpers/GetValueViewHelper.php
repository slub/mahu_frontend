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
class GetValueViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('material', 'array', 'document describing a material', TRUE, array());
		$this->registerArgument('name', 'string', 'the name of the property for that the value should be returned', TRUE, "");
		$this->registerArgument('property', 'array', 'an object describing the property', FALSE, array());
		$this->registerArgument('schema', 'array', 'underlying schema definition as object', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    $name= $this->arguments["name"];
	    $prop = $this->arguments["property"];
	    $schema = $this->arguments["schema"];
	    $material = $this->arguments["material"];
	    
	    // lookup property information in the schema
	    if (!$prop){
	        if ($schema["properties"][$name]){
	            $prop = $schema["properties"][$name];
	        }
	        if ($schema["miscProperties"][$name]){
	            $prop = $schema["miscProperties"][$name];
	        }
	        if ($schema["chemicalProperties"][$name]){
	            $prop = $schema["chemicalProperties"][$name];
	        }
	    }
	    
	    $propIsHidden = false;
	    if (is_array($material["obfuscate"])){
	        $propIsHidden = in_array($name, $material["obfuscate"]);
	    }
	    
	    $val = NULL;
	    $remark = NULL;
	    $unit = NULL;
	    $labels = NULL;
	    $nominal = array();
	    $substance = NULL;
	    
	    if ($prop){
	        if ($material[$name."_unit"]){
	            $unit = $material[$name."_unit"];
	        }
	        
	        $rem = $material[$name."_remark"]; // sometimes, there is a remark that carries vendor- and field-specific semantics of certain property values
	        if (!empty($rem)){
	            //$val = $rem;
	            $remark = $rem;
	        }
	        
	        $substance = $material[$name."_substance"];
	        
	        // query the value depending on the property type
	        if ($prop["isMultivalued"]=="true" || $prop["isMultivalued"]=="1"){
	            if (!is_array($unit))
	                $unit = array($unit);
	            
	            $val = $material[$name."_value"];
	            $minArray = $material[$name."_value_min"];
	            $maxArray = $material[$name."_value_max"];
	            
	            if (is_array($val)){
    	            foreach ($val as $key => $entry){
    	                
    	                if (!$unit[$key] && $prop["defaultUnit"]) {
    	                    $unit[$key] = $prop["defaultUnit"];
    	                }
    	                
    	                $nominal[$key] = "";
    	                
    	                if (!$entry || $entry == "NaN"){
    	                    $min = $minArray[$key];
    	                    $max = $maxArray[$key];
    	                    
    	                    if ((isset($min) && $min !== "NaN") || (isset($max) && $max !== "NaN")){
    	                        $_val= "";
    	                        if (!isset($min) && isset($max)){ // less than
    	                            $_val = "&#x003C; ".$max;
    	                        } else if (!isset($max) && isset($min)){ // greater than
    	                            $_val = "&#x003E; ".$min;
    	                        } else { // interval
    	                            $_val = $min . " &#8211; " . $max;
    	                        }
   	                            $val[$key] = $_val;
    	                    }
    	                } else {
    	                    /*
    	                     * set nominal range
    	                     */
    	                    $nrv = "";
    	                    // generate markup
    	                    $min = $minArray[$key];
    	                    $max = $maxArray[$key];
    	                    
    	                    if (isset($min) && $min !== "NaN" && (!isset($max) || $max === "NaN")){
    	                        $nrv = "&#x003E; ".$min;
    	                    }
    	                    if ((!isset($min) || $min === "NaN") && isset($max) && $max !== "NaN"){
    	                        $nrv = "&#x003C; ".$max;
    	                    }
    	                    if (isset($min) && $min !== "NaN" && isset($max) && $max !== "NaN"){
    	                        $nrv = $min . " &#8211; " . $max;
    	                    }
    	                    if (!empty($nrv)){
                                $nominal[$key] = $nrv;
    	                    }
    	                }
    	                
    	                $label = $this->getMethodLabel($key, $name, $material);
    	                $labels[] = $label;

    	            }
	            } else {
	                // cover intervals, <, >
	                $len = 0;
	                if (isset($minArray)){
	                    if (is_array($minArray)){
	                        $len = count($minArray);
	                    } else {
	                        $len = 1;
	                        $minArray = array($minArray);
                        }
	                }
	                if (isset($maxArray)){
	                    if (!is_array($maxArray)){
                            $maxArray = array($maxArray);
	                    } else {
	                        if ($len == 0) {
	                            $len = count($maxArray);
	                        }
	                    }
	                }

	                $_val= array();
	                for($j=0; $j < $len; ++$j) { // assume that both arrays have the same length
	                    $min = $minArray[$j];
	                    $max = $maxArray[$j];
	                    
	                    if (!$val){// cover the case that a property can be both interval-based and non-interval-based
	                        if (isset($min) || isset($max)){
	                            if (!isset($min) && isset($max)){ // less than
	                                $_val[] = "&#x003C; ".$max;
	                            } else if (!isset($max) && isset($min)){ // greater than
	                                $_val[] = "&#x003E; ".$min;
	                            } else // interval
	                                $_val[] = $min . " &#8211; " . $max;
	                        }
	                    } else {
	                        $nominal = "";
	                        // set nominal range
	                        if (isset($min) && $min !== "NaN" && !isset($max)){
	                            $nominal = "&#x003E; ".$min;
	                        }
	                        if (!isset($min) && isset($max) && $max !== "NaN"){
	                            $nominal = "&#x003C; ".$max;
	                        }
	                        if (isset($min) && $min !== "NaN" && isset($max) && $max !== "NaN"){
	                            $nominal = $min . " &#8211; " . $max;
	                        }
	                    }
	                    $labels[] = $this->getMethodLabel($j, $name, $material);
	                }
	                if (!$val) {
	                    $val = $_val;
	                }
	                if ($len == 0){
	                    $labels[] = $this->getMethodLabel(0, $name, $material);
	                }
	            }

	            // fallback solution
	            if ((!isset($val) || empty($val) ) && isset($material[$name])){
	                $val =  $material[$name];
	            }
	        } else {
                $val = $material[$name."_value"];
                $min = $material[$name."_value_min"];
                $max = $material[$name."_value_max"];
                
                if (!isset($val) || $val === "NaN" ){// cover the case that a property can be both interval-based and non-interval-based
                    if (isset($min) || isset($max)){
                        if (!isset($min) && isset($max)){ // less than
                            $val = "&#x003C; ".$max;
                        } else if (!isset($max) && isset($min)){ // greater than
                            $val = "&#x003E; ".$min;
                        } else // interval
                            $val = $min . " &#8211; " . $max;
                    }
                } else {
                    $nominal = "";
                    // set nominal range
                    if (isset($min) && $min !== "NaN" && !isset($max)){
                        $nominal = "&#x003E; ".$min;
                    }
                    if (!isset($min) && isset($max) && $max !== "NaN"){
                        $nominal = "&#x003C; ".$max;
                    }
                    if (isset($min) && $min !== "NaN" && isset($max) && $max !== "NaN"){
                        $nominal = $min . " &#8211; " . $max;
                    }
                }
                
                if (!isset($val)) {
                    $val =  $material[$name];
                }
                if (!$unit) {
                    if ($prop["defaultUnit"]){
                        $unit = $prop["defaultUnit"];
                    }
                }
                
                $rem = $material[$name."_remark"]; // sometimes, there is a remark that carries vendor- and field-specific semantics of certain property values
                if (!empty($rem)){
                    //$val = $rem;
                    $remark = $rem;
                }
                
                $labels[] = $this->getMethodLabel(0, $name, $material);
	        }
	        
	        //if (!$isRemark){
/*    	        if ($material[$name."_unit"]){
    	            $unit = $material[$name."_unit"];
    	            if (is_array($unit)){
    	                $unit = $unit[0];
    	            }
    	        } else 
    	        {
    	           if ($prop["defaultUnit"]){
    	               $unit = $prop["defaultUnit"];
    	           }
    	        }*/
	        //}
	    } else {
	        // fall-back solution, in case the requested property is not part of the schema
	        if (isset($material[$name]))
	            $val = $material[$name];
	            if (isset($material[$name."_unit"]))
	            $unit = $material[$name."_unit"];
	    }
	    
	    // the requested property is not set for that material
	    if (($val === NULL || $val === "NaN" || (is_array($val) && count($val) == 0)) && $remark == NULL && !$propIsHidden){
	        return NULL;
	    }
	    
	    if (!isset($val)) {
	        $val = NULL;
	        $unit = NULL;
	    }
	    
	    // make sure we always return an array to ease processing in the frontend
	    if (!is_array($val)){
	        $val = array($val);
	    }
	    
        if (!is_array($unit)) {
            $unit = array($unit);
        }
        if ($nominal && !is_array($nominal)) {
            $nominal = array($nominal);
        }

        if ($substance && !is_array($substance)) {
            $substance = array($substance);
        }
        
        $result = array();
	    
	    // obfuscate values, remarks and labels if required
	    /*if ($obfuscate && $this->canBeObfuscated($prop, $schema)){
	        $result["obfuscated"] = true;
	        
            for($g=0; $g < count($val); ++$g){
                $val[$g] = $g+1;
                $unit[$g] = $prop["defaultUnit"];
                
                if ($remark[$g])
                    $remark[$g] = "lorem ipsum dolor";
                
                if ($labels[$g]) {
                    $labels[$g] = "lorem ipsum dolor";
                }
            }
        }*/
        
        // post process remarks (replace empty strings by "-")
        if (is_array($remark)){
            foreach ($remark as $rk => $rval){
                if ($rval === "") {
                    $remark[$rk] = "-";
                }
            }
        } else {
            if ($remark === "") {
                $remark = "-";
            }
        }
        
        $result["obfuscated"] = $propIsHidden;
        $result["value"] = $val;
        if (!$prop["isQualitative"]){
            $result["unit"] = $unit;
        }
        $result["remark"] = $remark;
        $result["labels"] = $labels;
        $result["nominal"] = $nominal;
        $result["substance"] = $substance;
        
		return $result;
	}
	
	/*private function canBeObfuscated($prop, $schema){
	    return $schema["properties"][$prop["id"]] || $schema["chemicalProperties"][$prop["id"]];
	}*/
	
	private function getMethodLabel($idx, $prop, $material){
	    $label = NULL;
	    
	    /* query relevant fields */
	    $norm = $material[$prop."_norm"];
	    $method = $material[$prop."_method"];
	    $testCondition = $material[$prop."_testCondition"];
	    
	    $setPrevious = FALSE;
	    
	    /* concatenate field values */
	    if ($norm) {
	        if (is_array($norm)) {
	            if (!empty($norm[$idx]) && $norm[$idx] != '-') {
	                if ($setPrevious) {
	                    $label=$label.", ";
	                }
	                $label=$label."<a class='no-change' href='https://katalog.slub-dresden.de/?tx_find_find[facet][format_de14][Norm]=1&tx_find_find%5Bq%5D%5Bdefault%5D=".$norm[$idx]."'><i class='fas fa-external-link-alt smallicon' aria-hidden='true'></i>".$norm[$idx]."</a>";
	                $setPrevious = TRUE;
	            } else {
	                $setPrevious = FALSE;
	            }
	        } else {
	            if (!empty($norm) && $norm != '-'){
	                if ($setPrevious) {
	                    $label=$label.", ";
	                }
	                $label=$label."<a class='no-change' href='https://katalog.slub-dresden.de/?tx_find_find[facet][format_de14][Norm]=1&tx_find_find%5Bq%5D%5Bdefault%5D=".$norm."'><i class='fas fa-external-link-alt smallicon' aria-hidden='true'></i>".$norm."</a>";
	                $setPrevious = TRUE;
	            } else {
	                $setPrevious = FALSE;
	            }
	        }
	    }
	    if ($method) {
	        if (is_array($method)) {
	            if (!empty($method[$idx]) && $method[$idx] != "-"){
	                if ($setPrevious){
	                    $label=$label.", ";
	                }
	                $label=$label.$method[$idx];
	                $setPrevious = TRUE;
	            } else {
	                $setPrevious = FALSE;
	            }
	        } else {
	            if (!empty($method) &&  $method != '-'){
	                if ($setPrevious){
	                    $label=$label.", ";
	                }
	                $label=$label.$method;
	                $setPrevious = TRUE;
	            } else {
	                $setPrevious = FALSE;
	            }
	        }
	    }
	    if ($testCondition) {
	        if (is_array($testCondition)) {
	            if (!empty($testCondition[$idx]) &&  $testCondition[$idx] != '-') {
	                if ($setPrevious){
	                    $label=$label.", ";
	                }
	                $label=$label.$testCondition[$idx];
	            }
	        } else {
	            if (!empty($testCondition) && $testCondition != '-') {
	                if ($setPrevious){
	                    $label=$label.", ";
	                }
	                $label=$label.$testCondition;
	            }
	        }
	    }
	    
	    $label= trim($label);
	    if (empty($label)) {
	        $label = "&#8211;";
	    }
	    return $label;
	}
}

?>