<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
if (file_exists("FILE/troll.png")) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename=trollface.png');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize("FILE/troll.png"));
    readfile("FILE/troll.png");
    exit;
} else {
    echo("trollface.png currently doesn't exist, please pester ioi_xd about this");
}
?>

