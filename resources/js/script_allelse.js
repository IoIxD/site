// javascript that isn't called from scripts and can be used no matter what (and thank god)

// remove window
function windowRemove(page) {
  document.getElementById(page).remove();
}

// resize window
function windowResize(page) {
  pageelem = document.getElementById(page);
  if(hasClass(pageelem,"maximized")) {
    removeClass(pageelem,"maximized");
    document.body.style.overflow = "auto";
  } else {
    addClass(pageelem,"maximized");
    document.body.style.overflow = "hidden";
  }

}

// shade window
function windowShade(page) {
  pageelem = document.getElementById(page)
  if(hasClass(pageelem,"shaded")) {
    removeClass(pageelem,"shaded");
    pageelem.style.marginTop = "0px";
  } else {
    addClass(pageelem,"shaded");
    var shiftBy = +(pageelem.style.height.replace("/px/","",2));
    pageelem.style.marginTop = -1*(shiftBy/2)+9+"px";
  }
}

// wrap the resize listener in here for the same reason we wrap them in script_synchronous.js:
// if it's not there we don't care, this isn't necessary functionality either way
try {
  window.addEventListener('resize', scaleUpdate);
} catch(ex) {
  fuck = "piss";
}

// function for handling zoom ins and zoom outs.
// essentially we want to make sure the body can only ever scale evenly.
function scaleUpdate() {
  // set the scale of the body
  var dpi = (document.getElementById("dpi").offsetHeight / 96)-1;
  ratio = window.devicePixelRatio;
  desiredRatio = Math.floor(((ratio+dpi)-1)*10)+1; // how many tenths away is the ratio and dpi from 1?
  if(desiredRatio % 2 != 0 && desiredRatio != 1) {desiredRatio++}; // make sure it's even, always.
  if(desiredRatio <= 0) desiredRatio = 1; 
  document.body.style.transform = "scale("+desiredRatio+")";
  document.body.style.width = +(window.innerWidth/desiredRatio)-30+"px";
  document.body.style.height = +(window.innerHeight/desiredRatio)+"px";
  //document.body.style.height = "0px";
}

// dummy function
function init() {}

// we actually want things to be run when the window is loaded
window.onload = function() {
  // update the scale based on the device pixel ratio
  scaleUpdate();
}