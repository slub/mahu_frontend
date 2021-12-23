/**
 * Provdes German labels.
 * 
 * Copyright 2018-2019 SLUB Dresden
 */
const Localization = (function (){
	const language = "de";
	
	const localizedStrings = {
		"keywords" : "Stichworte",
		"yes" : "Ja",
		"no" : "Nein",
		"from" : "von",
		"to" : "bis",
		"actionmenu": "Aktionsmenü",
		"close":"Schließen",
		"save":"Speichern",
		
		"cookieInfo":"Wir verwenden Cookies und andere Tracking-Techniken, um zu verstehen, wie unsere Webseite genutzt wird und um unseren Nutzern ein interessenbezogenes Angebot präsentieren zu können. Dabei werden keine personenbezogenen Daten an Dritte weitergegeben.",
		
		"selectProperty": "Bitte eine Materialeigenschaft wählen...",
		"add":"Hinzufügen",
		"edit":"Bearbeiten",
		"remove":"Entfernen",
		"print":"Drucken",
		
		"facets.showLess" : "Zeige weniger",
		"facets.showMore" : "Zeige {0} weitere",
		
		"show all": "alle anzeigen",
		"show less": "weniger anzeigen",
		
		"ExportJSON": "Exportieren (JSON)",
		"ExportRDF": "Exportieren (RDF/XML)",
		"ExportCSV": "Exportieren (CSV)",
		
		"detailpage.classInfo": "Informationen zur Materialklasse bei {0} anzeigen.",
		
		"ExportCSV.query": "Suchanfrage",
		"ExportCSV.heading": "Materialname;Firma;Detailseite im Material Hub",
		
		"emailTpl.subject": "Anfrage bezüglich Ihres Materials ",
		"emailTpl.body": "Sehr geehrte Damen und Herren,\nbei der Recherche nach geeigneten Materialien anhand folgender Kriterien bin ich auf Ihr Produkt '{0}' gestoßen.\n\n",
		"emailTpl.footer": "\n\nBitte setzen Sie sich für ein Angebot mit mir in Verbindung.\n\nMit freundlichen Grüßen,\n",
		
		"compView.property" : "Eigenschaft",
		"compView.heading" : "Materialvergleich",
		"compView.back" : "Zurück zur Materialauswahl",
		"compView.close" : "Schließen",
		"compViewPlot.selectProps" : "Wählen Sie Materialeigenschaften als Vergleichskriterien aus:",
		
		"matClassSel.expand": "Weitere Unterklassen einblenden",
		"matClassSel.collapse": "Unterklassen ausblenden",
		"matClassSel.goto": "Zeige Materialien der Kategorie ",
		"matClassSel.navigate": "Zeige die Unterkategorien von ",
		
		"matSel.heading" : "Materialien vergleichen",
		"matSel.compare" : "Vergleichen (Tabelle)",
		"matSel.comparePlot" : "Vergleichen (Diagramm)",
		"matSel.abort" : "Abbrechen",
		"matSel.clickToRemove" : "Klicken zum Entfernen von",
		"matSel.select" : "Bitte wählen Sie weitere Materialien zum Vergleichen.",
		"matSel.maxSel" : "Es können höchstens {0} Materialien verglichen werden.", // contains templates in curly brackets which are dynamically filled using String.format
		"matSel.loading" : "Lade...",
		
		"appAreaWidgetToggle":"Darstellung wählen:",
		"showTagCloud":"Als Wortwolke darstellen",
		"showImageGrid":"Als Bildraster darstellen",
		"tagCloud.search" : "Suchen in Anwendungsgebieten",
		
		"userMatClasses.headerWhenNoHistory": "Beispielhafte Materialklassen",
		
		/* labels required by the researh overview widget */
		"ro.ltm" : "weniger als einer Minute",
		"ro.minute": " Minute",
		"ro.hour": "Stunde",
		"ro.day" : "Tage",
		"ro.plural" : "n",
		"ro.ago" : "vor",
		"ro.tmpl" : "{3} {0} {1}{2}", // contains placeholders (see above)
		"ro.result" : "Ergebnis",
		"ro.results" : "Ergebnisse",
		"ro.furtherResults" : "... und {0} weitere Filter", // contains placeholders (see above)
		"ro.mail.query.subject":"Meine Suchanfrage an das Material Hub",
		"ro.mail.query.content":"Suchanfrage vom {0} mit {1} Treffern:\n{2}", // contains placeholders (see above)
		"ro.mail.queries.subject": "Meine durchgeführten Suchanfragen im Material Hub",
		"ro.mail.savedQuery.subject":"Meine gespeicherte Suchanfrage an das Material Hub",
		"ro.mail.savedQuery.content": "Suchanfrage vom {0} mit {1} Treffern:\n{2}", // contains placeholders (see above)
		"ro.mail.savedQueries.subject":"Meine gespeicherten Suchanfragen im Material Hub",
		"ro.mail.savedQueries.content": "Suchanfrage vom {0} mit {1} Treffern:\n {2}\n\n", // contains placeholders (see above)
		"ro.mail.bookmarks.subject":"Meine Lesezeichen im Material Hub",
		"ro.mail.pageVisits.subject":"Meine besuchten Materialien im Material Hub",
		
		"history.types.bookmark" : "Lesezeichen",
		"history.types.pagevisit" : "Eintrag",
		"history.types.query" : "Suchanfrage",
		"history.types.all" : "Einträge",
		"history.notification.added" : "in Historie hinzugefügt.",
		"history.notification.removed" : "aus Historie entfernt.",
		"history.error.disabled": "Aktion nicht möglich, da Personalisierungs-Cookies deaktiviert wurden.",
		
		"addBookmark" : "Lesezeichen hinzufügen",
		"removeBookmark" : "Lesezeichen entfernen",
		"removeAllBookmarks" : "Alle Lesezeichen entfernen",
		"showAllBookmarks" : "Alle Lesezeichen anzeigen",
		"showAllBookmarksCollapse" : "Weniger Lesezeichen anzeigen",
		"compare" : "Vergleichen",
		"share" : "Teilen",
		"removeFromHistory" : "Aus Verlauf entfernen",
		"removeVisits" : "Verlauf löschen",
		"showVisits" : "Kompletten Verlauf anzeigen",
		"showVisitsCollapse" : "Weniger Materialien anzeigen",
		"removeQuery" : "Suchanfrage entfernen",
		"removeQueries": "Verlauf löschen",
		"removeAllQueries" : "Alle Suchanfragen löschen",
		"showAllQueries" : "Alle Suchanfragen anzeigen",
		"showAllQueriesCollapse" : "Weniger Anfragen anzeigen",
		"showQueries": "Kompletten Verlauf anzeigen",
		"showQueriesCollapse": "Weniger Anfragen anzeigen",
		"loggedInAs":"Angemeldet als",
		"logout": "Abmelden",
		"login": "Anmelden",
		"register": "Registrieren",
		"clearHistory": "Nutzerhistorie löschen",
		"showProfile" : "Nutzerprofil editieren",
		"showResearchOverview": "Zeige den kompletten Rechercheverlauf",
		"filters":"Filter",
		"user profile menu":"Nutzerprofil-Menü",
		
		"sd.cpp":"Materialeigenschaften selbst festlegen (ansonsten abhängig von den Suchergebnissen und der Suchanfrage)",
		"sd.cpp.selectProps":"Wählen Sie eine bis drei Materialeigenschaften aus, die für Suchergebnisse angezeigt werden sollen.",
		
		"dym": "Meinten Sie...",
		
		/* labels for material classes */
		"Anorganisch-natürlich":"Natürlich",
		"Anorganisch-synthetisch":"Synthetisch",
		"Organisch-natürlich":"Natürlich",
		"Organisch-synthetisch":"Synthetisch",
		
		"food":"Hinweis auf Freigaben für Lebensmittelkontakt",
		"certificateByCountry": "Freigaben nach Region",
		"certificate":"Freigaben nach Zertifikat",
		
		"querySuggestions":"Suchanfragevorschläge",
		"addFilter":"Filter hinzufügen",
		"matClass":"Materialklasse",
		"placeholder":"Platzhalter",
		"symbolicImage":"Symbolbild",
		"matImage":"Materialbild",
		
		"simMaterialsSearch.noresults":"Keine Ergebnisse für die eingestellten Materialeigenschaften und Abweichungen gefunden!",
		
		"matedit.autosave": "Die Materialbeschreibung wurde automatisch als '{0}' zwischengespeichert."
	};
	
	try {
	if (propertyLabels != undefined) {
		Object.assign(localizedStrings, propertyLabels);
		propertyLabels = null;
	}
	}catch(E){console.error(E);}
	
	
	return {
		getLanguage : function(){
			return language;
		},
		getString : function(key){
			return localizedStrings[key] || key;
		}
	}
})();