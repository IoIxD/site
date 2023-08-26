<?php
function getRequestProtocol()
{
	if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']))
		return $_SERVER['HTTP_X_FORWARDED_PROTO'];
	else
		return !empty($_SERVER['HTTPS']) ? "https" : "http";
}
$_GET['dir'] = getRequestProtocol();
include("../dirlist.php");
?>