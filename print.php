<span style='padding: 5em; width: 75%; margin: 0 auto; display: block;'>
	<h1>Gavin Parker</h1>
	<article>
		<span tabindex="1"><?php 
			// php has a hilarious bug that doesn't let me structure this code in a readable way, sorry
			// start with a regex that takes out all the html tags we don't want
			$page = str_replace("\n","",file_get_contents('pages/main.php'));
			echo preg_replace('(<img (.*?)>|<(noprint)>(.*?)<\/(noprint)>)', '', $page);
			?>
		</span>
		<span style='display: inline-block; width: 40vw;' tabindex="2"><?php echo file_get_contents('pages/top-languages.php');?></span>
		<span style='display: inline-block; width: 40vw;' tabindex="3"><?php echo file_get_contents('pages/github-stats.php');?></span>
	</article>
</span>