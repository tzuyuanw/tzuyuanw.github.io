//Set up map
var map = L.map('map', {
    center: [39.9430, -75.201388],
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
var selectedOD;
var stationLines;
var selectedLines = [];
//var usageData;

//Functions
var makeMarkers = function(data) {
    return _.map(data,function(station){
        var lat = station.geometry.coordinates[1];
        var lng = station.geometry.coordinates[0];
        return L.marker([lat,lng],{icon: new customMarker()}).bindPopup(station.properties.name);
    })
};

var makeLines = function(data){
    return _.map(data,function(OD){
        var latlngs = [
            [OD.start_lat, OD.start_lon],
            [OD.end_lat, OD.end_lon]
        ];
        return L.polyline(latlngs,{opacity: Math.max(OD.count/100, 0.2)})
    })
}
//196

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

//find clicked marker
var findClickedMarker = function(e){
    selectedMarker = stationMarkers.filter(function(data){
        return data._leaflet_id === e.currentTarget._leaflet_id - 1 ;
    });
    selectedLat = selectedMarker[0]._latlng.lat;
    console.log(selectedMarker);
    selectedStation = stationData.features.filter(function(data){
        return data.geometry.coordinates[1] === selectedLat;
    })
    return selectedStation;
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
    var selectedUsageData = usageData.filter(function(usageData){
        return usageData.stationID == data[0].properties.id
    });
    if(selectedUsageData.length != 0){
        var avgTripStart = selectedUsageData[0].dailyTripStart.toFixed(1);
        var avgTripEnd = selectedUsageData[0].dailyTripEnd.toFixed(1);

    }
    if($('#liveView').is(":checked")){                          //if in live view 
        if(status == "Unavailable"){                                //if station unavailable
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
        $('#results').empty().append('<div id="' + name + '" style="margin-top:50px;margin-bottom:50px;"><strong style="font-size: x-large"></br>' + name + '</strong>' + 
            '<br>Current Status: ' + status + 
            '<br>Number of Bikes Available: <strong style="font-size: large">' + bikesAvailable + '</strong>' + 
            '<br>Number of Electric Bikes Available: <strong style="font-size: large">' + electricBikesAvailable + '</strong>' + 
            '<br>Number of Docks Available: <strong style="font-size: large">' + docksAvailable + '</strong>'
        );
    }else{                                                      //if in data view

        if(avgTripStart == undefined){
            $('#results').show();
            $('#results').empty().append('<div id="' + name + '" style="margin-top:50px;margin-bottom:50px;"><strong style="font-size: x-large">' + name + '</strong>' + 
                '<br>No data available.'
            );
        }else{
            var tripsRank1 = (selectedOD[selectedOD.length - 1].count / 90).toFixed(1);
            var tripsRank2 = (selectedOD[selectedOD.length - 2].count / 90).toFixed(1);
            var tripsRank3 = (selectedOD[selectedOD.length - 3].count / 90).toFixed(1);
            var stationRank1 = stationData.features.filter(function(data){
                                    return data.properties.kioskId == selectedOD[selectedOD.length - 1].end_station;
                                })[0].properties.name;
            var stationRank2 = stationData.features.filter(function(data){
                                    return data.properties.kioskId == selectedOD[selectedOD.length - 2].end_station;
                                })[0].properties.name;
            var stationRank3 = stationData.features.filter(function(data){
                                    return data.properties.kioskId == selectedOD[selectedOD.length - 3].end_station;
                                })[0].properties.name;
            $('#results').show();
            $('#results').empty().append('<div id="' + name + '" style="margin-top:50px;margin-bottom:50px;"><strong style="font-size: x-large"></br>' + name + '</strong>' + 
                '<br>According to data from January to March 2021: ' + 
                '<br><strong style="font-size: large">' + avgTripStart + '</strong> trips originate daily from this station.' +
                '<br><strong style="font-size: large">' + avgTripEnd + '</strong> trips end daily at this station.' + 
                '<br>' + 
                '<br><br><p><b>Top three destination by average daily trips:</b></p>' +
                '<div class="table"><table class="table">' + 
                '<thead><tr><th scope="col">Rank</th><th scope="col">Destination</th><th scope="col">Trips</th></tr></thead>' + 
                '<tbody><tr><th scope="row">1</th><td>' + stationRank1 + '</td><td>' + tripsRank1 + '</td></tr>'+
                '<tr><th scope="row">2</th><td>' + stationRank2 + '</td><td>' + tripsRank2 + '</td></tr>' +
                '<tr><th scope="row">3</th><td>' + stationRank3 + '</td><td>' + tripsRank3 + '</td></tr></tbody></table></div></div>'
            );
        }
    }
}

var getdata = function(){
    $.ajax({
        url: stationDataURL,
        success: function(data){
            stationData = data;
            console.log("getting new data");
        }
    })
}

var filterOD = function(indegoOD){
    var sortedIndegoOD = indegoOD.filter(function(data){
        return data.start_station == selectedStation[0].properties.id
    })
    sortedIndegoOD = _.sortBy(sortedIndegoOD, 'count');

    return sortedIndegoOD;
}

//load page
$(document).ready(function() {
    $('#openModal').modal('show');
    $.when($.ajax(stationDataURL)).then(function(stationRes){
        stationData = stationRes;
        stationMarkers = makeMarkers(stationData.features);
        plot(stationMarkers);
        $('#loading').hide(); //hide load spinner when done plotting 
        //For when switching between views after a marker is clicked
        $('#dataView').click(function(e){
            if(selectedStation != undefined){
                remove(selectedLines);
                selectedOD = filterOD(indegoOD);
                selectedLines = makeLines(selectedOD);
                plot(selectedLines);
                updateInfoCard(selectedStation);
            }
        })
        $('#liveView').click(function(e){
            if(selectedStation != undefined){
                updateInfoCard(selectedStation);
                remove(selectedLines);
            }
        })
        $('.leaflet-marker-icon').click(function(e){
            remove(selectedLines);
            selectedStation = findClickedMarker(e);
            if($('#dataView').is(":checked")){
                selectedOD = filterOD(indegoOD);
                selectedLines = makeLines(selectedOD);
                plot(selectedLines);
            } 
            updateInfoCard(selectedStation);
        })
        setInterval(getdata, 30000);
    })
});

/* 
$.ajax({
    url: "https://www3.septa.org/hackathon/TransitViewAll/",
  
   dataType: "jsonp",
    success: function(data){
      testData = data;
    }
  }); 
  testData.routes[0]["BLVDDIR"]
  */