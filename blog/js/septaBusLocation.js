$.ajax({
    url: "https://www3.septa.org/hackathon/TransitViewAll/",
  
   dataType: "jsonp",
    success: function(data){
      testData = data;
    }
  }); 
  testData.routes[0]["BLVDDIR"]