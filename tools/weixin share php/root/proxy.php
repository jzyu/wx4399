<?PHP
error_reporting(0);

require_once 'phplib/retcode.php';

$code = 200;
$valid_url_regex = '/.*/';
#$invalid_url_regex='/google|YouTube|.png|.jpg|.gif|.wav|.mp3|.mp4|.pdf/i';
$invalid_url_regex='/google|YouTube|.mp4|.pdf/i';

$url = $_GET['url'];
if(isset($_GET['ua'])) {
	$ua = $_GET['ua'];
}
else {
	$ua = $_SERVER['HTTP_USER_AGENT'];	
}

if($url) {
	$url = urldecode(base64_decode($url));
}

session_start();
if(isset($_SESSION['user_name'])) {
	$userName = $_SESSION['user_name'];
	$cookiePath = sys_get_temp_dir() . '/proxy-cookie-' . $userName . '.txt';
}
else {
	$cookiePath = null;
}
session_write_close();

if ( !$url || !preg_match( $valid_url_regex, $url ) || preg_match($invalid_url_regex, $url)) {
  $code = 500;
  $contents = 'ERROR: url not specified or invalid';
} 
else {
  for($i = 0; $i < 3; $i++) {
	  $ch = curl_init( $url );
	  if ( strtolower($_SERVER['REQUEST_METHOD']) == 'post' ) {
		curl_setopt( $ch, CURLOPT_POST, true );
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $_POST );
	  }
	  
	  curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
	  curl_setopt( $ch, CURLOPT_HEADER, true );
	  curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
	  curl_setopt( $ch, CURLOPT_USERAGENT, $ua);
	  if($cookiePath) {
		  curl_setopt( $ch, CURLOPT_COOKIEFILE, $cookiePath);
		  curl_setopt( $ch, CURLOPT_COOKIEJAR, $cookiePath);
      }

	  $data = curl_exec( $ch ); 
	  list( $header, $contents ) = preg_split( '/([\r\n][\r\n])\\1/', $data, 2 );
	  if(strstr($header, "HTTP/1.1 100")) {
		list( $header1, $header2, $contents1) = preg_split( '/([\r\n][\r\n])\\1/', $contents, 3 );
		$header = $header2;
		$contents = $contents1;
	  }
	  
	  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	  if($code == 200) {
		break;
	  } 
	  curl_close( $ch );
  }
}

if(strlen($contents) > 1000000) {
	$code = 404;	
	$contents = "too large";
}

http_response_code($code);
if($code !== 200) {
	echo $contents;
	exit;
}

// Split header text into an array.
$header_text = preg_split( '/[\r\n]+/', $header );
foreach ( $header_text as $header ) {
	if ( preg_match( '/^(?:Content-Type|Content-Language|Set-Cookie):/i', $header ) ) {
	  header( $header );
	}
}

print $contents;

?>
