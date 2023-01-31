<table>
	<tbody>
		<tr class='thead'>
			<td>Name</td>
			<td>Date Modified</td>
			<td align='right'>Size</td>
			<td>Kind</td>
		</tr>
<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
$GLOBALS['lastfolder'] = '';
function DirectoryList($dir, $subdir) {
	$dirfull = $_SERVER['DOCUMENT_ROOT']."/".$dir;
	$scan = scandir($dirfull);
	foreach($scan as $value) {
		if(
			$value == "." || 
			($value == ".." && realpath($dirfull."/..") == $_SERVER['DOCUMENT_ROOT']."/pages") || 
			$value == "index.php"
		) {
			continue;
		}

		$path = $dirfull."/".$value;
		$filetype = filetype($path);
		$mime = explode("/", mime_content_type($path))[0];
		$date = gmdate('r', filemtime($path));
		$filesize = filesize($path);

		switch(strlen($filesize)) {
			case 10:
			case 9:
				$filesize_h = substr(($filesize / 1000000000), 0, 4)." GB";
				break;
			case 8:
			case 7:
				$filesize_h = substr(($filesize / 1000000), 0, 4)." MB";
				break;
			case 6:
			case 5:
			case 4:
				$filesize_h = substr(($filesize / 1000), 0, 4)." K";
				break;
			default:
				$filesize_h = $filesize." B";
				break;
		}

		if($subdir == 1) {echo "<tr class='hidden ".$GLOBALS['lastfolder']."'>";} else {echo "<tr class='a'>";}

		switch($filetype) {
			case "dir":
				$GLOBALS['lastfolder'] = $value;
				echo "
				<td class='hcolumn' onclick=\"parent.setPageContents(this.parentElement.parentElement.parentElement, '/pages/dirlist.php?dir=$dir/$value')\">
					<img width='16' height='16' src='../resources/icons/folder-documents-16x16.svg'>$value</td> 
				<td>$date</td>
				<td align='right'>-</td>
				<td>$filetype</td>
				</tr>";
				break;
			case "file":
				switch($mime) {
					case "image":
						echo "<td class='hcolumn' onclick=\"parent.windowCreate('generic_image', 'valload ".str_replace("/", "%2F", $dir."/".$value)."')\"><img width='16' height='16' src='../resources/icons/photoshop.svg'><p>$value</p></td>";
						break;
					case "text":
						echo "<td class='hcolumn' onclick=\"parent.windowCreate('generic_text', 'valload ".str_replace("/", "%2F", $dir."/".$value)."')\"><img width='16' height='16' src='../resources/icons/accessories-text-editor_16x16.svg'><p>$value</p></td>";
						break;
				}
				echo "
				<td>$date</td>
				<td align='right'>$filesize_h</td>
				<td>$mime</td>
				</tr>";
				break;
		}
	}
}
DirectoryList($_GET['dir'], 0);
?>
	</tbody>
</table>
<script>
	function vistoggle(classname) {
		elements = document.querySelectorAll("."+classname+".unhidden");
		elements_hidden = document.querySelectorAll("."+classname+".hidden");
		for (i=0; i < elements.length; i++) {
			elements[i].classList.add("hidden");
			elements[i].classList.remove("unhidden");
		}
		for (i=0; i < elements_hidden.length; i++) {
			elements_hidden[i].classList.remove("hidden");
			elements[i].classList.add("unhidden");
		}
	}
</script>