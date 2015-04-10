//yhc-eventhandle.js

//--
function getUrlParam(param) {
	var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r !== null)
		return unescape(r[2]);
	else
		return null;
}

function getUrlParamFromHtml(param) {
	var el = document.getElementById(param);
	if (el)
		return el.value;
	else
		return null;
}
    
function getUid(){
    //var uid = getUrlParam('uid');
    var uid = getUrlParamFromHtml('uid');
    if (! uid)
        uid = '999999';
    return uid;
}

//-- 后台api --
function apiSaveHighScore(score, onDone){
	var url = 'http://wx4399.duapp.com/saveHighScore?uid=' + getUid() + '&score=' + score;
    httpGetURL(url, onDone);
}

function apiGetScoreboardInfo(onDone){
	var url = 'http://wx4399.duapp.com/getScoreboardInfo?uid=' + getUid();
	httpGetJSON(url, onDone);
}

function apiSaveAwardInfo(name, mobile, onDone){
	var url = 'http://wx4399.duapp.com/saveAwardInfo?uid=' + getUid() + '&name=' + escape(name) + '&mobile=' + mobile;
    httpGetURL(url, onDone);
}