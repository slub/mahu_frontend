/**
 * An ImageLinkResolver is responsible for mapping terms (keys, names) to the URL of corresponding image ressources.
 * 
 * Copyright 2018-2020 SLUB Dresden
 */
const ImageLinkResolver = function (){
	
	const rootPath = mahu.getImageRootPath();
	const _def = rootPath+"placeholder.png";
	
	// data structure that holds all data sources to be considered
	// each data source reflects another material property (currently material category and application area are supported)
	// a data source defines a sub folder where images reside and maps from files, i.e. image, to terms (1 file may apply for several terms)
	const dataSources = [
		// application area images
		{
			subPath: "applicationareas/",
			fileToTermsMapping: {
				"abdeckungen.jpg" : [
					"Abdeckungen"
				],
				"distanzscheibe.jpg" : [
					"Abstandshalter"
				],
				"abstreifer.jpg" : [
					"Abstreifer"
				],
				"mechnicalengineering.jpg" : [
					"Antriebe"
				],
				"advertisingtechnology.jpg" : [
					"Werbung"
				],
				"aerospace.jpg" : [
					"Raumfahrt"
				],
				"aircraftconstruction.jpg" : [
					"Luftfahrt"
				],
				"anvilpads.jpg" : [
					"Amboss"
				],
				"apparatusconstruction.jpg" : [
					"Apparatebau",
					"Gerätebau"
				],
				"architekturdesignetc.jpg" : [
					"Architektur"
				],
				"autoclaveindustry.jpg" : [
					"Autoklav"
				],
				"automatisation.jpg" : [
					"Automatisierung"
				],
				"automotiveindustry.jpg" : [
					"Fahrzeugbau",
					"Fahrzeugindustrie",
					"Automobilbranche",
					"Montage"
				],
				"aviation.jpg" : [
					"Aviation industry"
				],
				"bearing.jpg" : [
					"Bearing"
				],
				"bellows.jpg" : [
					"Balge"
				],
				"beverageindustry.jpg" : [
					"Getränkeindustrie"
				],
				"beschriftungstafeln.jpg" : [
					"Schilder"
				],				
				"industrypackagingsystems.jpg" : [
					"Lebensmittelkontakt",
					"Lebensmittelindustrie"
				],
				"boatbuilding.jpg" : [
					"Schiffbau"
				],
				"housing.jpg" : [
					"Bauwesen"
				],	
				"bohrschablonen.jpg" : [
					"Bohren"
				],				
				"brandschutz.jpg" : [
					"Brandschutz"
				],
				"chemicalengineeringandtankbuilding.jpg" : [
					"Tanks"
				],
				"chemieindustrie.jpg" : [
					"Chemieindustrie"
				],
				"cleanroomandsemiconductorindustry.jpg" : [
					"Halbleiter"
				],
				"constructionindustry.jpg" : [
					"Bauindustrie"
				],
				"caravaningsector.jpg" : [
					"Wohnmobile"
				],
				"controldisks.jpg" : [
					"Mitnehmer"
				],
				"materialshandlingindustry.jpg" : [
					"Fördertechnik"
				],			
				"corrosionprotection.jpg" : [
					"Korrosionsschutz"
				],
				"cuttingboard.jpg" : [
					"Schneidunterlagen"
				],					
				"displaysundraumteiler.jpg" : [
					"Trennwände"
				],
				"doormanufactoring.jpg" : [
					"Türen und Tore"
				],
				"doormanufactoring.jpg" : [
					"Türen und Tore"
				],				
				"drinkingwaterandsewagewater.jpg" : [
					"Wasser"
				],
				"electronicindustry.jpg" : [
					"Elektronik",
					"Elektroindustrie"
				],
				"electricalindustry.jpg" : [
					"Elektrik",
					"Elektrotechnik"
				],
				"entflammbareumgebungen.jpg" : [
					"Entflammbare Umgebungen"
				],
				"electroplating.jpg" : [
					"Beschichtung"
				],
				"formteile.jpg" : [
					"Formteile"
				],
				"industry.jpg" : [
					"Energietechnik"
				],	
				"impactprotectivewallsinsandblastingsystems.jpg" : [
					"Sandstrahlen"
				],					
				"fender.jpg" : [
					"Fender"
				],	
				"filtrationsplatte.jpg" : [
					"Filter"
				],					
				"fotomounting.jpg" : [
					"Kaschieren"
				],
				"fridgeapplications.jpg" : [
					"Kühlschränke"
				],				
				"fuehrungsleisten.jpg" : [
					"Führungen"
				],					
				"fuellstutzen.jpg" : [
					"Füllstutzen"
				],
				"funktionsmodelle.jpg" : [
					"Funktionsmodelle"
				],
				"galvanik.jpg" : [
					"Galvanik"
				],
				"gartenbau.jpg" : [
					"Gartenbau",
					"Gartenzubehör"
				],
				"gebäudetechnik.jpg" : [
					"Gebäudetechnik"
				],
				"gebrauchsgueter.jpg" : [
					"Sport und Freizeit",
					"Mode"
				],
				"gelaender.jpg" : [
					"Geländer"
				],
				"gleitelemente.jpg" : [
					"Gleitelemente"
				],
				"harbourconstruction.jpg" : [
					"Hafenbau"
				],
				"haushalt.jpg" : [
					"Haushalt",
					"Haushaltsgeräte"
				],
				"hinweise.jpg" : [
					"Schilder",
				],
				"hochdrucksysteme.jpg" : [
					"Hochdrucksysteme"
				],
				"hydraulik.jpg" : [
					"Hydraulik"
				],
				"hygieneartikel.jpg" : [
					"Hygieneartikel"
				],
				"industrieverglasungen.jpg" : [
					"Verglasung"
				],		
				"industrialaplications.jpg" : [
					"industrielle Anwendungen"
				],
				"innenausbau.jpg" : [
					"Innenausbau"
				],
				"innendekoration.jpg" : [
					"Innendekoration",
					"Dekoration"
				],
				"insulatinglining.jpg" : [
					"Isolierung"
				],
				"instrumentenbau.jpg" : [
					"Instrumentenbau"
				],
				"kanalisation.jpg" : [
					"Kanalisation"
				],		
				"kompressoren.jpg" : [
					"Kompressoren"
				],				
				"kuehlhausisolierung.jpg" : [
					"Kühlhausisolierung"
				],
				"kurzwaren.jpg": [
					"Kurzwaren"
				],
				"lackindustrie.jpg" : [
					"Lackindustrie"
				],
				"ladenbau.jpg" : [
					"Ladenbau"
				],				
				"Lagerbuchsen.jpg" : [
					"Lager"
				],
				"landwirtschaft.jpg" : [
					"Landwirtschaft",
					"Agrarindustrie"
				],
				"learningelements.jpg" : [
					"Schule und Kindergarten"
				],
				"lichttechnik.jpg" : [
					"Lichttechnik"
				],
				"maschinenbau.jpg" : [
					"Maschinenbau",
					"Maschinen- und Gerätebau",
					"Maschinen- und Apparatebau"
				],
				"mechanicalengineering.jpg" : [
					"Mechanik"
				],
				"medicalengineering.jpg" : [
					"Medizin",
					"Medizinaltechnik"
				],
				"messeundausstellungsstaende.jpg" : [
					"Laden- und Messebau"
				],
				"militarytechnology.jpg" : [
					"Militär"
				],
				"mining.jpg" : [
					"Mining"
				],
				"moebelbau.jpg" : [
					"Möbelbau"
				],
				"montageplatten.jpg" : [
					"Montageplatten"
				],
				"nassundfeuchtbereiche.jpg" : [
					"Nassbereiche"
				],
				"nuclearindustry.jpg" : [
					"Nuklearindustrie"
				],
				"orthopaedictechnology.jpg" : [
					"Orthopädie"
				],
				"offshore.jpg" : [
					"Offshore"
				],	
				"oilandgasindustry.jpg" : [
					"Öl und Gas"
				],	
				"outdoorapplications.jpg" : [
					"Outdoor"
				],				
				"packagingindustry.jpg" : [
					"Verpackung",
					"Verpackungsindustrie"
				],
				"paintindustry.jpg" : [
					"Farbenindustrie"
				],
				"paperindustry.jpg" : [
					"Papierindustrie"
				],	
				"pharmaceuticalindustry.jpg" : [
					"Pharmazie"
				],
				"portionieren.jpg" : [
					"Portionieren"
				],
				"powdercoating.jpg" : [
					"Pulverbeschichtung"
				],
				"pumpengineering.jpg" : [
					"Pumpen"
				],
				"produktdesign.jpg": [
					"Produktdesign"
				],
				"prototypenbau.jpg" : [
					"Prototypenbau"
				],
				"rehabilitation.jpg" : [
					"Reha"
				],
				"reinraum.jpg" : [
					"Reinraum"
				],
				"reusablecontainers.jpg": [
					"Aufbewahrung"
				],
				"safetyengineering.jpg" : [
					"Sicherheitstechnik"
				],
				"sanitaryengineering.jpg" : [
					"Sanitär"
				],
				"schienen.jpg" : [
					"Schienen"
				],
				"schnecke.jpg" : [
					"Schnecken"
				],
				"schmuck.jpg" : [
					"Schmuck"
				],
				"seals.jpg" : [
					"Dichtungen"
				],
				"seilrollen.jpg" : [
					"Rollen"
				],
				"siebdruckanwendungen.jpg" : [
					"Siebdruckanwendungen"
				],
				"spielwaren.jpg" : [
					"Spielwaren"
				],
				"splashbacksinpaintshops.jpg" : [
					"Spritzschutz"
				],
				"stampingpads.jpg" : [
					"Stempeln"
				],
				"steelindustry.jpg" : [
					"Stahlindustrie"
				],
				"technischeteile.jpg" : [
					"Technische Teile"
				],
				"textileindustry.jpg" : [
					"Textilindustrie",
					"Bekleidungsindustrie",
					"Textil- und Lackindustrie"
				],
				"transportationindustry.jpg" : [
					"Transportwesen"
				],
				"trays.jpg" : [
					"Behälter"
				],
				"umlenkscheiben.jpg" : [
					"Umlenkscheiben"
				],
				"energiewindraederetc.jpg" : [
					"Umwelttechnik"
				],
				"vacuumformingindustry.jpg" : [
					"Vakuumformen"
				],
				"ventilationtechnology.jpg" : [
					"Belüftung"
				],
				"verglasungen.jpg" : [
					"Verglasungen"
				],
				"verschleissschutz.jpg" : [
					"Verschleißschutz"
				],
				"verkleidungen.jpg" : [
					"Verkleidungen"
				],
				"zahnräder.jpg" : [
					"Zahnräder"
				],
			}
		},
		// material class images
		{
			subPath: "",
			fileToTermsMapping: {
				"compound.jpg": ["Verbundwerkstoffe"],
				"metall.jpg": ["Metalle"],
				"eisenmetall.jpg": ["Eisenmetalle"],
				"stahl.jpg": ["Stähle"],
				"werkzeugstahl.jpg": ["Werkzeugstähle"],
				"kaltarbeitsstahl.jpg": ["Kaltarbeitsstähle"],
				"warmarbeitsstahl.jpg": ["Warmarbeitsstähle"],
				"schnellarbeitsstahl.jpg": ["Schnellarbeitsstähle"],
				"kunststoffformenstahl.jpg": ["Kunststoffformenstähle"],
				"leichtmetall.jpg": ["Leichtmetalle"],
				"stein.jpg": ["Anorganisch-natürlich"],
				"keramik.jpg": ["Keramik"],
				"glas.jpg": ["Gläser"],
				"holz.jpg": ["Organisch-natürlich"],
				"leder.jpg": ["Tierische Stoffe"],
				"organisch-synthetisch.jpg": ["Organisch-synthetisch"],
				"elastomere.jpg": ["Elastomere"],
				"holz.jpg" : ["Holz"],
				"organisch-synthetisch.jpg" : ["Kunststoff","Kunststoffe"],
				"leder.jpg" : ["Tierische Werkstoffe"],
				"thermoplaste.jpg": ["Thermoplaste"],
				"duroplaste.jpg": ["Duroplaste"],
				"polyamid.jpg": ["Polyamid"],
				"polyester.jpg": ["Polyester"],
				"ausscheidungsprodukte.jpg": ["Ausscheidungsprodukte"],
				"pflanzlicheverbundwerkstoffe.jpg": ["Pflanzliche Verbundwerkstoffe"],
				"holzverbundwerkstoffe.jpg": ["Holzverbundwerkstoffe"],
				"graeser.jpg": ["Gräser"],
				"harzeundsaefte.jpg": ["Harze und Säfte"],
				"pflanzlichewerkstoffe.jpg" : ["Pflanzliche Werkstoffe","Pflanzliche Stoffe"]
			}
		}
	];

	/**
	 * Answers the image URL for the given term (may be a material class or an application area).
	 */
	const getImgURL = function(term){
		for (let j=0; j < dataSources.length; ++j){
			let imgLookup = dataSources[j];
			let hit = null;
			
			let files = Object.getOwnPropertyNames(imgLookup.fileToTermsMapping);
			for (let i=0; i < files.length; ++i){
				let file = files[i];
				if (imgLookup.fileToTermsMapping[file].indexOf(term) != -1) {
					hit = file;
					break;
				}
			}
			if (hit){
				return rootPath + imgLookup.subPath + hit;
			}
		}
		return null;
	};
	
	/* expose public interface */
	return {
		getImageURL : getImgURL,
		getDefaultImageURL : function(){
			return _def;
		}
	}
};