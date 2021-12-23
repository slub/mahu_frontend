<?php

$EM_CONF[$_EXTKEY] = array(
	'title' => 'Material Hub Frontend for Find extension',
	'description' => 'The Material Hub Frontend for the find extension',
	'category' => 'plugin',
	'author' => 'Carsten Radeck',
	'author_email' => 'carsten.radeck@slub-dresden.de',
	'state' => 'stable',
	'internal' => '',
	'uploadfolder' => '0',
	'createDirs' => '',
	'clearCacheOnLoad' => 0,
	'version' => '0.9.7',
	'constraints' => array(
		'depends' => array(
			'typo3' => '10.0.0-10.9.99',
		    'find' => '>1.0.0',
		    'mahu_partners' => '>=0.9',
			'femanager' => '>6.3.0'
		),
		'conflicts' => array(
		),
		'suggests' => array(
		),
	)
);