<?php 
function getUserTmpDir($userName) {

	if(strchr($userName, '@')) {
		list($name, $domainName) = explode("@", $userName);
		$tempDir = '/tmp/drawapp8/' . $domainName . '/' . $name;
	}
	else {
		$tempDir = '/tmp/drawapp8/' . $userName;	
	}

	if(!file_exists($tempDir)) {
		mkdir($tempDir, 0777, true);
	}

	return $tempDir;
}

function getUserSessionTmpDir($userName) {
	$userTmpDir = getUserTmpDir($userName);
	$sessionTmpDir = $userTmpDir . '/' . $_SESSION['id'];

	if(!file_exists($sessionTmpDir)) {
		mkdir($sessionTmpDir, 0777, true);
	}

	return $sessionTmpDir;
}

function getUserDefaultAppID($userName) {
	$appName = "com.drawapp8.";

	if(strchr($userName, '@')) {
		list($name, $domainName) = explode("@", $userName);
		$appName = $appName . $name;
	}
	else {
		$appName = $appName . $userName;
	}

	return $appName;
}

function getPreivewFile($id) {
	$previewPath = '/tmp/drawapp8/preview/';
	$filename = $previewPath . $id . '.jso';

	if(!file_exists($previewPath)) {
		mkdir($previewPath, 0777, true);
	}

	return $filename;
}

function dupZip($srcName, $dstName) {
	if(!copy($srcName, $dstName)) {
		returnJson(404, G_ERR_INVALID_PARAMS, 'Copy File Failed.', '');
	}

	$dstZip = new ZipArchive();
	if($dstZip->open($dstName, 0)!==TRUE) {
		returnJson(404, G_ERR_INVALID_PARAMS, 'Open Dst Zip Failed.', '');
	}

	return $dstZip;
}

function getAppZipNameForUser($userName) {
	$zipFileName = getUserSessionTmpDir($userName) . '/app.zip';

	return $zipFileName;
}

function getInstallerExtName($platform) {
	$extName = 'apk';

	if($platform === 'android') {
		$extName = 'apk';
	}
	else if($platform === 'ios'){
		$extName = 'ipa';
	}
	else if($platform === 'webos'){
		$extName = 'ipk';
	}
	else if($platform === 'winphone'){
		$extName = 'xap';
	}
	else if($platform === 'symbian'){
		$extName = 'wgz';
	}
	else if($platform === 'blackberry'){
		$extName = 'jad';
	}

	return $extName;
}

function getAppInstallerNameForUser($userName, $platform) {
	$sessionTmpDir = getUserSessionTmpDir($userName);
	$installerName = $sessionTmpDir . '/installer.' . getInstallerExtName($platform);

	return $installerName;
}

function get_file($path) {

	if ( function_exists('realpath') )
		$path = realpath($path);

	if ( ! $path || ! @is_file($path) )
		return false;

	return @file_get_contents($path);
}

function get_bin_file($path) {
	if ( function_exists('realpath') )
		$path = realpath($path);

	if ( ! $path || ! @is_file($path) )
		return false;

	$filename = $path;
	$handle = fopen($filename, "rb");
	
	if($handle) {
		$contents = fread($handle, filesize($filename));
		fclose($handle);
		return $contents;
	}

	return '';
}

function testUtil() {
	session_start();
	header("Content-type: text/html; charset=utf-8");
	echo getUserTmpDir("xianjimli@hotmail.com");
	echo "<br>";
	echo getUserSessionTmpDir("xianjimli@hotmail.com");
	echo "<br>";
	echo getAppZipNameForUser("xianjimli@hotmail.com");
	echo "<br>";
	echo getAppInstallerNameForUser("xianjimli@hotmail.com", 'webos');

	return;
}

//testUtil();

?>

