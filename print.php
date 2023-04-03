<span>
	<h1>Gavin Parker</h1>
	<article>
		<span tabindex="1"><?php 
			// php has a hilarious bug that doesn't let me structure this code in a readable way, sorry
			// start with a regex that takes out all the html tags we don't want
			$page = str_replace("\n","",file_get_contents('pages/main.php'));
			echo preg_replace('(<img (.*?)>|<(noprint)>(.*?)<\/(noprint)>)', '', $page);
			?>
		</span>
		<table>
			<tr>
				<td tabindex="2"><?php echo file_get_contents('pages/top-languages.php');?></td>
				<td tabindex="3"><?php echo file_get_contents('pages/github-stats.php');?></td>
			</tr>
		</table>
	</article>
</span>