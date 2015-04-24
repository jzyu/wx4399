<?php
error_reporting(0);

$appID = 'osgames5-821423377846894';
if(!empty($_GET['appid'])) {
	$appID = $_GET['appid'];
}
$appURL='http://bcs.duapp.com/osgames/'.$appID.'.jso';

function  fetchFile($url) {
	$ch = curl_init( $url );
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);  
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); 
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); 	

	$data = curl_exec($ch);
	$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close( $ch );

	return ($http_status == 200) ? $data : "";
}

header('Content-Type: application/x-javascript; charset=UTF-8');
header('Content-Encoding: gzip');

echo fetchFile($appURL);

