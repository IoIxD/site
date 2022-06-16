// javascript file to load the javascript files. it does this to ensure we only load asynchronous functions when we have to.

function loadJS(url) {
	var xhr = new XMLHttpRequest();
	if(xhr != null) {
	    xhr.open("GET", url);
	    xhr.onerror = function(e) {
	      console.error(e);
	    }
	    xhr.onload = function(e) {
	    	// evaluate the contents of the text
		    eval.apply(null, [xhr.responseText]);
		    // call that script's initialization function
		    init();
	    }
	    xhr.send(null);
	} else {
	  console.error("XMLHttpRequest not supported. Cannot continue properly.");
	}
}

window.onload = function() {
	var bareURL = location.href.split("?")[0];
	// by default, call the asynchronous code.
	var scripts_url;
	scripts_url = bareURL+"resources/js/script_asynchronous.js";
	// but if we can't call that, we'll have to go with the synchronous file. 
	try {
		eval("async () => {}");
	} catch(ex) { // if no async
		scripts_url = bareURL+"resources/js/script_synchronous.js";
	}
	loadJS(bareURL+"resources/js/script_allelse.js");
	loadJS(scripts_url);
}
