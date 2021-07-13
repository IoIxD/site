    <?php
    if(strpos($_SERVER['HTTP_USER_AGENT'], "iPhone") !== false || strpos($_SERVER['HTTP_USER_AGENT'], "Android") !== false) {
        $clicktype = "onclick";
    } else {
        $clicktype = "ondblclick";
    }
    ?>