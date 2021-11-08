
<!DOCTYPE HTML>
<html>
    <?php include("common.php");?>
    <head>
        <link rel="stylesheet" type="text/css" href="/resources/about.css?2">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>noscript {display: none!important;}</style>
        <title>ioi_xd's site</title>
    </head>
    <body class='main' bgcolor="#9c9cce">
        <article class='sr-only' style='position: absolute; top: -500px'>If you're hearing this, it means you're using a screen reader, I think. I don't see a good way of translating this site into one that's more accessible, so I made a version of the site that is text only. You can view it by pressing Control, Alt, Shift, and O, at the same time.d
</article><span aria-hidden='true'>
    	<span class='right-click-bar'></span>
    	<span class='desktop-item' style='font-size:0px;' <?php echo $clicktype?>="OpenTheThree()"><img src="/files/icons/accessories-text-editor.png"><br><span class='text main'>Main</span></span><br>
    	<span class='desktop-item' style='font-size:0px;' <?php echo $clicktype?>="windowCreate('downloads');"><img src="/files/icons/drive-harddisk.png"><br><span class='text downloads'>Downloads</span></span><br>
    	<span class='desktop-item' style='font-size:0px;' <?php echo $clicktype?>="windowCreate('links');"><img src="/files/icons/folder-remote.png"><br><span class='text links'>social media</span></span><br>
        <!---<span class='desktop-item' style='font-size:0px;' <?php echo $clicktype?>="window.open('https://j.ioi-xd.net/IoI_xD');"><img src="/files/icons/folder-documents.png"><br><span class='text blog'>blog</span></span><br>--->
        <span class='desktop-item' style='font-size:0px;' <?php echo $clicktype?>="windowCreate('art');"><img src="/files/icons/folder-pictures.png"><br><span class='text art'>art</span></span><br>
        <span class='desktop-item' style='font-size:0px;' <?php echo $clicktype?>="windowCreate('ftype');"><img src="/files/icons/ftype_icon.png"><br><span class='text ftype'>F-Type</span></span><br>
    	<span class='note mobile_only' style='font-size:0px; width: 30vw; top: 7vw; right:7vw'>On mobile devices, the scrollbar for windows do not show up. In general, though, the site doesn't look great, and for the full experience you should view it on a desktop computer.</span>
        <script type="text/javascript" src="/resources/script.js"></script><script>init();</script>
        <!---
        <span class='note bgnote' style='width: 10%; height: 10%; top: 50%; left: 50%; transform: translate(-50%, -50%)'>(The background takes a bit to load.)</span>
        <script>document.addEventListener('DOMContentLoaded', function() {document.querySelector('.note.bgnote').remove();},false);</script>
        --->
    </span>
    </body>
</html>
