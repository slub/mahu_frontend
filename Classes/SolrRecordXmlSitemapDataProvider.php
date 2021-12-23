<?php
namespace Slub\MahuFrontend;

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Seo\XmlSitemap\Exception\MissingConfigurationException;

//TODO remove later on
require_once(\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath('find') . 'vendor/autoload.php');

class SolrRecordXmlSitemapDataProvider extends \TYPO3\CMS\Seo\XmlSitemap\AbstractXmlSitemapDataProvider {
    
    /**
     * @var \Solarium\Client
     */
    protected $solr;
    
    /**
     * @param ServerRequestInterface $request
     * @param string $key
     * @param array $config
     * @param ContentObjectRenderer|null $cObj
     * @throws MissingConfigurationException
     */
    public function __construct(ServerRequestInterface $request, string $key, array $config = [], ContentObjectRenderer $cObj = null)
    {
        parent::__construct($request, $key, $config, $cObj);
        
        $this->numberOfItemsPerPage = $this->config["numberOfItemsPerPage"] ?? 100;
        
        $configuration = array(
            'endpoint' => array(
                'localhost' => array(
                    'host' => $this->config['connection']['host'],
                    'port' => intval($this->config['connection']['port']),
                    'path' => $this->config['connection']['path'],
                    'timeout' => $this->config['connection']['timeout'],
                    'scheme' => $this->config['connection']['scheme']
                )
            )
        );
        
        $this->solr = new \Solarium\Client($configuration);
        
        $this->generateItems();
    }
    
    /**
     * @throws MissingConfigurationException
     */
    public function generateItems(): void
    {
        $query = $this->solr->createSelect();
        $query->setQuery("*:*");
        $query->createFilterQuery('af-0')->setQuery("documentType:material");
        $query->setFields(["id","revisionDate"]);
        $query->setRows($this->config['maxRows']);
        $resultSet = $this->solr->select($query);
        
        $rows= $resultSet->getDocuments();
        foreach ($rows as $row) {
            $date = new \DateTime($row["revisionDate"]);
            $ts = $date->getTimestamp();
            
            $this->items[] = [
                'data' => $row,
                'lastMod' => $ts
            ];
        }
    }
    
    /**
     * @param array $data
     * @return array
     */
    protected function defineUrl(array $data): array
    {
        $pageId = $this->config['url']['pageId'] ?? $GLOBALS['TSFE']->id;
        $additionalParams = [];
        
        $additionalParams = $this->getUrlFieldParameterMap($additionalParams, $data['data']);
        $additionalParams = $this->getUrlAdditionalParams($additionalParams);
        
        $additionalParamsString = http_build_query(
            $additionalParams,
            '',
            '&',
            PHP_QUERY_RFC3986
            );
        
        $typoLinkConfig = [
            'parameter' => $pageId,
            'additionalParams' => $additionalParamsString ? '&' . $additionalParamsString : '',
            'forceAbsoluteUrl' => 1
        ];
        
        $data['loc'] = $this->cObj->typoLink_URL($typoLinkConfig);
        
        return $data;
    }
    
    /**
     * @param array $additionalParams
     * @param array $data
     * @return array
     */
    protected function getUrlFieldParameterMap(array $additionalParams, object $data): array
    {
        if (!empty($this->config['url']['fieldToParameterMap']) &&
            \is_array($this->config['url']['fieldToParameterMap'])) {
                foreach ($this->config['url']['fieldToParameterMap'] as $field => $urlPart) {
                    $additionalParams[$urlPart] = $data[$field];
                }
            }
            
            return $additionalParams;
    }
    
    /**
     * @param array $additionalParams
     * @return array
     */
    protected function getUrlAdditionalParams(array $additionalParams): array
    {
        if (!empty($this->config['url']['additionalGetParameters']) &&
            is_array($this->config['url']['additionalGetParameters'])) {
                foreach ($this->config['url']['additionalGetParameters'] as $extension => $extensionConfig) {
                    foreach ($extensionConfig as $key => $value) {
                        $additionalParams[$extension . '[' . $key . ']'] = $value;
                    }
                }
            }
            
            return $additionalParams;
    }
    
    /**
     * @return int
     */
    public function getLastModified(): int
    {
        $lastMod = 0;
        foreach ($this->items as $item) {
            if ((int)$item['lastMod'] > $lastMod) {
                $lastMod = (int)$item['lastMod'];
            }
        }
        
        return $lastMod;
    }
    
    /**
     * @return array
     */
    public function getItems(): array
    {
        $pageNumber = (int)($this->request->getQueryParams()['page'] ?? 0);
        $page = $pageNumber > 0 ? $pageNumber : 0;
        $items = array_slice(
            $this->items,
            $page * $this->numberOfItemsPerPage,
            $this->numberOfItemsPerPage
            );
        
        return array_map([$this, 'defineUrl'], $items);
    }
}