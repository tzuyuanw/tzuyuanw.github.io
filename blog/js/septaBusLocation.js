var routes;
var locationData;
var markers;

//Set up map
var map = L.map('map', {
    center: [39.9430, -75.201388],
    zoom: 13,
    zoomControl: false
});

var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
}).addTo(map);
new L.Control.Zoom({ position: 'topright' }).addTo(map);


//FUNCTIONS
var cleanData = function(data){
    locationData = data.routes[0];
    routes = Object.keys(data.routes[0]) // create an array of routes
    routes.forEach(function(route){                     // add routes to location data
        locationData[route].forEach(function(data){
            data.route = route
        })
    })
    
}



$.ajax({
    url: "https://www3.septa.org/hackathon/TransitViewAll/",
  
   dataType: "jsonp",
    success: function(data){
      cleanData(data);
    }
  }); 



  // use two for each to create marker 