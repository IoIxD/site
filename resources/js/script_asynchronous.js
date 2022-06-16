// asynchronous version of the site.


// GLOBAL VARIABLES
var mx = 0; var my = 0; mx_o = 0; my_o = 0;                             // mouse positions, _o = original
var mouseDown = 0;                                                      // is our mouse down?
var wx_o = 0; var wy_o = 0;                                             // original x/y of a window
var hoveredWin;                                                         // what window we're hovering over
var heldCtrl = 0; var heldShift = 0; var heldAlt = 0; var heldO = 0;    // keys to listen to
var movingWindow = 0;                                                   // window options
var windows = [];                                                       // cached windows
var onPhone = 0;                                                        // are we on a mobile device?
var properties;                                                         // window properties
var ratio; var desiredRatio;                                            // the ratio according to which to place objects on the screen


// LISTENERS

document.addEventListener("mousedown", function(e) {
  // which button was pressed?
  switch(e.which) {
    case 1:
      // our mouse is down
      mouseDown = 1; 
      // what element are we hovering over?
      elemHover = document.querySelectorAll(":hover");
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
      elemHover = document.querySelectorAll(":hover");
      if(elemHover.length >= 3 && elemHover[2].classList[0] == "window") {
        movingWindow = 1;
        hoveredWin = elemHover[2];
      }
    }
  }
})

// window creation
async function windowCreate(page, exoptions) {
  if(exoptions == null) {exoptions = "";}
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

  var pageProperties = properties[page];
  var loadOptionsAsValues = false;

  // First see if the properties for the window is in memory.
  // If they aren't, try and load one of the internal pages
  if(pageProperties == undefined) {
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
    pageProperties = await properties[page];
    if(pageProperties == undefined) {
      console.error("could not get the properties for page "+page+". properties json is: "+properties);
      return;
    }
  } else {
    pageToMatch = page;
  }

  var width = pageProperties.width;
  var height = pageProperties.height;
  var left = pageProperties.left;
  var top = pageProperties.top;
  var options = pageProperties.options;
  var title = properties[page].name;

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

  pageUrl = location.origin+"/"+page;

  // valload option contains files and what not that generic_text or generic_image should read from.
  if(exoptions.includes("valload")) {
    exoptions = exoptions.replace("valload ", "");
    pageUrl += "?val="+exoptions;
    page += "_"+idGen(6);
  }

  // get the contents of the page.
  var pageContents = await fetch(pageUrl).then(r => r.text());

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

// quick and dirty function to open the three windows from the first icon, one after the other.
function OpenTheThree() {
  windowCreate('main');
  setTimeout(function(){windowCreate('likes');}, 500);
  setTimeout(function(){windowCreate('dislikes');}, 1000);
}

// id generation for image windows.
function idGen(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *  charactersLength));
   }
   return result;
}

async function getJSON(url) {
  var fuck2;
  await fetch(url)
  .then(r => r.text())
  .then((r) => {
    fuck2 = r;
  });
  return JSON.parse(fuck2);
}

// the initialization function :tm: (asynchronously)

async function init() {
  // fill the site with content
  fetch(location.href+'has_script').then(r => r.text()).then(r => {
    document.open();
    document.write(r);
    document.close();
  })
  // initialize the properties variable
  properties = await getJSON(window.location.protocol+"//"+window.location.host+"/properties.json");

  // get the page we're on (currently unused)
  page = window.location.pathname.replace('.html','').replace('/','',1);
  if (page != "") { // if it's not blank, try and open a window based on it.
    windowCreate(page);
  } else {
    OpenTheThree() // otherwise, open the default three windows
  }

  // set a variable if we're on a mobile device.
  if(navigator.userAgent.match(/(iPad|iPhone|iPod|android)/i)) {
    onPhone = 1;
    // and while we're here, add a class to the html element to match our device.
    var html = document.getElementsByTagName('html')[0];
    if (navigator.userAgent.match(/(iPad|iPhone|iPod)/i)) html.classList.add('device-ios');
    if (navigator.userAgent.match(/android/i)) html.classList.add('device-android');
  } else {
    onPhone = 0;
  }
}