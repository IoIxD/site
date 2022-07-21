<!DOCTYPE html>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<head>
		<style>
		* {font-family: "Comic Sans MS"!important}
		.disappoint {position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);}
		.disappoint img {width:  100%; display: block; pointer-events: none;}
		</style>
	</head>
	<body>
		<script async src="https://cse.google.com/cse.js?cx=a017bb5ab4f27fa1a"></script>
		<div class="gcse-search"></div>
		<script>
		function checkSearch() {
			var textBox = document.querySelector('.gsc-input input');
			var blacklistedWords = ["chrome","google","firefox","opera","internet explorer","edge","porn"]
			var funnyWords = ["arse","ass","asshole","bastard","bitch","bollocks","brotherfucker","bugger","bullshit","child-fucker","Christ on a bike","Christ on a cracker","cocksucker","crap","cunt","damn","effing","fatherfucker","frigger","fuck","goddamn","godsdamn","hell","holy shit","horseshit","Jesus Christ","Jesus fuck","Jesus H. Christ","Jesus Harold Christ","Jesus wept","Jesus, Mary and Joseph","Judas Priest","motherfucker","piss","prick","shit","shit ass","shitass","sisterfucker","slut","son of a bitch","son of a whore","sweet Jesus","twat"]
			if(blacklistedWords.includes(textBox.value.toLowerCase())) {
				 document.querySelector(".disappoint").innerHTML = `<img src='./DISPLEASED.png'>
				 `;
			} else if(funnyWords.includes(textBox.value.toLowerCase())) {
				document.querySelector(".disappoint").innerHTML = `<img src='./dinglebuddysad.png'>
				 `;
			} else {
				document.querySelector(".disappoint").innerHTML = ``;
			}
		}
		setInterval(checkSearch, 1000);
		</script>
		<div class="disappoint"></div>
	</body>
</html>