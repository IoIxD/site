// global variables
var mx = 0; var my = 0; mx_o = 0; my_o = 0; wx_o = 0; wy_o = 0; var hoveredWin; var mouseDown = 0; var titlebar_additions = ""; var options_iframe = "";
var movingWindow = 0;
var onPhone = 0; var windows = [];

var pageid_regex = /(?![A-z])(?![0-9])(?!\.)./gm;
var heldCtrl = 0; var heldShift = 0; var heldAlt = 0; var heldO = 0;

var hoveredWin;

function setWindowsDraggable() {
  var windows = $(".window");
  for (i in windows) {
    $(".window").draggable({
      handle: ".titlebar",
    });
    $(".window").resizable();
  }
}

$("body").bind("keydown", function(e) {
  switch (e.key) {
    case "Control":
      heldCtrl = 1;
      break;
    case "Alt":
      heldAlt = 1;
      break;
    case "Shift":
      heldShift = 1;
      break;
    case "O":
      heldO = 1;
      break;
  }
  if (heldCtrl == 1 && heldAlt == 1 && heldShift == 1 && heldO == 1) {
    window.location.replace("https://ioi-xd.net/no_script.php");
  }
})
$("body").bind("keyup", function(e) {
  switch (e.key) {
    case "Control":
      heldCtrl = 0;
      break;
    case "Alt":
      heldAlt = 0;
      break;
    case "Shift":
      heldShift = 0;
      break;
    case "O":
      heldO = 0;
      break;
  }
})

// quick and dirty function to open the three windows from the first icon, one after the other.
function OpenTheThree() {
  windowCreate('main');
  setTimeout(function () { windowCreate('top-languages'); }, 250);
  setTimeout(function () { windowCreate('github-stats'); }, 500);
  setTimeout(function () { windowCreate('likes'); }, 750);
  setTimeout(function () { windowCreate('dislikes'); }, 1000);
}









// XEYES




/*
// random background
            $scan = scandir("./pages/art");
            // go through the listing and remove the "other" listing
            $scan = array_filter($scan, function($e) {
                return $e !== "other";
            });
            $num = rand(2, count($scan));
            $dir = './pages/art/'.$scan[$num];
            while($scan[$num] == "") {
                $num--;
                $dir = './pages/art/'.$scan[$num];
            }

            // we then want to find the png file with the under 1920x1080;
            $scan_ = scandir($dir);
            $highestnumber = 0;
            $finalfile = "";
            foreach($scan_ as $val) {
                $numbersonly = intval(preg_replace('/([^0-9])/','',$val));
                if($numbersonly > $highestnumber && $highestnumber <= 19201080) {
                    $highestnumber = $numbersonly;
                    $finalfile = $val;
                }
            }
            print('"'.$dir."/".$finalfile."\"");
            */




function main() {
  setBackground();
  
  page = window.location.pathname.replace(/\.html/, '').replace(/\//, '', 1);
  if (page != "") {
    windowCreate(page);
  } else {
    OpenTheThree()
  }
  var classNames = [];
  if (navigator.userAgent.match(/(iPad|iPhone|iPod)/i)) classNames.push('device-ios');
  if (navigator.userAgent.match(/android/i)) classNames.push('device-android');

  var html = $('html')[0];

  if (classNames.length) classNames.push('on-device');
  if (html.classList) html.classList.add.apply(html.classList, classNames);
}
main();