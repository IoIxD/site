
// WINDOW CREATION
function windowCreate(page) {
    var width, height, left, top, options, title;
    var exoptions = "";
    if (properties[page] === undefined) {
      var url = window.location.pathname.replace('.html', '');
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
      width = properties[pageToMatch].width;
      height = properties[pageToMatch].height;
      left = properties[pageToMatch].left;
      top = properties[pageToMatch].top;
      options = properties[pageToMatch].options;
      title = properties[pageToMatch].name;
    } else {
      width = properties[page].width;
      height = properties[page].height;
      left = properties[page].left;
      top = properties[page].top;
      options = properties[page].options;
      title = properties[page].name;
    }

    if (navigator.userAgent.match(/(iPad|iPhone|iPod|android)/i)) {
      onPhone = 1;
    } else { onPhone = 0; }
  
    $(".window").each(function(w) {
      if (!$(this).hasClass('noanim')) {
        $(this).addClass('noanim');
      }
      if (!arrincludes(options,"om_dc") && onPhone == 1) {
        windowRemove(w.id);
      }
    })
    windows = [];
    try {
      mx = window.event.pageX; my = window.event.pageY;
    } catch (e) {
  
    }
    if (onPhone == 1) {
      options += " noanim"
    }
    // if this fails, it means the browser doesn't support it. so ignore it.
    // todo: switch to a javascript solution?
    try {
      if (!arrincludes(options,"noanim")) {
        document.documentElement.style.setProperty('--iw', width);
        document.documentElement.style.setProperty('--ih', height);
        document.documentElement.style.setProperty('--ix', left);
        document.documentElement.style.setProperty('--iy', top);
        document.documentElement.style.setProperty('--mpx', mx + "px");
        document.documentElement.style.setProperty('--mpy', my + "px");
      }
    } catch(ex) {

    }

    if (arrincludes(options,"nooverflow")) {
      options_iframe = "scrolling='no'";
    } else {
      options_iframe = "";
    }
    if (arrincludes(options,"textfile")) {
      titlebar_additions = "<span class='wp-bar-fake'></span>";
    } else {
      titlebar_additions = "";
    }
    if (arrincludes(options,"dirlist")) { 
      pageUrl = "/pages/dirlist.php?dir=pages/"+page+"/";
    } else {
      if(strincludes(page,"/")) {
        pageUrl = "/pages/"+page;
      } else {
        pageUrl = "/pages/"+page+".php";
      }
      
    }
    if (arrincludes(exoptions,"valload")) {
      exoptions = exoptions.replace("valload ", "");
      // the text wasn't replaced and i couldn't get the css to properly cut off the title how i wanted. i should come back to this.
      // title = exoptions.replace("%2F","\/");
      pageUrl += "?val=" + exoptions;
      page += "_" + makeid(6);
    }
    var id = page.replace(pageid_regex, '');
  
    // create the div properly so we can reference it later.

    var div = $("<div></div>");
    div.addClass("window")
              .css("display", "block")
              .css("width", width)
              .css("height", height)
              .css("left",left)
              .css("top",top)
              .attr("id", page);
    
    for (var i in options) {
      div.addClass(options[i]);
    }
  
    // skip ahead a bit 
    div.append($("<span class='titlebar'>"+
        "<span class='tl_lines'></span>"+
        "<span onclick='windowRemove(\""+page+"\");'class='tl_button close'></span>"+
        "<span class='title'>"+ title + "</span>"+
        "<span class='tl_button maxmin'></span>"+
        "<span class='tl_button shade'></span>"+
      "</span>"+titlebar_additions));
  
    // create the contents div and properly add it to the div.
    $.get(pageUrl, function(data) {
      var contents = $("<span>"+data+"</span>");
      contents.addClass("content");
      for (var i in options) {
        contents.addClass(options[i]);
      }
  
      div.append(contents);
      $("body").append(div);
    
      setWindowsDraggable();
    });

  }