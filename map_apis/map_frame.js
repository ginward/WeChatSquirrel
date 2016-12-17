/*
 * the map frame to display the list of wechat friends
 */

var map;  //the google map object
var avatar_url = "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgeticon?username=";
var icons = new Object();
chrome.runtime.onMessage.addListener(
  	function(request) {
  		if (request.data!=null && request.data.action=="urldraw") {
  			if (request.data.url=="web.wechat.com"){
  				avatar_url="https://web.wechat.com/cgi-bin/mmwebwx-bin/webwxgeticon?username=";
  			}
  			console.log("draw_url");
  		}   else if(request.data!=null&&request.data.action=="draw"){
  			console.log("message!!!");
  			var latitude=parseFloat(request.data.latitude);
  			var longitude=parseFloat(request.data.longitude);
  			var nick=request.data.nick;
  			var loc={lat:latitude, lng:longitude};
  			var icon = {
				url: icons[nick], // url
				scaledSize: new google.maps.Size(35, 35), // scaled size
				origin: new google.maps.Point(0,0), // origin
				anchor: new google.maps.Point(0, 0) // anchor
  			}
			var marker = new google.maps.Marker({
				position: loc,
				map: map,
				title:nick,
				icon:icon
			});
			console.log(icons[nick]);
			marker.setMap(map);
			google.maps.event.addListener(marker , 'click', function(){
			  var infowindow = new google.maps.InfoWindow({
			    content:nick,
			    position: loc,
			  });
			  infowindow.open(map);
			});
  		} else if (request.data!=null && request.data.action=="username"){
  			if (request.data.host=="web.wechat.com")
  				avatar_url="https://web.wechat.com/cgi-bin/mmwebwx-bin/webwxgeticon?username=";
  			//receive usernames
  			var nick=request.data.nick;
  			var username=request.data.username;
  			icons[nick]=avatar_url+username;
  			console.log(request.data);
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