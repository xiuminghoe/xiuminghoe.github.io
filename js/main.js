//global variables
var map; //map object
var mapLayers;

//begin script when window loads
window.onload = initialize(); //->

//the first function called once the html is loaded
function initialize() {
    //<-window.onload
    setMap(); //->
    
};

//set basemap parameters
function setMap() {
    //<-initialize()

    //create the map and set its initial view // singapore map
    map = L.map('map').setView([1.3521, 103.8198], 12);
    //map = L.map('map').setView([37.7777,-122.4407], 13);

    // indicate the scale of the map
    L.control.scale().addTo(map);

    //create the object storing all map layers
    mapLayers = {};

    //add the tile layer to the map
    mapLayers.baseLayer = L.tileLayer(
            'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
            ).addTo(map);

    mapLayers.baseLayer.name = "Base Layer";

    // Market Place data
    mapLayers.marketMarkers = new L.MarkerClusterGroup();

    //Extend the Default marker class
    var MarketMarkerIconNtuc = L.Icon.Default.extend({
        options: {
            iconUrl: 'img/icon-ntuc.png'
        }
    });

    var MarketMarkerIconCS = L.Icon.Default.extend({
        options: {
            iconUrl: 'img/icon-coldstorage.png'
        }
    });

    var MarketMarkerIconG = L.Icon.Default.extend({
        options: {
            iconUrl: 'img/icon-giant.png'
        }
    });

    var MarketMarkerIconOthers = L.Icon.Default.extend({
        options: {
            iconUrl: 'img/icon-others-marketplace.png'
        }
    });

    var marketMarkerIconNtuc = new MarketMarkerIconNtuc();
    var marketMarkerIconCS = new MarketMarkerIconCS();
    var marketMarkerIconG = new MarketMarkerIconG();
    var marketMarkerIconOthers = new MarketMarkerIconOthers();

    // determine which icon to display
    function iconStyle(feature) {
        var c = feature.properties.category;
        return c === "Giant" ? marketMarkerIconG :
                c === "Cold Storage" ? marketMarkerIconCS :
                c === "NTUC" ? marketMarkerIconNtuc :
                marketMarkerIconOthers;
    }

    $.get('data/marketplace.csv', function (csvContents) {
        var marketLayer = L.geoCsv(csvContents, {
            firstLineTitles: true,
            fieldSeparator: ',',
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: iconStyle(feature)});
            },
            onEachFeature: function (feature, layer) {
                html = "<table width='400'><col width='100'><col width='300'><tr><td><b>Market Place</b></td><td><b>" + feature.properties.category + "</b></td></tr><tr><td>Store Type</td><td>" + feature.properties.storetype + "</td></tr><tr><td>Operating Hours</td><td>" + feature.properties.operatinghours + "</td></tr><tr><td>Telephone</td><td>" + feature.properties.telephone + "</td></tr><tr><td>Address</td><td>" + feature.properties.address + "</td></tr></table>";
                layer.bindPopup(html);
            }
        });

        mapLayers.marketMarkers.addLayer(marketLayer);
        mapLayers.marketMarkers.addTo(map);
    });

    mapLayers.marketMarkers.name = "Market Place Point Data";

    // Shopping Malls data
    var mallMarker = L.AwesomeMarkers.icon({
        prefix: 'fa',
        icon: 'fa-shopping-cart',
        markerColor: 'blue'
    });

    mapLayers.mallLayer = new L.Shapefile('data/ShoppingMalls.zip', {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: mallMarker});
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.Malls + " (" + feature.properties.Region + ")");
//            if (feature.properties) {
//                layer.bindPopup(feature.properties.ShoppingMa + " (" + feature.properties.Region + ")");
//            }
        }
    }).addTo(map);

    // Train Station
    function trainStyle(feature) {
        if (feature.properties.mrt_line_e === "Downtown Line") {
            return {
                weight: 5,
                opacity: 0.3,
                color: '#000099',
            };
        } else if (feature.properties.mrt_line_e === "East West Line" || feature.properties.mrt_line_e === "Changi Airport Line") {
            return {
                weight: 6,
                opacity: 0.3,
                color: '#009900',
            };
        } else if (feature.properties.mrt_line_e === "Circle Line Extension") {
            return {
                weight: 6,
                opacity: 0.3,
                color: '#f6f91c',
            };
        } else if (feature.properties.mrt_line_e === "Circle Line") {
            return {
                weight: 6,
                //opacity: 0.3,
                color: '#cccc00',
            };
        } else if (feature.properties.mrt_line_e === "North South Line") {
            return {
                weight: 6,
                opacity: 0.3,
                color: '#f20649',
            };
        } else if (feature.properties.mrt_line_e === "Bukit Panjang LRT") {
            return {
                weight: 6,
                //opacity: 0.3,
                color: 'black',
            };
        } else if (feature.properties.mrt_line_e === "Punggol LRT") {
            return {
                weight: 6,
                //opacity: 0.3,
                color: 'black',
            };
        } else if (feature.properties.mrt_line_e === "North East Line") {
            return {
                weight: 6,
                opacity: 0.3,
                color: '#b522d9',
            };
        }
        return {// sengkang lrt
            weight: 6,
            //opacity: 0.3,
            color: 'black',
        };
    }

    mapLayers.trainLayer = new L.Shapefile('data/TrainStations.zip', {
        style: trainStyle,
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                layer.bindPopup(feature.properties.mrt_line_e);
            }
        }
    }).addTo(map);

    mapLayers.trainLayer.name = "Train Station Layer";

    // population area data
    var popAreaColour = d3.scale.linear()
            .domain([0, 290000])
            .range(["#f08080", "#c61313"]);

    $.getJSON('data/planningarea.geojson', function (data) {
        mapLayers.popAreaColourLayer = new L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                var population = feature.properties.areapopulation_POPULATION;
                if (population === null) {
                    population = 0;
                } else {
                    population = format(population);
                }
                layer.bindPopup(feature.properties.PLN_AREA_N + "</br> (population: " + population + ")");
            },
            style: function (feature) {
                var population = feature.properties.areapopulation_POPULATION;
                if (population === null) {
                    return {
                        fillColor: 'white',
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '',
                        fillOpacity: 0.7
                    }
                } else {
                    return {
                        fillColor: popAreaColour(feature.properties.areapopulation_POPULATION),
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '',
                        fillOpacity: 0.7
                    }
                }
            },
        });

        mapLayers.popAreaColourLayer.addTo(map);

        mapLayers.popAreaColourLayer.legend = L.control({position: 'bottomright'});

        mapLayers.popAreaColourLayer.legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend panel');

            div.innerHTML +=
                    '<center><p><b>Count</b></br>(by MarketPlace)</p>' +
                    '<i style="background:white"></i> 0 <br />' +
                    '<i style="background:' + popAreaColour(21450) + '"></i> 10 - 21450 <br />' +
                    '<i style="background:' + popAreaColour(100260) + '"></i> 21450 - 100260 <br />' +
                    '<i style="background:' + popAreaColour(154480) + '"></i> 100260 - 154480 <br />' +
                    '<i style="background:' + popAreaColour(222870) + '"></i> 154480 - 222870 <br />' +
                    '<i style="background:' + popAreaColour(287170) + '"></i> 222870 - 287170 <br />';
                    '</center>';

            return div;
        };

        mapLayers.popAreaColourLayer.legend.addTo(map);

        // after everything is loaded, we want to set layer control
        $(document).one('ajaxStop', function () {
            loadMarketCountLayer();
            
            $.each(['mallLayer', 'trainLayer', 'popAreaColourLayer'], function (index, value) {
                map.removeLayer(mapLayers[value]);
            });
        });

    });

    // bind an event to allow users to on/off a layer
    $(".visible").click(function (event) {
        var mapID = $(this).attr('id');
        // toggle it off
        if ($(this).hasClass('on')) {
            map.removeLayer(mapLayers[mapID]);
            $(this).removeClass('on');
            $(this).addClass('off');
        } else {
            // toggle it on
            map.addLayer(mapLayers[mapID]);
            $(this).removeClass('off');
            $(this).addClass('on');
        }
    });

}

function format(num) {
    var n = num.toString(), p = n.indexOf('.');
    return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, function ($0, i) {
        return p < 0 || i < p ? ($0 + ',') : $0;
    });
}

console.log("My first geoweb mapping application");
