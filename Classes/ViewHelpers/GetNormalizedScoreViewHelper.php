<?php
/*******************************************************************************
 *
 * Copyright 2017-2018 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;


/**
 * Answers an array of materials, that are similar to a given material.
 * 
 * Currently, this class only randomly selects from a pre-defined set of material descriptors.
 *
 */
class GetNormalizedScoreViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {

  
	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('material', 'array', 'document describing a material', TRUE, array());
		$this->registerArgument('maxscore', 'int', 'highest score of a query result', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    $material = $this->arguments["material"];
	    $maxscore = $this->arguments["maxscore"];
	    
	    $score= $material["score"] / $maxscore;
	    
	    /*$max= hexdec("FF");
	    
	    $green = $max * $score;
	    $red = $max * (1-$score);
	    
	    $redHex = dechex($red);
	    if (strlen($redHex) == 1)
	        $redHex = "0".$redHex;
	    
	    $greenHex = dechex($green);
	    if (strlen($greenHex) == 1)
	        $greenHex = "0".$greenHex;
	    
	    $color = '#'.$redHex.$greenHex."00";*/
	    
	    $color = "#d14504";
	    if ($score >= 0.75){
	        $color = "#3fce00";
	    } else if ($score > 0.5) {
	        $color = "#fef200";
	    } else if ($score > 0.25){
	        $color = "#feb300";
	    }
	    
	    return array("score" => $score*100, "color" => $color);
	}

}

?>