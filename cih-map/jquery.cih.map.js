(function( $ ){
    $.fn.extend({ 
    	singlePointInterface: function(options)
    	{
    		options =  $.extend(defaultConfig(), options);
    	},
    	
    	singleLineInterface: function(options)
    	{
    		options =  $.extend(defaultConfig(), options);
    	},
    	
        singlePolygonInterface: function(options)
        {
        	// Configuração padrão.
            options =  $.extend(defaultConfig(), options);
            
            createDialog(options);
        }
    });
    
    function createDialog (options)
    {
    	$('#' + options.uiBodyDiv).remove();

    	$('<div></div>').attr('id', options.uiBodyDiv)
    		.attr('title', options.dialogTitle)
    		.html(
    			$("<div></div>")
    				.attr('id'		, options.uiContentDiv)
    				.css("margin" 	, 0)
    				.css("padding"	, 0)
    				.addClass('cih-map-content-div')
    				.html(
    					createDivMapContent(options)
    				)
    		)
    		.dialog({
				width		: options.dialogWidth,
				height		: options.dialogHeight,
				modal		: options.dialogModal,
				resizable	: options.dialogResizable
    		}
    	);
    	
    	// Instance the OpenLayers.Map object.
    	options.mapObject = new OpenLayers.Map(options.mapDivId, options.mapOptions);
    	
    	buildSearchBar (options);
    	
    	// Add commons layers.
    	options.mapObject.addLayers(registryCommonsLayers(options));
    	// Add user layers.
    	options.mapObject.addLayers(options.mapExtraLayers);
    	
    	// Add commons informations of map.
    	createBottonMapInformations(options);
    	// Add commons map controls.
    	options.mapObject = registryCommonsMapControls(options);
    	
    	// Center map view in lon-lat pair.
    	options.mapObject.setCenter(
    		new OpenLayers.LonLat(options.mapDefaultLongitude, options.mapDefaultLatitude), options.defaultZoomLevel
    	);
    	
    	createDefaultCloseButton(options);
    } // fim-function...
    
    function createDefaultCloseButton (options)
    {
    	$("#cih-map-bottom-map-information").last().append(
			$("<td>").html(
				$("<input>")
					.attr('type'	, 'button')
					.attr('id'		, 'button-close-dialog')
					.attr('class'	, 'submit')
					.attr('value'	, options.dialogButtonClose)
					.bind('click'	, function(){
						$('#' + options.uiBodyDiv).dialog('close');
					})
			)
		);
    	
    	return options;
    }
    
    function createBottonMapInformations (options)
    {
    	$("#table_linha3__").html(
    		$("<table>").html(
    			$("<tr>")
    		).attr('id', 'cih-map-bottom-map-information')
    		.attr('border', 1) //FIXME remove after
    	);
    	
		if(options.showLonLatOnMapClick == true)
		{
			$("#cih-map-bottom-map-information").append(
				$("<td>").html(
					$("<div>")
						.attr('id', 'cih-map-box-lonlat')
						.css('font-size', 12)
						.addClass('cih-map-box-lonlat')
				).append(
					$("<input>")
						.attr('type'	, 'text')
						.attr('id'		, 'cih-map-box-lonlat-clicked')
						.attr('class'	, 'cih-map-box-lonlat')
						.attr('size'	, 26)
						.css('font-size', 12)
						.bind('blur'	, function(){
							$(this).hide();
						})
						.hide()
				).attr('width', '30%')
			);
			options.mapObject.events.register("click", options.mapObject, function(evt)
			{
				var ponto 		= options.mapObject.getLonLatFromPixel(evt.xy);
			    var convertido 	= ponto.transform( options.mapObject.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));
			    
			    $("#cih-map-box-lonlat-clicked").attr('value', convertido.lon + ", " + convertido.lat).show().select();
	        });
		}
		
		if(options.showMapScale == true)
		{
			$("#cih-map-bottom-map-information").last().append(
				$("<td>").html(
					$("<div>")
						.attr('id', 'cih-map-box-scale')
						.css('font-size', 12)
						.addClass('cih-map-box-scale')
				)
			);
		}
		
		if(options.showMapProjection == true)
		{
			$("#cih-map-bottom-map-information").last().append(
				$("<td>").html(
					$("<div>")
						.attr('id', 'cih-map-box-scale')
						.css('font-size', 12)
						.addClass('cih-map-box-scale')
						.html(
							options.mapObject.getProjectionObject().getCode()
						)
				)
			);
		}
    }
    
    function buildSearchBar (options)
    {
    	$("#table_linha1__").html(
    		$("<table>")
    			.attr('class', 'cih-map-table-search-form')
    			.attr('id', 'cih-map-table-search-form')
    			
    			.last().html(
		    		$("<tr>").html(
		    			$("<td>").html(
		    				$("<label>").html(options.searchLocationLabelText + "<br/>").append(
		    					$("<input/>")
		    						.attr('type'	, 'text')
		    						.attr('size'	, 50)
		    						.attr('id'		, 'referencia_consulta')
		    						.attr('class'	, 'cih-map-search-input')
		    						.focus()
		    						.bind('keypress', function(event){
		    							var code = (event.keyCode ? event.keyCode : event.which);
		    							
		    							if(code == 13)
		    							{
		    								addressSearchActionListener(options);
		    								event.preventDefault();
		    							}
		    						})
		    				)
		    			)
		    		).append(
						$("<td>").html(
							$("<input/>")
								.attr('type'	, 'button')
								.attr('id'		, 'button-busca-location')
								.attr('class'	, 'cih-map-search-button')
								.attr('value'	,options.searchLocationButtonText)
								.bind('click', function(){
									addressSearchActionListener(options);
								})
		    			).append(
		    				"&nbsp;"
		    			).append(
							$("<input/>")
								.attr('type'	, 'button')
								.attr('id'		, 'button-limpa-busca')
								.attr('class'	, 'cih-map-search-button')
								.attr('value'	,options.searchLocationButtonLimpar)
								.bind('click', function(){
									$('#cih-map-result-id').remove();
									$('#referencia_consulta').attr('value', '').focus();
								})
					    )
		    		).append(
		    			$("<td>").append(
			    			$("<label>")
		    				.html(options.layerCamada + ":" + "<br/>")
		    				.append(
				    			$("<select>")
				    				.attr('id'		, 'select-layer-op')
				    				.attr('class'	, 'cih-map-search-select-change-layer')
				    				.append(
			    						$("<option/>")
			    							.attr('value', 0)
			    							.attr('text' , options.layerGoogleHybrid)
				    				).append(
			    						$("<option/>")
			    							.attr('value', 1)
			    							.attr('text' , options.layerGoogleStreets)
				    				).append(
			    						$("<option/>")
			    							.attr('value', 2)
			    							.attr('text' , options.layerGooglePhysical)
				    				).append(
			    						$("<option/>")
			    							.attr('value', 3)
			    							.attr('text' , options.layerGoogleSatellite)
				    				).append(
			    						$("<option/>")
			    							.attr('value', 4)
			    							.attr('text' , options.layerOpenStreetMap)
				    				).bind('change', function(){
				    					var layer = options.mapObject.layers[ parseInt( $(this).attr('value')) ];
				    					options.mapObject.setBaseLayer(layer);
				    				})
				    		)
	    				)
		    		)	
		    	)
    	);
    }
    
    function addressSearchActionListener (options)
    {
    	var query = $('#referencia_consulta').attr('value');
		
		if(query.length > 0)
		{
			$('#result-consulta-localizacao').html(
				'<center><img src="/sigbiogas/js/cih-map/img/ajax.gif" atl="ajax"/><br/>' + 
				instancia.getOptions().searchLocationProcessandoConsulta + '</center>'
			);
			
			var cihlocation = new CIHLocationSearch();
			
			cihlocation.executeSearch(instancia, query);
		}
		else
		{
			// Add the error row for user.
			$('#cih-map-table-search-form').last().append(
				$("<tr>")
					.attr('id', 'cih-map-result-id')
					.html(
					$("<td>")
						.attr('colspan', 3)
						.html(
							$("<div>")
								.attr('id', 'result-consulta-localizacao')
								.html(
									"<p>" + 
									"<span>" + options.searchLocationInformeUmTermoAviso + "</span>" +
									"<br/>" +
									options.searchLocationInformeUmTermoParaConsulta +
									"</p>"
								)
						)
				)
	    	);
		}
    }
    
    function registryCommonsMapControls (options)
    {
    	var layerSwitcher = new OpenLayers.Control.LayerSwitcher({
			id				: 'layer-switcher',
			ascending		: false,
			roundedCorner	: true
		});
		
		var panZoom = new OpenLayers.Control.PanZoomBar	({
			id: 'pan-zoom',
			activate:true
		});
		
		var mousePosition = new OpenLayers.Control.MousePosition({
			id	: 'mouse-position',
			div	: document.getElementById("cih-map-box-lonlat")
		});
		
		var scaleLine = new OpenLayers.Control.ScaleLine({
			id	: 'scale-line',
			div	: document.getElementById("cih-map-box-scale")
		});
		
		var navigation = new OpenLayers.Control.Navigation({
			id: 'navigation',
			zoomWheelEnabled: true
		});
		
		options.mapObject.addControl (panZoom);
		options.mapObject.addControl (layerSwitcher);
		options.mapObject.addControl (mousePosition);
		options.mapObject.addControl (scaleLine);
		options.mapObject.addControl (navigation);
		
		return options.mapObject;
    }
    
    function registryCommonsLayers (options)
	{
		var gmap = new OpenLayers.Layer.Google(
			options.layerGoogleStreets,
            {
				numZoomLevels		: 20,
				'sphericalMercator'	: true
			}
        );
        var ghyb = new OpenLayers.Layer.Google(
        	options.layerGoogleHybrid,
            {
				type				: G_HYBRID_MAP, 
				numZoomLevels		: 20,
				'sphericalMercator'	: true
			}
        );
        var gsat = new OpenLayers.Layer.Google(
        	options.layerGoogleSatellite,
            {
				type				: G_SATELLITE_MAP, 
				numZoomLevels		: 22,
				'sphericalMercator'	: true
			}
        );
		var gphy = new OpenLayers.Layer.Google(
			options.layerGooglePhysical,
            {
				type				: G_PHYSICAL_MAP,
				numZoomLevels		: 22,
				'sphericalMercator'	: true
			}
        );
        
		var mapnik = new OpenLayers.Layer.OSM();
		
		return [ghyb, gmap, gphy, gsat, mapnik];
	}
    
    function createDivMapContent (options)
	{
		var div = "	<div id='" + options.mapDivId + "' style='width:100%; height:290px; margin:0px; padding:0px;'>&nbsp;</div>";
		
		var table = "<table border='0' width='100%'>";
		table += "<tr><td><div id='table_linha1__'></div></td></tr>";
		table += "<tr><td><div id='table_linha1_1__'></div><div id='table_linha1_1_1__'></div></td></tr>";
		table += "<tr><td><div id='table_linha2__'>" + div + "</div></td></tr>";
		table += "<tr><td><div id='table_linha3__'></div></td></tr>";
		table += "<tr><td><div id='table_linha4__'></div></td></tr>";
		table += "</table>";
		
		return table;
	};
    
    /**
     * Returns all default configs.
     */
    function defaultConfig()
    {
    	return {
    		dialogTitle			: $.msg('cih.map.dialog.title'),
    		dialogWidth			: 800,
    		dialogHeight		: 550,
    		dialogModal			: true,
    		dialogResizable		: false,
    		dialogButtonClose	: $.msg('cih.map.button.close.dialog'),
    		
    		searchLocationLabelText							: $.msg('cih.map.search.location.label.text'),
    		searchLocationButtonText						: $.msg('cih.map.search.button.search'),
    		searchLocationButtonLimpar						: $.msg('cih.map.search.button.limpar'),
    		searchLocationNenhumResultadoEncontradoTitulo	: $.msg('cih.map.search.resultado.nenhum.titulo'),
    		searchLocationNenhumResultadoEncontrado			: $.msg('cih.map.search.resultado.nenhum.mensagem'),
    		searchLocationProcessandoConsulta				: $.msg('cih.map.search.processando.consulta'),
    		searchLocationInformeUmTermoAviso				: $.msg('cih.map.search.informe.um.termo.aviso'),
    		searchLocationInformeUmTermoParaConsulta		: $.msg('cih.map.search.informe.um.termo.para.a.consulta'),
    		
    		mapInformationLatitude		: $.msg('cih.map.latitude'),
    		mapInformationLongitude		: $.msg('cih.map.longitude'),
    		mapInformationCoordenadas	: $.msg('cih.map.coordenada'),
    		mapInformationEscala		: $.msg('cih.map.escala'),
    		mapInformationProjecao		: $.msg('cih.map.projecao'),

    		googleApiKey				: 'ABQIAAAAaXpf-8iMc3MLup8v6WaqthQ3SC50Hc0sl7Yq_pGrWTQnWkV8KBTHqmY0IHnj_7Z_UTwLNY0GNWbkWg',
    		defaultZoomLevel			: 10,
    		defaultSearchZoomLevel		: 11,
    		defaultGeometryAddZoomLevel	: 11,
    		
    		layerCamada			: $.msg('cih.map.layer.label'),
    		layerGoogleHybrid	: $.msg('cih.map.layer.google.hybrid'),
    		layerGoogleSatellite: $.msg('cih.map.layer.google.satellite'),
    		layerGoogleStreets	: $.msg('cih.map.layer.google.streets'),
    		layerGooglePhysical	: $.msg('cih.map.layer.google.physical'),
    		layerOpenStreetMap	: $.msg('cih.map.layer.openstreet.maps'),
    		
    		layerBingMapShaded	: 'Bing Shaded Map',
    		layerBingMapHybrid	: 'Bing Hybrid Map',
    		layerBingMapAerial	: 'Bing Aerial Map',
    		
    		totalFeatures				:1,
    		lineStringHTMLInputId		: '#linestring',
    		lineStringHTMLWriteToId		: '#linestring',
    		lineStringHTMLReadToId		: '#linestring',
    		
    		singlePointInputReadWriteX	: '#pontoX',
    		singlePointInputReadWriteY	: '#pontoY',
    		
    		geometryButtonAddGeometry		: $.msg('cih.map.geometry.button.add'),
    		geometryButtonRemoveGeometry	: $.msg('cih.map.geometry.button.remove'),
    		geometryButtonNavegateGeometry	: $.msg('cih.map.geometry.button.navegate'),
    		geometryInputReadWrite			: '#wkt',
    		geometryWKTDisplayReadOnly		: '#wkt_display',
    		
    		geometryAfterLoadMap			: function(instancia){},
    		
    		// core
    		uiBodyDiv	: 'cih-map_uiBodyDiv___',
    		uiContentDiv: 'cih-map_uiContentDiv__',
    		mapDivId	: 'cih-map_mapDiv__',
    		
    		mapWidth	: '100%',
    		mapHeight	: '290px',
    		mapObject	: null,
    		
    		mapOptions	: {
				controls:[],
				maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34),
				projection		 : new OpenLayers.Projection("EPSG:900913"),
				displayProjection: new OpenLayers.Projection("EPSG:4326"),
				Z_INDEX_BASE: {
					BaseLayer	: 0,
					Overlay		: 32,
					Feature		: 72,
					Popup		: 75,
					Control		: 90
				}
			},
			mapExtraLayers		: {},
			mapDefaultLongitude	: -6067265.55632, 
			mapDefaultLatitude	: -2935181.88574,
			showLonLatOnMapClick: true,
			showMapScale		: true,
			showMapProjection	: true
    	};
    }
    
    // funções internas.
})( jQuery );