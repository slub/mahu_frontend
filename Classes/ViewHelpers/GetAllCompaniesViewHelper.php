<?php
/*******************************************************************************
 *
 * Copyright 2017-2018 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;

use Slub\MahuPartners\Domain\Repository\CompanyRepository;


/**
 * Answers a tuple of stringified values and corresponding units for a given material-property-constellation.
 * Thereby, it transparently handles the different types of properties and styles of value definition.
 * 
 * @author Carsten Radeck
 *
 */
class GetAllCompaniesViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {

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
	    $this->registerArgument('onlyOfCurrentUser', 'boolean', '', FALSE, FALSE);
	}
	
	/**
	 * Inject the company repository
	 *
	 * @param \Slub\MahuPartners\Domain\Repository\CompanyRepository $companyRepository
	 */
	public function injectCompanyRepository(CompanyRepository $companyRepository)
	{
	    $this->repo = $companyRepository;
	}

	/**
	 * @return array
	 */
	public function render() {
	    $onlyOfCurrentUser = $this->arguments["onlyOfCurrentUser"];
	    
	    $arr = NULL;
	    
	    if ($onlyOfCurrentUser) {
	        $resp = $this->repo->findCompaniesOfUser( $GLOBALS['TSFE']->fe_user->user["uid"], true );
	        $arr = $resp;
	    } else {
	        $resp = $this->repo->findAll();
	        if ($resp) {
	            $arr = $resp->toArray();
	        }
	    }
        
	    if ($arr && is_array($arr)){
	        usort($arr, array($this, "sortFunction"));
	        return $arr;
	    }
	    
	    return null;
	}
}

?>