<?php

define('G_ERR_OK', 0);
define('G_ERR_NOT_LOGIN', 1);
define('G_ERR_INVALID_PARAMS', 2);

if (!function_exists('http_response_code'))
{
    function http_response_code($newcode = NULL)
    {
        static $code = 200;
        if($newcode !== NULL)
        {
            header('X-PHP-Response-Code: '.$newcode, true, $newcode);
            if(!headers_sent())
                $code = $newcode;
        }       
        return $code;
    }
}

function returnJson($respcode, $retcode, $message, $data) 
{
	http_response_code($respcode);
	header("Content-type: text/plain; charset=utf-8");

	echo '{"code":'.$retcode.', "message":"'.$message.'","data":'. json_encode($data) . '}';
	exit;
}

function get_file_type($filename) 
{
	if(stristr($filename, ".jpg")) {
		return "image/jpeg";
	}
	
	if(stristr($filename, ".png")) {
		return "image/png";
	}
	
	if(stristr($filename, ".gif")) {
		return "image/png";
	}

	return "text/plain; charset=utf-8";
}

function returnFile($respcode, $filename, $content) 
{
	http_response_code($respcode);

	$contenttype = get_file_type($filename);

	if(stristr($contenttype, 'image')) {
		$expires_offset = 31536000;	
		header('Pragma: public');
		header('Expires: ' . gmdate( "D, d M Y H:i:s", time() + $expires_offset ) . ' GMT');
		header("Cache-Control: public, max-age=$expires_offset");
	}
	if(strstr($filename, ".jso")) {
		header('Content-Encoding: gzip');
	}
	header('Content-Type: '.$contenttype);

	ob_clean();
	flush();
	echo $content;
	
	exit;
}

?>
