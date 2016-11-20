const CONTACT_URL = "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact";

var port = chrome.runtime.connect({name: "init_port"}); // port connection from squirrel.js to background.js
var friends_loc = new Object();//stores the longitude and latitude of the friends

port.onMessage.addListener(function(msg) {
	if(msg.action=="check"&&msg.status==true){
		//the location data has been initialized
		alert("location data initialized!");
		startApp();
	} else if(msg.action=="check"&&msg.status==false){
		alert("map initializing");
	} else if(msg.action=="query"){
		var longitude=msg.longitude;
		var latitude=msg.latitude;
		var arr=new Array();
		arr.push(longitude);
		arr.push(latitude);
		var city=msg.city;
		friends_loc[city]=arr;
		console.log("result: "+friends_loc[city]);
	}
});

chrome.runtime.onConnect.addListener(function(new_port) {
	new_port.onMessage.addListener(function(msg) {
		if(msg.action=="init"&&msg.status==true){
				alert("location data initialized!")
				startApp();
			} else if(msg.action=="init"&&msg.status==false){
				alert("location data init failure");
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
			query_db(member_location);
		}
		console.log(friends_loc);
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
function query_db(loc){
	port.postMessage({action:"query", city:loc});
	console.log("query: "+loc);
}

checkInit();