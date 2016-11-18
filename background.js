/*
 * File to init the location data 
 */

function initializeDefaultValues(port) {
    if (localStorage.getItem('default_values_initialized')) {
        return;
    }
    readJSONFile('location.json', port);
}

function readJSONFile(file_name, port){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL(file_name), true);
	xhr.onreadystatechange = function()
	{
	    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
	    {
	    	var json_txt=xhr.responseText;
	    	var json=JSON.parse(json_txt);
	    	//set the longitude and latitude in the local storage 
	    	for (var key in json){
	    		localStorage.setItem(key, json[key]);
	    	}
	    	localStorage.setItem('default_values_initialized', true);
	    	if(port){
	    		port.postMessage({action:"init", status:checkInitStatus()});
	    	}
	    }
	};
	xhr.send();
}

//function to check the current init status
function checkInitStatus(){
	if (localStorage.getItem('default_values_initialized')) {
        return true;
    } else {
    	return false;
    }
}

//listent for messages from the content script
chrome.runtime.onConnect.addListener(function(port) {
	console.assert(port.name == "init_port");
	port.onMessage.addListener(function(msg) {
		if(msg.action=="check"){
			port.postMessage({action:"check", status:checkInitStatus()});
		} else if (msg.action=="init"){
			initializeDefaultValues(port);
		}
	});
});