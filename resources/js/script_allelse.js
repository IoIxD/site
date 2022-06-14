//
// pre-emptive note, this javascript is well over-commentated but it used to not be that way.
// my brain hurts when it's not that way because javascript is not a 100% readable language semantically.
// sorry
//

// global variables

// mouse positions, _o = original
var mx = 0; var my = 0; mx_o = 0; my_o = 0; 

// is our mouse down?
var mouseDown = 0;

// original x/y of a window
wx_o = 0; wy_o = 0;

// what window we're hovering over
var hoveredWin; 

// keys to listen to
var heldCtrl = 0; var heldShift = 0; var heldAlt = 0; var heldO = 0;

// window options
var movingWindow = 0;

// cached windows
var windows = []; 

// are we on a mobile device?
var onPhone = 0; 

// window properties
var properties;

// the ratio according to which to place objects on the screen
var ratio; var desiredRatio;

// functions to run upon starting up.

// update the scale based on the device pixel ratio
scaleUpdate();
// phone detection
if(navigator.userAgent.match(/(iPad|iPhone|iPod|android)/i)) {
  onPhone = 1;
} else {
  onPhone = 0;
}
// get the properties of windows
properties = getJSON(window.location.protocol+"//"+window.location.host+"/properties.json");

document.addEventListener("mousedown", function(e) {
  // which button?
  switch(e.which) {
    case 1:
      // our mouse is down
      mouseDown = 1; 
      // what element are we hovering over?
      elemHover = document.querySelectorAll(`:hover`);
      // not only does it need to window but it needs to be at leat three layers deep
      if(elemHover.length >= 3 && elemHover[2].classList[0] == "window") {
        // decrease the z index of every other window
        windows = document.getElementsByClassName("window");
        for( i=0; i< windows.length; i++ ) {
          curZIndex = windows[i].style.zIndex;
          if(curZIndex == undefined) {
            curZIndex = 1;
          }
          if(curZIndex > 0) windows[i].style.zIndex = curZIndex-1;
        }
        // and push ours to the top
        if(elemHover[2].style.zIndex == undefined) {
          elemHover[2].style.zIndex = 21;
        } else {
          elemHover[2].style.zIndex = windows.length+2;
        }
        
        // save our current mouse position to the "original" mouse position
        mx_o = e.pageX; my_o = e.pageY;

        // get the position of the window we're hovering over
        ex = elemHover[2].style.left; ey = elemHover[2].style.top;
        // if the x is in a percentage, convert it to pixels.
        if(ex.includes("%")) {
          wx_o = +(window.innerWidth) * +("."+ex.replace('%',''));
        } else {
          wx_o = ex.replace('px', '');
        }
        // same for y
        if(ey.includes("%")) {
          wy_o = +(window.innerHeight) * +("."+ey.replace('%',''));
        } else {
          wy_o = ey.replace('px', '');
        }
      }
      break;
    default: 
      break; // nothing for now.
  }
})

document.addEventListener("mouseup", function() {
  mouseDown = 0; // our mouse is no longer down
  // if we were moving a window, stop moving it and deselect everything.
  if(movingWindow == 1) {
    for(var i = 0; i < windows.length; i++) {
      windows[i].style.pointerEvents = 'initial';
      windows[i].style.userSelect = 'initial';
    }
    window.getSelection().removeAllRanges();
    movingWindow = 0;
  }
})

// ctrl + alt + shift + o should bring the user to a plaintext version
document.addEventListener('keydown', function(e) {
  switch(e.key) {
    case "Control":   heldCtrl = 1;   break;
    case "Alt":       heldAlt = 1;    break;
    case "Shift":     heldShift = 1;  break;
    case "O":         heldO = 1;      break;
  }
  if(heldCtrl == 1 && heldAlt == 1 && heldShift == 1 && heldO == 1) {
    window.location.replace("https://ioi-xd.net/no_script");
  }
})

