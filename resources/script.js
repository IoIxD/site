// global variables
var mx = 0; var my = 0; mx_o = 0; my_o = 0; wx_o = 0; wy_o = 0; var hoveredWin; var mouseDown = 0; var titlebar_additions = ""; var options_iframe = "";
var movingWindow = 0;
var onPhone = 0;
var lastTop = 0;

var properties = getJSON(window.location.protocol + "//" + window.location.host + "/pages/properties.json");

var heldCtrl = 0; var heldShift = 0; var heldAlt = 0; var heldO = 0;

var hoveredWin;

document.addEventListener("mousedown", function (e) {
  if (e.which != 1) { return; }
  mouseDown = 1; 
  if(hoveredWin) {
    mx_o = e.pageX; my_o = e.pageY;
    ex = hoveredWin.style.left; ey = hoveredWin.style.top;
    if (ex.includes("%")) {
      wx_o = +(window.innerWidth) * +("." + ex.replace('%', ''));
    } else { wx_o = ex.replace('px', '') }
    if (ey.includes("%")) {
      wy_o = +(window.innerHeight) * +("." + ey.replace('%', ''));
    } else { wy_o = ey.replace('px', '') }
  };
})
document.addEventListener("mouseup", function () { 
  mouseDown = 0; 
  movingWindow = 0; 
  hoveredWin = undefined; 
  var windows = document.getElementsByClassName("window");
  for (var i = 0; i < windows.length; i++) {
    if (windows[i] != hoveredWin) {
      windows[i].style.pointerEvents = 'initial';
      windows[i].style.userSelect = 'initial';
    }
  }
})

