/*
 * the map frame to display the list of wechat friends
 */

var map;  //the google map object

chrome.runtime.onMessage.addListener(
  	function(request) {
  		console.log("goooo");
		console.log(request);
  		if(request.data!=null&&request.data.action=="draw"){
  			console.log("message!!!");
  			var latitude=parseFloat(request.data.latitude);
  			var longtitude=parseFloat(request.data.longtitude);
  			var nick=request.data.nick;
  			var loc={lat:latitude, lng:longtitude};
  			console.log(map);
			var marker = new google.maps.Marker({
				position: loc,
				map: map
			});
  		}
	}
);

function initMap(){
	var uluru = {lat: -25.363, lng: 131.044};
	map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 1,
	  center: uluru
	});
}