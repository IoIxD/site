<html>
	<head>
		<link rel="stylesheet" type="text/css" href="../resources/about.css">
		</head>
	<body style='width: 100%; margin: 0px!important; padding: 5px;'>
		<?php echo preg_replace('/\n+/', '<br>', file_get_contents($_SERVER['DOCUMENT_ROOT']."/".$_GET['val']));?>
	</body>
</html>