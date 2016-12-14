const CONTACT_URL = "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact";
var CONST_MAP_FRAME = 'extension_map_id'; 
var port = chrome.runtime.connect({name: "init_port"}); // port connection from squirrel.js to background.js
var friends_loc = new Object();//stores the longitude and latitude of the friends
var city_offset = new Object();//if more than two friends belong to the same city, offset one of them with rand so that there profile images do not overlap each other
var EOF__FLAG__ = "EOF__FLAG__";//signal the end of list
var init = false;
var auto_launch=false;

port.onMessage.addListener(function(msg) {
	if(msg.action=="check"&&msg.status==true){
		//the location data has been initialized
		console.log("location data initialized!");
		startApp();
	} else if(msg.action=="check"&&msg.status==false){
		hint("map initializing");
	} else if(msg.action=="query"){
		if(msg.longitude==EOF__FLAG__||msg.latitude==EOF__FLAG__||msg.city==EOF__FLAG__||msg.nick==EOF__FLAG__){
			init=true;
			//launch the application by default
			if (auto_launch) {
				console.log("*******************");
				console.log(friends_loc);
				showMap();
			}
		}
		else {
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
			//draw the friend on the map
			var data={action:"draw", longitude:friends_loc[nick][0], latitude:friends_loc[nick][1], nick:nick};
			chrome.runtime.sendMessage({sendBack:true, data:data});
			console.log(friends_loc[nick]);
		}
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
		if (member_count==0) {
			hint("Please login to continue.");
		} else {
			for(var i=0;i<member_list.length;i++){
				var member=member_list[i];
				var member_username=member["UserName"];
				var member_name=member["NickName"];
				var member_location=member["City"];
				query_db(member_location, member_name);
				if(i==member_list.length-1){
					query_db(EOF__FLAG__, EOF__FLAG__);
				}
				var data_nick={action:"username", nick:member_name, username:member_username};
				chrome.runtime.sendMessage({sendBack:true, data:data_nick});
				if(i==member_list.length-1){
					chrome.runtime.sendMessage({sendBack:true, data:{action:"username", nick:EOF__FLAG__, username:EOF__FLAG__}});
				}
			}
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
	checkInit();
}

function showMap(){
	//draw friends on the map
	if(init){
		console.log(friends_loc);
		var mapViewerDOM = document.getElementById(CONST_MAP_FRAME);
		mapViewerDOM.style.visibility = "visible";
		var iframe = jQuery('iframe');
		iframe.show();
	} else {
		auto_launch=true;
		alert("Still initializing... Will launch after initialization.")
	}
}

function createMap(){
	var mapViewerDOM = document.createElement('iframe');
	mapViewerDOM.setAttribute('id', CONST_MAP_FRAME);
	mapViewerDOM.setAttribute('src', chrome.extension.getURL('map_apis/map_frame.html'));
	mapViewerDOM.setAttribute('frameBorder', '0');
  	mapViewerDOM.setAttribute('width', '99.90%');
  	mapViewerDOM.setAttribute('height', '100%');
  	mapViewerDOM.setAttribute('style','	position: absolute;top: 50%; left: 50%; transform: translate(-50%, -50%);z-index:99999; visibility:hidden;width:500px;height:500px;');
	document.body.appendChild(mapViewerDOM);
	jQuery(document).add(parent.document).click(function(e) {
	    var iframe_obj = jQuery('iframe')[0];
	    var iframe = jQuery('iframe');
	    var earth = jQuery('#earth');
	    if (iframe_obj.style.visibility=='visible'&&!iframe.is(e.target) && iframe.has(e.target).length === 0&&!earth.is(e.target)&&earth.has(e.target).length===0) {
	    	console.log("called");
	        iframe.hide();
	    }
	});
}

 //show the hint of the function
 function hint(msg){
 	var div = document.createElement( 'div' );
	document.body.appendChild( div );
	div.id="squirrel_hint";
	
	var hint_span = document.createElement( 'span' );
	hint_span.innerHTML = msg;
	div.appendChild(hint_span);

	setTimeout(function(){ document.getElementById("squirrel_hint").remove(); }, 5000);
 }

function nodeInsertedCallback(event) {
    console.log(event);
};

document.addEventListener('DOMNodeInserted', nodeInsertedCallback);

UIInit();