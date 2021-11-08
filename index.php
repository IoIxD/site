<html>
	<body>
		<script>
		/* this code is somewhat sluggish, but i think it's better then having the site appear on screen for a second before showing
		the no-javascript error screen (if applicable). that said, text needs to be hidden and then shown with css as a result of this, to make the look less embaressing */
		var xhr = new XMLHttpRequest();
		xhr.open('Get', '/has_script.php', true);
		xhr.onload = function(e) {document.write(xhr.response);}
		xhr.send();
		</script>
		<noscript><?php include('no_script.php');?></noscript>
		<script>document.getElementsByTagName('noscript').remove();</script>
		<?php if(strpos($_SERVER['HTTP_USER_AGENT'], 'FrogFind Reader') !== false) {include('no_script.php');}?>
	</body>
</html>