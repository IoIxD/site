var cache = [];
var maxLevel = 1;

function listTree(obj,num) {
	// if we've already evaluated this object, don't re-evaluate it
	// (yes, if this isn't here then the code can get caught in an infinite loop)
	for(var i in cache) {
		if(cache[i] == obj) {
			return;
		}
	}
	cache.push(obj);

	// if the object is a string then just print it
	if(typeof(obj) == "string") {
		indent(num);
		document.write(obj+"<br>");
		return;
	}
	// otherwise, go through each value in the object.
	for(var i in obj) {
		// send errors to the page instead of the console
		try {
			// does this value...value? yes for some reason this sometimes returns null lol.
			if(obj[i] != null) {
				// if it's value is "native function", print it as such.
				if(obj[i].toString().indexOf('[native code]') != -1) {
					indent(num);
					document.write(obj[i].toString()+"<br>");
					continue;
				}
				// if it's the object's prototype, print it as such.
				if(obj[i].isPrototypeOf(obj)) {
					document.write("<em>("+obj+"'s Prototype)</em>");
				}

				// if it's gonna tell us information worth jackshit, don't bother.
				if(obj[i].toString().match(/\[object (.*?)\]/)) {
					document.write(i+"<br>");
				} else {
					document.write(i+": <em>"+obj[i]+"</em><br>");
				}
			} else {
				indent(num);
				document.write(i+"<br>");
				continue;
			}
			
			// if the object has a value AND it's not the one we're on right now...
			if(obj[i] != null && obj[i] != "" && obj[i] != obj) {
				indent(num);
				if(num+1 < maxLevel) {
					listTree(obj[i],num+1)
				}
			}
		} catch(ex) {
			document.write(obj[i]);
			document.write(ex);
		}
	}
}

function indent(num) {
	document.write("╚");
	for(var n = 0; n < num; n++) {
		document.write("═");
	}
}

function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


// and if that doesn't work then yeah we should try and print shit out to the screen.
var maxLevelQuery = getParameterByName("level",window.location.href);
if(maxLevelQuery != null && maxLevelQuery != "" && maxLevelQuery.match(/[0-9]{1,5}/)) {
	maxLevel = maxLevelQuery;
}
document.open();
document.write("<code>");
listTree(window,0);
document.write("</code>");

document.close();