<?php

$DAHTML = "
<html>
	<head>
		<style>
		.normalize {width: calc(100% - 200px);}
		.normalize * {
			font-size:  16px!important;
		}
		body {
			background: url('bg_main.png');
			color: #e0d0d0;
			font-family: sans-serif;
			padding: 27px 21px;
		}
		a, a:visited {
			color: #aaaaff;
		}
		a.title {font-weight:  bold;}
		.sidebar {float: right; width: 180px; display: block; position: absolute; top:  20px; right:  20px;}
		</style>
	</head>
	<body>
		<h1>Minecraft News</h1>
		<br><br><br>
		<div class='normalize'>";

		include('htmldom/simple_html_dom.php');
		$j = json_decode(file_get_contents("https://www.minecraft.net/content/minecraft-net/_jcr_content.articles.grid?&count=25&tagsPath=minecraft:stockholm/news&pageSize=1000&locale=en-us"));
		$comdupphar = [];
		for($i=0;$i<150;$i++) {
			$title = $j->article_grid[$i]->default_tile->title;
			// what it should never equal
			if((strpos($title, "Beta") !== false) || (strpos($title, "Bedrock") !== false) || (strpos($title, "Changelog") !== false) || (strpos($title, "Snapshot") !== false) || (strpos($title, "Release Candidate") !== false) || (strpos($title, "Pre-Release") !== false)) {
				continue;
			}
			// what it should equal
			if(strpos($title, "1.") !== false || strpos($title, "Caves & Cliffs") !== false) {
				// lol
			}else {
				continue;
			}
			$link = "http://minecraft.net".$j->article_grid[$i]->article_url;
			$html = file_get_html($link);
			if(!$html->find('.end-with-block ul', 0)) {continue;}
			if($html->find('.end-with-block h1', 0) == "<h1>Features</h1>") {$update=1;} else {$update=0;}
			$f = $html->find('.end-with-block p', 0);
			if (in_array($f, $comdupphar)) {
				continue;
			} else {
				$contents = $f; 
				array_push($comdupphar, $f);
			}
			if($update) {
				$contents .= 
				$html->find('.end-with-block ul', 0).
				$html->find('.end-with-block h2', 0).
				$html->find('.end-with-block ul', 1).
				$html->find('.end-with-block h2', 1).
				$html->find('.end-with-block ul', 2);
			} else {
				$contents .=
				$html->find('.end-with-block h1', 0).
				$html->find('.end-with-block ul', 0).
				$html->find('.end-with-block h2', 0).
				$html->find('.end-with-block ul', 1).
				$html->find('.end-with-block h2', 1).
				$html->find('.end-with-block ul', 2);
			}
				 if(empty($contents)) {continue;}
			$DAHTML .= "<a class='title' href='$link'>$title</a><br>$contents<br>";
		}
$DAHTML .= '
		</div>
<div class="sidebar"><h2>Official links:</h2><a href="https://minecraft.net/">Minecraft.net</a><br><a href="https://minecraft.net/realms">Minecraft Realms</a><br><a href="https://www.facebook.com/minecraft">Minecraft&nbsp;on&nbsp;Facebook</a><br><a href="http://jinx.com/minecraft.aspx">Merchandise</a><br><br><a href="https://bugs.mojang.com/browse/MC">Bug tracker</a><br><a href="https://help.mojang.com">Account Support</a><br><br><a href="http://twitter.com/Mojang">Mojang on Twitter</a><br><a href="http://twitter.com/MojangSupport">Support on Twitter</a><br><br><b>Try our other games!</b><br><div style="height:5px; display:block;"></div><a href="http://scrolls.com/welcome?utm_source=mcl"><img src="http://assets.mojang.com/scrolls/scrolls_logo_150.png" border="0"></a><div style="height:5px; display:block;"></div><a href="http://playcobalt.com/?utm_source=mcl"><img src="http://assets.mojang.com/cobalt/cobalt_logo_150.PNG" border="0"></a><h2>Community links:</h2><a href="http://minecraftforum.net/">Minecraft&nbsp;Forums</a><br><a href="http://www.twitch.tv/directory/game/Minecraft">Minecraft on Twitch.tv</a><br></td>
	</body>
</html>';
print($DAHTML);
file_put_contents("index.html", $DAHTML);
?>