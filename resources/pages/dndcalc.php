<input type="number" id="one"/>
<input type="number" id="two"/>

<span id="result"></span>
<script>
  function calculate(e) {
    let a = +(document.querySelector("#one").value);
    let d = +(document.querySelector("#two").value);
    let res;
    if(a == d) {
      res = 0;
    } else {
      res = +(((a-d)/5)+1);
      if(res < 0) {
        res = 0;
      }
    }
    
    document.querySelector("#result").innerHTML = Math.floor(res);
  }
    document.querySelector("#one").addEventListener("change", calculate);
  document.querySelector("#two").addEventListener("change", calculate);
</script>
