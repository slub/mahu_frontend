<?php
namespace Slub\MahuFrontend\Slots;

use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use Solarium\QueryType\Select\Result\Document;
use Solarium\Exception\HttpException;

/*******************************************************************************
 * 
 * MaterialDescriptorEnricher adds supplements to material descriptors.
 * 
 * Copyright 2019 SLUB Dresden
 * 
 ******************************************************************************/
class MaterialDescriptorEnricher 
{

    /**
     * Contains the settings of the current extension
     *
     * @var array
     * @api
     */
    protected $settings;
    
    /**
     * @var \TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface
     */
    protected $configurationManager;
    
    /**
     * @param \TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface $configurationManager
     * @return void
     */
    public function injectConfigurationManager(ConfigurationManagerInterface $configurationManager) {
        $this->configurationManager = $configurationManager;
        $this->settings = $this->configurationManager->getConfiguration(ConfigurationManagerInterface::CONFIGURATION_TYPE_SETTINGS);
    }
    
    public function addSupplements($params, $solr, $view) {
        if ($this->settings['mahu']['addSupplements']){
            $id = null;
            
            if (!empty($params["document"])){
                $id = $params["document"]["id"];
            }
            
            if (!empty($id) && !empty($solr) && !empty($view)){
                $this->getSupplements($id, $solr, $view);
            }
        }
    }
    
    private function getSupplements($docID, $solr, $view){
        $query = $solr->createSelect();
        
        $escapedID = $query->getHelper()->escapeTerm($docID);
        
        $query->setQuery( 'documentType:supplement AND referenceID:' . $escapedID );
        try {
            $selectResults = $solr->select($query);
            if (count($selectResults) > 0) {
                $resultSet = $selectResults->getDocuments();
                $view->assign("supplements", $resultSet);
            }
        }
        catch (\Solarium\Exception\HttpException $exception) {
            $this->logError("Error while querying material supplements!", \TYPO3\CMS\Core\Messaging\FlashMessage::ERROR, array('docId' => $docID, 'exception' => $this->exceptionToArray($exception)));
        }
    }
}
