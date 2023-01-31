<?php 
// this code is kind of a mess to due a philsophy i went by that only the contents that the page absolutely needs should be loaded in, and also because i chose to put all the code on one page. please be patient reading it. 
	 $dif = $_GET['d']; $use_letters = $_GET['ul'];
	 if(!isset($dif)) { // font for the logo is arial black btw
	 	?>
	 	
<html>
	<head>
		<style>
			.option {background: url('../images/ftype_options.gif') no-repeat; display: block; width: 87px; height: 14px; cursor: pointer; border: none;}
			.option .option, .option .info {display:  none; }
			.option:hover .option, .option:hover .info {display: block;}
			.option.o1 {background-position: 0px 0px;}
			.option.o2 {background-position: 0px -13px; padding-left: 50px}
			.option.o3 {background-position: 0px -28px;}
			.option.o4 {background-position: 0px -41px;}
			.option.o5 {background-position: 0px -56px;}
			.option.o6 {background-position: 0px -70px; display: inline-block;}
			.option .info {color: white; width: 250px; height: 550px; margin-left: 60px; font-size: 12px; font-family: sans-serif;}
			input[type="checkbox"] {filter: invert();}
img, * {
    image-rendering: optimizeSpeed!important;             
    image-rendering: -moz-crisp-edges!important;
    image-rendering: -o-crisp-edges!important;
    image-rendering: -webkit-optimize-contrast!important;
    image-rendering: pixelated!important;
    image-rendering: optimize-contrast!important;
    -ms-interpolation-mode: nearest-neighbor!important;
}
		</style>
		<script>function dS(d) {window.location.href = "/pages/ftype.php?d="+d+"&ul="+document.querySelector('.ch').checked+"";}</script>
	</head>
	<body bgcolor='#111' text='#fff'>
		<center>
	 	<img src='../images/ftype_logo.gif'>
	 	</center>
	 	<span alt='About' class='option o1'>
	 		<span class='info'>You've played those typing games where you have to type actual words, so now play the one that's literal fucking nonsense. Actually just randomly generated letters. The faster you type before finishing a game with backspace (granted that you make the least mistakes), the higher score you get.</span>
	 	</span>
	 	<span alt='Play' class='option o2'>
	 		<button onclick='dS(0)' alt='Easy' class='option o3'></button>
	 		<button onclick='dS(1)' alt='Normal' class='option o4'></button>
	 		<button onclick='dS(2)' alt='Hard' class='option o5'></button>
	 		<br><br><br>
	 	</span><br><br><br><br><br>
	 	<input alt='Use Custom Font' class='ch' type="checkbox" checked><span class='option o6'></span>
	 </body>
</html>
<?php
	 	die();
	 }
?>
<html>
	<head>
		<style>body {height: 100%; background: linear-gradient(#c9981c, #5474bf);}
		.letters.good span:nth-of-type(1) {background-color: darkgreen}
		.letters.bad span:nth-of-type(1) {background-color: darkred}
		p, span {margin:  0; padding:  0; display: inline-block;}
		<?php if($_GET['ul'] == "true") {?>
		.letter {font-size: 0px; width: 8px; height: 16px; display: inline-block; -webkit-filter: invert() drop-shadow(1px 1px 0 darkgray);
  filter: invert() drop-shadow(1px 1px 0 darkgray); background: url('../images/letters_<?php
	    	switch ($dif) {
	    		case 0:
				echo("easy");
				break;
			case 1:
				echo("normal");
				break;
			case 2:
				echo("hard");
				break;
			}
		?>.gif');}
		<?php };?>
		.kpbar,.kpbar .progress {display: block; height: 16px; position: absolute;bottom: 0;left: 0;}
		.kpbar { width: 100%; background: black;}
		.kpbar .progress {background: green;}
		.score {display: block; font-weight: bold; font-family: sans-serif;}
img, * {
    image-rendering: optimizeSpeed!important;             
    image-rendering: -moz-crisp-edges!important;
    image-rendering: -o-crisp-edges!important;
    image-rendering: -webkit-optimize-contrast!important;
    image-rendering: pixelated!important;
    image-rendering: optimize-contrast!important;
    -ms-interpolation-mode: nearest-neighbor!important;
}
		</style>
	</head>
	<body bgcolor='#111' text='#fff'>
		<br><br>
	<center><span class='letters'></span>
			<!--- remember that you need to provide video evidence of you getting to 1000 to be eligible for the prize --->
			<span class='score'></span></center>
			<span class='kpbar'><span style='width:100%;' class='progress'></span></span>
	<script>
		var score = 0; var actv_keypresses = 0;
		var scorespan = document.querySelector(".score");
		var letters = document.querySelector(".letters"); 
		var kpbar = document.querySelector(".kpbar .progress"); 
		<?php if($_GET['ul'] == "true") {?>
		document.write("<style>");
		for (var i = 0; i < 93; i++) {
			document.write(".letter.l_"+i+" {background-position: -"+(i*8)+"px 0px}");
		}
		document.write("</style>");
		<?php };?>
		function makechars(length) {
	    	var result = "";
	    	var characters = '<?php
	    	switch ($dif) {
	    		case 0:
	    			echo 'qwertyuiopasdfghjklzxcvbnm';
	    			break;
	    		case 1:
	    			echo '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKZXCVBNM';
	    			break;
	    		case 2:
	    			echo '`1234567890-=qwertyuiop[]\asdfghjkl;zxcvbnm,.;~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?﹍﹍﹍﹍﹍﹍';
	    			break;
	    		default:
	    			echo '';
	    			break;
	    	}
	    	?>';
	    	
		    for (var i = 0; i < length; i++ ){
		      char_n = Math.floor(Math.random() * characters.length);
		      char = characters.charAt(char_n);
		      result += "<span class='letter l_"+char_n+"'>"+char+"</span>";
		    }
		    return result;
		}
		document.addEventListener('keypress', function(event){
			actv_keypresses += 1;
			p_key = event.key.replace(' ', '﹍');
			if(letters.firstChild.textContent == p_key) {
				letters.removeChild(letters.childNodes[0]);
				letters.innerHTML += makechars(1);
				letters.classList.add('good'); letters.classList.remove('bad');
				score += 3;
			} else {
				letters.classList.add('bad'); letters.classList.remove('good');
				score /= 2;
				actv_keypresses /= 2;
			}
		});
		letters.innerHTML = makechars(50);
		setInterval(function(){
			if(actv_keypresses >= 0.0001) {
				actv_keypresses /= 2;
			}
			if((actv_keypresses <= 1) && (score >= 0.000005)) {
				score /= 2;
			}
		}, 500);
		setInterval(function(){
			if(score >= 1) {
				scorespan.innerHTML = Math.round(score);
			} else {
				scorespan.innerHTML = score;
			}
			
			kpbar.style.width = actv_keypresses+"%";
		}, 15);
	</script>
	</body>
</html>