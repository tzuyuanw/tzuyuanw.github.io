//Set up map
var map = L.map('map', {
    center: [39.98, -75.16],
    zoom: 12
});
  
var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(map);

//Global Variables
var stationDataURL = "https://kiosks.bicycletransit.workers.dev/phl";
var stationData;
var stationMarker;

//Functions
var makeMarkers = function(data) {
    return _.map(data,function(station){
        var lat = station.geometry.coordinates[1];
        var lng = station.geometry.coordinates[0];
        console.log([station.geometry.coordinates[0],station.geometry.coordinates[1]]);
        return L.marker([lat,lng]).bindPopup(station.properties.name);
    })
};

var plotMarkers = function(marker) {
    _.each(marker,function(marker){
        marker.addTo(map);
    })
};



//load data
$.when($.ajax(stationDataURL)).then(function(stationRes){
    stationData = stationRes;
    stationMarker = makeMarkers(stationData.features);
    plotMarkers(stationMarker);


})