// WINDOW CREATION
function windowCreate(page, exoptions = "") {
  var width, height, left, top, options, title;
  if (properties[page] === undefined) {
    let url = window.location.pathname.replace('.html', '');
    page = url.replace('/', '', 1);
    pageRoot = url.split("/")[0] ? 0 : url.split("/")[1];
    pageToMatch = pageRoot;
    if (page.match(/\.txt$/gm)) {
      exoptions += "valload " + page;
      pageToMatch = "generic_text";
    } else if (page.match(/\.png$/gm)) {
      exoptions += "valload " + page;
      pageToMatch = "generic_image";
    } else {
      pageToMatch = pageRoot;
      options += "dirlist";
    }
    width = properties[`${pageToMatch}`].width;
    height = properties[`${pageToMatch}`].height;
    left = properties[`${pageToMatch}`].left;
    top = properties[`${pageToMatch}`].top;
    options = properties[`${pageToMatch}`].options;
    title = properties[`${pageToMatch}`].name;
  } else {
    width = properties[`${page}`].width;
    height = properties[`${page}`].height;
    left = properties[`${page}`].left;
    top = properties[`${page}`].top;
    options = properties[`${page}`].options;
    title = properties[`${page}`].name;
  }

  if(onPhone) {
    if(lastTop != 0) {
      top = lastTop;
    }
    lastTop = height;
  }

  if (document.getElementById(page) || page == null) {
    return 0;
  }

  var windows_r = document.getElementsByClassName("window");
  var windows = [];
  // (we add the windows to a seperate list to ensure that the list doesn't change until we're done with it.)
  for (i = 0; i < windows_r.length; i++) {
    windows.push(windows_r[i])
  }

  for (i = 0; i < windows.length; i++) {
    if (!windows[i].classList.contains('noanim')) {
      windows[i].classList.add('noanim');
    }

  }
  try {
    mx = window.event.pageX; my = window.event.pageY;
  } catch (e) {

  }
  if (onPhone == 1) {
    options += " noanim"
  }
  if (!options.includes("noanim")) {
    document.documentElement.style.setProperty('--iw', width);
    document.documentElement.style.setProperty('--ih', height);
    document.documentElement.style.setProperty('--ix', left);
    document.documentElement.style.setProperty('--iy', top);
    document.documentElement.style.setProperty('--mpx', mx + "px");
    document.documentElement.style.setProperty('--mpy', my + "px");
  }
  if (options.includes("nooverflow")) {
    options_iframe = "scrolling='no'";
  } else {
    options_iframe = "";
  }
  if (options.includes("textfile")) {
    titlebar_additions = "<span class='wp-bar-fake'></span>";
  } else {
    titlebar_additions = "";
  }
  if (options.includes("dirlist")) { 
    pageUrl = `/pages/dirlist.php?dir=pages/${page}/`;
  } else {
    pageUrl = `/pages/${page}.php`;
  }
  if (exoptions.includes("valload")) {
    exoptions = exoptions.replace("valload ", "");
    // the text wasn't replaced and i couldn't get the css to properly cut off the title how i wanted. i should come back to this.
    // title = exoptions.replace("%2F","\/");
    pageUrl += "?val=" + exoptions;
    page += "_" + makeid(6);
  }

  // create the div properly so we can reference it later.
  var div = document.createElement("div");
  div.style.display = "block";
  div.style.width = width;
  div.style.height = height;
  div.style.left = left;
  div.style.top = top;
  div.id = page;
  div.classList.add("window");

  if (options != "") {
    optionsSplit = options.split(" ", 99);
    for (var i in optionsSplit) {
      div.classList.add(optionsSplit[i]);
    }
  }

  // skip ahead a bit 
  div.innerHTML += `
  <span class="titlebar">
      <span class='tl_lines'></span>
      <span onclick="windowRemove('${page}');"class='tl_button close'></span>
      <span class="title">`+ title + `</span>
      <span class='tl_button maxmin'></span>
      <span class='tl_button shade'></span>
    </span>
    `;
  div.innerHTML += titlebar_additions

  // create the contents div and properly add it to the div.
  var contents = document.createElement("span");
  contents.classList.add("content");
  if (options != "") {
    optionsSplit = options.split(" ", 99);
    for (var i in optionsSplit) {
      contents.classList.add(optionsSplit[i]);
    }
  }
  setPageContents(contents, pageUrl);
  div.appendChild(contents);

  var windowDrag = document.createElement("span");
  windowDrag.classList.add("window-drag");
  div.appendChild(windowDrag);

  document.body.appendChild(div);

  div.querySelector(".titlebar").addEventListener("mouseenter", function(e) {
    if(e.fromElement.classList.contains("window")) {
      hoveredWin = e.fromElement;
    }
  });

}
// WINDOW REMOVAL
function windowRemove(page) {
  document.getElementById(page).remove();
}

// DRAGGING
document.addEventListener("mousemove", function (e) {
  // are we moving a window?
  if (movingWindow) {
    // if the window we're supposed to be moving is maximized then no we aren't.
    if (hoveredWin.classList.contains("maximized")) {
      return;
    }
    // move whatever window we're hovering over.
    // first get what the position should be, in pixels.
    newTop = (+(e.pageY - my_o) + +wy_o);
    newLeft = (+(e.pageX - mx_o) + +wx_o);

    // adjust it according to the window's width, converting it to a percentage.
    newTop = (newTop / window.innerWidth) * 100;
    newLeft = (newLeft / window.innerHeight) * 100;

    // convert it back to pixels, again using the window's inner width.
    newTop = window.innerWidth * (newTop) / 100;
    newLeft = window.innerHeight * (newLeft) / 100;

    hoveredWin.style.top = newTop + "px";
    hoveredWin.style.left = newLeft + "px";

    hoveredWin.style.zIndex = "999";
    var windows = document.getElementsByClassName("window");

    // disallow every window from being selected while we're moving the current one.
    for (var i = 0; i < windows.length; i++) {
      if (windows[i] != hoveredWin) {
        windows[i].style.pointerEvents = 'none';
        windows[i].style.userSelect = 'none';
        windows[i].style.zIndex = '0';
      }
    }
  } else {
    // otherwise, check if we could be moving one, by checking if the mouse is down and we're over a window
    if (mouseDown) {
      if (hoveredWin) {
        movingWindow = 1;
      }
    }
  }
  xeyesCheck(e);
})


