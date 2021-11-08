    <?php
    if($_GET['test'] == 1) {
        echo "<br><br><br><br><span style='width: 150px; display: block;'>".$_SERVER['HTTP_USER_AGENT']."</style>";
    }
    //if(strpos($_SERVER['HTTP_USER_AGENT'], "iPhone") !== false || strpos($_SERVER['HTTP_USER_AGENT'], "Android") !== false) {
        $clicktype = "onclick";
    //} else {
    //    $clicktype = "ondblclick";
    //}
    ?>