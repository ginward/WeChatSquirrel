function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

var btn = document.getElementsByClassName("btn btn_send")[0]

function getContactList(){
	jQuery.get( "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact", function( res ) {
		var data=JSON.parse(res);
		var cnt=data.MemberCount;
		var list=data.MemberList;
	});
}