// quick and dirty function to open the three windows from the first icon, one after the other.
function OpenTheThree() {
  windowCreate('main');
  setTimeout(function () { windowCreate('top-languages'); }, 250);
  setTimeout(function () { windowCreate('github-stats'); }, 500);
  setTimeout(function () { windowCreate('likes'); }, 750);
  setTimeout(function () { windowCreate('dislikes'); }, 1000);
}

function setPageContents(elem, url) {
  // try using async
  try {
    what = Function("arg0", "arg1", `
      return fetch(arg1)
        .then((t) => t.text())
        .then(t => {
        arg0.innerHTML = t;
      });
      `)(elem, url);
  } catch (ex) {
    // the code is actually correct so any errors should be handled by using the old xml method
    contents = getPageContents(url);
    elem.innerHTML = contents;
  }
}

function getPageContents(url) {
  var resp, xmlHttp;
  xmlHttp = new XMLHttpRequest();
  if (xmlHttp != null) {
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    resp = xmlHttp.responseText;
  }
  return resp;
}

function getJSON(url) {
  var json = getPageContents(url); 
  return JSON.parse(json);
}

async function setBackground() {
  let url = window.location.protocol + "//" + window.location.hostname;

  // acceptable folders to choose from
  let folders = ["checkerland", "dimension_352", "mindisafuck", "troll_98", "weecee_wallpaper_1"];

  let random = folders[Math.ceil(Math.random() * folders.length - 1)];

  // We want to get all the files within this folder and pick the one
  // that is closed to the user's screen resolution.
  let file = "";
  // we pass the size in kind of a weird way, but doing this allows us to just filter the filenames (which always have WIDTHxHEIGHT in
  // the name) to numbers only and compare, which is faster.
  let maxSize = +(screen.width + "" + screen.height); 

  await fetch(url + "/pages/art/" + random + "/")
    .then(r => r.text())
    .then(r => {
      let page = document.createElement("html");
      page.innerHTML = r;
      console.log(url + "/pages/art/" + random);

      let links = page.querySelectorAll(".a p");
      for (let i in links) {
        let link = links[i];
        if (link.innerHTML === undefined) {
          continue;
        }
        if (link.innerHTML.includes("png")) {
          let numbers = +(link.innerHTML.replace(/([^0-9])/g, '', 99));
          if (numbers <= maxSize) {
            file = "/pages/art/" + random + "/" + link.innerHTML;
          }
        }
      }
    });
  console.log(file);
  // now we want to fetch the contents of that link and set the page's background to it
  document.body.style.backgroundImage = "url(\"" + file + "\")";
}

// XEYES

function xeyesCheck(e) {
  xeyes = document.querySelectorAll(".xeye");
  xeyes.forEach(eye => {
    let top = eye.style.top.replace("px", "", 1);
    let left = eye.style.left.replace("px", "", 1);
    let parent = document.querySelector("#xeyes");
    let y = (e.clientY - top) - parent.style.top.replace("px", "", 1);
    let x = (e.clientX - left) - parent.style.left.replace("px", "", 1);
    console.log(parent.style.top.replace("px", "", 1));
    let deg = (Math.atan2(y, x)) * 180 / Math.PI;
    eye.querySelector(".inner").style.transform = `rotate(${deg}deg)`;
  });
}


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

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function main() {
  if (navigator.userAgent.match(/(iPad|iPhone|iPod|android)/i)) {
    onPhone = 1;
  } else { onPhone = 0; }

  page = window.location.pathname.replace('.html', '').replace('/', '', 1);
  if (page != "") {
    windowCreate(page);
  } else {
    OpenTheThree()
  }
  var classNames = [];
  if (navigator.userAgent.match(/(iPad|iPhone|iPod)/i)) classNames.push('device-ios');
  if (navigator.userAgent.match(/android/i)) classNames.push('device-android');

  var html = document.getElementsByTagName('html')[0];

  if (classNames.length) classNames.push('on-device');
  if (html.classList) html.classList.add.apply(html.classList, classNames);

  setBackground();
}
main();