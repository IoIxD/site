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
  var id = page.replace(pageid_regex, '');

  // create the div properly so we can reference it later.
  var div = document.createElement("div");
  div.style.display =   "block";
  div.style.width   =   width;
  div.style.height  =   height;
  div.style.left    =   left;
  div.style.top     =   top;
  div.id      =   page;
  div.classList.add("window");

  if(options != "") {
    optionsSplit = options.split(" ",99);
    for (var i in optionsSplit) {
      div.classList.add(optionsSplit[i]);
    }
  }

  // skip ahead a bit 
  div.innerHTML += `
  <span class="titlebar">
      <span class='tl_lines'></span>
      <span onclick="windowRemove('${page}');"class='tl_button close'></span>
      <span class="title">`+title+`</span>
      <span class='tl_button maxmin'></span>
      <span class='tl_button shade'></span>
    </span>
    `;
  div.innerHTML += titlebar_additions

  // create the contents div and properly add it to the div.
  var contents = document.createElement("span");
  contents.classList.add("content");
  if(options != "") {
    optionsSplit = options.split(" ",99);
    for (var i in optionsSplit) {
      contents.classList.add(optionsSplit[i]);
    }
  }
  setPageContents(contents,pageUrl);
  div.appendChild(contents);

  var windowDrag = document.createElement("span");
  windowDrag.classList.add("window-drag");
  div.appendChild(windowDrag);

/*
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
    <span class="content ${options} id_`+id+`""></span>
    <span class="window-drag"></span>
  </div>`;
  */
  document.body.appendChild(div);
}
// WINDOW REMOVAL
function windowRemove(page) {
  document.getElementById(page).remove();
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

function setPageContents(elem, url) {
  // try using async
  try {
    what = Function("arg0","arg1", `
      return fetch(arg1)
        .then((t) => t.text())
        .then(t => {
        arg0.innerHTML = t;
      });
      `)(elem,url);
  } catch(ex) {
    // the code is actually correct so any errors should be handled by using the old xml method
    contents = getPageContents(url);
    elem.innerHTML = contents;
  }
}

function getPageContents(url) {
    var resp, xmlHttp;
    xmlHttp = new XMLHttpRequest();
    if(xmlHttp != null) {
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

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *  charactersLength));
   }
   return result;
}

