// the second part of the windowCreate function, synchronously
function windowCreatePart2(page,width,height,left,top,options,title,titlebar_additions) {
  try {
    var xhr = new XMLHttpRequest();
    if(xhr != null) {
      xhr.open('Get', pageUrl, true);
      xhr.onerror = function(e) {
        console.log(e);
      }
      xhr.onload = function(e) {
        pageContents = xhr.responseText;
      }
    } else {
      console.error("XMLHttpRequest not supported. Cannot continue properly.");
      return;
    }
  } catch(ex) {
    console.error(ex);
    pageContents = "ERROR: <br>"+ex;
  }
  windowCreatePart3(page,pageContents,width,height,left,top,options,title,titlebar_additions);
}

// synchronous getJSON code
function getJSON(url) {
    var resp;
    var xhr = new XMLHttpRequest();
    if(xhr != null) {
        xhr.open("GET", url);
        xhr.onerror = function(e) {
          console.error(e);
        }
        xhr.onload = function(e) {
          resp = xmlHttp.responseText;
        }
        xhr.send(null);
        return JSON.parse(resp);
    } else {
      console.error("XMLHttpRequest not supported. Cannot continue properly.");
      return JSON.parse("{'ok': 'false'}");
    }
}

// file for filling the site with content, synchronously, if javascript is enabled.
function fillSite(url) {
  try {
    var xhr = new XMLHttpRequest(null); // ????
    xhr.open("GET", url);
    xhr.onerror = function(e) {
      console.error(e);
    }
    xhr.onload = function(e) {
      document.open();
      document.write(xhr.responseText);
      document.close();
    }
    xhr.send(null);
  } catch(ex) {
    document.open();
    document.write("ERROR: <br>"+ex);
    document.close();
  }
  return;
}