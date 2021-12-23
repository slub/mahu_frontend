<?php
/*******************************************************************************
 *
 * Copyright 2017-2018 SLUB Dresden
 *
 ******************************************************************************/

namespace Slub\MahuFrontend\ViewHelpers;

use Slub\MahuPartners\Domain\Repository\CompanyRepository;
use Slub\MahuPartners\Domain\Repository\DivisionRepository;


/**
 * Answers a tuple of stringified values and corresponding units for a given material-property-constellation.
 * Thereby, it transparently handles the different types of properties and styles of value definition.
 * 
 * @author Carsten Radeck
 *
 */
class GetCompanyViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {

    private $repo;
    private $divrepo;
    
	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
	    parent::initializeArguments();
	    $this->registerArgument('id', 'String', 'The ID of the requested company', TRUE, "");
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
	 * Inject the division repository
	 *
	 * @param \Slub\MahuPartners\Domain\Repository\DivisionRepository $divisionRepository
	 */
	public function injectDivisionRepository(DivisionRepository $divisionRepository)
	{
	    $this->divrepo = $divisionRepository;
	}
	
	
	/**
	 * @return array
	 */
	public function render() {
	    $id = $this->arguments["id"];
	    $resp = NULL;
	    
        if (!empty($id)) {
            $resp = $this->repo->findByID($id);
            
            
            if (count($resp->toArray())==0) {
                $resp = $this->divrepo->findByID($id);
            }
        }
	    
	    if ($resp){
    	    $arr = $resp->toArray();
    	    
    	    if ($arr && count($arr) == 1){
    	        return $arr[0];
    	    }
	    }
	    
	    return null;
	}
}

?>