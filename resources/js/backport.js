// firefox 2.0 didn't have console logging lol

(function () {
	try {
		var _consolelog = console.log;
		var _consolewarn = console.warn;
		var _consoleerror = console.error;
	} catch(ex) {
		// This could only possibly fail if the browser doesn't support console commands, and that's
		// what this is for. ignore this.
		var dontEvenLog = "";
	}

	console = {
		log: function(message) {
			try {
				_consolelog(message);
			} catch(ex) {
				logToVisual(message, 0);
			}
		},
		warn: function(message) {
			try {
				_consolewarn(message);
			} catch(ex) {
				logToVisual(message, 1);
			}
		},
		error: function(message) {
			try {
				_consoleerror(message);
			} catch(ex) {
				logToVisual(message, 2);
			}
		}
	}

})();

function logToVisual(messageString, type) {
	visualLog = document.getElementById("visuallog");
	if(visualLog != undefined) {
		var message = document.createElement("span");
		visualLog.appendChild(message);
		switch(type) {
			case 1:
				message.style.backgroundColor = "yellow";
				message.style.color = "black";
				break;
			case 2:
				message.style.backgroundColor = "red";
				break;
			default:
				break;
		}
		visualLog.innerHTML += messageString+"   <br>";
	} else {
		document.open();
		document.write("visualLog undefined.");
		document.close();
	}

}

// older browsers shit their pants at the async syntax, this function fixes that.
function defineAsyncWithFallback(functionContents) {
	var functionToReturn;
	try {
		eval('async () => {}');
	} catch(ex) {
		functionToReturn = function() {}
	} finally {
		console.log(functionContents);
	}
	return functionToReturn;
}