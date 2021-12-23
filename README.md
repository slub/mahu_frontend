# TYPO3 extension `mahu_frontend`

The extension `mahu_frontend` offers the site package and the search functionality for the [Material Hub](https://www.materialhub.de).

## Features

- customized search functionality based on the find extension
- extends the User model by certain fields relevant for the Material Hub
- Sitemap data provider for Solr records
- a frontend editor for material descriptions (material edior)
- a frontend editor for supplemental data (supplement edior)


## Development

All Material Hub extension are shipped with a [grunt](https://gruntjs.com/) configuration \(requires [Node.js](https://nodejs.org/en/)\). This ensures that during development the files from /Resources/Private/Css and /Resources/Private/JavaScript are copied to /Resources/Public as soon as changes occur. For this purpose, the command `grunt` must be executed in the root directory of the respective project via the console. Before committing to git, it is recommended to automatically generate a "production version" with the command `grunt buildProd`, where minified files are stored in the /Resources/Public folder.

## Usage

### Dependencies

- find
- mahu_partners
- femanager

### Setup

#### material search functionality
- Add the find plugin as a content element.
- Include the static TypoScript "Fluid content elements", "Fluid content elements CSS", "Find", "Mahu Frontend design templates".
- Configure the extension via TypoScript. A complete list of options can be found in the next section.

#### material editor functionality
- Add the plugin "mahufrontend_materialeditor" as a content element.
- Configure the extension via TypoScript. A complete list of options can be found in the next section.

#### supplement editor functionality
- Add the plugin "mahufrontend_supplementeditor" as a content element.
- Configure the extension via TypoScript. A complete list of options can be found in the next section.

## TypoScript Configuration Options

To configure extension `mahu_frontend`, the following settings are supported as part of the array `plugin.tx_find.settings.mahu` of the TypoScript **setup** configuration.

- `dev` (boolean, default to 0): enable or disable the development mode (shows under construction indicator and debug area)
- `imgRootPath` (defaults to /typo3conf/ext/mahu_frontend/Resources/Public/Images/): 
- `keepFacets`: determines whether set facets should be kept or reset when changing the free text query
- `POST`: indicates whether the search form should use HTTP POST requests. If set to false or 0, GET requests are applied.
- `autoEnableHistory` (boolean, defaults to false): if set to true/1, the history is enabled automatically. Otherwise it has to be activated later on, e.g. by a cookie consent management.
- `partnerPageID`: ID of the company / institute search page
- `regulationsPageID`: ID of the regulation search page
- `contactPageID`: ID of the contact page
- `materialSearchPageID`: ID of the material search page
- `wizardPageID`: ID of the wizard page.
- `addSupplements`: If true, supplemental data for a material description are queryied and shown on detail pages.
- `showLogos` (defaults to true): Indicates whether logos of companies / institutes should be displayed in certain views.
- `showSimilarMaterialsSearch`: Show or hide the similar materials search feature on detail pages
- `showScores` (boolean, defaults to true): indicates whether score bars should be shown
- `showWelcomeDialog`: show or hide a welcome dialog to the user
- `showTeaser`: configures whether the teaser should be visible on the landing page. If true, the following setting is required:
- `teaserCounts`: an array that holds metrics to be shown in the teaser
    - `materials` (integer): number of materials
    - `categories` (integer): number of categories
    - `usecases` (integer): number of usecases / application areas
    - `companies` (integer): number of companies / institutes
    - `regulations` (integer): number of regulations
- `showNumberOfMaterialsInTaxonomy`: defines whether the number of materials per material class should be shown in the taxonomy widget on the landing page
- `disableEmptyClassesInTaxonomy`: defines whether material classes without individuals should be disabled (e.g., be no clickable link) in the materials taxonomy
- `feedbackURL`:  URL of the feedback questionaire
- `feedbackURLQRCode`: URL of the QR code image that encodes the `feedbackURL`

To configure extension `mahu_frontend`, the following settings are supported as part of the array `plugin.tx_mahufrontend.settings` of the TypoScript **setup** configuration.
- `materialEditorPageID`: ID of the site hosting the material editor
- `supplementEditorPageID`: ID of the site hosting the supplement editor
- `materialsOverviewPageID`: ID of the site containing the overview on materials and supplements


In addition, the extension supports the following **constants**:
- `useGenericQueryFields` (boolean): If false, traditional find query fields configuration takes place. If true, generic query fields are utilized for querying Solr. In addition, the material search frontend provides Requirement tags for users to specify their search criteria.


Furthermore, the extension relies on certain **shared variables** existing in the `lib` data structure for a functioning base site / page setup (enabled by adding the static template).

- menus
    - `lib.menu`: the header navigation
    - `lib.footerMenu`: link list in the footer 
    - `lib.rootline`: the breadcrumb menu
       - `lib.showRootline` (boolean): Enables or disables the breadcrumb menu.
- language settings
     - `lib.currentLangID`: the ID of the current language
     - `lib.currentLang`:  the name/code if the current language
     - `lib.showLanguageMenu` (boolean): enable or disable the language selection menu
- login/user settings
    - `lib.loginEnabled` (boolean): indicates whether login mechanisms are in place
    - `lib.username`: a unique ID for the currently logged in user (e.g. property `username`)
    - `lib.usernameExt`: the display name of the currently logged in user (e.g. derived from properties `first_name` and `last_name`)
- page IDs:
    - `lib.landingPageID`: Id of the landing page
    - `lib.profilePageID`: Id of the page for editing data provider profiles
    - `lib.materialSearchPageID`: Id of the materials search page
    - `lib.registrationPageID`: Id of the data provider registration page
    - `lib.loginPageID`: Id of the page where data providers can login
    - `lib.mahuLogoLinkPageID`: Id of the page to be linked by the Material Hub logo
- `lib.includeMatomo` (boolean): Controls whether the Javascript snipet for Matomo should be delivered to the client.
- `lib.matomoURL` (string): The URL of the server hosting Matomo
- `lib.matomoSiteID` (string): The Matomo site ID to be tracked

### Find related setup

As this extension is meant to be used in conjunction with the extension find, the find's configuration parameters related to the search functionality, like paging, sorting, and highlighting, take place. Please refer to the [extension documentation](https://github.com/subugoe/typo3-find).

However, a customized find verions is utilized in the Material Hub, offering some new features and the corresponding configuration parameters.

#### Grouping

```
plugin.tx_find.settings.grouping {
    field = string      // Solr field that serves for determining groups
    limit = int         // max. number of shown results per group (-1 for no limit)
    showMenu = 0|1      // configures, whether the UI menu for selecting the number of results per page should be shown
    menu {              // an array that enumerates the options to be shown in the UI menu
        0 = int
        ..
        n = int
    }
}
```

#### Highlighting

```
plugin.tx_find.settings.highlight {
    method = unified    // the Highlighter to be used, see https://lucene.apache.org/solr/guide/8_7/highlighting.html#choosing-a-highlighter
    default {
        fields {        // Solr fields for that highlighting should be calculated
            f1 = string
            ...
            fn = string
        }
    }
}
```


### XML Sitemap data provider for Solr

Besides the standard configuration parameters, this Sitemap data provider supports the following custom settings (`config` array):
- `numberOfItemsPerPage` (integer, defaults to 100):  defines the number of items that should appear in a sitemap
- `maxRows` (integer): sets the maximum numner of records to be queried from Solr
- `connection`: an array configuring the Solr connection
	- `scheme`: the protocol
    - `host`: the server name or IP
    - `port`: the port
    - `path`: the URL path
    - `timeout`: maximum time in seconds to wait for a response before triggering a timeout

Example:

```
plugin.tx_seo.config {
   xmlSitemap {
      sitemaps {
         materials {
            provider = Slub\MahuFrontend\SolrRecordXmlSitemapDataProvider
            config {
               #numberOfItemsPerPage = 1000
               maxRows = 1000
               connection {
                  scheme = http
                  host = localhost
                  port = 8984
                  path = /solr/mahu/
                  timeout = 30
				  }
               url {
                  pageId = 2
                  fieldToParameterMap {
                     id = tx_find_find[id]
                  }
                  additionalGetParameters {
                     tx_find_find.controller = Search
                     tx_find_find.action = detail
                  }
               }
            }
         }
```

