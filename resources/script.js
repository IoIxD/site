// synchronous version of the site.


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
function registerEventListeners() {
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

}

// window creation
function windowCreate(page) {
  // if there's already a window with the page, do nothing.
  if(document.getElementById(page) || page == null) {
    return 0;
  }

  var pageToMatch = "";

  var pageProperties = properties[page];

  // First see if the properties for the window is in memory.
  // If they aren't, try and load one of the internal pages
  if(pageProperties == undefined) {
    page = window.location.pathname.replace('.html','').replace('/','',1);
    pageRoot = window.location.pathname.replace('.html','').split("/")[1];
    if(page.match(/\.txt$/gm)) {
      pageToMatch = pageProperties["generic_text"];
    } else if(page.match(/\.png$/gm)) {
      pageToMatch = pageProperties["generic_image"];
    } else {
      pageToMatch = pageProperties[pageRoot];
    }
    if(pageToMatch == undefined) {
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
  var legacyAnimate = false;
  // if we're not phone and the window should animate, set that up.
  if(!hasWord(options,"noanim") && onPhone != 1) {
    try {
      document.documentElement.style.setProperty('--iw', width);
      document.documentElement.style.setProperty('--ih', height);
      document.documentElement.style.setProperty('--ix', left);
      document.documentElement.style.setProperty('--iy', top);
      document.documentElement.style.setProperty('--mpx', mx+"px");
      document.documentElement.style.setProperty('--mpy', my+"px");
    } catch(ex) {
      // if those fail then the browser doesn't support css variables, so turn on legacy animation.
      legacyAnimate = true;
    }
  }

  var titlebar_additions = "";

  // textfile options adds a WordPerfect inspired text bar to the window
  if(hasWord(options, "textfile")) {
    titlebar_additions = "<span class='wp-bar-fake'></span>";
  }

  pageUrl = location.protocol+"//"+location.host+"/"+page+"?embed=true";

  // get the contents of the page.
  var pageContents = "";
  try {
      var xhr = new XMLHttpRequest();
      if (xhr != null) {
          function load(e) {
              pageContents = xhr.responseText;
          }
          xhr.onerror = function(e) {
              console.error(e);
          }
          try {
            xhr.onload = load;
          } catch(ex) {
            xhr.readystatechange = load;
          }
          xhr.open('GET', pageUrl, false);
          xhr.send(null);
      } else {
          console.error("XMLHttpRequest not supported. Cannot continue properly.");
          return;
      }
  } catch (ex) {
      console.error(ex);
      pageContents = "ERROR: <br>" + ex;
  }

  // create a div the proper way so that we can reference it
  var div = document.createElement("div");
  document.body.appendChild(div);
  div.style.display =   "block";
  div.style.width   =   width;
  div.style.height  =   height;
  div.style.left    =   left;
  div.style.top     =   top;
  div.id            =   page;
  div.classList.add(div,"window");
  div.classList.add(div,options);

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
                  "<span class='window-drag'></span>";

  //if(legacyAnimate) windowAnimate(div,mx,my,left,top,width,height);
  windowPopulate(div,pageContents);
  return document.body.innerHTML;
}

// update the contents of a window.
function windowPopulate(div,pageContents) {
  var content = getElementsInElementByClassName(div,"content")[0];
  if(typeof content === undefined) {
    return;
  }
  content.innerHTML = pageContents;
}

function percentageToPixels(percent, basedOn) {
  percent = parseInt(percent.replace(/\%/, "", 1));
  return basedOn * (percent / 100);
}

function cleanUnits(target, basedOn) {
  if(hasLetter(target,"%")) {
    switch(basedOn) {
      case "width":
        target = percentageToPixels(target,window.innerWidth);
        break;
      case "height":
        target = percentageToPixels(target,window.innerHeight);
        break;
    }
  }
  if(hasLetter(target,"p")) target = target.replace(/px/,"",2);
  return +(target);
}


// check if a string has a word (simpler then includes because this checks between spaces)
function hasWord(find, match) {
  var found = false;
  var lookThru = find.split(" ");
  for(var i = 0; i < lookThru.length; i++) {
    if(lookThru[i] == match) {
      found = true;
      return found;
    }
  }
  return found;
}

// check if a string has a letter.
// we roll our own function both for browser compatibility and to save on speed when we only need to check one letter.
function hasLetter(find, match) {
  var found = false;
  for(var i = 0; i < find.length; i++) {
    if(find[i] == match) {
      found = true;
      return found;
    }
  }
  return found;
}

// animate a window
// (we don't use css animations because we want this to work on browsers from 20 years ago, i.e. firefox 2)
function windowAnimate(div,from_x,from_y,to_x,to_y,to_width,to_height) {

  // clean up the measurements we get
  from_x = 0;
  from_y = 0;
  to_x = cleanUnits(to_x,"width");
  to_y = cleanUnits(to_y,"height");
  to_width = cleanUnits(to_width,"width");
  to_height = cleanUnits(to_height,"height");

  // we want to make sure this animation only has 250 frames.
  var frameCount = 240;
  var xProgress = (to_x-from_x)/frameCount;
  var yProgress = (to_y-from_y)/frameCount;
  var wProgress = (to_width)/frameCount;
  var hProgress = (to_height)/frameCount;

  var x = from_x;
  var y = from_y;
  var width = 0;
  var height = 0;

  while(x < to_x && y < to_y && width < to_width && height < to_height) {
    
    if(y <= to_y) {
      newY = cleanUnits(div.style.top,"height");
      newY += yProgress;
      y += yProgress;
      div.style.top = newY+"px";
    }
    if(x <= to_x) {
      newX = cleanUnits(div.style.left,"width");
      newX += xProgress;
      x += xProgress;
      div.style.left = newX+"px";
    }
    if(width <= to_width) {
      newWidth = cleanUnits(div.style.width,"width");
      newWidth += wProgress;
      width += wProgress;
      div.style.width = newWidth+"px";
    }
    if(height <= to_height) {
      newHeight = cleanUnits(div.style.height,"height");
      newHeight += hProgress;
      height += hProgress;
      div.style.height = newHeight+"px";
    }
  }

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

// synchronous getJSON code
function getJSON(url) {
    var resp;
    var xhr = new XMLHttpRequest();
    if(xhr != null) {
        function load(e) {
          resp = xhr.responseText;
        }
        xhr.onerror = function(e) {
          console.error(e);
        }
        try {
          xhr.onload = load;
        } catch(ex) {
          xhr.readystatechange = load;
        }
        xhr.open("GET", url, false);
        xhr.send(null);
        return JSON.parse(resp);
    } else {
      console.error("XMLHttpRequest not supported. Cannot continue properly.");
      return JSON.parse("{'ok': 'false'}");
    }
}

// the initialization function :tm: (synchronously)
function init() {
  // initialize the properties variable
  properties = getJSON(window.location.protocol+"//"+window.location.host+"/pages/properties.json");

  // get the page we're on
  page = window.location.pathname.replace('.html','').replace('/','',1);
  if (page != "") { // if it's not blank, try and open a window based on it.
    windowCreate(page);
  } else {
    OpenTheThree(); // otherwise, open the default three windows
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

  try {
    registerEventListeners();
  } catch(ex) {
    // if the listeners fail to register we don't give a fuck because the likely chance is that the browser just doesn't support them,
    // but the browser also stops execution when it sees them, hence why we need to make sure it ignores them.
    var fuck = "piss";
  }

}


