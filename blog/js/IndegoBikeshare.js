//Set up map
var map = L.map('map', {
    center: [39.9450, -75.201388],
    zoom: 13,
    zoomControl: false
});

var customMarker= L.Icon.extend({
    options: {
        shadowUrl: null,
        iconAnchor: new L.Point(12, 24),
        iconSize: new L.Point(24, 24),
        iconUrl: 'geo-alt.svg'
    }
  }); 
  
 

var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(map);
new L.Control.Zoom({ position: 'topright' }).addTo(map);

//Global Variables
var stationDataURL = "https://kiosks.bicycletransit.workers.dev/phl";
var stationData;
var stationMarkers;
var selectedStation;
var usageData;

//Functions
var makeMarkers = function(data) {
    return _.map(data,function(station){
        var lat = station.geometry.coordinates[1];
        var lng = station.geometry.coordinates[0];
        return L.marker([lat,lng],{icon: new customMarker()}).bindPopup(station.properties.name);
    })
};

var plotMarkers = function(marker) {
    _.each(marker,function(marker){
        marker.addTo(map);
    })
};

var markerClicked = function(e){
    //find clicked marker
    selectedMarker = stationMarkers.filter(function(data){
        return data._leaflet_id === e.currentTarget._leaflet_id - 1 ;
    });
    selectedLat = selectedMarker[0]._latlng.lat;
    console.log(selectedMarker);
    console.log(selectedLat);
    selectedStation = stationData.features.filter(function(data){
        return data.geometry.coordinates[1] === selectedLat;
    })
    //update infoCardInformation
    updateInfoCard(selectedStation);
    updateUsageGraph(selectedStation);
}

var updateInfoCard = function(data){
    console.log(data[0].properties);
    $('#unavailable').hide();       //hide alert
    $('#noBike').hide();            //hide alert
    $('#noDock').hide();            //hide alert
    var name = data[0].properties.name;
    var status = data[0].properties.kioskPublicStatus;
    var bikesAvailable = data[0].properties.bikesAvailable;
    var electricBikesAvailable =  data[0].properties.electricBikesAvailable;
    var docksAvailable = data[0].properties.docksAvailable
    if(status == "Unavailable"){            //if station unavailable
        bikesAvailable = "--";
        electricBikesAvailable = "--";
        docksAvailable = "--";
        $('#unavailable').show();
    }
    if(bikesAvailable == 0 && electricBikesAvailable == 0){     //if no bikes available
        $('#noBike').show();
    }
    if(docksAvailable == 0){                                    // if no docks available
        $('#noDock').show();
    }
    $('#results').show();
    $('#results').empty().append('<div id="' + name + '" style="margin-top:50px;margin-bottom:50px;"><strong style="font-size: x-large">' + name + '</strong>' + 
        '<br>Current Status: ' + status + 
        '<br>Number of Bikes Available: <strong style="font-size: large">' + bikesAvailable + '</strong>' + 
        '<br>Number of Electric Bikes Available: <strong style="font-size: large">' + electricBikesAvailable + '</strong>' + 
        '<br>Number of Docks Available: <strong style="font-size: large">' + docksAvailable + '</strong>'
    );
}

var updateUsageGraph = function(data){
    
}

//load page
$(document).ready(function() {
    $('#openModal').modal('show');
    $.when($.ajax(stationDataURL)).then(function(stationRes){
        stationData = stationRes;
        stationMarkers = makeMarkers(stationData.features);
        plotMarkers(stationMarkers);
        $('#loading').hide();
        $('.leaflet-marker-icon').click(function(e){
            markerClicked(e);
        })
    })
});
