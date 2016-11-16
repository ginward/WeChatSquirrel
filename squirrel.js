const CONTACT_URL = "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact";
/*
 * The javascript function to obtain the list of friends from WeChat server
 */
function obtainFriendList(){
	jQuery.get(CONTACT_URL, function(res){
		var data = JSON.parse(res);
		var member_count=data['MemberCount'];
		var member_list=data['MemberList'];
		for(var i=0;i<member_list.length;i++){
			
		}
	});
}

obtainFriendList();