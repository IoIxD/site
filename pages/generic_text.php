<?php echo preg_replace('/\n+/', '<br>', file_get_contents($_SERVER['DOCUMENT_ROOT']."/".$_GET['val']));?>