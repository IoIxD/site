<html><body text="#fff" bgcolor="#000" style='width: 512px; margin: 0 auto;'>
	<center>
	<img alt=" " src="images/sadmac.gif"><br>
	<span tabindex="1"><?php 
		// php has a hilarious bug that doesn't let me structure this code in a readable way, sorry
		// start with a regex that takes out all the html tags we don't want
		echo preg_replace('/(\<)((?!br|\?php|span(.*?)mobiletext2).*?)(\>)/', '', 
		// followed by one that evaluates php code because for some reason it just doesn't execute
		// ...is the comment i wanted to make but eval just doesn't fucking work so i'll just account for the one that prints my age lol
		preg_replace('/(\<\?php)(.*)(\?\>)/', floor((time()-1026399600)/31563000), file_get_contents('pages/main.php')));?></span>
	</center>
	<article>
		<br>
		<span tabindex="2"><strong>likes</strong><br><?php echo preg_replace('/\<((?!br|span).*?)\>/', '', file_get_contents('pages/likes.php'));?><br></span>
		<span tabindex="3"><strong>dislikes</strong><br><?php echo preg_replace('/\<((?!br|span).*?)\>/', '', file_get_contents('pages/dislikes.php'));?><br></span>
		<span aria-hidden="true"><strong>downloads</strong><ul>
		<li>Pokemon: H edition: <i>http://ioi-xd.net/files/pokeh.bps</i></li>
		<li>Pokemon: Source edition: <i>http://ioi-xd.net/files/pokesource.bps</i></li>
		<li>Greenscreen 64: <i>http://ioi-xd.net/Greenscreen 64.zip</i></li>
		<li>Peter Griffin 64: <i>http://ioi-xd.net/Peter Griffin 64.zip</i></li>
	</ul>
</span>
	<br>
	<em tabindex="4" alt="">(this is the javascript-less version of the site, you either chose to see this or were redirected here)</em></font>
</article>
</body>
</html>