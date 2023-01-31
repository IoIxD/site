function xeyesCheck(e) {
    xeyes = document.querySelectorAll(".xeye");
    xeyes.forEach(eye => {
      var top = eye.style.top.replace("px", "", 1);
      var left = eye.style.left.replace("px", "", 1);
      var parent = document.querySelector("#xeyes");
      var y = (e.clientY - top) - parent.style.top.replace("px", "", 1);
      var x = (e.clientX - left) - parent.style.left.replace("px", "", 1);
      console.log(parent.style.top.replace("px", "", 1));
      var deg = (Math.atan2(y, x)) * 180 / Math.PI;
      eye.querySelector(".inner").style.transform = "rotate("+deg+"deg)";
    });
  }