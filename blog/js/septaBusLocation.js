var routes;
var locationData;
var locationDataClean;
var locationDataFilter;
var markers;
var circles;
var condition;
var selectedRoute = "all";
var selectedRouteStop;
var routeSelectionHTML = "<option selected value='all'>Select a Route</option><option value='all'>All</option>";
var busInfoHTML = "";
var dataURL = "https://www3.septa.org/hackathon/TransitViewAll/";

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

var customMarker= L.Icon.extend({
    options: {
        shadowUrl: null,
        iconAnchor: new L.Point(12, 24),
        iconSize: new L.Point(24, 24),
        iconUrl: 'geo-alt.svg'
    }
  }); 


//FUNCTIONS
var cleanData = function(data){
    locationData = data.routes[0];
    routes = Object.keys(data.routes[0])                // create an array of routes
    routes.forEach(function(route){                     // add routes to location data
        locationData[route].forEach(function(data){
            data.route = route
        })
    })
    locationDataClean = _.compact(_.flatten(_.unzip(locationData)));
    locationDataClean = locationDataClean.filter(function(data){
        return data.VehicleID != "0";
    })
}

var filterData = function(data, route){
    if(route === "all"){
        return data;
    }else{
        return data.filter(function(bus){
            return bus.route == route;
        })
    }
}

var makeMarkers = function(data) {
    return _.map(data,function(bus){
        var lat = bus.lat;
        var lng = bus.lng;
        return L.marker([lat,lng],{icon: new customMarker()}).bindPopup(bus.route);
    })
};

var makeCircles = function(data) {
    return _.map(data,function(stop){
        var lat = stop.lat;
        var lng = stop.lng;
        return L.circle([lat,lng],{radius:10})
    })
}

var plot = function(marker) {
    _.each(marker,function(marker){
        marker.addTo(map);
    })
};

var remove = function(marker){
    _.each(marker,function(marker){
        map.removeLayer(marker);
    })
};

var getdata = function(){
    $.ajax({
        url: "https://www3.septa.org/hackathon/TransitViewAll/",
        dataType: "jsonp",
        success: function(data){
            remove(markers);
            cleanData(data);
            locationDataFilter = filterData(locationDataClean,selectedRoute);
            markers = makeMarkers(locationDataFilter);
            plot(markers);
            makeVehicleCard(locationDataFilter);
            makeSelectHTML(routes);
            $('#routeSelection').empty().append(routeSelectionHTML);        //update route selection list 
            console.log("update");
            condition = routes.filter(function(data){   //If selected routes still in list  
                return data == selectedRoute
            }).length ==1;

            if(condition){                              //route number still present  
                $('#routeSelection').val(selectedRoute);
            }else{                                      //route number does not exist 
                $('#routeSelection').val("all");
            }
        }
    });
}

var makeSelectHTML = function(routes){
    routeSelectionHTML = "<option selected value='all'>Select a Route</option><option value='all'>All</option>";
    routes.forEach(function(route){
        routeSelectionHTML = routeSelectionHTML + '<option value="' + route + '">' + route + '</option>'
    })
}

var makeVehicleCard = function(bus){
    busInfoHTML = "";
    if(selectedRoute == "all"){
        busInfoHTML = "";
    }else{
        bus.forEach(function(data){
            if(data.estimated_seat_availability == "NOT_AVAILABLE"){
                var seatAvailability = "No Information"
                var badgeType = "bg-light"
            }
            if(data.estimated_seat_availability == "MANY_SEATS_AVAILABLE"){
                var seatAvailability = "Many Seats Available"
                var badgeType = "bg-success"
            }
            if(data.estimated_seat_availability == "FEW_SEATS_AVAILABLE"){
                var seatAvailability = "Few Seats Available"
                var badgeType = "bg-warning"
            }
            if(data.estimated_seat_availability == "STANDING_ROOM_ONLY"){
                var seatAvailability = "Standing Room Only"
                var badgeType = "bg-danger"
            }
            busInfoHTML = busInfoHTML + "<div class='card' style='width: 300 px;'><div class='card-body'>" + 
                "<h5 class='card-title'>" + data.route + "</h5>" + 
                "<h6 class='card-subtitle mb-2 text-muted'> To " + data.destination + "</h6>" +
                "<p class='card-text'>Next: " + data.next_stop_name + "<br>" +
                "Seats Available: <span class='badge " + badgeType + " text-dark'>" + seatAvailability + "</span></p>" +
                "</div></div>"
        })
    }
    $('#busInfo').empty().append(busInfoHTML);
}

var addStops = function(route){
    remove(circles);
    if(route != "all"){
        var stopURL = "http://www3.septa.org/hackathon/Stops/?req1=" + route + "&callback=?"
        console.log(stopURL);
        $.ajax({
            url: stopURL,
            dataType: "jsonp",
            success: function(data){
                selectedRouteStop = data;
                circles = makeCircles(selectedRouteStop);
                plot(circles);
            }
        });
    }else{
        //do nothing
    }

}


$(document).ready(function(){
    $.when($.ajax({url: dataURL, dataType: "jsonp"})).then(function(data){
        cleanData(data);
        markers = makeMarkers(locationDataClean);
        plot(markers);
        makeSelectHTML(routes);
        $('#routeSelection').empty().append(routeSelectionHTML);
        setInterval(getdata, 20000);
        $('#routeSelection').on('change', function() {
            selectedRoute = $("#routeSelection").val();
            locationDataFilter = filterData(locationDataClean,selectedRoute);
            remove(markers);
            markers = makeMarkers(locationDataFilter);
            plot(markers);
            addStops(selectedRoute);
            makeVehicleCard(locationDataFilter);
        });

    })
});


/* 
Possible functions:
filter by route --- DONE
    use bootstrap select
    build html in js 
Update route selector list after each ajax call --- DONE 
Add bus information to sidebar --- DONE
Add stop location --- DONE
read in gtfs from github 
plot stop location using gtfs 
plot route line using gtfs
link to pdf schedule? 
add gtfs schedule 

$.ajax({
        url: "https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/LiveBoard/KLRT?$format=JSON",
        success: function(data){
            metro = data;
        }
    });
*/