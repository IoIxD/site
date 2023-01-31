function setBackground() {
    var url = window.location.protocol + "//" + window.location.hostname;
  
    // acceptable folders to choose from
    var folders = ["checkerland", "dimension_352", "mindisafuck", "troll_98", "weecee_wallpaper_1"];
  
    var random = folders[Math.ceil(Math.random() * folders.length - 1)];
  
    // We want to get all the files within this folder and pick the one
    // that is closed to the user's screen resolution.
    var file = "";
    // we pass the size in kind of a weird way, but doing this allows us to just filter the filenames (which always have WIDTHxHEIGHT in
    // the name) to numbers only and compare, which is faster.
    var maxSize = +(screen.width + "" + screen.height); 
  
    $.get(url + "/pages/art/" + random + "/", function(r) {
      var page = document.createElement("html");
      page.innerHTML = r;

      var links = $(page).find(".a").find("p");
      links.each(function(i) {
        var link = links[i];
        if (link.innerHTML === undefined) {
          return;
        }
        if (strincludes(link.innerHTML,"png")) {
          var numbers = +(link.innerHTML.replace(/([^0-9])/g, '', 99));
          if (numbers <= maxSize) {
            file = "/pages/art/" + random + "/" + link.innerHTML;
          }
        }
      });
    // now we want to fetch the contents of that link and set the page's background to it
    document.body.style.backgroundImage = "url(\"" + file + "\")";
    });

  }