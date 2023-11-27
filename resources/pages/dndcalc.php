<input type="number" id="one"/>
<input type="number" id="two"/>

<span id="result"></span>
<script>
  function calculate(e) {
    let a = +(document.querySelector("#one").value);
    let d = +(document.querySelector("#two").value);
    document.querySelector("#result").innerHTML = +(((a/d)/5)+1);
  }
    document.querySelector("#one").addEventListener("change", calculate);
  document.querySelector("#two").addEventListener("change", calculate);
</script>
