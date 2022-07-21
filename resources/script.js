// global variables
var mx = 0; var my = 0; mx_o = 0; my_o = 0; wx_o = 0; wy_o = 0; var hoveredWin; var mouseDown = 0; var titlebar_additions = ""; var options_iframe = "";
var movingWindow = 0;
var onPhone = 0; var windows = [];

var properties = getJSON(window.location.protocol+"//"+window.location.host+"/pages/properties.json");

var pageid_regex = /(?![A-z])(?![0-9])(?!\.)./gm;
var heldCtrl = 0; var heldShift = 0; var heldAlt = 0; var heldO = 0;

function init() {
    document.addEventListener("mousedown", function(e) {
        mouseDown = 1; 
        elemHover = document.querySelectorAll(`:hover`);
        if(elemHover.length >= 3 && elemHover[2].classList[0] == "window") {
          windows = document.getElementsByClassName("window");
          for( i=0; i< windows.length; i++ ) {
           windows[i].style.zIndex = 0;
          }
          elemHover[2].style.zIndex = 999;
          mx_o = e.pageX; my_o = e.pageY;
          ex = elemHover[2].style.left; ey = elemHover[2].style.top;
          if(ex.includes("%")) {
            wx_o = +(window.innerWidth) * +("."+ex.replace('%',''));
          } else {wx_o = ex.replace('px', '')}
          if(ey.includes("%")) {
            wy_o = +(window.innerHeight) * +("."+ey.replace('%',''));
          } else {wy_o = ey.replace('px', '')}
        }

      })
    document.addEventListener("mouseup", function() {mouseDown = 0; movingWindow = 0;})

    document.addEventListener('keydown', function(e) {
      switch(e.key) {
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
      if(heldCtrl == 1 && heldAlt == 1 && heldShift == 1 && heldO == 1) {
        window.location.replace("https://ioi-xd.net/no_script.php");
      }
    })
    document.addEventListener('keyup', function(e) {
      switch(e.key) {
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
    page = window.location.pathname.replace('.html','').replace('/','',1);
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
};
// WINDOW CREATION
function windowCreate(page, exoptions="") {
  try {
    console.log(page)
    var width = properties[`${page}`].width;
    var height = properties[`${page}`].height;
    var left = properties[`${page}`].left;
    var top = properties[`${page}`].top;
    var options = properties[`${page}`].options;
    var title = properties[`${page}`].name;
  } catch {
    page = window.location.pathname.replace('.html','').replace('/','',1);
    pageRoot = window.location.pathname.replace('.html','').split("/")[1];
    pageToMatch = "";
    if(page.match(/\.txt$/gm)) {
      // i ran out of variable names
      exoptions += "valload "+page;
      pageToMatch = "generic_text";
    } else if(page.match(/\.png$/gm)) {
      // i ran out of variable names
      exoptions += "valload "+page;
      pageToMatch = "generic_image";
    } else {
      pageToMatch = pageRoot;
      options += "dirlist";
    }
    var width = properties[`${pageToMatch}`].width;
    var height = properties[`${pageToMatch}`].height;
    var left = properties[`${pageToMatch}`].left;
    var top = properties[`${pageToMatch}`].top;
    var options = properties[`${pageToMatch}`].options;
    var title = properties[`${pageToMatch}`].name;
  }
  if(document.getElementById(page) || page == null) {
    return 0;
  }
  if(navigator.userAgent.match(/(iPad|iPhone|iPod|android)/i)) {
    onPhone = 1;
  } else {onPhone = 0;}
  windows_r = document.getElementsByClassName("window");
  windows = [];
  // (we add the windows to a seperate list to ensure that the list doesn't change until we're done with it.)
  for( i=0; i < windows_r.length; i++ ) {
    windows.push(windows_r[i])
  }

  for( i=0; i < windows.length; i++ ) {
   if(!windows[i].classList.contains('noanim')) {
    windows[i].classList.add('noanim');
   }
   if(!options.includes("om_dc") && onPhone == 1) {
      windowRemove(windows[i].id);
   }
  }
  windows = [];
  try {
    mx = window.event.pageX; my = window.event.pageY;
  } catch(e) {

  }
  if (onPhone == 1){
    options += " noanim"
  }
  if(!options.includes("noanim")) {
    document.documentElement.style.setProperty('--iw', width);
    document.documentElement.style.setProperty('--ih', height);
    document.documentElement.style.setProperty('--ix', left);
    document.documentElement.style.setProperty('--iy', top);
    document.documentElement.style.setProperty('--mpx', mx+"px");
    document.documentElement.style.setProperty('--mpy', my+"px");
  }
  if(options.includes("nooverflow")) {
    options_iframe = "scrolling='no'";
  } else {
    options_iframe = "";
  }
  if(options.includes("textfile")) {
    titlebar_additions = "<span class='wp-bar-fake'></span>";
  } else {
    titlebar_additions = "";
  }
  if(options.includes("dirlist")) { 
    pageUrl = `/pages/dirlist.php?dir=${page}/`;
  } else {
    pageUrl = `/pages/${page}.php`;
  }
  if(exoptions.includes("valload")) {
    exoptions = exoptions.replace("valload ", "");
    // the text wasn't replaced and i couldn't get the css to properly cut off the title how i wanted. i should come back to this.
    // title = exoptions.replace("%2F","\/");
    pageUrl += "?val="+exoptions;
    page += "_"+makeid(6);
  }
  document.body.innerHTML += `
  <div id="${page}" style="display: block; z-index: 0; width: ${width}; height: ${height}; left:${left}; top:${top};" class="window ${options}">
    <span class="titlebar">
      <span class='tl_lines'></span>
      <span onclick="windowRemove('${page}');"class='tl_button close'></span>
      <span class="title">`+title+`</span>
      <span class='tl_button maxmin'></span>
      <span class='tl_button shade'></span>
    </span>
    ${titlebar_additions}
    <span class="content ${options}">
      <iframe class="tempid id_`+page.replace(pageid_regex, '')+`" ${options_iframe} class="${options}" src="${pageUrl}">
    </span>
    <span class="window-drag"></span>
  </div>`;
  // firefox has had a 15 year old bug that causes iframes to always be permenantly cached.
  // i've also had this issue with a chromium based browser. 
  var geniframe = document.getElementsByClassName("tempid");
  geniframe[0].contentWindow.location.href = geniframe[0].src;
  geniframe[0].classList.remove('tempid');
}
// WINDOW REMOVAL
function windowRemove(page) {
  document.getElementById(page).remove();
}
function iframeSet(target, page) {
  var iframes = document.getElementsByClassName("id_"+target.replace(pageid_regex, ''));
  var relframe = iframes[0];
  relframe.src = page;
  relframe.classList.remove("id_"+target.replace(pageid_regex, ''));
  relframe.classList.add("id_"+page.replace(pageid_regex, '').replace('pagesdirlist.phpdir', ''));
}
// DRAGGING
document.addEventListener("mousemove", function(e) {
  if(mouseDown == 1) {
    elemHover = document.querySelectorAll(`:hover`);
    if(elemHover.length >= 3 && elemHover[2].classList[0] == "window") {
      movingWindow = 1;
      hoveredWin = elemHover[2];
    }
    if(movingWindow) {
      hoveredWin.style.top = (+(e.pageY-my_o) + +wy_o)+"px";
      hoveredWin.style.left = (+(e.pageX-mx_o) + +wx_o)+"px";
    }
  }
})

// quick and dirty function to open the three windows from the first icon, one after the other.
function OpenTheThree() {
  windowCreate('main');
  setTimeout(function(){windowCreate('likes');}, 500);
  setTimeout(function(){windowCreate('dislikes');}, 1000);
}

function getJSON(url) {
    var resp, xmlHttp;
    xmlHttp = new XMLHttpRequest();
    if(xmlHttp != null) {
        xmlHttp.open("GET", url, false);
        xmlHttp.send(null);
        resp = xmlHttp.responseText;
    }
    return JSON.parse(resp);
}

// this code was taken from stack overflow don't blame me if it sucks
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *  charactersLength));
   }
   return result;
}

