<!DOCTYPE HTML>
<html>
    <?php
    //error_reporting(E_ALL);
    //ini_set('display_errors', '1');
    ?>
    <head>
        <link rel="stylesheet" type="text/css" href="/resources/about.css">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>noscript {display: none!important;}</style>
        <title>ioi_xd's site</title>
    </head>
    <body class='main'>
        <article class='sr-only' style='position: absolute; top: -500px'>If you're hearing this, it means you're using a screen reader, I think. I don't see a good way of translating this site into one that's more accessible, so I made a version of the site that is text only. You can view it by pressing Control, Alt, Shift, and O, at the same time.d
</article><span aria-hidden='true'>
    	<span class='right-click-bar'>
            <?php
            $month = "";
            switch(date('m')) {
                case "01": $month = "Jan"; break;
                case "02": $month = "Feb"; break;
                case "03": $month = "Mar"; break;
                case "04": $month = "Apr"; break;
                case "05": $month = "May"; break;
                case "06": $month = "June"; break;
                case "07": $month = "Jul"; break;
                case "08": $month = "Aug"; break;
                case "09": $month = "Sep"; break;
                case "10": $month = "Oct"; break;
                case "11": $month = "Nov"; break;
                case "12": $month = "Dec"; break;
            }
            echo "<span class='date'>".date('D')." ".$month." ".date('d')." 1997</span>"
            ?>
            
        </span>
    	<span class='desktop-item' style='font-size:0px; margin-top: 35px;' onclick="OpenTheThree()">
            <img width='32' height='32' src="/resources/icons/accessories-text-editor.svg"><br><img width='27' height='12' src="/images/font_main.svg">
        </span><br><span class='desktop-item' style='font-size:0px;' onclick="windowCreate('downloads');">
            <img width='32' height='32' src="/resources/icons/drive-harddisk.svg"><br>
            <img width='52' height='13' src="/images/font_downloads.svg">
        </span><br><span class='desktop-item' style='font-size:0px;' onclick="windowCreate('links');">
            <img width='32' height='32' src="/resources/icons/folder-remote.svg"><br>
            <img width='60' height='12' src="/images/font_social_media.svg">
        </span><br><span class='desktop-item' style='font-size:0px;' onclick="windowCreate('art');">
            <img width='32' height='32' src="/resources/icons/folder-pictures.svg"><br>
            <img width='30' height='12' src="/images/font_art.svg">
        </span><br>
        <script type="text/javascript" src="/resources/script.js"></script>
    </span>
    </body>
</html>
