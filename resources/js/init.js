// javascript file to load the javascript files. it does this to ensure we only load asynchronous functions when we have to.

window.onload = function() {
	var scripts_url;
	scripts_url = location.href+"resources/js/script_asynchronous.js";
	try {
		eval("async () => {}");
	} catch(ex) { // if no async
		scripts_url = location.href+"resources/js/script_synchronous.js";
	}

	var xhr = new XMLHttpRequest();
	if(xhr != null) {
	    xhr.open("GET", scripts_url);
	    xhr.onerror = function(e) {
	      console.error(e);
	    }
	    xhr.onload = function(e) {
	     	eval(xhr.responseText);
	     	fillSite(location.href+'has_script');
	    }
	    xhr.send(null);
	} else {
	  console.error("XMLHttpRequest not supported. Cannot continue properly.");
	}
}
