<!DOCTYPE HTML>
<html>
    <?php include("common.php");?>
    <head>
        <link rel="stylesheet" type="text/css" href="/resources/about.css?1">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>ioi_xd's site</title>
    </head>
    <body class='main' bgcolor="#9c9cce">
    	<span class='right-click-bar'></span>
    	<span class='desktop-item' <?php echo $clicktype?>="OpenTheThree()"><img src="/files/icons/accessories-text-editor.png"><span class='text main'>Main</span></span><br>
    	<span class='desktop-item' <?php echo $clicktype?>="windowCreate('downloads');"><img src="/files/icons/drive-harddisk.png"><span class='text downloads'>Downloads</span></span><br>
    	<span class='desktop-item' <?php echo $clicktype?>="windowCreate('links');"><img src="/files/icons/folder-remote.png"><span class='text links'>social media</span></span><br>
        <span class='desktop-item' <?php echo $clicktype?>="windowCreate('blog');"><img src="/files/icons/folder-documents.png"><span class='text blog'>blog</span></span><br>
        <span class='desktop-item' <?php echo $clicktype?>="windowCreate('art');"><img src="/files/icons/folder-pictures.png"><span class='text art'>art</span></span><br>
    	<span class='note mobile_only' style='width: 30vw; top: 7vw; right:7vw'>On mobile devices, the scrollbar for windows do not show up. In general, though, the site doesn't look great, and for the full experience you should view it on a desktop computer.</span>
        <script type="text/javascript" src="/resources/script.js"></script>
    </body>
</html>
