const CONTACT_URL = "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact";
var CONST_MAP_FRAME = 'extension_map_id'; 
var port = chrome.runtime.connect({name: "init_port"}); // port connection from squirrel.js to background.js
var friends_loc = new Object();//stores the longitude and latitude of the friends
var city_offset = new Object();//if more than two friends belong to the same city, offset one of them with rand so that there profile images do not offset each other

port.onMessage.addListener(function(msg) {
	if(msg.action=="check"&&msg.status==true){
		//the location data has been initialized
		console.log("location data initialized!");
		startApp();
	} else if(msg.action=="check"&&msg.status==false){
		alert("map initializing");
	} else if(msg.action=="query"){
		var longitude=msg.longitude;
		var latitude=msg.latitude;
		var nick=msg.nick;
		var arr=new Array();
		arr.push(longitude);
		arr.push(latitude);
		var city=msg.city;
		if(city in city_offset){
			console.log("duplicate city found: processing");
			console.log("before long:"+city_offset[city][0]+" lat:"+city_offset[city][1]);
			var tmp_lng=city_offset[city][0];
			var tmp_lat=city_offset[city][1];
			var rand = 0.001 * Math.floor((Math.random() * 10) + 1);
			console.log("random:"+rand);
			var seed_x = Math.floor((Math.random() * 10) + 1);
			var seed_y = Math.floor((Math.random() * 10) + 1);
			//distribute different coordinates evenly
			if(seed_x%2==0&&seed_y%2==0){
				city_offset[city][0]=tmp_lng+rand;
				city_offset[city][1]=tmp_lat+rand;
			} else if(seed_x%2!=0&&seed_y%2==0) {
				city_offset[city][0]=tmp_lng-rand;
				city_offset[city][1]=tmp_lat+rand;
			} else if(seed_x%2==0&&seed_y%2!=0) {
				city_offset[city][0]=tmp_lng+rand;
				city_offset[city][1]=tmp_lat-rand;
			} else if(seed_x%2!=0&&seed_y%2!=0) {
				city_offset[city][0]=tmp_lng-rand;
				city_offset[city][1]=tmp_lat-rand;
			}
			console.log("after long:"+city_offset[city][0]+" lat:"+city_offset[city][1]);
		} else {
			city_offset[city]=arr;
		}
		friends_loc[nick]=arr;
		console.log(friends_loc[nick]);
	}
});

chrome.runtime.onConnect.addListener(function(new_port) {
	new_port.onMessage.addListener(function(msg) {
		if(msg.action=="init"&&msg.status==true){
				console.log("location data initialized!")
				startApp();
			} else if(msg.action=="init"&&msg.status==false){
				console("location data init failure");
		}
	});
});
/*
 * The javascript function to obtain the list of friends from WeChat server
 */
function obtainFriendList(){
	jQuery.get(CONTACT_URL, function(res){
		var data = JSON.parse(res);
		var member_count=data['MemberCount'];
		var member_list=data['MemberList'];
		for(var i=0;i<member_list.length;i++){
			var member=member_list[i];
			var member_username=member["UserName"];
			var member_name=member["NickName"];
			var member_location=member["City"];
			query_db(member_location, member_name);
			var data_nick={action:"username", nick:member_name, username:member_username};
			chrome.runtime.sendMessage({sendBack:true, data:data_nick});
		}
	});
}

//check if the json file has been initialized
function checkInit(){
	port.postMessage({action:"check"});
}

/*
 * Call the startup procedures to start the app
 */
function startApp(){
	UIInit();
	obtainFriendList();
}

//query the background script for location data
function query_db(loc, name){
	port.postMessage({action:"query", city:loc, nick:name});
	console.log("query: "+loc);
}

//create the rotating globe
function UIInit(){
	var div = document.createElement( 'div' );
	document.body.appendChild( div );
	div.id="earth";
	div.onclick = showMap;
	createMap();
	var map = document.createElement('div');
	document.body.appendChild( map );
	map.id="map";
}

function showMap(){
	console.log(friends_loc);
	for (var nick in friends_loc) {
		var data={action:"draw", longitude:friends_loc[nick][0], latitude:friends_loc[nick][1], nick:nick};
		chrome.runtime.sendMessage({sendBack:true, data:data});
	}
}

function createMap(){
	var mapViewerDOM = document.createElement('iframe');
	mapViewerDOM.setAttribute('id', CONST_MAP_FRAME);
	mapViewerDOM.setAttribute('src', chrome.extension.getURL('map_apis/map_frame.html'));
	mapViewerDOM.setAttribute('frameBorder', '0');
  	mapViewerDOM.setAttribute('width', '99.90%');
  	mapViewerDOM.setAttribute('height', '100%');
	document.body.appendChild(mapViewerDOM);
}

checkInit();