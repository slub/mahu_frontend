<?php
defined('TYPO3_MODE') or die();

# extend frontend users TCA
$tmp_fe_users_columns = array(
    'power_of_disposition' => [
        'exclude' => 1,
        'label' => "Confirmed Power of Disposition",
        'config' => [
            'type' => 'check',
            'default' => 0,
        ]
    ],
    'power_of_disposition_date_of_acceptance' => [
        'displayCond' => 'FIELD:power_of_disposition:REQ:TRUE',
        'label' => "Power of Disposition Date of Confirmation",
        'exclude' => true,
        'config' => [
            'type' => 'input',
            'size' => 30,
            'eval' => 'datetime',
            'readOnly' => true,
        ]
    ],
    'expertise' => [
        'exclude' => true,
        'label' => 'Expertise',
        'config' => [
            'type' => 'text',
            'cols' => 40,
            'rows' => 5,
            'eval' => 'trim'
        ]
    ],
    'position' => [
        'exclude' => 1,
        'label' => "Position",
        'config' => [
            'type' => 'text',
            'cols' => 40,
            'rows' => 5,
            'eval' => 'trim'
        ]
    ],
);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('fe_users', $tmp_fe_users_columns);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addToAllTCAtypes('fe_users', 'power_of_disposition, power_of_disposition_date_of_acceptance, position, expertise');