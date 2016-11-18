const CONTACT_URL = "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact";

//connect to the background script
var port = chrome.runtime.connect({name: "init_port"});

port.onMessage.addListener(function(msg) {
	if(msg.action=="check"&&msg.status==true){
		//the location data has been initialized
		alert("location data initialized!");
		startApp();
	} else if(msg.action=="check"&&msg.status==false){
		port.postMessage({action:"init"});
		alert("map initializing");
	} else if(msg.action=="init"&&msg.status==true){
		alert("location data initialized!")
		startApp();
	} else if(msg.action=="init"&&msg.status==false){
		alert("location data init failure");
	}
});

/*
 * The javascript function to obtain the list of friends from WeChat server
 */
function obtainFriendList(){
	jQuery.get(CONTACT_URL, function(res){
		var data = JSON.parse(res);
		var member_count=data['MemberCount'];
		var member_list=data['MemberList'];
		console.log(member_list);
		for(var i=0;i<member_list.length;i++){
			
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

checkInit();