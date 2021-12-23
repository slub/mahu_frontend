<?php
/*******************************************************************************
 *
 * Copyright 2017-2018 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;

use Slub\MahuPartners\Domain\Repository\CompanyRepository;


/**
 * Answers random company records.
 * 
 * @author Carsten Radeck
 *
 */
class GetRandomPartnersViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {

    private $repo;
    
   
	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
	    parent::initializeArguments();
	    $this->registerArgument('limit', 'int', 'number of companies requested', FALSE, 5);
	}
	
	/**
	 * Inject the company repository
	 *
	 * @param \Slub\MaHuPartners\Domain\Repository\CompanyRepository $companyRepository
	 */
	public function injectCompanyRepository(CompanyRepository $companyRepository)
	{
	    $this->repo = $companyRepository;
	}

	/**
	 * @return array
	 */
	public function render() {
	    $resp = $this->repo->findAll();
	    if ($resp){
	        $limit = $this->arguments["limit"];
	        
	        $companies = $resp->toArray();
    	    $noc = count($companies);

    	    $result = array();
    	    $taken = array();
    	    for ($i = 0; $i < min($limit, $noc); ++$i) {
    	        $rand = -1;
    	        do {
    	            $rand = rand(0, $noc-1);
    	        } while(in_array($rand, $taken));
    	        $taken[]= $rand;
    	        
    	        $result[] = $companies[$rand];
    	    }
    	    
    	    return $result;
	    }
	    return null;
	}
}

?>