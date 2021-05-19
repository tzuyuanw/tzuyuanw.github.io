var routes;
var locationData;
var markers;

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
  //testData.routes[0]["BLVDDIR"]


  // use two for each to create marker 