document.addEventListener('keyup', function(e) {
  switch(e.key) {
    case "Control":   heldCtrl = 0;   break;
    case "Alt":       heldAlt = 0;    break;
    case "Shift":     heldShift = 0;  break;
    case "O":         heldO = 0;      break;100 
  }
})

// window dragging 
document.addEventListener("mousemove", function(e) {

  // are we moving a window?
  if(movingWindow) {
    // if the window we're supposed to be moving is maximized then no we aren't.
    if(hoveredWin.classList.contains("maximized")) {
      return;
    }
    // move whatever window we're hovering over.
    // first get what the position should be, in pixels.
    newTop = (+(e.pageY-my_o) + +wy_o);
    newLeft = (+(e.pageX-mx_o) + +wx_o);

    // adjust it according to the window's width, converting it to a percentage.
    newTop = (newTop / window.innerWidth)*100;
    newLeft = (newLeft / window.innerHeight)*100;

    // convert it back to pixels, again using the window's inner width.
    newTop = window.innerWidth * (newTop)/100;
    newLeft = window.innerHeight * (newLeft)/100;

    hoveredWin.style.top = newTop+"px";
    hoveredWin.style.left = newLeft+"px";

    // disallow every window from being selected while we're moving the current one.
    for(var i = 0; i < windows.length; i++) {
      if(windows[i] != hoveredWin) {
        windows[i].style.pointerEvents = 'none';
        windows[i].style.userSelect = 'none';
      }
    }

  } else {
    // otherwise, check if we could be moving one, by checking if the mouse is down and we're over a window
    if(mouseDown) {
      elemHover = document.querySelectorAll(`:hover`);
      if(elemHover.length >= 3 && elemHover[2].classList[0] == "window") {
        movingWindow = 1;
        hoveredWin = elemHover[2];
      }
    }
  }
})

window.addEventListener('resize', scaleUpdate);

// function for handling zoom ins and zoom outs.
// essentially we want to make sure the body can only ever scale evenly.
function scaleUpdate() {
  // set the scale of the body
  var dpi = (document.querySelector('#dpi').offsetHeight / 96)-1;
  ratio = window.devicePixelRatio;
  desiredRatio = Math.floor(((ratio+dpi)-1)*10)+1; // how many tenths away is the ratio and dpi from 1?
  if(desiredRatio % 2 != 0 && desiredRatio != 1) {desiredRatio++}; // make sure it's even, always.
  if(desiredRatio <= 0) desiredRatio = 1; 
  document.body.style.transform = "scale("+desiredRatio+")";
  document.body.style.width = +(window.innerWidth/desiredRatio)-30+"px";
  document.body.style.height = +(window.innerHeight/desiredRatio)+"px";
  //document.body.style.height = "0px";
}

// window creation

