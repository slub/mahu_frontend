<?php
/*******************************************************************************
 *
 * Copyright 2017 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;

use Slub\MahuPartners\Domain\Repository\RegulationRepository;


/**
 * 
 * @author radeck
 *
 */
class GetAllRegulationsViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {

    private $repo;
    
    private function sortFunction( $a, $b ) {
        return strcasecmp($a->getName(), $b->getName());
    }
    
	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
	}
	
	/**
	 * Inject the company repository
	 *
	 * @param \Slub\MahuPartners\Domain\Repository\RegulationRepository $companyRepository
	 */
	public function injectCompanyRepository(RegulationRepository $companyRepository)
	{
	    $this->repo = $companyRepository;
	}

	/**
	 * @return array
	 */
	public function render() {
	    $resp = $this->repo->findAll();
	    
	    if ($resp){
	        $arr = $resp->toArray();
	        
	        if ($arr && is_array($arr)){
	            usort($arr, array($this, "sortFunction"));
	            return $arr;
	        }
	    }
	    
	    return null;
	}
}

?>