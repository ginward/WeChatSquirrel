/*
 * the map frame to display the list of wechat friends
 */

var map;  //the google map object
var avatar_url = "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgeticon?username=";
chrome.runtime.onMessage.addListener(
  	function(request) {
  		if(request.data!=null&&request.data.action=="draw"){
  			console.log("message!!!");
  			var latitude=parseFloat(request.data.latitude);
  			var longitude=parseFloat(request.data.longitude);
  			var nick=request.data.nick;
  			var loc={lat:latitude, lng:longitude};
  			console.log(nick);
			var marker = new google.maps.Marker({
				position: loc,
				map: map,
				title:nick
			});
			marker.setMap(map);
			google.maps.event.addListener(marker , 'click', function(){
			  var infowindow = new google.maps.InfoWindow({
			    content:nick,
			    position: loc,
			  });
			  infowindow.open(map);
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