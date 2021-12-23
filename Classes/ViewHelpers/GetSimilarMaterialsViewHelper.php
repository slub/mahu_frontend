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
class GetSimilarMaterialsViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper {

    private $data= array(
        array(
            "id" => "bdf0b603-585a-46ee-bbd8-5e56707dcee9",
            "name" => "75 Fluoroprene XP41",
            "producer_name" => "Freudenberg Sealing Technologies",
            "imageURL" => "/typo3conf/ext/mahu_frontend/Resources/Public/Images/placeholder.png",
            "category" => "Elastomere"
        ),
        array(
            "id" => "100220035",
            "name" => "Kleber / Härter SKL 65",
            "producer_name" => "Kahmann & Ellerbrock",
            "imageURL" => "https://kahmann-ellerbrock.de/tradepro/shop/artikel/gross/SKL65.jpg",
            "category" => "Kunststoffe"
        ),
        array(
            "id" => "100220071",
            "name" => "POM-C (FoodGrade)",
            "producer_name" => "Kahmann & Ellerbrock",
            "imageURL" => "https://kahmann-ellerbrock.de/tradepro/shop/artikel/gross/KS_foodgrade.jpg",
            "category" => "Kunststoffe"
        ),
        array(
            "id" => "100220030&",
            "name" => "PTFE-Folie, virginal, einseitig selbstklebend",
            "producer_name" => "Kahmann & Ellerbrock",
            "imageURL" => "https://kahmann-ellerbrock.de/tradepro/shop/artikel/gross/ptfe-glasgewebe-taconic-1.jpg",
            "category" => "Kunststoffe"
        ),
        array(
            "id" => "100219998",
            "name" => "PP - Polypropylen Tafeln Grau Extrudiert ",
            "producer_name" => "Kahmann & Ellerbrock",
            "imageURL" => "https://kahmann-ellerbrock.de/tradepro/shop/artikel/gross/Technische-Kunststoffe.jpg",
            "category" => "Kunststoffe"
        ),
        array(
            "id" => "64ff0480-92e6-11e7-abc4-cec278b6b50a",
            "name" => "Legierung BD",
            "producer_name" => "memry",
            "imageURL" => "/typo3conf/ext/mahu_frontend/Resources/Public/Images/placeholder.png",
            "category" => "aktorische FGL"
        ),
        array(
            "id" => "100220116",
            "name" => "PMMA - Polymethylmethacrylat (Acrylglas) Rundstäbe extrudiert ",
            "producer_name" => "Kahmann & Ellerbrock",
            "imageURL" => "https://kahmann-ellerbrock.de/tradepro/shop/artikel/gross/Transparente-Werkstoffe.jpg",
            "category" => "Elastomere"
        )
    );

	/**
	 * Register arguments.
	 * @return void
	 */
	public function initializeArguments() {
		parent::initializeArguments();
	}

	/**
	 * @return array
	 */
	public function render() {
	    
	    $added = 0;
	    while ($added < 4){
	        $q= $this->data[mt_rand(0, 6)];
	        
	        if (!in_array($q, $res)){
	           $res[] = $q;
	           ++$added;
	        }
	    }
	    
		return $res;
	}
}

?>