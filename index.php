<html>
	<body>
		<script>
		/* this code is somewhat sluggish, but i think it's better then having the site appear on screen for a second before showing
		the no-javascript error screen (if applicable). that said, text needs to be hidden and then shown with css as a result of this, to make the look less embaressing */

		var intended = location.origin+'/has_script.php';
		document.open();
		var xhr = new XMLHttpRequest();
		xhr.open('GET', intended, true);
		xhr.onerror = function(e) {
			console.log(e);
		}
		xhr.onload = function(e) {
			console.log(xhr.responseText);
			document.write(xhr.responseText);
		}
		document.close();

		</script>
		<noscript><?php include('no_script.php');?></noscript>
		<script>
		if(document.getElementsByTagName('noscript')[0] != undefined) {
			document.getElementsByTagName('noscript')[0].remove();
		}
		</script>
		<?php if(strpos($_SERVER['HTTP_USER_AGENT'], 'FrogFind Reader') !== false) {include('no_script.php');}?>
	</body>
</html>