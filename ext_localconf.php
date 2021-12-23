<?php
defined('TYPO3_MODE') or die();


\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
    'mahu_frontend', // The extension name (in UpperCamelCase) with vendor prefix
    'MaterialEditor', // A unique name of the plugin in UpperCamelCase
    array ( // An array holding the enabled controller-action-combinations
        \Slub\MahuFrontend\Controller\MaterialController::class => 'index, new, edit, preview, remove, duplicate, autosave', // The first controller and its first action will be the default
    ),
    array ( // An array holding the non-cachable controller-action-combinations
        \Slub\MahuFrontend\Controller\MaterialController::class => 'index, new, edit, preview, remove, duplicate, autosave', // The first controller and its first action will be the default
    )
);

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
    'mahu_frontend', // The extension name (in UpperCamelCase) with vendor prefix
    'SupplementEditor', // A unique name of the plugin in UpperCamelCase
    array ( // An array holding the enabled controller-action-combinations
        \Slub\MahuFrontend\Controller\SupplementController::class => 'index, new, edit, remove, duplicate, autosave', // The first controller and its first action will be the default
    ),
    array ( // An array holding the non-cachable controller-action-combinations
        \Slub\MahuFrontend\Controller\SupplementController::class => 'index, new, edit, remove, duplicate, autosave', // The first controller and its first action will be the default
    )
);


/** @var \TYPO3\CMS\Extbase\SignalSlot\Dispatcher $signalSlotDispatcher */
$signalSlotDispatcher = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Extbase\SignalSlot\Dispatcher::class);
$signalSlotDispatcher->connect(
    "Subugoe\Find\Controller\SearchController",                 // Signal class name
    'detailActionBeforeRender',                                 // Signal name
    "Slub\MahuFrontend\Slots\MaterialDescriptorEnricher",       // Slot class name
    'addSupplements'                                            // Slot name
    );

$GLOBALS['TYPO3_CONF_VARS']['SYS']['Objects']['TYPO3\\CMS\\Extbase\\Mvc\\Controller\\Argument'] = array('className' => 'Slub\\MahuFrontend\\Xclass\\Extbase\\Mvc\\Controller\\Argument');

$container = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Extbase\Object\Container\Container::class);
$container->registerImplementation(In2code\Femanager\Controller\EditController::class, Slub\MahuFrontend\Controller\EditController::class);
$container->registerImplementation(In2code\Femanager\Controller\NewController::class, Slub\MahuFrontend\Controller\NewController::class);
$container->registerImplementation(In2code\Femanager\Domain\Model\User::class, Slub\MahuFrontend\Domain\Model\User\User::class);