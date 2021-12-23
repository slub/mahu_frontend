<?php
namespace Slub\MahuFrontend\Controller;

class SupplementController extends \Slub\MahuFrontend\Controller\MaterialController
{
    
    public function duplicateAction(){
        if (!$this->checkArguments()) {
            $this->view->assign("error", true);
            return;
        }
        
        $companyID= $this->requestArguments["company"];
        $src = $this->requestArguments["src"];
        $newname = $this->requestArguments["newname"];
        
        if (!empty($src) && !empty($newname)){
            $srcMaterial = $this->readFile($companyID, $src);
            $srcMaterial["name"] = $newname;
            $srcMaterial["id"] = $this->generateID($newname);
            
            $this->writeFile($companyID, $srcMaterial);
        }
        $this->forward("index");
    }
    
    /**
     * Assigns standard variables to the view.
     */
    protected function addStandardAssignments () {
        parent::addStandardAssignments();
        
        $this->configuration['prefixID'] = 'tx_mahufrontend_supplementeditor';
        
        $this->view->assign('config', $this->configuration);
    }
    
    protected function getCompanyFolder($companyID){
        // load user path settings
        $path = "/user_upload/";
        $dir = "materials/";
        $storageID = "1";
        if (!empty($this->settings["materialEditor"])) {
            if (!empty($this->settings["materialEditor"]["path"])) {
                $path = $this->settings["materialEditor"]["path"];
                if (substr( $path, -1 ) !== "/") {
                    $path = $path."/";
                }
            }
            if (!empty($this->settings["materialEditor"]["storage"])) {
                $storageID = $this->settings["materialEditor"]["storage"];
            }
            if (!empty($this->settings["materialEditor"]["dir"])) {
                $dir = $this->settings["materialEditor"]["dir"];
                if (substr( $dir, -1 ) !== "/") {
                    $dir = $dir."/";
                }
            }
        }
        $folderIdentifier = $path . $companyID . "/" . $dir. "supplements/";
        
        // read the file using the TYPO3 storage API
        $resourceFactory = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Core\Resource\ResourceFactory::class);
        $storage = $resourceFactory->getStorageObject($storageID);
        
        if (!$storage->hasFolder($folderIdentifier)) {
            $storage->createFolder($folderIdentifier);
        }
        return $storage->getFolder($folderIdentifier);
    }
    
    public function removeAction(){
        if (!$this->checkArguments()) {
            $this->view->assign("error", true);
            return;
        }
        $companyID= $this->requestArguments["company"];
        
        $fileID = $this->requestArguments["file"];
        if (empty($fileID)) {
            return;
        }
        
        $folder = $this->getCompanyFolder($companyID);
        if ($folder != null) {
            $storage = $folder->getStorage();
            // try to gather the files from $path/{username}
            if ($folder->hasFile($fileID)) {
                $jsonfile = $storage->getFileInFolder($fileID, $folder);
                $jsonfileName = $jsonfile->getProperty("name");
                
                $lastDotPos= strrpos($jsonfileName, ".");
                $filenameWithoutEnding = substr($jsonfileName, 0, $lastDotPos-1);
                
                // remove corresponding material images
                $files = $storage->getFilesInFolder($folder);
                foreach ($files as $file) {
                    if ($file === $jsonfile){
                        continue;
                    }
                    
                    $tfname= $file->getProperty("name");
                    $tflastDotPos= strrpos($tfname, ".");
                    $tffilenameWithoutEnding = substr($tfname, 0, $tflastDotPos-1);
                    
                    if ($tffilenameWithoutEnding === $filenameWithoutEnding) {
                        $storage->deleteFile($file);
                    }
                }
                $storage->deleteFile($jsonfile);
            }
        }
        
        $this->forward("index");
    }

}