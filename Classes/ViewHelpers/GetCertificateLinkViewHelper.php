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
class GetCertificateLinkViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {

    private $repo;
    
	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
		$this->registerArgument('certName', 'string', 'certificate name as stated in a material description', TRUE, "");
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
	    $certName = $this->arguments['certName'];
	    $response = $this->repo->findAll();
	    
	    if (!$response || empty($response)) 
	        return null;
	    
	    $lookup = $response->toArray();
        foreach($lookup as $certInfo){
            $match = $certInfo->getMatchingExpression();
            //$uri = $certInfo->getUri();
            
            if (empty($match)) continue;
            
            $sp = strpos($certName, $match);
            if ($sp === false) {
                if (strpos($match, "/")===0){
                    try {
                        $rp = preg_match($match, $certName);
                        if ($rp !== 0){
                            //return $uri;
                            return $certInfo;
                        }
                    }catch (\Exception $e){
                    }
                }
            } else {
                //return $uri;
                return $certInfo;
            }
        }
        return null;
	}
}

?>