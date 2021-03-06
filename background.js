/*
 * File to init the location data 
 */
var current_tab_id; //the current tab that background script is connected to
var init_port; //port connection from background.js to squirrel.js
var EOF__FLAG__ = "EOF__FLAG__";
var host = "wx.qq.com";
//indexedDB
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
var db; //the database object

function initializeDefaultValues() {
	chrome.storage.local.get("default_values_initialized", function (obj) {
    	if(obj.default_values_initialized==true){
    		return;
    	} else {
   		 	readJSONFile('location.json');
    	}
	});
}

function readJSONFile(file_name){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL(file_name), true);
	xhr.onreadystatechange = function()
	{
	    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
	    {
	    	var json_txt=xhr.responseText;
	    	var json=JSON.parse(json_txt);
			var transaction = db.transaction(["squirrel"], "readwrite");
			transaction.oncomplete = function(event) {
			  console.log("All done!");
		      chrome.storage.local.set({default_values_initialized: true});
	    	  init_port.postMessage({action:"init", status:true});
			};
			transaction.onerror = function(event) {
			  // Don't forget to handle errors!
			};
			var objectStore = transaction.objectStore("squirrel");
	    	for (var key in json){
	    		var obj={city:key, longitude:json[key][0], latitude:json[key][1]};
	    		var request=objectStore.add(obj);
	    		request.onsuccess=function(event){
					//console.log(obj);	    			
	    		}
	    	}
	    }
	};
	xhr.send();
}

//function to check the current init status
function checkInitStatus(port){
	chrome.storage.local.get("default_values_initialized", function (obj) {
    	if(obj.default_values_initialized==true){
    		port.postMessage({action:"check", status:true});
    	} else {
	    	port.postMessage({action:"check", status:false});
	    	if(db){
				chrome.tabs.query(
				    { currentWindow: true, active: true },
				    function (tabArray) { 
				    	current_tab_id=tabArray[0].id; 
						init_port = chrome.tabs.connect(current_tab_id, {name:"init_port"});
						console.log(init_port);
						initializeDefaultValues();
				    }
				);
			} else {
				init_db(function(){
					chrome.tabs.query(
					    { currentWindow: true, active: true },
					    function (tabArray) { 
					    	current_tab_id=tabArray[0].id; 
							init_port = chrome.tabs.connect(current_tab_id, {name:"back_port"});
							console.log(init_port);
							initializeDefaultValues();
					    }
					);
				});
			}
    	}
	});
}

function init_db(callback){
	if(db==null){
		var request = window.indexedDB.open("squirrel");
		request.onerror = function(event){
			console.log("Database error: " + event.target.errorCode);
		}
		request.onsuccess = function(event){
			db=event.target.result;
			callback();
		}
		request.onupgradeneeded = function(event) { 
		  var db = event.target.result;
		  // Create an objectStore for this database
		  var objectStore = db.createObjectStore("squirrel", { keyPath: "city" });
		};		
	} else {
		callback();
	}
}

//query the database
function query(city, port, nick){
	init_db(function(){
		var transaction = db.transaction(["squirrel"], "readwrite");
		transaction.oncomplete = function(event) {
		  console.log("query back!");
		};
		transaction.onerror = function(event) {
		  // Don't forget to handle errors!
		  console.log("db error");
		};
		var objectStore = transaction.objectStore("squirrel");
		console.log(city);
		objectStore.get(city).onsuccess = function(event) {
			if(event.target.result!=null){
				var longitude=event.target.result.longitude;
				var latitude=event.target.result.latitude;
				port.postMessage({action:"query", city:city, longitude:longitude, latitude:latitude, nick:nick});
			}
		};
	});
}

//listen for messages from the content script
chrome.runtime.onConnect.addListener(function(port) {
		port.onMessage.addListener(function(msg) {
			if(msg.action=="check"){
				checkInitStatus(port, msg);
				console.log("checking");
			} else if (msg.action=="query"){
				if(msg.city==EOF__FLAG__||msg.nick==EOF__FLAG__){
					port.postMessage({action:"query", city:EOF__FLAG__, longitude:EOF__FLAG__, latitude:EOF__FLAG__, nick:EOF__FLAG__});
				} else {
					query(msg.city, port, msg.nick);
				}
			} else if (msg.action=="cookie"){
			    chrome.cookies.get({"url": "https://"+host, "name": "webwx_data_ticket"}, function(cookie) {
			    	if(cookie)
						port.postMessage({action:"cookie", value:cookie.value});
					else 
						port.postMessage({action:"cookie", value:null});
			    });
			} else if (msg.action=="url_validate"){
				chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
				    var url = tabs[0].url;
				    var l = getLocation(url);
				    port.postMessage({action:"url_validate", url:getLocation(url).hostname});
				    host = getLocation(url).hostname;
				});
			}
		});
});

/*
 * Get the host name
 */

var getLocation = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};

chrome.runtime.onMessage.addListener(function(message, sender) {
    if (message.sendBack&&message.data.action!=null&&(message.data.action=="draw"||message.data.action=="username")||message.data.action=="urldraw") {
 				chrome.tabs.query(
				    { currentWindow: true, active: true },
				    function (tabArray) { 
				    	current_tab_id=tabArray[0].id; 
				    	chrome.tabs.sendMessage(current_tab_id, message);
				    }
				);	
    }
});