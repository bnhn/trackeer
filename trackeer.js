// collections
Markers = new Mongo.Collection("markers");
Vehicles = new Mongo.Collection("vehicles");

if (Meteor.isClient) {
  var MAP_ZOOM = 16;
  Meteor.startup(function() {
    var key =  Meteor.settings.public.googleMapAPIKey;
    console.log("key",key);
    GoogleMaps.load({key:key});
    console.log("map is loading");
  });

 

  Template.map.helpers({
    geolocationError: function() {
      var error = Geolocation.error();
      return error && error.message;
    },
    mapOptions: function() {
      var latLng = Geolocation.latLng();
      // Initialize the map once we have the latLng.
      if (GoogleMaps.loaded() && latLng) {
        return {
          center: new google.maps.LatLng(latLng.lat, latLng.lng),
          zoom: MAP_ZOOM
        };
      }
    }
});

  Template.map.onCreated(function() {
    var self = this;


    GoogleMaps.ready('map', function(map) {
      var marker;
      var driveMarker= [];

     // Create and move the marker when latLng changes.
      self.autorun(function() {

        var latLng = Geolocation.latLng();
        if (! latLng){
          return;
        }

        if (!marker){

          marker = new google.maps.Marker({
            position: new google.maps.LatLng(latLng.lat, latLng.lng),
            map: map.instance
          });
        }
        else{
          marker.setPosition(latLng);
          console.log("setting position");
        }

       // Center and zoom the map view onto the current position.
        map.instance.setCenter(marker.getPosition());
        map.instance.setZoom(MAP_ZOOM);
    });//end of client side tracking function

      Tracker.autorun(function(){
        var latLng = Geolocation.latLng();
        if(!latLng){
          return;
        }
        Meteor.call('drivInsertLoc',latLng, function (err, res) {
          if(err){
            return "error " + err;
          }
        });
      });

       Tracker.autorun(function(){
          Meteor.call("drivRetrieveLoc", function(err, res){
            if(res){
              vehicleDisplay(res);
              console.log("driveMarker ",driveMarker.length);
            }
            });
          });
       
       
       //displaying vehicles on map
       function vehicleDisplay(pos){
        console.log("Adding car markers");
        if(driveMarker.length===0){
          emptyMarkerArray(pos);
        }
          else if (driveMarker.length!==0 && driveMarker.length < pos.length){
            shorterMarkerArray(pos);
          } 
            else{
              equalMarkerArray(pos);
            }
          }

          /////////////////////////////////////////////
          /////collection of functions to handle//////
          /////different marker array lengths////////
          //////////////////////////////////////////
          function emptyMarkerArray(pos){
            console.log("Empty driveMarker collection");
            for (var i=0;i < pos.length;i++){
            driveMarker.push( new google.maps.Marker({
              position:new google.maps.LatLng(pos[i][1],pos[i][0]),
              map: map.instance
            }));
            }
          }

          function shorterMarkerArray(pos){
              var newPos =pos.slice(driveMarker.length,pos.length);
              console.log("Longer Drive data collecton",newPos);
              for (var i=0;i < newPos.length;i++){
                driveMarker.push( new google.maps.Marker({
                position: new google.maps.LatLng(newPos[i][1],newPos[i][0])
                }));  
              }
          }

          function equalMarkerArray(pos){
            console.log("Equal driveData collecton");
              for(var i=0;i < pos.length;i++){
                var posLatLng = new google.maps.LatLng(pos[i][1],pos[i][0]);
                driveMarker[i].setPosition(posLatLng);
              }
          }
          /////////////////////////////////////
          ////end of functions collection/////
          ///////////////////////////////////
});//end of GoogleMaps.ready() function
  }); //end of onCreated() function
}// end of isClient


Meteor.methods({
   //inserting driver location into DB
        drivInsertLoc: function(latLng){
          console.log("DriverLoc starting");
          var driverLoc = Meteor.user();
         // console.log("driverLoc: ",driverLoc,Meteor.userId());
          if (!Meteor.user()){
            console.log("no user found");
            return;
          }
          else if (Meteor.user().profile.type === "driver" && latLng){
                var upSertID = Vehicles.upsert({_id:driverLoc._id},
                  {_id:driverLoc._id,name:driverLoc.username,latLng:[latLng.lng,latLng.lat]});
                console.log("Vehicles upsert", upSertID);
          }
        },

        //retrieving data from db
      drivRetrieveLoc: function(){
        console.log("Drive retrieve starting");
        var cursor = Vehicles.find({});
        var driveData = cursor.map(function(cursor){ return cursor.latLng});
        console.log("driveData:", driveData);
        return driveData;
      }
})