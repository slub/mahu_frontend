<?php
namespace Slub\MahuFrontend\Controller;

use Slub\MahuPartners\Domain\Repository\CompanyRepository;


class MaterialController extends \TYPO3\CMS\Extbase\Mvc\Controller\ActionController
{
    
    /**
     * @var array
     */
    protected $requestArguments;
    
    /**
     * Array to collect the configuration information that will be added as a template variable.
     * @var array
     */
    protected $configuration = array();
    
    protected $companyRepo;
    
    /**
     * Initialisation and setup.
     */
    public function initializeAction() {
        $this->requestArguments = $this->request->getArguments();
        
        $objectManager = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Extbase\Object\ObjectManager::class);
        $this->companyRepo = $objectManager->get(CompanyRepository::class);
    }
    
    /**
     * This action renders the material editor for modifying the given material description
     * and handles the form data accordingly after the user has submitted the form.
     */
    public function editAction() {
        if (!$this->checkArguments()) {
            $this->view->assign("error", true);
            return;
        }
        $companyID= $this->requestArguments["company"];
        
        $material = $this->requestArguments["material"];
        
        
        if (empty($material)) {
            // request for edit form
            $id = $this->requestArguments["id"];

            if (!empty($id)) {
                $material = $this->readFile($companyID, $id);
            } else {
                $this->view->assign("unknownID", true);
                $this->view->assign("error", true);
            }
            
            $assignments = array(
                "material" => $material,
                "showForm" => TRUE
            );
        } else {
            // edit form has been submitted
            
            $material["id"] = $this->generateID($material["name"]);
            if ($material["\$prop\$"]) {
                unset($material["\$prop\$"]);
            }
            $this->addCompanyNames($material);
            
            $file= $this->writeFile($companyID, $material);
            
            $assignments = array(
                "material" => $material,
                "showForm" => FALSE,
                "success" => TRUE,
                "file" => $file
            );
        }
        $this->view->assign("companyID", $companyID);
        $this->view->assignMultiple($assignments);
        $this->addStandardAssignments();
    }
    
    /**
     * Back end action for the client-side auto save feature.
     * Takes the given material description and persists it 
     * in the file named "$materialname$_autosave.json".
     */
    public function autosaveAction(){
        if (!$this->checkArguments()) {
            $this->view->assign("error", true);
            return;
        }
        $companyID= $this->requestArguments["company"];
        
        $material = $this->requestArguments["material"];
        
        $assignments = array(
            "success" => FALSE
        );
        
        if (!empty($material)) {
            try {
            $material["id"] = $this->generateID($material["name"])."_autosave";
            if ($material["\$prop\$"]) {
                unset($material["\$prop\$"]);
            }
            $this->addCompanyNames($material);
            
            $file= $this->writeFile($companyID, $material);
            
            $assignments["success"] = TRUE;
            $assignments["file"] = $file->getName();
            
            }catch(Exception $e) {}
        }
        $this->view->assign("response", $assignments);
        $this->addStandardAssignments();
    }
    
    /**
     * Creates a copy of a given material description.
     * To this end, the ID (file name) of the source material description (parameter name "src")
     * and the name of the new material (parameter name "newname") have to be part of the request.
     */
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
     * This actions ships the material editor to create a new material descriptions and 
     * handles the submitted form data. 
     * 
     */
    public function newAction() {
        if (!$this->checkArguments()) {
            $this->view->assign("error", true);
            return;
        }
        $companyID= $this->requestArguments["company"];
        
        $material = $this->requestArguments["material"];
        $showForm = FALSE;
        $success = FALSE;
        
        if (!empty($material)) {
            
            $material["id"] = $this->generateID($material["name"]);
            if ($material["\$prop\$"]) {
                unset($material["\$prop\$"]);
            }
            $this->addCompanyNames($material);
            
            $file = $this->writeFile($companyID, $material);
            
            $this->view->assign("file", $file);
            
            // display state
            $success = TRUE;
        } else {
            // deliver form for new organization
            $showForm = TRUE;
        }
        
        $assignments = array(
            "material" => $material,
            "showForm" => $showForm,
            "success" => $success,
            "companyID" => $companyID,
            "companyName" => $this->companyRepo->findByIDIgnoreHidden($companyID)->getFirst()->getName()
        );

        $this->view->assignMultiple($assignments);
        $this->addStandardAssignments();
    }
    
    /**
     * Tests whether certain obligatory input arguments are provided by the current request.
     * For instance, most actions require a logged in, authorized user.
     * @return boolean
     */
    protected function checkArguments(){
        $companyID= $this->requestArguments["company"];
        if (!$companyID) {
            $this->view->assign("insufficientarguments", true);
            // add some standard variables to the viewer
            $this->addStandardAssignments();
            return false;
        }
        
        $username = $GLOBALS['TSFE']->fe_user->user['username'];
        if (empty($username)) {
            $this->view->assign("nologin", true);
            // add some standard variables to the viewer
            $this->addStandardAssignments();
            return false;
        }
        if (!$this->hasPermission($GLOBALS['TSFE']->fe_user->user['uid'], $companyID)){
            $this->view->assign("nopermission", true);
            // add some standard variables to the viewer
            $this->addStandardAssignments();
            return false;
        }
        return true;
    }
    
    /**
     * The index action lists all files, i.e., material descriptions, created for the given organization. 
     */
    public function indexAction() {
        if (!$this->checkArguments()) {
            $this->view->assign("error", true);
            return;
        }
        $companyID= $this->requestArguments["company"];
        
        $folder = $this->getCompanyFolder($companyID);
        if ($folder != null) {
            // filter JSON files
            $jsonFiles= [];
            $storage = $folder->getStorage();
            $files = $storage->getFilesInFolder($folder);
            
            foreach ($files as $file) {
                if ($file->getProperty("extension") === "json") {
                    array_push($jsonFiles, $file);
                }
            }
            
            $this->view->assign("files", $jsonFiles);
        }

        $this->view->assignMultiple(array(
            "companyID" => $companyID,
            "success" => true,
            "companyName" => $this->companyRepo->findByIDIgnoreHidden($companyID)->getFirst()->getName()
        ));
        $this->addStandardAssignments();
    }
    
    /**
     * Returns the folder for the given organization.
     * This takes the plugin settings into consideration. 
     * 
     * @param string $companyID
     * @return object the folder
     */
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
        $folderIdentifier = $path . $companyID . "/" . $dir;
        
        // read the file using the TYPO3 storage API
        $resourceFactory = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Core\Resource\ResourceFactory::class);
        $storage = $resourceFactory->getStorageObject($storageID);
        
        if (!$storage->hasFolder($folderIdentifier)) {
            $storage->createFolder($folderIdentifier);
        }
        return $storage->getFolder($folderIdentifier);
    }
    
    /**
     * Answers whether the given user is allowed to modify the given organization.
     * @param string $userID the userID
     * @param string $companyID the ID of the organization write permission is requested for
     * @return boolean
     */
    protected function hasPermission($userID, $companyID){
        $company= $this->companyRepo->findByIDIgnoreHidden($companyID)->getFirst();
        if (!$company) {
            return false;
        }
        
        if ($userID === $company->getUserid()) {
            return true;
        }
        
        $editorIDs = explode(";", $company->getEditors());
        if (in_array($userID, $editorIDs)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Provides a preview on material descriptions created in the material editor.
     */
    public function previewAction(){
        if (!$this->checkArguments()) {
            $this->view->assign("error", true);
            return;
        }
        $companyID= $this->requestArguments["company"];
        
        $id = $this->requestArguments["id"];
        
        $success = TRUE;
        
        // get the material description from file
        if (!empty($id)) {
            $material = $this->readFile($companyID, $id);
        } else {
            $success = FALSE;
        }

        // Pre-process the material description to ensure that the preview
        // is as close to the final detail page as possible.
        $this->clearEmptyFields($material);
        
        $assignments = array(
            "document" => $this->materialToDocument($material),
            "showForm" => TRUE,
            "companyID" => $companyID,
            "fileName" => $id,
            "success" => $success
        );
        
        $this->view->assignMultiple($assignments);
        $this->addStandardAssignments();
    }
    
    /**
     * Remove empty properties from the given material description. 
     * @param array $material
     */
    protected function clearEmptyFields(&$material){
        // iterate all properties
        foreach ($material as $key => &$value) {
            if (is_array($value)) {
                if (!is_array($value[array_key_first ( $value )])) {
                    // array of strings
                    
                    $noEntries = true;
                    foreach ($value as $str) {
                        $noEntries = $noEntries && empty($str); 
                    }
                    
                    if ($noEntries) {
                        unset($material[$key]);
                    }
                } else {
                    // array of arrays
                    
                    foreach ($value as $k => $v) {
                        $noEntries = true;
                        
                        foreach ($v as $subpropname => $subpropvalue) {
                            $noEntries = $noEntries && empty($subpropvalue);
                        }
                        
                        if ($noEntries) {
                            unset($value[$k]);
                        }
                    }
                }
            } else {
                if (empty($value)) {
                    unset($material[$key]);
                }
            }
        }
    }
    
    /**
     * Converts a JSON represented material description (generated via the Material Editor) into a Solr-like document.
     * Used for the preview functionality.
     * 
     * @param array $material
     * @return array
     */
    protected  function materialToDocument($material){
        $doc = array();
        
        foreach ($material as $key => $value) {
            
            if (is_array($value)) {
                if (!is_array($value[array_key_first ( $value )])) {
                    $doc[$key] = $value;
                } else {
                    foreach ($value as $k => $v) {
                        foreach ($v as $subpropname => $subpropvalue) {
                            
                            if (!is_array($doc[$key."_".$subpropname])){
                                $doc[$key."_".$subpropname] = array();
                            }
                            array_push($doc[$key."_".$subpropname], $subpropvalue);
                        }
                    }
                }
            } else {
                $doc[$key] = $value;
            }

        }
        
        // specific postprocessing for material property "category": merge "category" and "category_custom" in an array with the latter at the end
        array_push($doc["category"], $doc["category_custom"]);
        
        return $doc;
    }
    
    /**
     * Answers the material property info object for the given property ID
     * @param string $propertyID
     * @return array|NULL
     */
    protected function getPropInfo($propertyID) {
        $schema = $this->settings["schema"];
        
        $res = array();
        
        foreach ($schema as $name => $s) {
            foreach($s as $id => $config) {
                if ($id == $propertyID) {
                    $res["type"] = $name;
                    
                    foreach ($config as $key => $value) {
                        $res[$key] = $value;
                    }
                    
                    return $res;
                }
            }
        }
        return null;
    }
    
    /**
     * This action allows to remove files from the folder of a certain organization. 
     * Required request arguments are "company" (the organization ID) and "file", the file name. 
     */
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
    
    /**
     * Extends the given material description with the names of organizations annotated as data deliverer, producer and supplier. 
     * This is necessary since there are only IDs of organizations delivered from the material editor form.
     * 
     * @param array $material
     */
    protected function addCompanyNames(&$material){
        $dd = $material["dataDelivererID"];
        if (!empty($dd)) {
            $c = $this->companyRepo->findByIDIgnoreHidden($dd)->getFirst();
            if (!empty($c)) {
                $material["dataDeliverer"] = $c->getName();
            }
        }

        $producer = $material["producerID"];
        if (!empty($producer)) {
            $c = $this->companyRepo->findByIDIgnoreHidden($producer)->getFirst();
            if (!empty($c)) {
                $material["producer"] = $c->getName();
            }
        }

        $suppliers = $material["supplierID"];
        if (!empty($suppliers)) {
            $material["supplier"] = array();
            
            foreach ($suppliers as $supplier) {
                $c = $this->companyRepo->findByIDIgnoreHidden($supplier)->getFirst();
                if (!empty($c)) {
                    array_push($material["supplier"], $c->getName());
                }
            }
        }
    }
    
    /**
     * Generates an ID from a name (material or organization) in the way specified in the Material Hub project.
     * 
     * @param string $name
     * @return string
     */
    protected function generateID($name){
        $id = str_replace(" ","-", $name); // replace whitespaces by hyphens
        $id = mb_strtolower($id);
        
        // replace umlauts, dicritics etc.
        $id = str_replace("ß","ss", $id);
        $id = str_replace(array("æ","œ","ç","ñ"),array("ae","oe","c", "n"),$id);
        $id = str_replace(array("ä", "à","á","â","ã","å"),"a",$id);
        $id = str_replace(array("ü","ù","ú","û"),"u",$id);
        $id = str_replace(array("ö","ò","ó","ô","õ"),"o",$id);
        $id = str_replace(array("ì","í","î","ï"),"i",$id);
        $id = str_replace(array("è","é","ê","ë"),"e",$id);
        $id = str_replace(array("ý","ÿ"),"y",$id);
        
        // remove certain words
        $id = preg_replace("/-gmbh-?/","-",$id);
        $id = preg_replace("/-co-?/","-",$id);
        $id = preg_replace("/-kg-?/","-",$id);
        $id = preg_replace("/-inc-?/","-",$id);
        $id = preg_replace("/-ag-?/","-",$id);
        
        // removes special chars
        $id = preg_replace('/[^A-Za-z0-9\-]/', '', $id);
        
        // replaces multiple hyphens with a single one
        $id = preg_replace('/-+/', '-', $id);
        // remove trailing hyphens
        $id = preg_replace("/-$/","", $id);
        
        return $id;
    }
    
    /**
     * Reads the material description file identified by $filename for the organization given by its ID.
     * 
     * @param string $companyID the ID of the organization for which the material description file was created
     * @param string $filename the file name
     * @return array|NULL
     */
    protected function readFile($companyID, $filename){
        // get the organization folder
        $folder= $this->getCompanyFolder($companyID);
        if ($folder) {
            // read the file contents...
            $storage = $folder->getStorage();
            $fileContent = $storage->getFileContents($storage->getFileInFolder($filename, $folder));
            
            // and deserialze it
            $material = json_decode($fileContent, TRUE);
            
            return $material;
        }

        return null;
    }
    
    /**
     * Stores the given material description in the folder of the organization given by $companyID.
     *
     * @param string $companyID the ID of the organization for which the material description file was created
     * @param array $material the material description as an array
     * @return array|NULL
     */
    protected function writeFile($companyID, &$material) {
        
        $matID = $material["id"];
        
        // get the organization folder
        $folder = $this->getCompanyFolder($companyID);
        $storage = $folder->getStorage();

        // check if there is an uploaded file with the ID 'materialImage' (as defined in the material description form)
        if (!empty($_FILES['materialImage'])) {
            if ($_FILES['materialImage']['error'] === 0) {
                $siteURL = "/";
                if (!empty($this->settings["materialEditor"])) {
                    if (!empty($this->settings["materialEditor"]["siteURL"])) {
                        $siteURL = $this->settings["materialEditor"]["siteURL"];
                        if (substr( $siteURL, -1 ) !== "/") {
                            $siteURL=$siteURL."/";
                        }
                    }
                }
                
                $uploadedFileName = $_FILES['materialImage']['name'];
                $lastDotPos= strrpos($uploadedFileName, ".");
                $fileEnding = substr($uploadedFileName, $lastDotPos);
                
                // store the uploaded file using the TYPO3 storage API
                $newFile = $storage->addFile(
                    $_FILES['materialImage']['tmp_name'],
                    $folder,
                    $matID.$fileEnding,
                    \TYPO3\CMS\Core\Resource\DuplicationBehavior::REPLACE
                    );
                
                // finally, set the Company's logo property to the file URL
                $material["imageUrl"] = $siteURL.$newFile->getPublicUrl();
            }
        }
        
        // serialize the material description
        $serializedMaterial = json_encode ($material);
        
        // store material description in a json file
        $targetFile = null;
        if (!$folder->hasFile($matID.".json")) {
            $targetFile = $folder->createFile($matID.".json");
        } else {
            $targetFile = $storage->getFileInFolder($matID.".json", $folder);
        }
        $targetFile->setContents($serializedMaterial);
        return $targetFile;
    }
    
    /**
     * Assigns standard variables to the view.
     */
    protected function addStandardAssignments () {
        $this->view->assign('arguments', $this->requestArguments);
        
        $contentObject = $this->configurationManager->getContentObject();
        $uid = $contentObject->data['uid'];
        $this->configuration['uid'] = $uid;
        
        $this->configuration['prefixID'] = 'tx_mahufrontend_materialeditor';
        
        $this->configuration['pageTitle'] = $GLOBALS['TSFE']->page['title'];
        
        $this->configuration['language'] = $GLOBALS['TSFE']->config['config']['language'];
        
        $this->view->assign('config', $this->configuration);
    }
}