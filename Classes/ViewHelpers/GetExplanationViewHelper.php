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
class GetExplanationViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {


	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('results', 'array', 'list of result documents', TRUE, array());
		$this->registerArgument('document', 'array', 'document describing a material', TRUE, "");
		$this->registerArgument('defaultFields', 'array', 'the fields that per default are highlighted in the result list in case of a match and thus should not be considered', TRUE, array());
	}

	/**
	 * @return array
	 */
	public function render() {
	    $documentID = $this->arguments['document']['id'];
	    
	    if ($documentID) {
	        $fieldNames = $this->arguments["defaultFields"];
	        
	        $highlighting = $this->arguments['results']->getHighlighting();
	        
	        if ($highlighting) {
	            $result = $highlighting->getResult($documentID);

	            if ($result->count() > 0) {
	                $res = array();
	                foreach($result->getFields() as $id => $hit){
	                    if (is_array($hit) && count($hit) == 0)
	                        continue;
	                    
	                    $propName = $id;
	                    
	                    // if user query matches another field than the default fields (title, producer name, supplier name)
	                    $hitDefaultField = FALSE;
	                    foreach($fieldNames as $fieldName){
	                        if ($fieldName === $propName){
	                            $hitDefaultField = TRUE;
	                            break;
	                        }
	                    }
	                    if ($hitDefaultField) {
	                        continue;
	                    }
	                    
	                    // filter some fields which are only intended for internal usage
	                    if (strpos($propName, "_unstemmed") || $propName === "suggestionsField") {
	                        continue;
	                    }
	                    
	                    // remove subfield names
	                    $pos = strpos($propName, "_");
	                    if ($pos){
	                       $propName = substr($propName, 0, $pos);
	                    }
	                    
	                    array_push($res, $propName);
	                }
	                
	                // avoid pseudo duplicate entries (caused by certain internal fields like "applicationAreaGeneral" 
	                // that are hidden to the user and have the same label as the corresponding field, e.g. "applicationArea")
	                $aagPos = array_search("applicationAreaGeneral", $res, true);
	                $aaPos = array_search("applicationArea", $res, true);
	                if ($aagPos !== false && $aaPos !== false) {
	                    array_splice($res, $aagPos, 1);
	                }
	                
	                return $res;
	            }
	        }
	    }
	    return null;
	}
}

?>