function windowCreate(page, exoptions="") {
  // if there's already a window with the page, do nothing.
  if(document.getElementById(page) || page == null) {
    return 0;
  }

  var pageToMatch = "";
  
  // wait until properties is defined
  if(properties == undefined) {
    setTimeout(function(){
      windowCreate(page, exoptions)
    },250);
    return;
  }

  var pageProperties = properties[`${page}`];
  var loadOptionsAsValues = false;

  // First see if the properties for the windows are in memory.
  // If they aren't, try and load one of the internal pages
  if(pageProperties == undefined ) {
    page = window.location.pathname.replace('.html','').replace('/','',1);
    pageRoot = window.location.pathname.replace('.html','').split("/")[1];
    if(page.match(/\.txt$/gm)) {
      exoptions += "valload "+page;
      pageToMatch = "generic_text";
    } else if(page.match(/\.png$/gm)) {
      exoptions += "valload "+page;
      pageToMatch = "generic_image";
    } else {
      pageToMatch = pageRoot;
      options += "dirlist";
    }
    pageProperties = properties[`${page}`];
  } else {
    pageToMatch = page;
  }

  var width = pageProperties.width;
  var height = pageProperties.height;
  var left = pageProperties.left;
  var top = pageProperties.top;
  var options = pageProperties.options;
  var title = properties[`${page}`].name;

  windows.length = 0;
  windows_r = document.getElementsByClassName("window");
  for ( i = 0; i < windows_r.length; i++ ) {
    windows.push(windows_r[i])
  }

  // if we're not phone and the window should animate, set that up.
  if(!options.includes("noanim") && onPhone != 1) {
    document.documentElement.style.setProperty('--iw', width);
    document.documentElement.style.setProperty('--ih', height);
    document.documentElement.style.setProperty('--ix', left);
    document.documentElement.style.setProperty('--iy', top);
    document.documentElement.style.setProperty('--mpx', mx+"px");
    document.documentElement.style.setProperty('--mpy', my+"px");
  }

  var titlebar_additions = "";

  // textfile options adds a WordPerfect inspired text bar to the window
  if(options.includes("textfile")) {
    titlebar_additions = "<span class='wp-bar-fake'></span>";
  }

  // dirlist option signifies that the window should be a directory listing
  if(options.includes("dirlist")) { 
    pageUrl = `/dirlist?dir=${page}/`;
  } else {
    pageUrl = `/${page}.html`;
  }

  // valload option contains files and what not that generic_text or generic_image should read from.
  if(exoptions.includes("valload")) {
    exoptions = exoptions.replace("valload ", "");
    pageUrl += "?val="+exoptions;
    page += "_"+makeid(6);
  }

  pageUrl = location.origin+pageUrl;
  var pageContents = "";

  windowCreatePart2(page,width,height,left,top,options,title,titlebar_additions);
}


function windowCreatePart3(page,pageContents,width,height,left,top,options,title,titlebar_additions) {
  // create a div the proper way so that we can reference it
  var div = document.createElement("div");
  div.style.display =   "block";
  div.style.width   =   width;
  div.style.height  =   height;
  div.style.left    =   left;
  div.style.top     =   top;
  div.id      =   page;
  div.classList.add("window");
  div.classList.add(options);
  // create a div the improper way because fuck that
  div.innerHTML = "<span class='titlebar'>"+
                    "<span class='tl_lines'></span>"+
                    "<span onclick='windowRemove(\""+page+"\");' class='tl_button close'></span>"+
                    "<span class='title'>"+title+"</span>"+
                    "<span onclick='windowShade(\""+page+"\");' class='tl_button shade'></span>"+
                    "<span onclick='windowResize(\""+page+"\");' class='tl_button maxmin'></span>"+
                  "</span>"+
                  titlebar_additions+
                  "<span class='content "+options+"'></span>"+
                  "<span class='window-drag'></span>"+
                "</div";
  windowPopulate(div,pageContents);
  document.body.append(div);
}

// update the contents of a window.
function windowPopulate(div,pageContents) {
  var content = div.getElementsByClassName("content")[0];
  if(typeof content === undefined) {
    return;
  }
  content.innerHTML = pageContents;
}

// remove window
function windowRemove(page) {
  document.getElementById(page).remove();
}

// resize window
function windowResize(page) {
  if(document.getElementById(page).classList.contains("maximized")) {
    document.getElementById(page).classList.remove("maximized");
    document.body.style.overflow = "auto";
  } else {
    document.getElementById(page).classList.add("maximized");
    document.body.style.overflow = "hidden";
  }

}

// shade window
function windowShade(page) {
  if(document.getElementById(page).classList.contains("shaded")) {
    document.getElementById(page).classList.remove("shaded");
    document.getElementById(page).style.marginTop = "0px";
  } else {
    document.getElementById(page).classList.add("shaded");
    var shiftBy = +(document.getElementById(page).style.height.replace("px","",2))
    document.getElementById(page).style.marginTop = -1*(shiftBy/2)+9+"px";
  }
}

// quick and dirty function to open the three windows from the first icon, one after the other.
function OpenTheThree() {
  windowCreate('main');
  setTimeout(function(){windowCreate('likes');}, 500);
  setTimeout(function(){windowCreate('dislikes');}, 1000);
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

