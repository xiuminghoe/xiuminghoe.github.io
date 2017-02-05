function loadMarketCountLayer() {
    
    $.getJSON('data/marketplace.json', function (marketData) {
        
        var marketOptions = {
            recordsField: null,
            latitudeField: 'location.1',
            longitudeField: 'location.0',
            chartOptions: {
                'NTUC': {
                    displayName: 'NTUC',
                    color: 'hsl(357,65%,47%)',
                    fillColor: 'hsl(358,75%,54%)',
                },
                'GIANT': {
                    displayName: 'GIANT',
                    color: 'hsl(43,99%,41%)',
                    fillColor: 'hsl(43,100%,49%)'
                },
                'COLDSTORAGE': {
                    displayName: 'COLDSTORAGE',
                    color: 'hsl(138,56%,30%)',
                    fillColor: 'hsl(137,55%,38%)',
                },
                'OTHERS': {
                    displayName: 'OTHERS',
                    color: 'hsl(219,100%,21%)',
                    fillColor: 'hsl(220,100%,28%)',
                }
            },
            layerOptions: {
                fillOpacity: 1,
                opacity: 1,
                weight: 1,
                radius: 25,
                barThickness: 15
            },
            tooltipOptions: {
                iconSize: new L.Point(120, 80),
                iconAnchor: new L.Point(-5, 60)
            }
            ,
            onEachRecord: function (layer, record) {
                html = "<div>";
                
                html += "<h6>MarketPlace counts:</h6>";
                
                html += "<ul class='count_list'>";
                html += "<li> NTUC: " + record.NTUC + "</li>";
                html += "<li> Cold Storage: " + record.COLDSTORAGE + "</li>";
                html += "<li> Sheng Shiong: " + record.GIANT + "</li>";
                html += "<li> Others: " + record.OTHERS + "</li>";
                
                html += "</ul>";
                
                html += "</div>";
                $html = $(html);
                
                layer.bindPopup($html.wrap('<div/>').parent().html(), {
                    minWidth: 160,
                    maxWidth: 160
                });
            },
            legendOptions: {
                title: 'Market Place Count by Type of Supermarket'
            }
        };
        
        mapLayers.marketProportionalSymbolLayer = new L.PieChartDataLayer(marketData, marketOptions);

        map.addLayer(mapLayers.marketProportionalSymbolLayer);

    });

}